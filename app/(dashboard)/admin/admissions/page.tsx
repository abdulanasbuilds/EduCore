export const dynamic = 'force-dynamic';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdmissionsClient from "./admissions-client";

export default async function AdmissionsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "school_admin") redirect("/login");

  const { data: applications } = await supabase
    .from("admission_applications")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdmissionsClient applications={applications ?? []} />;
}

