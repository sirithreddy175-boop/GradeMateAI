import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard-shell"
import { createClient } from "@/lib/supabase/server"
import { getMissingSupabaseEnvVars } from "@/lib/supabase/config"

function isMissingTableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false

  const candidate = error as { code?: string; message?: string }
  const code = candidate.code ?? ""
  const message = candidate.message ?? ""

  return code === "PGRST205" || /could not find the table|schema cache/i.test(message)
}

export default async function Page() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/auth/login")

    const { data: exams, error } = await supabase
      .from("exams")
      .select("id,title,subject,description,status,question_count,submission_count,average_score,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return <DashboardShell initialExams={exams ?? []} />
  } catch (error) {
    const missing = getMissingSupabaseEnvVars()
    if (missing.length > 0) {
      return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><section className="w-full max-w-[520px] rounded-xl border border-border bg-card p-8 text-center shadow-sm"><h1 className="text-2xl font-semibold tracking-[-0.03em]">Supabase setup required</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Missing environment variable: {missing.join(", ")}</p></section></main>
    }

    if (isMissingTableError(error)) {
      return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><section className="w-full max-w-[620px] rounded-xl border border-border bg-card p-8 text-center shadow-sm"><h1 className="text-2xl font-semibold tracking-[-0.03em]">Database setup required</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Your Supabase project is connected, but the database schema is not ready yet. The app is waiting for the required table: <strong>public.exams</strong>.</p><p className="mt-3 text-sm leading-6 text-muted-foreground">Create the tables and policies in your Supabase project, then refresh this page.</p></section></main>
    }

    throw error
  }
}
