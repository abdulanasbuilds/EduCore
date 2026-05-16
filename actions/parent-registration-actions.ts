"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { ActionResponse } from "@/types";

const parentRegistrationSchema = z.object({
  studentAdmissionNumber: z.string().min(1, "Admission number is required"),
  studentFullName: z.string().min(1, "Student name is required"),
  parentFullName: z.string().min(1, "Your full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  relationship: z.string().min(1, "Relationship is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerParentAction(
  formData: z.infer<typeof parentRegistrationSchema>
): Promise<ActionResponse> {
  try {
    const parsed = parentRegistrationSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, message: "Validation failed" };
    }

    const data = parsed.data;
    const supabase = await createClient();

    // 1. Verify student exists
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, school_id")
      .ilike("admission_number", data.studentAdmissionNumber)
      .ilike("full_name", data.studentFullName)
      .single();

    if (studentError || !student) {
      return { 
        success: false, 
        message: "Could not find a student matching that admission number and name." 
      };
    }

    // 2. Create the user in Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.parentFullName,
          role: "parent",
          school_id: student.school_id,
        },
      },
    });

    if (authError) {
      return { success: false, message: authError.message };
    }

    if (!authData.user) {
      return { success: false, message: "Failed to create user account" };
    }

    // Note: The database trigger (handle_new_user) will automatically create the 'profiles' row.
    
    // 3. Create the guardian record
    const { data: guardian, error: guardianError } = await supabase
      .from("guardians")
      .insert({
        user_id: authData.user.id,
        school_id: student.school_id,
        full_name: data.parentFullName,
        phone: data.phone,
        email: data.email,
        relationship: data.relationship,
        is_primary: false, // Wait for admin to verify or just set to true if no primary exists
      })
      .select("id")
      .single();

    if (guardianError || !guardian) {
      // We don't fail the whole request here, but log it. The user has an account now.
      console.error("Failed to create guardian record:", guardianError);
      return { success: true, message: "Account created, but linking failed. Contact school admin." };
    }

    // 4. Link guardian to student
    const { error: linkError } = await supabase
      .from("student_guardians")
      .insert({
        student_id: student.id,
        guardian_id: guardian.id,
      });

    if (linkError) {
      console.error("Failed to link student and guardian:", linkError);
      return { success: true, message: "Account created, but linking to student failed. Contact admin." };
    }

    return { 
      success: true, 
      message: "Registration successful! You can now log in." 
    };

  } catch (err) {
    console.error("Registration error:", err);
    return { success: false, message: "An unexpected error occurred during registration" };
  }
}
