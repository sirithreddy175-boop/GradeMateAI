import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getMissingSupabaseEnvVars, getSupabaseConfig } from "./config"

export async function createClient() {
  const config = getSupabaseConfig()
  if (!config) {
    throw new Error(`Supabase is not configured. Missing: ${getMissingSupabaseEnvVars().join(", ")}.`)
  }

  const cookieStore = await cookies()

  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Server Components cannot always write cookies; the proxy refreshes them.
        }
      },
    },
  })
}
