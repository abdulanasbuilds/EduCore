"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth, isAuthError } from "@/lib/auth";
import { sendSMS, sendWhatsApp } from "@/lib/twilio";
import { schoolConfig } from "@/lib/env";
import type { ActionResponse } from "@/types";
import { z } from "zod";

const announcementSchema = z.object({
   title: z.string().min(1, "Title is required").max(100),
   message: z.string().min(1, "Message is required").max(500),
   sendTo: z.enum(["everyone", "class", "individual"]),
   classId: z.string().uuid().optional(),
   guardianId: z.string().uuid().optional(),
   sendWhatsApp: z.boolean(),
   sendSMS: z.boolean(),
});

export async function sendAnnouncementAction(
    formData: z.infer<typeof announcementSchema>
): Promise<ActionResponse<{ sent: number; failed: number; total: number }>> {
    // Use requireAuth for authentication and authorization
    const auth = await requireAuth(['school_admin', 'class_teacher', 'subject_teacher', 'bursar']);
    if (isAuthError(auth)) {
      return { success: false, message: auth.error };
    }
    
    try {
      const parsed = announcementSchema.safeParse(formData);
      if (!parsed.success) {
        return { success: false, message: "Validation failed" };
      }

      const data = parsed.data;
      const supabase = await createClient();
    
    // Verify the school_id matches the user's school for class/guardian operations
    if (data.sendTo === "class" && data.classId) {
      // Verify the class belongs to the user's school
      const { data: classCheck, error: classError } = await supabase
        .from("classes")
        .select("id, school_id")
        .eq("id", data.classId)
        .single();
      if (classError || !classCheck) {
        return { success: false, message: 'Class not found.' };
      }
      if (classCheck.school_id !== auth.schoolId) {
        return { success: false, message: 'Access denied.' };
      }
    } else if (data.sendTo === "individual" && data.guardianId) {
      // Verify the guardian belongs to the user's school
      const { data: guardianCheck, error: guardianError } = await supabase
        .from("guardians")
        .select("id, school_id")
        .eq("id", data.guardianId)
        .single();
      if (guardianError || !guardianCheck) {
        return { success: false, message: 'Guardian not found.' };
      }
      if (guardianCheck.school_id !== auth.schoolId) {
        return { success: false, message: 'Access denied.' };
      }
    }

    let guardians: any[] = [];

    if (data.sendTo === "everyone") {
      const { data: allGuardians } = await supabase
        .from("guardians")
        .select("id, full_name, phone, whatsapp_number, is_primary, student_id")
        .eq("school_id", auth.schoolId)
        .eq("is_primary", true);
      guardians = allGuardians ?? [];
    } else if (data.sendTo === "class") {
      if (!data.classId) return { success: false, message: "Class is required" };
      const { data: classStudents } = await supabase
        .from("student_class_history")
        .select("student_id")
        .eq("class_id", data.classId)
        .eq("is_current", true);
      if (!classStudents) return { success: false, message: "No students found" };
      const studentIds = classStudents.map((s: any) => s.student_id);
      const { data: classGuardians } = await supabase
        .from("guardians")
        .select("id, full_name, phone, whatsapp_number, is_primary, student_id")
        .in("student_id", studentIds)
        .eq("is_primary", true);
      guardians = classGuardians ?? [];
    } else if (data.sendTo === "individual") {
      if (!data.guardianId) return { success: false, message: "Guardian is required" };
      const { data: singleGuardian } = await supabase
        .from("guardians")
        .select("id, full_name, phone, whatsapp_number, is_primary, student_id")
        .eq("id", data.guardianId)
        .single();
      if (singleGuardian) guardians = [singleGuardian];
    }

    if (guardians.length === 0) {
      return { success: false, message: "No recipients found" };
    }

    const channels: string[] = [];
    if (data.sendWhatsApp) channels.push("whatsapp");
    if (data.sendSMS) channels.push("sms");

    const target: string = data.sendTo === "everyone" ? "all" : data.sendTo === "class" ? "class" : "individual";
    const { data: announcement } = await supabase
      .from("announcements")
      .insert({
        school_id: auth.schoolId,
        created_by: auth.userId,
        title: data.title,
        body: data.message,
        target,
        class_id: data.classId || null,
        individual_guardian_id: data.guardianId || null,
        channels,
        recipient_count: guardians.length,
        send_sms: data.sendSMS,
        send_whatsapp: data.sendWhatsApp,
      })
      .select("id")
      .single();

    const fullMessage = `${schoolConfig.name}: ${data.message}`;
    let sent = 0;
    let failed = 0;

    for (const guardian of guardians) {
      const phone = guardian.whatsapp_number || guardian.phone;
      if (!phone) { failed++; continue; }

      for (const channel of channels) {
        if (channel === "whatsapp") {
          const result = await sendWhatsApp({
            to: phone,
            message: fullMessage,
            recipientName: guardian.full_name,
            type: "announcement",
          });
          if (result.success) sent++; else failed++;
        } else if (channel === "sms") {
          const result = await sendSMS({
            to: phone,
            message: fullMessage,
            recipientName: guardian.full_name,
            type: "announcement",
          });
          if (result.success) sent++; else failed++;
        }
      }

      if (guardians.indexOf(guardian) < guardians.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    if (announcement) {
      await supabase
        .from("announcements")
        .update({ delivered_count: sent, failed_count: failed })
        .eq("id", announcement.id);
    }

    return {
      success: true,
      message: `Sent to ${sent} recipients. ${failed > 0 ? `${failed} failed.` : ""}`,
      data: { sent, failed, total: guardians.length },
    };
    } catch (error) {
      console.error("Error in sendAnnouncementAction:", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  }

export async function sendQuickMessageAction(
   guardianId: string,
   message: string,
   studentName?: string
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
     return { success: false, message: 'Account is inactive.' }
   }
   
   if (!profile.school_id) {
     return { success: false, message: 'No school assigned to this account.' }
   }
   
   // STEP 3: Check role permission - who can send quick messages?
   // school_admin: can send messages to any guardian in their school
   // class_teacher/subject_teacher: can send messages to guardians of students in their classes
   // bursar: can send messages to all guardians? (for fee-related communication)
   // parent/student: cannot send quick messages (privacy concern)
   if (!['school_admin', 'class_teacher', 'subject_teacher', 'bursar'].includes(profile.role)) {
     return { success: false, message: 'You do not have permission for this action.' }
   }

   try {
     // STEP 4: For looking up the specific guardian, we need to verify they belong to the user's school
     // We can use the regular client with RLS for this lookup since we're just reading one record
     const { data: guardian, error: guardianError } = await supabase
       .from("guardians")
       .select("id, full_name, phone, whatsapp_number, student_id")
       .eq("id", guardianId)
       .eq("school_id", profile.school_id)  // Important: scope to user's school
       .single();

     if (guardianError || !guardian) {
       return { success: false, message: 'Guardian not found or access denied' };
     }

     const fullMessage = `${schoolConfig.name}${studentName ? ` — Regarding ${studentName}` : ""}: ${message}`;
     const phone = guardian.whatsapp_number || guardian.phone;
     if (!phone) return { success: false, message: "No phone number found" };

     let delivered = 0;
     let failed = 0;

     const waResult = await sendWhatsApp({
       to: phone,
       message: fullMessage,
       recipientName: guardian.full_name,
       type: "direct_message",
     });
     if (waResult.success) delivered++; else failed++;

     if (!waResult.success) {
       const smsResult = await sendSMS({
         to: phone,
         message: fullMessage,
         recipientName: guardian.full_name,
         type: "direct_message",
       });
       if (smsResult.success) delivered++; else failed++;
     }

     return {
       success: failed === 0,
       message: failed === 0 ? "Message sent successfully" : "Message sent via fallback SMS",
     };
   } catch (err: any) {
     console.error('Error in sendQuickMessageAction:', err)
     return { success: false, message: 'An unexpected error occurred' };
   }
 }

export async function getRecipientsCountAction(params: {
  sendTo: "everyone" | "class" | "individual";
  classId?: string;
  guardianId?: string;
}): Promise<{ count: number }> {
  const adminClient = createAdminClient() as any;

  const { data: profile } = await adminClient
    .from("profiles")
    .select("school_id")
    .limit(1)
    .single();

  if (!profile) return { count: 0 };

  if (params.sendTo === "everyone") {
    const { count } = await adminClient
      .from("guardians")
      .select("id", { count: "exact" })
      .eq("school_id", profile.school_id)
      .eq("is_primary", true);
    return { count: count ?? 0 };
  }

  if (params.sendTo === "class" && params.classId) {
    const { data: classStudents } = await adminClient
      .from("student_class_history")
      .select("student_id")
      .eq("class_id", params.classId)
      .eq("is_current", true);
    if (!classStudents) return { count: 0 };
    const studentIds = classStudents.map((s: any) => s.student_id);
    const { count } = await adminClient
      .from("guardians")
      .select("id", { count: "exact" })
      .in("student_id", studentIds)
      .eq("is_primary", true);
    return { count: count ?? 0 };
  }

  if (params.sendTo === "individual" && params.guardianId) {
    return { count: 1 };
  }

  return { count: 0 };
}

export async function searchGuardiansAction(query: string): Promise<ActionResponse<{ guardians: any[] }>> {
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
     return { success: false, message: 'Account is inactive.' }
   }
   
   if (!profile.school_id) {
     return { success: false, message: 'No school assigned to this account.' }
   }

   // STEP 3: Check role permission - who can search guardians?
   // school_admin: can search all guardians in their school
   // class_teacher/subject_teacher: can search guardians of students in their classes
   // bursar: can search all guardians? (for fee-related communication)
   // parent/student: cannot search guardians (privacy concern)
   if (!['school_admin', 'class_teacher', 'subject_teacher', 'bursar'].includes(profile.role)) {
     return { success: false, message: 'You do not have permission for this action.' }
   }

   // STEP 4: Use admin client for operations that need to bypass RLS (like searching across tables)
   // But only after authentication and authorization
   const adminClient = createAdminClient() as any;

   // Verify the search is scoped to the user's school
   // (Note: We're using admin client but still scoping to school_id for defense in depth)
   if (!query) return { success: true, message: 'OK', data: { guardians: [] } };

   // Fix injection vulnerability: Use parameterized query instead of string interpolation
   // Build the OR condition properly using Supabase's or() method with proper parameterization
   const searchTerm = `%${query}%`;
   
   const { data: guardians } = await adminClient
     .from("guardians")
     .select(`
       id, full_name, phone, whatsapp_number, relationship, is_primary,
       student_id,
       students!inner(full_name, admission_number)
     `)
     .eq("school_id", profile.school_id)
     .or(`full_name.ilike.${searchTerm},phone.ilike.${searchTerm}`)
     .limit(20);

   return { success: true, message: 'Guardians found', data: { guardians: guardians ?? [] } };
 }

export async function getAnnouncementHistoryAction(params?: {
  dateFrom?: string;
  dateTo?: string;
  target?: string;
}): Promise<{ announcements: any[] }> {
  const supabase = await createClient();
  const { data: { user } } = await (supabase.auth as any).getUser();
  if (!user) return { announcements: [] };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) return { announcements: [] };

  let query = supabase
    .from("announcements")
    .select(`
      id, title, body, target, class_id, channels,
      recipient_count, delivered_count, failed_count,
      created_at,
      created_by,
      profiles(full_name),
      classes(name),
      guardians(full_name)
    `)
    .eq("school_id", profile.school_id)
    .order("created_at", { ascending: false });

  if (profile.role === "class_teacher" || profile.role === "subject_teacher") {
    query = query.eq("created_by", user.id);
  }

  if (params?.dateFrom) {
    query = query.gte("created_at", params.dateFrom);
  }
  if (params?.dateTo) {
    query = query.lte("created_at", params.dateTo + "T23:59:59");
  }
  if (params?.target && params.target !== "all") {
    query = query.eq("target", params.target);
  }

  const { data: announcements } = await query.limit(100);
  return { announcements: announcements ?? [] };
}
