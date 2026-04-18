"use client"
import { createBrowserClient } from "@supabase/ssr"
import { env } from "@/lib/env"
import type { Database } from "@/types"

let client: any = null

export function createClient() {
  if (typeof window === 'undefined') return {} as any;

  if (!client) {
    const url = env.NEXT_PUBLIC_SUPABASE_URL
    const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        // Fallback for build time safety
        return {} as any
    }

    client = createBrowserClient<Database>(url, key)
  }
  return client
}
