import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const generatedQuestionSchema = z.object({
  questions: z.array(z.object({
    prompt: z.string().min(1).max(2000),
    type: z.enum(["multiple_choice", "short_answer", "true_false", "essay"]),
    options: z.array(z.string().max(300)).max(6),
    correct_answer: z.string().max(500).nullable(),
    points: z.number().int().min(1).max(100),
  })).min(1).max(30),
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const demo = formData.get("demo") === "true" && process.env.NODE_ENV !== "production"
    const topic = String(formData.get("topic") ?? "").trim().slice(0, 500)
    const difficulty = String(formData.get("difficulty") ?? "medium").slice(0, 40)
    const count = Math.min(30, Math.max(1, Number(formData.get("count") ?? 5)))
    const file = formData.get("file")

    if (!topic && !(file instanceof File)) return Response.json({ error: "Add a topic or upload a question paper." }, { status: 400 })
    if (file instanceof File && file.size > 10 * 1024 * 1024) return Response.json({ error: "The uploaded file must be smaller than 10 MB." }, { status: 413 })
    if (file instanceof File && !["application/pdf", "image/jpeg", "image/png"].includes(file.type)) return Response.json({ error: "Only PDF, JPG, and PNG files are supported." }, { status: 415 })

    if (!demo) {
      const supabase = await createClient()
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) return Response.json({ error: "Sign in before generating questions." }, { status: 401 })
    }

    if (demo) {
      return Response.json({ questions: Array.from({ length: count }, (_, index) => ({ prompt: `Explain one important idea about ${topic || "this lesson"}.`, type: index % 2 === 0 ? "short_answer" : "multiple_choice", options: index % 2 === 0 ? [] : ["It describes the core concept", "It is unrelated", "It only applies to homework"], correct_answer: index % 2 === 0 ? null : "It describes the core concept", points: 2 })) })
    }

    const content: Array<{ type: "text"; text: string } | { type: "file"; data: Uint8Array; mediaType: string }> = [{ type: "text", text: `Create exactly ${count} classroom assessment questions about ${topic || "the uploaded question paper"}. Difficulty: ${difficulty}. Return a balanced set with clear wording. For multiple choice, provide 3-5 options and set correct_answer to the exact correct option. For other types, use an empty options array when appropriate.` }]
    if (file instanceof File) content.push({ type: "file", data: new Uint8Array(await file.arrayBuffer()), mediaType: file.type })

    const { text } = await generateText({
      model: google("gemma-4-31b-it"),
      system: "Return only valid JSON. Do not use markdown fences or add commentary.",
      messages: [{ role: "user", content: [...content, { type: "text", text: `Return JSON matching this shape: {\\"questions\\":[{\\"prompt\\":\\"string\\",\\"type\\":\\"multiple_choice|short_answer|true_false|essay\\",\\"options\\":[\\"string\\"],\\"correct_answer\\":\\"string or null\\",\\"points\\":1}]} Generate exactly ${count} questions.` }] }],
      temperature: 0.2,
    })

    const jsonText = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
    return Response.json(generatedQuestionSchema.parse(JSON.parse(jsonText)))
  } catch (error) {
    console.error("[v0] Gemma question generation failed", error)
    return Response.json({ error: "Question generation failed. Check the server configuration and try again." }, { status: 500 })
  }
}
