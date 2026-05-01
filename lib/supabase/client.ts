"use client"
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    // Return null-safe — caller must handle null
    // This only happens if env vars not set yet
    throw new Error(
      "Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL " +
      "and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables."
    )
  }
  
  return createBrowserClient(url, key)
}
