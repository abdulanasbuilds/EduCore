import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { env } from "@/lib/env"

export const dynamic = 'force-dynamic'

export async function createClient() {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
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

export async function requireAuth() {
  const supabase = await createClient()
  
  if (!supabase) {
    return { user: null, supabase: null }
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return { user, supabase }
  } catch {
    return { user: null, supabase }
  }
}