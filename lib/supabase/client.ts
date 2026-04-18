import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a dummy client during build time if environment variables are missing
    return {} as any;
  }

  return createBrowserClient<Database>(url, key);
}
