"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "@/types";
import { z } from "zod";

const academicYearSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  terms: z.array(
    z.object({
      name: z.string(),
      termNumber: z.number().min(1).max(3),
      startDate: z.string(),
      endDate: z.string(),
      feeDueDate: z.string(),
    })
  ),
});

export async function createAcademicYearAction(
  formData: z.infer<typeof academicYearSchema>
): Promise<ActionResponse<{ yearId: string }>> {
  try {
    const parsed = academicYearSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, message: "Validation failed" };
    }

    const data = parsed.data;
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("id", user.id)
      .single() as any;

    if (!profile?.school_id) return { success: false, message: "No school found" };

      const { data: year, error } = await supabase
      .from("academic_years")
      .insert({
        school_id: profile.school_id,
        name: data.name,
        start_date: data.startDate,
        end_date: data.endDate,
        is_current: false,
        status: "active" as const,
      } as any)
      .select("id")
      .single() as any;

    if (error || !year) return { success: false, message: error?.message || "Failed" };

    // Create terms
    for (const term of data.terms) {
      await supabase.from("terms").insert({
        academic_year_id: year.id,
        school_id: profile.school_id,
        name: term.name,
        term_number: term.termNumber,
        start_date: term.startDate,
        end_date: term.endDate,
        fee_due_date: term.feeDueDate,
        status: "upcoming" as const,
      } as any);
    }

    return {
      success: true,
      message: "Academic year created",
      data: { yearId: year.id },
    };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function setCurrentYearAction(yearId: string): Promise<ActionResponse> {
  try {
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("id", user.id)
      .single() as any;

    if (!profile?.school_id) return { success: false, message: "No school found" };

    // Unset all current years
    await supabase
      .from("academic_years")
      .update({ is_current: false } as any)
      .eq("school_id", profile.school_id);

    // Set the selected year as current
    const { error } = await supabase
      .from("academic_years")
      .update({ is_current: true } as any)
      .eq("id", yearId);

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Academic year set as current" };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function closeTermAction(termId: string): Promise<ActionResponse> {
  try {
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase
      .from("terms")
      .update({ status: "closed" as const } as any)
      .eq("id", termId);

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Term closed successfully" };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function openTermAction(termId: string): Promise<ActionResponse> {
  try {
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("id", user.id)
      .single() as any;

    if (!profile?.school_id) return { success: false, message: "No school found" };

    // Close any currently active term
    await supabase
      .from("terms")
      .update({ status: "closed" as const } as any)
      .eq("school_id", profile.school_id)
      .eq("status", "active");

    const { error } = await supabase
      .from("terms")
      .update({ status: "active" as const } as any)
      .eq("id", termId);

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Term opened" };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function closeAcademicYearAction(yearId: string): Promise<ActionResponse> {
  try {
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { error } = await supabase
      .from("academic_years")
      .update({ status: "closed" as const, is_current: false } as any)
      .eq("id", yearId);

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Academic year closed" };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}

const promotionSchema = z.object({
  academicYearId: z.string().uuid(),
  decisions: z.array(
    z.object({
      studentId: z.string().uuid(),
      currentClassId: z.string().uuid(),
      outcome: z.enum(["promoted", "repeated", "graduated", "withdrawn"]),
      nextClassId: z.string().uuid().optional(),
    })
  ),
});

export async function executePromotionsAction(
  formData: z.infer<typeof promotionSchema>
): Promise<ActionResponse<{ promoted: number; repeated: number; graduated: number }>> {
  try {
    const parsed = promotionSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, message: "Validation failed" };
    }

    const data = parsed.data;
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("school_id")
      .eq("id", user.id)
      .single() as any;

    if (!profile?.school_id) return { success: false, message: "No school found" };

    // Get next academic year
    const { data: nextYear } = await supabase
      .from("academic_years")
      .select("id")
      .eq("school_id", profile.school_id)
      .eq("status", "active")
      .neq("id", data.academicYearId)
      .order("start_date", { ascending: false })
      .limit(1)
      .single();

    let promoted = 0, repeated = 0, graduated = 0;

    for (const decision of data.decisions) {
      // Close current history record
      await supabase
        .from("student_class_history")
        .update({
          is_current: false,
          outcome: decision.outcome,
          completed_date: new Date().toISOString().split("T")[0],
        } as any)
        .eq("student_id", decision.studentId)
        .eq("class_id", decision.currentClassId)
        .eq("academic_year_id", data.academicYearId);

      if (decision.outcome === "promoted" && decision.nextClassId && nextYear) {
        await supabase.from("student_class_history").insert({
          student_id: decision.studentId,
          class_id: decision.nextClassId,
          academic_year_id: nextYear.id,
          is_current: true,
          outcome: "active" as const,
          enrolled_date: new Date().toISOString().split("T")[0],
        } as any);
        promoted++;
      } else if (decision.outcome === "repeated" && nextYear) {
        await supabase.from("student_class_history").insert({
          student_id: decision.studentId,
          class_id: decision.currentClassId,
          academic_year_id: nextYear.id,
          is_current: true,
          outcome: "active" as const,
          enrolled_date: new Date().toISOString().split("T")[0],
        } as any);
        repeated++;
      } else if (decision.outcome === "graduated") {
        await supabase
          .from("students")
          .update({ status: "Graduated" as const } as any)
          .eq("id", decision.studentId);
        graduated++;
      }
    }

    return {
      success: true,
      message: `Promotions executed: ${promoted} promoted, ${repeated} repeated, ${graduated} graduated`,
      data: { promoted, repeated, graduated },
    };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}
