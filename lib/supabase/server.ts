import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { env } from "@/lib/env"

export async function createClient() {
  // Return null if Supabase not configured - let pages handle the state
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null as any
  }
  
  const cookieStore = await cookies()
  
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach((cookie: any) =>
              cookieStore.set(cookie.name, cookie.value, cookie.options)
            )
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  ) as any
}