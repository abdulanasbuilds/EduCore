"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited } from "@/lib/rate-limit";

export async function verifyStudentForRegistration(admissionNumber: string, verificationData: { name?: string; dob?: string }) {
  const supabase = await createClient();
  if (!supabase) return { success: false, message: "System not configured." };

  const { data: student, error } = await supabase
    .from("students")
    .select("id, full_name, admission_number, school_id")
    .eq("admission_number", admissionNumber)
    .single();

  if (error || !student) return { success: false, message: "Student not found." };

  if (verificationData.name) {
    const match = student.full_name.toLowerCase().includes(verificationData.name.toLowerCase());
    if (!match) return { success: false, message: "Name does not match." };
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
  const limited = await isRateLimited('parent-register', 5, '1 m');
  if (limited) {
    return { success: false, message: 'Too many attempts. Please wait a minute.' };
  }
  
  const supabase = await createClient();
  const adminClient = createAdminClient() as any;
  
  // 1. Verify student exists and get school_id
  const { data: student } = await adminClient
    .from("students")
    .select("id, school_id")
    .eq("id", data.studentId)
    .single();
    
  if (!student) return { success: false, message: "Student not found." };

  // 2. Sign up user
  const { data: authData, error: authError } = await (supabase.auth as any).signUp({
    email: data.email || `${data.phone}@school.edu`, // Fallback email if not provided
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        role: "parent",
        school_id: student.school_id,
      }
    }
  });

  if (authError) return { success: false, message: authError.message };
  if (!authData.user) return { success: false, message: "Failed to create account." };

  const userId = authData.user.id;

  // 3. Create Guardian record
  const { data: guardian, error: guardianError } = await adminClient
    .from("guardians")
    .insert({
      user_id: userId,
      full_name: data.fullName,
      phone: data.phone,
      whatsapp_number: data.whatsapp || null,
      email: data.email || null,
      relationship: data.relationship,
      is_primary: true,
      school_id: student.school_id
    })
    .select("id")
    .single();

  if (guardianError) {
    console.error("Guardian creation error:", guardianError);
    return { success: false, message: "Account created but failed to link student. Please contact admin." };
  }

  // 4. Link Student to Guardian
  await adminClient.from("student_guardians").insert({
    student_id: student.id,
    guardian_id: guardian.id
  });

  return { success: true, message: "Registration successful." };
}

export async function submitAdmissionApplication(data: any) {
  const limited = await isRateLimited('apply', 3, '10 m');
  if (limited) {
    return { success: false, message: 'Too many submissions. Please wait.' };
  }
  
  const supabase = await createClient();
  if (!supabase) return { success: false, message: "System not configured." };
  
  const { error } = await supabase
    .from("admission_applications")
    .insert(data);
    
  if (error) return { success: false, message: "Failed to submit application." };
  return { success: true, message: "Submitted successfully." };
}
