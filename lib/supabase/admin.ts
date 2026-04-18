import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"
import type { Database } from "@/types"

export function createAdminClient() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
      // This will only be called at runtime where variables MUST exist
      // But we check here to satisfy TypeScript
      throw new Error("Missing Supabase Admin credentials")
  }

  return createClient<Database>(
    url,
    key,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
