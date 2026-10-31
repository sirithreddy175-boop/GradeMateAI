"use client"

import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff, LoaderCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getMissingSupabaseEnvVars } from "@/lib/supabase/config"
import { BrandLogo } from "@/components/brand-logo"

type AuthMode = "login" | "signup" | "forgot"

function Logo() {
  return <BrandLogo />
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [configError, setConfigError] = useState("")

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setConfigError("")
    if (mode === "signup" && password !== confirmPassword) return setError("Passwords do not match.")
    if (mode === "signup" && password.length < 8) return setError("Use at least 8 characters for your password.")
    setIsLoading(true)
    try {
      const supabase = createClient()
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message.toLowerCase().includes("confirm") ? "Please verify your email before signing in." : "Invalid email or password.")
        else window.location.assign("/")
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`, data: { full_name: fullName } } })
        if (error) {
          const message = error.message.toLowerCase()
          setError(message.includes("password") ? "Choose a stronger password and try again." : message.includes("rate") ? "Too many attempts. Please wait a moment and try again." : "We could not create your account. Check your details and try again.")
        } else window.location.assign("/auth/sign-up-success")
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password` })
        if (error) setError("We could not send the reset email. Please try again.")
        else setMessage("If an account exists for that email, we have sent password reset instructions.")
      }
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unexpected client error"
      setError(`Supabase client error: ${message} (code: client_error)`)
      if (message.includes("Supabase is not configured")) {
        setConfigError(`Missing environment variable: ${getMissingSupabaseEnvVars().join(", ")}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const title = mode === "login" ? "Teacher sign in" : mode === "signup" ? "Create your teacher account" : "Reset your password"
  const description = mode === "login" ? "Sign in to manage your assessments and grading workspace." : mode === "signup" ? "Set up your secure GradeMate AI workspace." : "Enter your email and we will send you a secure reset link."
  const isDevelopment = process.env.NODE_ENV !== "production"

  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><section className="w-full max-w-[420px]"><div className="mb-8 flex justify-center"><Logo /></div><div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"><h1 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>{configError && <div role="alert" className="mt-5 rounded-md border border-soft-red bg-soft-red px-3 py-2 text-sm text-red-900">{configError}</div>}{error && <div role="alert" className="mt-5 rounded-md border border-soft-red bg-soft-red px-3 py-2 text-sm text-red-900">{error}</div>}{message && <div role="status" className="mt-5 rounded-md border border-muted-green bg-muted-green px-3 py-2 text-sm text-green-900">{message}</div>}<form onSubmit={submit} className="mt-6 flex flex-col gap-4">{mode === "signup" && <label className="flex flex-col gap-2 text-sm font-medium">Full name<input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" autoComplete="name" /></label>}<label className="flex flex-col gap-2 text-sm font-medium">Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" autoComplete="email" /></label>{mode !== "forgot" && <><label className="flex flex-col gap-2 text-sm font-medium">Password<div className="relative"><input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 pr-10 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" autoComplete={mode === "login" ? "current-password" : "new-password"} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff /> : <Eye />}</button></div></label>{mode === "signup" && <label className="flex flex-col gap-2 text-sm font-medium">Confirm password<input required type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring" autoComplete="new-password" /></label>}</>} {mode === "login" && <div className="flex justify-end"><Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">Forgot password?</Link></div>}<button disabled={isLoading} className="mt-1 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">{isLoading && <LoaderCircle className="animate-spin" />} {mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}</button></form>{mode === "login" && isDevelopment && <div className="mt-5 border-t border-border pt-5"><Link href="/?demo=1" onClick={(event) => { event.preventDefault(); window.location.assign("/?demo=1") }} className="flex h-10 w-full items-center justify-center rounded-md border border-primary/30 bg-accent px-4 text-sm font-medium text-primary transition-colors hover:bg-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Preview Demo Dashboard</Link><p className="mt-2 text-center text-xs text-muted-foreground">Development-only preview with no real data.</p></div>}<div className="mt-6 border-t border-border pt-5 text-center text-sm text-muted-foreground">{mode === "login" ? <>Need a teacher account? <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">Create one</Link></> : <Link href="/auth/login" className="font-medium text-primary hover:underline">Back to sign in</Link>}</div></div><p className="mt-6 text-center text-xs text-muted-foreground">GradeMate AI · Teacher workspace</p></section></main>
}
