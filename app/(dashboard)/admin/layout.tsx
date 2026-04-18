import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import type { UserRole } from "@/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role, school_id, full_name")
        .eq("id", user.id)
        .single();

  if (!profile || !["SCHOOL_ADMIN", "SUPER_ADMIN"].includes(profile.role as string)) {
    const roleRedirects: Record<UserRole, string> = {
      SUPER_ADMIN: "/super-admin",
      SCHOOL_ADMIN: "/admin",
      CLASS_TEACHER: "/teacher",
      SUBJECT_TEACHER: "/subject-teacher",
      BURSAR: "/bursar",
      PARENT: "/parent",
      STUDENT: "/student",
    };
    redirect(roleRedirects[(profile?.role as UserRole) || "STUDENT"] || "/login");
  }

  // Get current term info
  let currentTermLabel = "No Active Term";
  if (profile.school_id) {
    const { data: activeTerm } = await supabase
      .from("terms")
      .select("name, academic_year:academic_years(name)")
      .eq("school_id", profile.school_id)
      .eq("status", "active")
      .limit(1)
      .single();

    if (activeTerm) {
      const term = activeTerm as { name: string; academic_year: { name: string } | null };
      const yearName = term.academic_year?.name || "";
      currentTermLabel = `${term.name} (${yearName})`;
    }
  }

  return (
    <AdminShell profileName={profile.full_name} currentTerm={currentTermLabel}>
      {children}
    </AdminShell>
  );
}
