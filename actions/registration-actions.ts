"use server";

import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";

export async function verifyStudentForRegistration(admissionNumber: string, verificationData: { name?: string; dob?: string }) {
  const supabase = await createClient();
  if (!supabase) return { success: false, message: "System not configured." };

  const { data: student, error } = await supabase
    .from("students")
    .select("id, full_name, admission_number")
    .eq("admission_number", admissionNumber)
    .single();

  if (error || !student) return { success: false, message: "Student not found." };

  if (verificationData.name) {
    const match = student.full_name.toLowerCase().includes(verificationData.name.toLowerCase());
    if (!match) return { success: false, message: "Name does not match." };
  }

  return { success: true, student, message: "Verified" };
}

export async function submitParentRegistration(data: any) {
  // Rate limit: 5 attempts per minute per IP
  const limited = await isRateLimited('parent-register', 5, '1 m');
  if (limited) {
    return { 
      success: false,
      message: 'Too many attempts. Please wait a minute and try again.' 
    };
  }
  
  const supabase = await createClient();
  if (!supabase) return { success: false, message: "System not configured." };
  
  // TODO: Implement actual parent registration logic
  return { success: false, message: "Not yet implemented." };
}

export async function submitAdmissionApplication(data: any) {
  // Rate limit: 3 applications per 10 minutes per IP
  const limited = await isRateLimited('apply', 3, '10 m');
  if (limited) {
    return { 
      success: false,
      message: 'Too many submissions. Please wait before trying again.' 
    };
  }
  
  const supabase = await createClient();
  if (!supabase) return { success: false, message: "System not configured." };
  
  const { error } = await supabase
    .from("admission_applications")
    .insert(data);
    
  if (error) return { success: false, message: "Failed to submit application. Please try again." };
  return { success: true, message: "Submitted successfully." };
}
