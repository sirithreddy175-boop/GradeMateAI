import Link from "next/link"

export default function AuthErrorPage() {
  return <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10"><section className="w-full max-w-[420px] rounded-xl border border-border bg-card p-8 text-center shadow-sm"><h1 className="text-2xl font-semibold tracking-[-0.03em]">Authentication link unavailable</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">This link may have expired or already been used. Request a new link and try again.</p><Link href="/auth/login" className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">Return to sign in</Link></section></main>
}
