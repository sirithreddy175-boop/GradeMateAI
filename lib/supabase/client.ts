import { createBrowserClient } from "@supabase/ssr"
import { getMissingSupabaseEnvVars, getSupabaseConfig } from "./config"

let browserClient: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  if (browserClient) return browserClient

  const config = getSupabaseConfig()
  if (!config) {
    throw new Error(`Supabase is not configured. Missing: ${getMissingSupabaseEnvVars().join(", ")}.`)
  }

  browserClient = createBrowserClient(config.url, config.key)
  return browserClient
}
