import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const extractionSchema = z.object({ detected_languages: z.array(z.enum(["English", "Telugu", "Hindi", "Unknown"])), answers: z.array(z.object({ question_number: z.coerce.number().int().positive(), answer_text: z.string(), language: z.enum(["English", "Telugu", "Hindi", "Unknown"]), confidence: z.number().min(0).max(1), needs_review: z.boolean(), warning: z.string().optional() })) })

export async function POST(request: Request) {
  try {
    const { submissionId } = await request.json()
    if (typeof submissionId !== "string" || !submissionId) return Response.json({ error: "A submission is required." }, { status: 400 })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Sign in before extracting an answer sheet." }, { status: 401 })
    const { data: submission, error } = await supabase.from("answer_sheet_submissions").select("id,user_id,storage_path,exam_id").eq("id", submissionId).eq("user_id", user.id).single()
    if (error || !submission) return Response.json({ error: "Answer sheet not found." }, { status: 404 })
    await supabase.from("answer_sheet_submissions").update({ ocr_status: "processing", ocr_warning: null }).eq("id", submissionId)
    const { data: signed, error: signedError } = await supabase.storage.from("grademate-documents").createSignedUrl(submission.storage_path, 300)
    if (signedError || !signed?.signedUrl) return Response.json({ error: "The uploaded sheet could not be opened for OCR." }, { status: 422 })
    const file = await fetch(signed.signedUrl)
    if (!file.ok) return Response.json({ error: "The uploaded sheet could not be read for OCR." }, { status: 422 })
    const bytes = new Uint8Array(await file.arrayBuffer())
    const headerType = file.headers.get("content-type") || ""
    const mediaType = submission.storage_path.toLowerCase().endsWith(".pdf") || headerType.includes("pdf") ? "application/pdf" : headerType.startsWith("image/") ? headerType : "image/jpeg"
    const documentPart = mediaType === "application/pdf" ? { type: "file" as const, data: bytes, mediaType } : { type: "image" as const, image: bytes, mediaType }
    const { text } = await generateText({ model: google("gemma-4-31b-it"), maxRetries: 1, temperature: 0, system: "You are a production multilingual answer-sheet OCR assistant. Read printed and handwritten English, Telugu, and Hindi across every page. Preserve the original script exactly and keep answer numbering. Never invent unreadable text: return an empty string with needs_review true and a precise warning when a region cannot be read. Return only valid JSON matching the requested schema.", messages: [{ role: "user", content: [{ type: "text", text: "Extract every numbered answer from every page of this answer sheet. Detect the language per answer. Return detected_languages and answers with question_number, answer_text, language, confidence from 0 to 1, needs_review, and optional warning. If the same question spans pages, concatenate its text in reading order." }, documentPart] }] })
    const parsed = extractionSchema.parse(JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()))
    const { data: questions } = await supabase.from("questions").select("id,position").eq("exam_id", submission.exam_id)
    const questionMap = new Map((questions ?? []).sort((a, b) => a.position - b.position).map((question, index) => [index + 1, question.id]))
    await supabase.from("extracted_answers").delete().eq("submission_id", submissionId)
    const orderedQuestions = (questions ?? []).sort((a, b) => a.position - b.position)
    const matchedAnswers = parsed.answers.filter((answer) => questionMap.has(answer.question_number))
    const answersToStore = matchedAnswers.length ? matchedAnswers : parsed.answers.map((answer, index) => ({ ...answer, question_number: index + 1 }))
    const rows = answersToStore.map((answer) => ({ submission_id: submissionId, question_id: questionMap.get(answer.question_number) || orderedQuestions[answer.question_number - 1]?.id, original_answer_text: answer.answer_text, answer_text: answer.answer_text, answer_language: answer.language, confidence: answer.confidence, page_number: 1 })).filter((row) => row.question_id && row.answer_text.trim())
    if (!rows.length) { await supabase.from("answer_sheet_submissions").update({ ocr_status: "failed", ocr_warning: "OCR returned no readable answer text. Retry extraction or enter answers manually." }).eq("id", submissionId); return Response.json({ error: "OCR returned no readable answer text. Retry extraction or enter answers manually." }, { status: 422 }) }
    const insert = await supabase.from("extracted_answers").insert(rows)
    if (insert.error) return Response.json({ error: insert.error.message }, { status: 500 })
    const warning = parsed.answers.filter((answer) => answer.needs_review || answer.language === "Unknown").map((answer) => `Q${answer.question_number}: ${answer.warning || "Review OCR confidence and language."}`).join(" ") || null
    await supabase.from("answer_sheet_submissions").update({ detected_languages: parsed.detected_languages, ocr_status: "needs_review", ocr_warning: warning }).eq("id", submissionId)
    return Response.json({ ...parsed, inserted_answers: rows.length, warning })
  } catch (error) {
    console.error("[v0] multilingual OCR failed", error)
    return Response.json({ error: "OCR could not safely read this sheet. The original upload is preserved for manual correction." }, { status: 500 })
  }
}
