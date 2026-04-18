import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (typeof window === 'undefined') {
    // Return a dummy client or similar for static generation/build time
    return {} as any;
  }

  if (!url || url === 'your_supabase_project_url') {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env.local");
  }
  if (!key || key === 'your_supabase_anon_key') {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it to .env.local");
  }

  if (client) return client;

  client = createBrowserClient<Database>(url, key);
  return client;
}
