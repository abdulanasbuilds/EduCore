"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResponse } from "@/types";
import { z } from "zod";
import { features, schoolConfig } from "@/lib/env";
import { sendSMS, sendWhatsApp } from "@/lib/twilio";
import { gradePublished } from "@/lib/notifications/templates";

const assessmentSchema = z.object({
  termId: z.string().uuid(),
  classId: z.string().uuid(),
  subjectId: z.string().uuid(),
  assessmentTypeId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  date: z.string().min(1, "Date is required"),
  maxScore: z.number().positive("Max score must be positive"),
});

export async function createAssessmentAction(
  formData: z.infer<typeof assessmentSchema>
): Promise<ActionResponse<{ assessmentId: string }>> {
  try {
    const parsed = assessmentSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, message: "Validation failed" };
    }

    const data = parsed.data;
    const supabase = await createClient();
    if (!supabase) return { success: false, message: "Supabase not configured" };
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, school_id")
      .eq("id", user.id)
      .single();

    if (!profile?.school_id || !["school_admin", "class_teacher", "subject_teacher"].includes(profile.role)) {
      return { success: false, message: "Unauthorized: Only teachers and admins can create assessments" };
    }

    const { data: assessment, error } = await supabase
      .from("assessments")
      .insert({
        term_id: data.termId,
        class_id: data.classId,
        subject_id: data.subjectId,
        assessment_type_id: data.assessmentTypeId,
        title: data.title,
        date: data.date,
        max_score: data.maxScore,
        is_published: false,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (error || !assessment) {
      return { success: false, message: error?.message || "Failed to create assessment" };
    }

    return {
      success: true,
      message: "Assessment created successfully",
      data: { assessmentId: assessment.id },
    };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}

const gradeEntrySchema = z.object({
  assessmentId: z.string().uuid(),
  grades: z.array(
    z.object({
      studentId: z.string().uuid(),
      score: z.number().min(0).nullable(),
      remarks: z.string().optional(),
    })
  ),
});

export async function submitGradesAction(
  formData: z.infer<typeof gradeEntrySchema>
): Promise<ActionResponse> {
  try {
    const parsed = gradeEntrySchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, message: "Validation failed" };
    }

    const data = parsed.data;
    const supabase = await createClient();
    if (!supabase) return { success: false, message: "Supabase not configured" };
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, school_id")
      .eq("id", user.id)
      .single();

    if (!profile?.school_id || !["school_admin", "class_teacher", "subject_teacher"].includes(profile.role)) {
      return { success: false, message: "Unauthorized: Only teachers and admins can submit grades" };
    }

    // Get assessment max score for validation
    const { data: assessment } = await supabase
      .from("assessments")
      .select("max_score")
      .eq("id", data.assessmentId)
      .single();

    if (!assessment) {
      return { success: false, message: "Assessment not found" };
    }

    // Validate scores
    for (const grade of data.grades) {
      if (grade.score !== null && grade.score > assessment.max_score) {
        return { success: false, message: `Score cannot exceed ${assessment.max_score}` };
      }
    }

    // Upsert grades
    for (const grade of data.grades) {
      const { error } = await supabase
        .from("grades")
        .upsert(
          {
            assessment_id: data.assessmentId,
            student_id: grade.studentId,
            score: grade.score,
            remarks: grade.remarks || null,
          },
          { onConflict: "assessment_id,student_id" }
        );

      if (error) {
        return { success: false, message: `Failed to save grade: ${error.message}` };
      }
    }

    return {
      success: true,
      message: `Grades saved for ${data.grades.length} students`,
    };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function publishAssessmentAction(
  assessmentId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    if (!supabase) return { success: false, message: "Supabase not configured" };
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!["school_admin", "class_teacher", "subject_teacher"].includes(profile?.role || "")) {
      return { success: false, message: "Unauthorized: Only teachers and admins can publish assessments" };
    }

    const { error } = await supabase
      .from("assessments")
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .eq("id", assessmentId);

    if (error) return { success: false, message: error.message };

     // For publishing assessments, we need to look up related data for notifications
     // We can use the regular client with RLS since we're already authenticated
     const { data: assessment } = await supabase
       .from("assessments")
       .select("*, subjects(name), classes(name)")
       .eq("id", assessmentId)
       .single();

     if (assessment) {
       const { data: grades } = await supabase
         .from("grades")
         .select("student_id")
         .eq("assessment_id", assessmentId);
       if (grades) {
         const studentIds = [...new Set(grades.map((g: any) => g.student_id))];
         for (const studentId of studentIds) {
           const { data: student } = await supabase.from("students").select("full_name, admission_number").eq("id", studentId).single();
           const { data: guardian } = await supabase
             .from("student_guardians")
             .select("guardians(full_name, phone, whatsapp_number)")
             .eq("student_id", studentId)
             .eq("is_primary", true)
             .single();
           const g = guardian?.guardians;
           if (!g?.phone) continue;
           const parentName = g.full_name || "Parent";
           const phone = g.whatsapp_number || g.phone;
           const { data: grade } = await supabase.from("grades").select("score").eq("assessment_id", assessmentId).eq("student_id", studentId).single();
           if (!grade?.score && grade?.score !== 0) continue;
           const score = grade.score;
           const max = assessment.max_score;
           const pct = Math.round((score / max) * 100);
           const gradeL = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";
           const portal = `${process.env.NEXT_PUBLIC_APP_URL}/parent/grades`;
           const msg = gradePublished(parentName, student?.full_name || "", assessment.subjects?.name || "", score, max, gradeL, portal);
           sendWhatsApp({ to: phone, message: msg, recipientName: parentName, type: "grade" }).catch(() => {});
           if (!features.smsEnabled) {
             sendSMS({ to: phone, message: msg, recipientName: parentName, type: "grade" }).catch(() => {});
           }
         }
       }
     }

    return { success: true, message: "Assessment published. Parents notified." };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function deleteAssessmentAction(
  assessmentId: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    if (!supabase) return { success: false, message: "Supabase not configured" };
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!["school_admin"].includes(profile?.role || "")) {
      return { success: false, message: "Unauthorized: Only admins can delete assessments" };
    }

    // Check if grades exist
    const { count } = await supabase
      .from("grades")
      .select("*", { count: "exact", head: true })
      .eq("assessment_id", assessmentId);

    if (count && count > 0) {
      return { success: false, message: "Cannot delete assessment with existing grades" };
    }

    const { error } = await supabase
      .from("assessments")
      .delete()
      .eq("id", assessmentId);

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Assessment deleted" };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}
