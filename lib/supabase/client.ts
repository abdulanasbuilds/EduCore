"use client"
import { createBrowserClient } from "@supabase/ssr"
import { env } from "@/lib/env"

let cachedClient: any = null

export function createClient() {
  // Don't create client during build/SSG with empty values
  if (typeof window === 'undefined' && !env.NEXT_PUBLIC_SUPABASE_URL) {
    return null
  }
  
  // Use cached client or create new one
  if (!cachedClient) {
    cachedClient = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
    )
  }
  return cachedClient
}