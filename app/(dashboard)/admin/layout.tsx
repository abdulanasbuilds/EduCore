import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "school_admin") {
    redirect("/login");
  }

  const { data: term } = await supabase
    .from("terms")
    .select("name")
    .eq("status", "active")
    .single();

  return (
    <AdminShell 
      profileName={profile.full_name || "Admin"} 
      currentTerm={term?.name || "No Active Term"}
    >
      {children}
    </AdminShell>
  );
}
