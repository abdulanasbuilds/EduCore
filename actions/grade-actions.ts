"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "@/types";
import { z } from "zod";

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
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

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
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

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
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase
      .from("assessments")
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .eq("id", assessmentId);

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Assessment published successfully" };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function deleteAssessmentAction(
  assessmentId: string
): Promise<ActionResponse> {
  try {
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

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
