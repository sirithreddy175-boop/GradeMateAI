export type SupabaseConfig = {
  url: string
  key: string
}

const placeholderValuePatterns = [
  "your_supabase",
  "your-google",
  "example.com",
  "placeholder",
  "changeme",
  "<your",
  "replace_me",
  "not_real",
]

function hasValidEnvValue(value?: string): boolean {
  if (!value) return false

  const normalized = value.trim().toLowerCase()
  if (!normalized) return false
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      const parsed = new URL(normalized)
      return !!parsed.hostname && parsed.hostname !== "example.com"
    } catch {
      return false
    }
  }

  if (normalized.includes("your_")) return false
  if (normalized.includes("placeholder")) return false
  if (normalized.includes("changeme")) return false
  if (normalized.includes("replace_me")) return false

  return !placeholderValuePatterns.some((pattern) => normalized.includes(pattern))
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)?.trim()

  if (!url || !key) return null
  if (!hasValidEnvValue(url) || !hasValidEnvValue(key)) return null
  return { url, key }
}

export function getMissingSupabaseEnvVars(): string[] {
  const missing: string[] = []
  if (!hasValidEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL)) missing.push("NEXT_PUBLIC_SUPABASE_URL")
  if (!hasValidEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) && !hasValidEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  }
  return missing
}
