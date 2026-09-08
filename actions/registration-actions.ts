"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited } from "@/lib/rate-limit";

export async function verifyStudentForRegistration(
  admissionNumber: string,
  verificationData: { name?: string; dob?: string }
) {
  const limited = await isRateLimited("parent-verify", 5, "1 m");
  if (limited) return { success: false, message: "Too many attempts. Please wait a minute." };

  const supabase = await createClient();
  if (!supabase) return { success: false, message: "System not configured." };

  const normalizedAdmission = admissionNumber.trim();
  const { data: student, error } = await supabase
    .from("students")
    .select("id, full_name, admission_number, date_of_birth, school_id")
    .eq("admission_number", normalizedAdmission)
    .single();

  if (error || !student) return { success: false, message: "Student not found." };

  if (verificationData.name) {
    const supplied = verificationData.name.trim().toLowerCase();
    if (!supplied || supplied !== student.full_name.trim().toLowerCase()) {
      return { success: false, message: "Name does not match." };
    }
  }

  if (verificationData.dob && verificationData.dob !== student.date_of_birth) {
    return { success: false, message: "Date of birth does not match." };
  }

  return { success: true, student, message: "Verified" };
}

export async function submitParentRegistration(data: {
  studentId: string;
  fullName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  relationship: string;
  password: string;
}) {
  const limited = await isRateLimited("parent-register", 5, "1 m");
  if (limited) return { success: false, message: "Too many attempts. Please wait a minute." };

  const supabase = await createClient();
  const adminClient = createAdminClient() as any;
  const { data: student } = await adminClient
    .from("students")
    .select("id, school_id")
    .eq("id", data.studentId)
    .single();

  if (!student) return { success: false, message: "Student not found." };

  const email = data.email?.trim() || `${data.phone.replace(/\D/g, "")}@parent.local`;
  const { data: authData, error: authError } = await (supabase.auth as any).signUp({
    email,
    password: data.password,
    options: { data: { full_name: data.fullName, role: "parent", school_id: student.school_id } },
  });
  if (authError) return { success: false, message: authError.message };
  if (!authData.user) return { success: false, message: "Failed to create account." };

  const { data: guardian, error: guardianError } = await adminClient.from("guardians").insert({
    user_id: authData.user.id,
    full_name: data.fullName.trim(),
    phone: data.phone.trim(),
    whatsapp_number: data.whatsapp?.trim() || null,
    email: data.email?.trim() || null,
    relationship: data.relationship.trim(),
    is_primary: true,
    school_id: student.school_id,
  }).select("id").single();

  if (guardianError) return { success: false, message: "Account created but failed to link student. Please contact admin." };

  const { error: linkError } = await adminClient.from("student_guardians").insert({
    student_id: student.id,
    guardian_id: guardian.id,
  });
  if (linkError) return { success: false, message: "Account created but failed to link student. Please contact admin." };

  return { success: true, message: "Registration successful." };
}

export async function submitAdmissionApplication(data: any) {
  const limited = await isRateLimited("apply", 3, "10 m");
  if (limited) return { success: false, message: "Too many submissions. Please wait." };
  const supabase = await createClient();
  if (!supabase) return { success: false, message: "System not configured." };
  const { error } = await supabase.from("admission_applications").insert(data);
  if (error) return { success: false, message: "Failed to submit application." };
  return { success: true, message: "Submitted successfully." };
}
