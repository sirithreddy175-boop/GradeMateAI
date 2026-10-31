import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const resultSchema = z.object({
  recommended_marks: z.coerce.number().min(0),
  confidence: z.coerce.number().min(0).max(1),
  explanation: z.string().default("Gemma did not provide an explanation."),
  missing_concepts: z.array(z.string()).default([]),
  incorrect_statements: z.array(z.string()).default([]),
})

function parseGemmaJson(text: string) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
  const start = cleaned.indexOf("{")
  const end = cleaned.lastIndexOf("}")
  if (start < 0 || end <= start) throw new Error("Gemma returned no JSON object")
  return JSON.parse(cleaned.slice(start, end + 1))
}

export async function POST(request: Request) {
  try {
    const { submissionId } = await request.json()
    if (typeof submissionId !== "string" || !submissionId) return Response.json({ error: "A submission is required." }, { status: 400 })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: "Sign in before grading answer sheets." }, { status: 401 })
    const { data: submission, error: submissionError } = await supabase.from("answer_sheet_submissions").select("id,exam_id,user_id,status").eq("id", submissionId).eq("user_id", user.id).single()
    if (submissionError || !submission) return Response.json({ error: "Answer sheet not found." }, { status: 404 })
    const { data: preferences } = await supabase.from("teacher_preferences").select("rubric_suggestions,feedback_prompts,grading_style,secondary_styles,marking_preferences,answer_quality_expectations,explanation_preferences,feedback_preferences,feedback_templates,profile_overrides").eq("teacher_id", user.id).maybeSingle()
    const { data: answers, error: answersError } = await supabase.from("extracted_answers").select("id,question_id,answer_text").eq("submission_id", submissionId)
    if (answersError) return Response.json({ error: answersError.message }, { status: 500 })
    if (!answers?.length) return Response.json({ error: "No extracted answers are available. Complete OCR extraction or enter answers manually before grading." }, { status: 409 })
    const questionIds = answers.map((answer) => answer.question_id).filter(Boolean)
    const { data: questions, error: questionsError } = await supabase.from("questions").select("id,prompt,correct_answer,alternative_answers,concepts,keywords,partial_mark_criteria,points").in("id", questionIds)
    if (questionsError) return Response.json({ error: questionsError.message }, { status: 500 })
    const questionMap = new Map((questions ?? []).map((question) => [question.id, question]))
    const recommendations = []
    for (const answer of answers) {
      const question = questionMap.get(answer.question_id)
      if (!question) continue
      const { text } = await generateText({
        model: google("gemma-4-31b-it"),
        maxRetries: 1,
        system: `Evaluate semantically using the official answer and rubric. Return only JSON. Never award more than the maximum marks. Do not infer missing student content. Teacher preferences are guidance only: ${JSON.stringify(preferences ?? { grading_style: "balanced", marking_preferences: { partial: true, strict: false, unanswered: "zero" }, answer_quality_expectations: {}, explanation_preferences: ["concept_gap", "incorrect_statement"], feedback_preferences: {}, profile_overrides: {} })}`,
        prompt: JSON.stringify({ question: question.prompt, maximum_marks: question.points, student_answer: answer.answer_text, official_answer: question.correct_answer, alternative_answers: question.alternative_answers ?? [], concepts: question.concepts ?? [], keywords: question.keywords ?? [], partial_mark_criteria: question.partial_mark_criteria ?? "", teacher_profile: preferences?.profile_overrides ?? {}, feedback_templates: preferences?.feedback_templates ?? [] }),
        temperature: 0.1,
      })
      const parsed = resultSchema.parse(parseGemmaJson(text))
      recommendations.push({ submission_id: submissionId, question_id: question.id, extracted_answer_id: answer.id, recommended_marks: Math.min(question.points, parsed.recommended_marks), confidence: parsed.confidence, explanation: parsed.explanation, missing_concepts: parsed.missing_concepts, incorrect_statements: parsed.incorrect_statements, needs_review: true })
    }
    if (!recommendations.length) return Response.json({ error: "No question mappings were available for grading." }, { status: 409 })
    const { error: insertError } = await supabase.from("grading_recommendations").upsert(recommendations, { onConflict: "submission_id,question_id" })
    if (insertError) return Response.json({ error: insertError.message }, { status: 500 })
    const { error: statusError } = await supabase.from("answer_sheet_submissions").update({ status: "review_pending" }).eq("id", submissionId).eq("user_id", user.id)
    if (statusError) return Response.json({ error: statusError.message }, { status: 500 })
    return Response.json({ graded: recommendations.length })
  } catch (error) {
    console.error("[v0] Gemma grading failed", error)
    return Response.json({ error: "AI grading failed. No marks were fabricated. Review the answer extraction and retry." }, { status: 500 })
  }
}
