"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResponse } from "@/types";
import { z } from "zod";

const studentSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female"]),
  classId: z.string().uuid("Class is required"),
  enrollmentDate: z.string().optional(),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  medicalNotes: z.string().optional(),
  previousSchool: z.string().optional(),
  guardianName: z.string().min(1, "Guardian name is required"),
  guardianPhone: z.string().min(10, "Valid phone number required"),
  guardianWhatsapp: z.string().optional(),
  guardianEmail: z.string().email().optional().or(z.literal("")),
  guardianRelationship: z.string().min(1, "Relationship is required"),
  guardian2Name: z.string().optional(),
  guardian2Phone: z.string().optional(),
  guardian2Relationship: z.string().optional(),
});

export async function createStudentAction(
  formData: z.infer<typeof studentSchema>
): Promise<ActionResponse<{ studentId: string; admissionNumber: string }>> {
  try {
    const parsed = studentSchema.safeParse(formData);
    if (!parsed.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const data = parsed.data;
    const supabase = (await createClient()) as any;
    const adminSupabase = createAdminClient() as any;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id, role")
      .eq("id", user.id)
      .single() as any;

    if (!profile?.school_id || !["SUPER_ADMIN", "SCHOOL_ADMIN"].includes(profile.role)) {
      return { success: false, message: "Unauthorized" };
    }

    const schoolId = profile.school_id;

    // Generate admission number
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true })
      .eq("school_id", schoolId);

    const seq = String((count || 0) + 1).padStart(4, "0");
    const admissionNumber = `EDU-${year}-${seq}`;

    // Create student
    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        school_id: schoolId,
        admission_number: admissionNumber,
        full_name: data.fullName,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        enrollment_date: data.enrollmentDate || new Date().toISOString().split("T")[0],
        address: data.address || null,
        blood_group: data.bloodGroup || null,
        medical_notes: data.medicalNotes || null,
        previous_school: data.previousSchool || null,
        status: "Active" as const,
      })
      .select("id")
      .single();

    if (studentError || !student) {
      return { success: false, message: studentError?.message || "Failed to create student" };
    }

    // Get current academic year
    const { data: currentYear } = await supabase
      .from("academic_years")
      .select("id")
      .eq("school_id", schoolId)
      .eq("is_current", true)
      .single();

    if (currentYear) {
      await supabase.from("student_class_history").insert({
        student_id: student.id,
        class_id: data.classId,
        academic_year_id: currentYear.id,
        is_current: true,
        enrolled_date: data.enrollmentDate || new Date().toISOString().split("T")[0],
        outcome: "active" as const,
      });
    }

    // Create primary guardian
    const { data: guardian1 } = await supabase
      .from("guardians")
      .insert({
        full_name: data.guardianName,
        phone: data.guardianPhone,
        whatsapp_number: data.guardianWhatsapp || data.guardianPhone,
        email: data.guardianEmail || null,
        relationship: data.guardianRelationship,
        is_primary: true,
        school_id: schoolId,
      })
      .select("id")
      .single();

    if (guardian1) {
      await supabase.from("student_guardians").insert({
        student_id: student.id,
        guardian_id: guardian1.id,
      });
    }

    // Create secondary guardian if provided
    if (data.guardian2Name && data.guardian2Phone) {
      const { data: guardian2 } = await supabase
        .from("guardians")
        .insert({
          full_name: data.guardian2Name,
          phone: data.guardian2Phone,
          relationship: data.guardian2Relationship || "Guardian",
          is_primary: false,
          school_id: schoolId,
        })
        .select("id")
        .single();

      if (guardian2) {
        await supabase.from("student_guardians").insert({
          student_id: student.id,
          guardian_id: guardian2.id,
        });
      }
    }

    // Assign current term fees
    const { data: currentTerm } = await supabase
      .from("terms")
      .select("id")
      .eq("school_id", schoolId)
      .eq("status", "active")
      .single();

    if (currentTerm) {
      const { data: feeAssignments } = await supabase
        .from("fee_assignments")
        .select("id, amount")
        .eq("term_id", currentTerm.id)
        .eq("class_id", data.classId);

      if (feeAssignments) {
        for (const fa of feeAssignments) {
          await supabase.from("student_fees").insert({
            student_id: student.id,
            fee_assignment_id: fa.id,
            amount_owed: fa.amount,
            amount_paid: 0,
            status: "Unpaid",
          });
        }
      }
    }

    return {
      success: true,
      message: `Student ${data.fullName} enrolled successfully with admission number ${admissionNumber}`,
      data: { studentId: student.id, admissionNumber },
    };
  } catch (error) {
    console.error("Create student error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function updateStudentAction(
  studentId: string,
  updates: Record<string, unknown>
): Promise<ActionResponse> {
  try {
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase
      .from("students")
      .update(updates)
      .eq("id", studentId);

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Student updated successfully" };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function withdrawStudentAction(
  studentId: string,
  reason: string,
  withdrawalDate: string
): Promise<ActionResponse> {
  try {
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase
      .from("students")
      .update({
        status: "Withdrawn",
        withdrawal_date: withdrawalDate,
        withdrawal_reason: reason,
      })
      .eq("id", studentId);

    if (error) return { success: false, message: error.message };

    // Close current class history
    await supabase
      .from("student_class_history")
      .update({
        is_current: false,
        outcome: "withdrawn" as const,
        completed_date: withdrawalDate,
      })
      .eq("student_id", studentId)
      .eq("is_current", true);

    return { success: true, message: "Student withdrawn successfully" };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}
