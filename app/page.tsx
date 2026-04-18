import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardRedirect() {
  const supabase = (await createClient()) as any;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const roleRedirects: Record<string, string> = {
    SUPER_ADMIN: "/super-admin",
    SCHOOL_ADMIN: "/admin",
    CLASS_TEACHER: "/teacher",
    SUBJECT_TEACHER: "/teacher", // Map to same portal for now
    BURSAR: "/bursar",
    PARENT: "/parent",
    STUDENT: "/student",
  };

  redirect(roleRedirects[profile.role] || "/login");
}
