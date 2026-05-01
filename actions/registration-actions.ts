"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function verifyStudentForRegistration(admissionNumber: string, verificationData: { name?: string; dob?: string }) {
  const adminDb = createAdminClient();
  if (!adminDb) return { success: false, message: "System not configured." };

  const { data: student } = await adminDb
    .from("students")
    .select("id, full_name, admission_number")
    .eq("admission_number", admissionNumber)
    .single();

  if (!student) return { success: false, message: "Student not found." };

  if (verificationData.name) {
    const match = student.full_name.toLowerCase().includes(verificationData.name.toLowerCase());
    if (!match) return { success: false, message: "Name does not match." };
  }

  return { success: true, student, message: "Verified" };
}

export async function submitParentRegistration(data: any) {
  return { success: false, message: "Not yet implemented." };
}

export async function submitAdmissionApplication(data: any) {
  const adminDb = createAdminClient();
  if (!adminDb) return { success: false, message: "System not configured." };
  
  const { error } = await adminDb
    .from("admission_applications")
    .insert(data);
    
  if (error) return { success: false, message: "Failed to submit application. Please try again." };
  return { success: true, message: "Submitted successfully." };
}
