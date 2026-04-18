import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || url === 'your_supabase_project_url') {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL for admin client.");
  }
  if (!serviceRoleKey || serviceRoleKey === 'your_supabase_service_role_key') {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY. Add it to .env.local");
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
