"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    if (password.length < 8) return setError("Use at least 8 characters for your password.")
    if (password !== confirmPassword) return setError("Passwords do not match.")
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) setError("We could not update your password. Request a new reset link and try again.")
      else router.replace("/auth/login")
    } catch {
      setError("Authentication is not configured. Add the Supabase environment variables to continue.")
    } finally {
      setIsLoading(false)
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><section className="w-full max-w-[420px] rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"><h1 className="text-2xl font-semibold tracking-[-0.03em]">Choose a new password</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Use a secure password with at least 8 characters.</p>{error && <div role="alert" className="mt-5 rounded-md border border-soft-red bg-soft-red px-3 py-2 text-sm text-red-900">{error}</div>}<form onSubmit={submit} className="mt-6 flex flex-col gap-4"><label className="flex flex-col gap-2 text-sm font-medium">New password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" autoComplete="new-password" /></label><label className="flex flex-col gap-2 text-sm font-medium">Confirm password<input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" autoComplete="new-password" /></label><button disabled={isLoading} className="mt-1 h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60">{isLoading ? "Updating…" : "Update password"}</button></form></section></main>
}
