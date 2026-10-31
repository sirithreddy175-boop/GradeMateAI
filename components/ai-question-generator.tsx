"use client"

import { useState } from "react"
import { Sparkles, Upload } from "lucide-react"

export type GeneratedQuestion = {
  prompt: string
  type: "multiple_choice" | "short_answer" | "true_false" | "essay"
  options: string[]
  correct_answer: string | null
  points: number
}

export function AIQuestionGenerator({ demo = false, onGenerated }: { demo?: boolean; onGenerated: (questions: GeneratedQuestion[]) => Promise<void> | void }) {
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [count, setCount] = useState("5")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const generate = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setMessage("")
    try {
      const formData = new FormData(); formData.set("topic", topic); formData.set("difficulty", difficulty); formData.set("count", count); formData.set("demo", String(demo)); if (file) formData.set("file", file)
      const response = await fetch(`/api/ai/generate-questions${demo ? "?demo=1" : ""}`, { method: "POST", body: formData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Question generation failed.")
      await onGenerated(result.questions)
      setMessage(`${result.questions.length} questions added to this exam.`)
      setTopic(""); setFile(null)
    } catch (error) { setMessage(error instanceof Error ? error.message : "Question generation failed.") } finally { setLoading(false) }
  }

  return <form onSubmit={generate} className="rounded-md border border-primary/20 bg-accent/40 p-4"><div className="flex items-start gap-3"><div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground"><Sparkles className="size-4" aria-hidden="true" /></div><div><h4 className="text-sm font-semibold">Generate with Gemma</h4><p className="mt-1 text-xs leading-5 text-muted-foreground">Use Gemma 4 through Google AI Studio to draft assessment questions. Review before publishing.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_150px_90px]"><label className="grid gap-1 text-xs font-medium">Topic or learning objective<input value={topic} onChange={(event) => setTopic(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal" placeholder="Photosynthesis and energy transfer" /></label><label className="grid gap-1 text-xs font-medium">Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label><label className="grid gap-1 text-xs font-medium">Count<input type="number" min="1" max="30" value={count} onChange={(event) => setCount(event.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm font-normal" /></label></div><div className="mt-3 flex flex-wrap items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium"><Upload className="size-3.5" />{file ? file.name : "Attach PDF/JPG/PNG"}<input type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="sr-only" /></label><button type="submit" disabled={loading || (!topic.trim() && !file)} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50">{loading ? "Generating…" : "Generate questions"}</button></div>{message && <p role="status" className="mt-3 text-xs text-muted-foreground">{message}</p>}{demo && <p className="mt-2 text-[11px] text-muted-foreground">Demo preview: generated questions are local and are not saved to Supabase.</p>}</form>
}
