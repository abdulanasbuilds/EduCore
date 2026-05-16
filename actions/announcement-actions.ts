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
    
    if (data.sendTo === "class" && data.classId) {
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

    let recipients: any[] = [];

    if (data.sendTo === "everyone") {
      const { data: allPrimary } = await supabase
        .from("guardians")
        .select("id, full_name, phone, whatsapp_number")
        .eq("school_id", auth.schoolId)
        .eq("is_primary", true);
      recipients = allPrimary ?? [];
    } else if (data.sendTo === "class") {
      if (!data.classId) return { success: false, message: "Class is required" };
      const { data: classGuardians } = await supabase
        .from("student_guardians")
        .select(`
          guardian_id,
          guardians!inner (
            id,
            full_name,
            phone,
            whatsapp_number,
            is_primary
          )
        `)
        .eq("guardians.is_primary", true)
        .in("student_id", (await supabase.from("student_class_history").select("student_id").eq("class_id", data.classId).eq("is_current", true)).data?.map(s => s.student_id) || []) as any;
      
      recipients = classGuardians?.map((sg: any) => sg.guardians) || [];
    } else if (data.sendTo === "individual") {
      if (!data.guardianId) return { success: false, message: "Guardian is required" };
      const { data: singleGuardian } = await supabase
        .from("guardians")
        .select("id, full_name, phone, whatsapp_number")
        .eq("id", data.guardianId)
        .single();
      if (singleGuardian) recipients = [singleGuardian];
    }

    if (recipients.length === 0) {
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
        recipient_count: recipients.length,
        send_sms: data.sendSMS,
        send_whatsapp: data.sendWhatsApp,
      })
      .select("id")
      .single();

    const fullMessage = `${schoolConfig.name}: ${data.message}`;
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const phone = recipient.whatsapp_number || recipient.phone;
      if (!phone) { failed++; continue; }

      const schoolId = auth.schoolId;

      for (const channel of channels) {
        if (channel === "whatsapp") {
          const result = await sendWhatsApp({
            schoolId,
            to: phone,
            message: fullMessage,
            recipientName: recipient.full_name,
            type: "announcement",
          });
          if (result.success) sent++; else failed++;
        } else if (channel === "sms") {
          const result = await sendSMS({
            schoolId,
            to: phone,
            message: fullMessage,
            recipientName: recipient.full_name,
            type: "announcement",
          });
          if (result.success) sent++; else failed++;
        }
      }

      if (recipients.indexOf(recipient) < recipients.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 50));
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
      data: { sent, failed, total: recipients.length },
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
   const supabase = await createClient();
   const { data: { user }, error: authError } = await (supabase.auth as any).getUser();
   
   if (authError || !user) {
     return { success: false, message: 'Authentication required.' };
   }

   const { data: profile } = await supabase
     .from('profiles')
     .select('role, school_id, is_active')
     .eq('id', user.id)
     .single();
   
   if (!profile?.is_active) return { success: false, message: 'Account is inactive.' };
   if (!profile?.school_id) return { success: false, message: 'No school assigned.' };
   
   if (!['school_admin', 'class_teacher', 'subject_teacher', 'bursar'].includes(profile.role)) {
     return { success: false, message: 'Permission denied.' };
   }

   try {
     const { data: guardian, error: guardianError } = await supabase
       .from("guardians")
       .select("id, full_name, phone, whatsapp_number")
       .eq("id", guardianId)
       .eq("school_id", profile.school_id)
       .single();

     if (guardianError || !guardian) {
       return { success: false, message: 'Guardian not found or access denied' };
     }

     const fullMessage = `${schoolConfig.name}${studentName ? ` — Regarding ${studentName}` : ""}: ${message}`;
     const phone = guardian.whatsapp_number || guardian.phone;
     if (!phone) return { success: false, message: "No phone number found" };

     const schoolId = profile.school_id;

     const waResult = await sendWhatsApp({
       schoolId,
       to: phone,
       message: fullMessage,
       recipientName: guardian.full_name,
       type: "direct_message",
     });

     if (!waResult.success) {
       const smsResult = await sendSMS({
         schoolId,
         to: phone,
         message: fullMessage,
         recipientName: guardian.full_name,
         type: "direct_message",
       });
       return {
         success: smsResult.success,
         message: smsResult.success ? "Sent via fallback SMS" : "Failed to send message",
       };
     }

     return { success: true, message: "Message sent successfully" };
   } catch (err: any) {
     return { success: false, message: 'An unexpected error occurred' };
   }
}

export async function getRecipientsCountAction(params: {
  sendTo: "everyone" | "class" | "individual";
  classId?: string;
  guardianId?: string;
}): Promise<{ count: number }> {
  const supabase = await createClient();
  const { data: { user } } = await (supabase.auth as any).getUser();
  if (!user) return { count: 0 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) return { count: 0 };

  if (params.sendTo === "everyone") {
    const { count } = await supabase
      .from("guardians")
      .select("id", { count: "exact", head: true })
      .eq("school_id", profile.school_id)
      .eq("is_primary", true);
    return { count: count ?? 0 };
  }

  if (params.sendTo === "class" && params.classId) {
    const { data: students } = await supabase
      .from("student_class_history")
      .select("student_id")
      .eq("class_id", params.classId)
      .eq("is_current", true);
    if (!students || students.length === 0) return { count: 0 };
    
    const { count } = await supabase
      .from("student_guardians")
      .select("guardian_id", { count: "exact", head: true })
      .in("student_id", students.map(s => s.student_id))
      .eq("guardians.is_primary", true);
    return { count: count ?? 0 };
  }

  if (params.sendTo === "individual") return { count: 1 };
  return { count: 0 };
}

export async function searchGuardiansAction(query: string): Promise<ActionResponse<{ guardians: any[] }>> {
   const supabase = await createClient();
   const { data: { user } } = await (supabase.auth as any).getUser();
   if (!user) return { success: false, message: 'Unauthorized' };

   const { data: profile } = await supabase
     .from('profiles')
     .select('role, school_id')
     .eq('id', user.id)
     .single();
   
   if (!profile?.school_id) return { success: false, message: 'Unauthorized' };
   if (!query) return { success: true, message: 'OK', data: { guardians: [] } };

   const searchTerm = `%${query}%`;
   const { data: guardians } = await supabase
     .from("guardians")
     .select(`
       id, full_name, phone, whatsapp_number, relationship, is_primary,
       student_guardians!inner (
         students (full_name, admission_number)
       )
     `)
     .eq("school_id", profile.school_id)
     .or(`full_name.ilike.${searchTerm},phone.ilike.${searchTerm}`)
     .limit(20);

   return { 
     success: true, 
     message: 'OK', 
     data: { 
       guardians: (guardians || []).map((g: any) => ({
         ...g,
         students: g.student_guardians?.[0]?.students
       }))
     } 
   };
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

  if (params?.dateFrom) query = query.gte("created_at", params.dateFrom);
  if (params?.dateTo) query = query.lte("created_at", params.dateTo + "T23:59:59");
  if (params?.target && params.target !== "all") query = query.eq("target", params.target);

  const { data: announcements } = await query.limit(100);
  return { announcements: announcements ?? [] };
}
