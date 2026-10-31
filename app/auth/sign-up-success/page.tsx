import Link from "next/link"

export default function SignUpSuccessPage() {
  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><section className="w-full max-w-[420px] rounded-xl border border-border bg-card p-8 text-center shadow-sm"><div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted-green text-green-900">✓</div><h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em]">Check your email</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">Your teacher account is ready. Confirm your email address to finish setup, then return here to sign in.</p><Link href="/auth/login" className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Back to sign in</Link></section></main>
}
