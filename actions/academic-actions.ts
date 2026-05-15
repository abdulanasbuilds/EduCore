"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth, isAuthError } from "@/lib/auth";
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
   // Use requireAuth for authentication and authorization
   const auth = await requireAuth(['school_admin']);
   if (isAuthError(auth)) {
     return { success: false, message: auth.error };
   }
   
   try {
     const parsed = academicYearSchema.safeParse(formData);
     if (!parsed.success) {
       return { success: false, message: 'Validation failed' };
     }

     const data = parsed.data;
     const supabase = await createClient();
     if (!supabase) return { success: false, message: 'Supabase not configured' };

       const { data: year, error } = await supabase
       .from("academic_years")
       .insert({
         school_id: auth.schoolId,
         name: data.name,
         start_date: data.startDate,
         end_date: data.endDate,
         is_current: false,
         status: "active" as const,
       } as any)
       .select("id")
       .single() as any;

     if (error || !year) return { success: false, message: 'Failed to create academic year' };

     // Create terms
     for (const term of data.terms) {
       await supabase.from("terms").insert({
         academic_year_id: year.id,
         school_id: auth.schoolId,
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
       message: 'Academic year created',
       data: { yearId: year.id },
     };
   } catch (err: any) {
     console.error('Error in createAcademicYearAction:', err);
     return { success: false, message: 'An unexpected error occurred' };
   }
 }

export async function setCurrentYearAction(yearId: string): Promise<ActionResponse> {
   // STEP 1: Always verify authentication first
   const supabase = await createClient();
   const { data: { user }, error: authError } = await supabase.auth.getUser();
   
   if (authError || !user) {
     return { success: false, message: 'Authentication required.' };
   }

   // STEP 2: Get user role and school_id from profiles
   const { data: profile } = await supabase
     .from('profiles')
     .select('role, school_id, is_active')
     .eq('id', user.id)
     .single();
   
   if (!profile) {
     return { success: false, message: 'Profile not found.' };
   }
   
   if (!profile.is_active) {
     return { success: false, message: 'Account is inactive.' };
   }
   
   if (!profile.school_id) {
     return { success: false, message: 'No school assigned to this account.' }
   }
   
   // STEP 3: Check role permission - only school_admin can set current year
   if (profile.role !== 'school_admin') {
     return { success: false, message: 'You do not have permission for this action.' }
   }

   try {
     // Verify the year belongs to the user's school
     const { data: yearCheck, error: yearError } = await supabase
       .from("academic_years")
       .select("id, school_id")
       .eq("id", yearId)
       .single();
   
     if (yearError || !yearCheck) {
       return { success: false, message: 'Academic year not found.' };
     }
     
     // STEP 4: Always scope queries to school_id
     if (yearCheck.school_id !== profile.school_id) {
       return { success: false, message: 'Academic year does not belong to your school.' }
     }

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

     if (error) return { success: false, message: 'Failed to set academic year as current' };
     return { success: true, message: 'Academic year set as current' };
   } catch (err: any) {
     console.error('Error in setCurrentYearAction:', err);
     return { success: false, message: 'An unexpected error occurred' };
   }
 }

export async function closeTermAction(termId: string): Promise<ActionResponse> {
   // STEP 1: Always verify authentication first
   const supabase = await createClient();
   const { data: { user }, error: authError } = await supabase.auth.getUser();
   
   if (authError || !user) {
     return { success: false, message: 'Authentication required.' };
   }

   // STEP 2: Get user role and school_id from profiles
   const { data: profile } = await supabase
     .from('profiles')
     .select('role, school_id, is_active')
     .eq('id', user.id)
     .single();
   
   if (!profile) {
     return { success: false, message: 'Profile not found.' };
   }
   
   if (!profile.is_active) {
     return { success: false, message: 'Account is inactive.' };
   }
   
   if (!profile.school_id) {
     return { success: false, message: 'No school assigned to this account.' }
   }
   
   // STEP 3: Check role permission - who can close terms?
   // school_admin: can close any term in their school
   // class_teacher/subject_teacher: can close terms for their classes? (probably not)
   // For safety, only allow school_admin to close terms
   if (profile.role !== 'school_admin') {
     return { success: false, message: 'You do not have permission for this action.' }
   }

   try {
     // Verify the term belongs to the user's school
     const { data: termCheck, error: termError } = await supabase
       .from("terms")
       .select("id, school_id")
       .eq("id", termId)
       .single();
   
     if (termError || !termCheck) {
       return { success: false, message: 'Term not found.' };
     }
     
     // STEP 4: Always scope queries to school_id
     if (termCheck.school_id !== profile.school_id) {
       return { success: false, message: 'Term does not belong to your school.' }
     }

     const { error } = await supabase
       .from("terms")
       .update({ status: "closed" as const } as any)
       .eq("id", termId);

     if (error) return { success: false, message: 'Failed to close term' };
     return { success: true, message: 'Term closed successfully' };
   } catch (err: any) {
     console.error('Error in closeTermAction:', err);
     return { success: false, message: 'An unexpected error occurred' };
   }
 }

export async function openTermAction(termId: string): Promise<ActionResponse> {
   // STEP 1: Always verify authentication first
   const supabase = await createClient();
   const { data: { user }, error: authError } = await supabase.auth.getUser();
   
   if (authError || !user) {
     return { success: false, message: 'Authentication required.' };
   }

   // STEP 2: Get user role and school_id from profiles
   const { data: profile } = await supabase
     .from('profiles')
     .select('role, school_id, is_active')
     .eq('id', user.id)
     .single();
   
   if (!profile) {
     return { success: false, message: 'Profile not found.' };
   }
   
   if (!profile.is_active) {
     return { success: false, message: 'Account is inactive.' };
   }
   
   if (!profile.school_id) {
     return { success: false, message: 'No school assigned to this account.' }
   }
   
   // STEP 3: Check role permission - who can open terms?
   // school_admin: can open any term in their school
   // class_teacher/subject_teacher: can open terms for their classes? (probably not)
   // For safety, only allow school_admin to open terms
   if (profile.role !== 'school_admin') {
     return { success: false, message: 'You do not have permission for this action.' }
   }

   try {
     // Verify the term belongs to the user's school
     const { data: termCheck, error: termError } = await supabase
       .from("terms")
       .select("id, school_id")
       .eq("id", termId)
       .single();
   
     if (termError || !termCheck) {
       return { success: false, message: 'Term not found.' };
     }
     
     // STEP 4: Always scope queries to school_id
     if (termCheck.school_id !== profile.school_id) {
       return { success: false, message: 'Term does not belong to your school.' }
     }

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

     if (error) return { success: false, message: 'Failed to open term' };
     return { success: true, message: 'Term opened' };
   } catch (err: any) {
     console.error('Error in openTermAction:', err);
     return { success: false, message: 'An unexpected error occurred' };
   }
 }

export async function closeAcademicYearAction(yearId: string): Promise<ActionResponse> {
   // STEP 1: Always verify authentication first
   const supabase = await createClient();
   const { data: { user }, error: authError } = await supabase.auth.getUser();
   
   if (authError || !user) {
     return { success: false, message: 'Authentication required.' };
   }

   // STEP 2: Get user role and school_id from profiles
   const { data: profile } = await supabase
     .from('profiles')
     .select('role, school_id, is_active')
     .eq('id', user.id)
     .single();
   
   if (!profile) {
     return { success: false, message: 'Profile not found.' };
   }
   
   if (!profile.is_active) {
     return { success: false, message: 'Account is inactive.' };
   }
   
   if (!profile.school_id) {
     return { success: false, message: 'No school assigned to this account.' }
   }
   
   // STEP 3: Check role permission - only school_admin can close academic years
   if (profile.role !== 'school_admin') {
     return { success: false, message: 'You do not have permission for this action.' }
   }

   try {
     // Verify the year belongs to the user's school
     const { data: yearCheck, error: yearError } = await supabase
       .from("academic_years")
       .select("id, school_id")
       .eq("id", yearId)
       .single();
   
     if (yearError || !yearCheck) {
       return { success: false, message: 'Academic year not found.' };
     }
     
     // STEP 4: Always scope queries to school_id
     if (yearCheck.school_id !== profile.school_id) {
       return { success: false, message: 'Academic year does not belong to your school.' }
     }

     const { error } = await supabase
       .from("academic_years")
       .update({ status: "closed" as const, is_current: false } as any)
       .eq("id", yearId);

     if (error) return { success: false, message: 'Failed to close academic year' };
     return { success: true, message: 'Academic year closed' };
   } catch (err: any) {
     console.error('Error in closeAcademicYearAction:', err);
     return { success: false, message: 'An unexpected error occurred' };
   }
 }

export async function rolloverYearAction(
   sourceYearId: string,
   newYearData: { name: string; startDate: string; endDate: string; terms: Array<{ name: string; termNumber: number; startDate: string; endDate: string; feeDueDate: string }> }
): Promise<ActionResponse<{ yearId: string; classesCreated: number; subjectsCreated: number; promotionsDone: number }>> {
   // STEP 1: Always verify authentication first
   const supabase = await createClient();
   const { data: { user }, error: authError } = await supabase.auth.getUser();
   
   if (authError || !user) {
     return { success: false, message: 'Authentication required.' };
   }

   // STEP 2: Get user role and school_id from profiles
   const { data: profile } = await supabase
     .from('profiles')
     .select('role, school_id, is_active')
     .eq('id', user.id)
     .single();
   
   if (!profile) {
     return { success: false, message: 'Profile not found.' };
   }
   
   if (!profile.is_active) {
     return { success: false, message: 'Account is inactive.' }
   }
   
   if (!profile.school_id) {
     return { success: false, message: 'No school assigned to this account.' }
   }
   
   // STEP 3: Check role permission - only school_admin can rollover years
   if (profile.role !== 'school_admin') {
     return { success: false, message: 'You do not have permission for this action.' }
   }

   try {
     // Verify the source year belongs to the user's school
     const { data: sourceYear, error: sourceYearError } = await supabase
       .from("academic_years").select("*").eq("id", sourceYearId).eq("school_id", profile.school_id).single() as any;
     if (sourceYearError || !sourceYear) return { success: false, message: 'Source year not found or does not belong to your school.' };

     const { data: newYear, error: yearErr } = await supabase
       .from("academic_years").insert({
         school_id: profile.school_id,
         name: newYearData.name,
         start_date: newYearData.startDate,
         end_date: newYearData.endDate,
         is_current: false,
         status: "active" as const,
       } as any).select("id").single() as any;
     if (yearErr || !newYear) return { success: false, message: 'Failed to create year' };

     for (const term of newYearData.terms) {
       await supabase.from("terms").insert({
         academic_year_id: newYear.id,
         school_id: profile.school_id,
         name: term.name,
         term_number: term.termNumber,
         start_date: term.startDate,
         end_date: term.endDate,
         fee_due_date: term.feeDueDate,
         status: "upcoming" as const,
       } as any);
     }

     const { data: sourceClasses } = await supabase
       .from("classes").select("*").eq("school_id", profile.school_id);
     let classesCreated = 0;
     const classIdMap: Record<string, string> = {};
     if (sourceClasses?.length) {
       for (const cls of sourceClasses) {
         const { data: newCls } = await supabase.from("classes").insert({
           school_id: profile.school_id,
           name: cls.name,
           level: cls.level,
           class_teacher_id: null,
           capacity: cls.capacity,
           description: cls.description,
         } as any).select("id").single() as any;
         if (newCls) {
           classIdMap[cls.id] = newCls.id;
           classesCreated++;
         }
       }
     }

     const { data: sourceSubjects } = await supabase
       .from("subjects").select("id, name, code, type").eq("school_id", profile.school_id);
     let subjectsCreated = 0;
     const subjectIdMap: Record<string, string> = {};
     if (sourceSubjects?.length) {
       for (const sub of sourceSubjects) {
         const { data: newSub } = await supabase.from("subjects").insert({
           school_id: profile.school_id,
           name: sub.name,
           code: sub.code,
           type: sub.type,
         } as any).select("id").single() as any;
         if (newSub) {
           subjectIdMap[sub.id] = newSub.id;
           subjectsCreated++;
         }
       }
     }

     if (Object.keys(classIdMap).length > 0 && Object.keys(subjectIdMap).length > 0) {
       const { data: sourceAllocations } = await supabase
         .from("class_subject_allocations")
         .select("class_id, subject_id")
         .in("class_id", Object.keys(classIdMap));

       if (sourceAllocations?.length) {
         const newAllocations = sourceAllocations
           .filter((a: any) => classIdMap[a.class_id] && subjectIdMap[a.subject_id])
           .map((a: any) => ({
             class_id: classIdMap[a.class_id],
             subject_id: subjectIdMap[a.subject_id],
           }));
         await supabase.from("class_subject_allocations").insert(newAllocations as any);
       }
     }

     const { data: sourceTimetable } = await supabase
       .from("timetable_entries")
       .select("class_id, subject_id, teacher_id, day_of_week, period_number, room")
       .in("class_id", Object.keys(classIdMap));

     if (sourceTimetable?.length) {
       const newEntries = sourceTimetable
         .filter((t: any) => classIdMap[t.class_id] && subjectIdMap[t.subject_id])
         .map((t: any) => ({
           class_id: classIdMap[t.class_id],
           subject_id: subjectIdMap[t.subject_id],
           teacher_id: t.teacher_id,
           day_of_week: t.day_of_week,
           period_number: t.period_number,
           room: t.room,
           academic_year_id: newYear.id,
         }));
       await supabase.from("timetable_entries").insert(newEntries as any);
     }

     const { data: sourceFees } = await supabase
       .from("fee_assignments").select("id, class_id, fee_type_id, amount, description")
       .in("class_id", Object.keys(classIdMap));

     const newYearTerms = await supabase.from("terms").select("id").eq("academic_year_id", newYear.id);
     if (sourceFees?.length && newYearTerms.data?.length) {
       for (const term of newYearTerms.data) {
         const feeRecords = sourceFees
           .filter((f: any) => classIdMap[f.class_id])
           .map((f: any) => ({
             class_id: classIdMap[f.class_id],
             fee_type_id: f.fee_type_id,
             term_id: term.id,
             amount: f.amount,
             description: f.description,
           }));
         await supabase.from("fee_assignments").insert(feeRecords as any);
       }
     }

     const { data: sourceRules } = await supabase
       .from("promotion_rules").select("class_id, min_avg_score, min_subject_score, require_all_subjects")
       .eq("school_id", profile.school_id);

     if (sourceRules?.length) {
       const newRules = sourceRules.map((r: any) => ({
         school_id: profile.school_id,
         class_id: r.class_id ? classIdMap[r.class_id] : null,
         min_avg_score: r.min_avg_score,
         min_subject_score: r.min_subject_score,
         require_all_subjects: r.require_all_subjects,
       }));
       await supabase.from("promotion_rules").upsert(newRules as any);
     }

     return {
       success: true,
       message: `New year created. ${classesCreated} classes, ${subjectsCreated} subjects copied from ${sourceYear.name}.`,
       data: { yearId: newYear.id, classesCreated, subjectsCreated, promotionsDone: 0 },
     };
   } catch (err: any) {
     console.error('Error in rolloverYearAction:', err);
     return { success: false, message: 'An unexpected error occurred' };
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
    if (!supabase) return { success: false, message: "Supabase not configured" };
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
