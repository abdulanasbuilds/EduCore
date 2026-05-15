"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "@/types";
import { z } from "zod";

const classSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  level: z.number().min(1).max(15),
  capacity: z.number().min(1).optional(),
  classTeacherId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export async function createClassAction(
   formData: z.infer<typeof classSchema>
): Promise<ActionResponse<{ classId: string }>> {
   // STEP 1: Always verify authentication first
   const supabase = await createClient();
   const { data: { user }, error: authError } = await (supabase.auth as any).getUser();
   
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
   
   // STEP 3: Check role permission - only school_admin can create classes
   if (profile.role !== 'school_admin') {
     return { success: false, message: 'You do not have permission for this action.' }
   }

   try {
     const parsed = classSchema.safeParse(formData);
     if (!parsed.success) return { success: false, message: 'Validation failed' };

     const data = parsed.data;
     const supabase = await createClient();
     if (!supabase) return { success: false, message: 'Supabase not configured' };

     const { data: cls, error } = await supabase.from("classes").insert({
       school_id: profile.school_id,
       name: data.name,
       level: data.level,
       capacity: data.capacity || 40,
       class_teacher_id: data.classTeacherId || null,
       description: data.description || null,
     } as any).select("id").single() as any;

     if (error || !cls) return { success: false, message: 'Failed to create class' };
     return { success: true, message: `Class "${data.name}" created`, data: { classId: cls.id } };
   } catch (err: any) {
     console.error('Error in createClassAction:', err);
     return { success: false, message: 'An unexpected error occurred' };
   }
 }

export async function updateClassAction(
   classId: string,
   formData: Partial<z.infer<typeof classSchema>>
): Promise<ActionResponse> {
   // STEP 1: Always verify authentication first
   const supabase = await createClient();
   const { data: { user }, error: authError } = await (supabase.auth as any).getUser();
   
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
   
   // STEP 3: Check role permission - only school_admin can update classes
   if (profile.role !== 'school_admin') {
     return { success: false, message: 'You do not have permission for this action.' }
   }

   try {
     // Verify the class belongs to the user's school
     const { data: classCheck, error: classError } = await supabase
       .from("classes")
       .select("id, school_id")
       .eq("id", classId)
       .single();
   
     if (classError || !classCheck) {
       return { success: false, message: 'Class not found.' };
     }
     
     // STEP 4: Always scope queries to school_id
     if (classCheck.school_id !== profile.school_id) {
       return { success: false, message: 'Class does not belong to your school.' }
     }

     const update: any = {};
     if (formData.name !== undefined) update.name = formData.name;
     if (formData.level !== undefined) update.level = formData.level;
     if (formData.capacity !== undefined) update.capacity = formData.capacity;
     if (formData.classTeacherId !== undefined) update.class_teacher_id = formData.classTeacherId || null;
     if (formData.description !== undefined) update.description = formData.description;

     const { error } = await supabase.from("classes").update(update).eq("id", classId);
     if (error) return { success: false, message: 'Failed to update class' };
     return { success: true, message: 'Class updated' };
   } catch (err: any) {
     console.error('Error in updateClassAction:', err);
     return { success: false, message: 'An unexpected error occurred' };
   }
 }

export async function deleteClassAction(classId: string): Promise<ActionResponse> {
  try {
    const supabase = (await createClient()) as any;
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single() as any;
    if (!["school_admin"].includes(profile?.role)) return { success: false, message: "Unauthorized" };

    const { error } = await supabase.from("classes").delete().eq("id", classId);
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Class deleted" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

const subjectSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  type: z.enum(["Core", "Elective", "Optional"]),
});

export async function createSubjectAction(
  formData: z.infer<typeof subjectSchema>
): Promise<ActionResponse<{ subjectId: string }>> {
  try {
    const parsed = subjectSchema.safeParse(formData);
    if (!parsed.success) return { success: false, message: "Validation failed" };

    const data = parsed.data;
    const supabase = (await createClient()) as any;
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user.id).single() as any;
    if (!profile?.school_id) return { success: false, message: "No school found" };

    const { data: sub, error } = await supabase.from("subjects").insert({
      school_id: profile.school_id,
      name: data.name,
      code: data.code.toUpperCase(),
      type: data.type,
    } as any).select("id").single() as any;

    if (error || !sub) return { success: false, message: error?.message || "Failed to create subject" };
    return { success: true, message: `Subject "${data.name}" created`, data: { subjectId: sub.id } };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function allocateSubjectToClassAction(
  classId: string,
  subjectId: string,
  teacherId?: string
): Promise<ActionResponse> {
  try {
    const supabase = (await createClient()) as any;
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: existing } = await supabase
      .from("class_subjects").select("id").eq("class_id", classId).eq("subject_id", subjectId).limit(1);
    if (existing?.length) return { success: false, message: "Subject already assigned to this class" };

    const { error } = await supabase.from("class_subjects").insert({
      class_id: classId,
      subject_id: subjectId,
      teacher_id: teacherId || null,
    } as any);
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Subject assigned to class" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function removeSubjectFromClassAction(classId: string, subjectId: string): Promise<ActionResponse> {
  try {
    const supabase = (await createClient()) as any;
    const { error } = await supabase.from("class_subjects").delete().eq("class_id", classId).eq("subject_id", subjectId);
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Subject removed from class" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}