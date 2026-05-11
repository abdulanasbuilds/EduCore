"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const parsed = announcementSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, message: "Validation failed" };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const adminClient = createAdminClient() as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id || !["school_admin", "class_teacher", "subject_teacher", "bursar"].includes(profile.role)) {
    return { success: false, message: "Unauthorized" };
  }

  let guardians: any[] = [];

  if (data.sendTo === "everyone") {
    const { data: allGuardians } = await adminClient
      .from("guardians")
      .select("id, full_name, phone, whatsapp_number, is_primary, student_id")
      .eq("school_id", profile.school_id)
      .eq("is_primary", true);
    guardians = allGuardians ?? [];
  } else if (data.sendTo === "class") {
    if (!data.classId) return { success: false, message: "Class is required" };
    const { data: classStudents } = await adminClient
      .from("student_class_history")
      .select("student_id")
      .eq("class_id", data.classId)
      .eq("is_current", true);
    if (!classStudents) return { success: false, message: "No students found" };
    const studentIds = classStudents.map((s: any) => s.student_id);
    const { data: classGuardians } = await adminClient
      .from("guardians")
      .select("id, full_name, phone, whatsapp_number, is_primary, student_id")
      .in("student_id", studentIds)
      .eq("is_primary", true);
    guardians = classGuardians ?? [];
  } else if (data.sendTo === "individual") {
    if (!data.guardianId) return { success: false, message: "Guardian is required" };
    const { data: singleGuardian } = await adminClient
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
  const { data: announcement } = await adminClient
    .from("announcements")
    .insert({
      school_id: profile.school_id,
      created_by: user.id,
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
    await adminClient
      .from("announcements")
      .update({ delivered_count: sent, failed_count: failed })
      .eq("id", announcement.id);
  }

  return {
    success: true,
    message: `Sent to ${sent} recipients. ${failed > 0 ? `${failed} failed.` : ""}`,
    data: { sent, failed, total: guardians.length },
  };
}

export async function sendQuickMessageAction(
  guardianId: string,
  message: string,
  studentName?: string
): Promise<ActionResponse> {
  const supabase = await createClient();
  const adminClient = createAdminClient() as any;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .single();

  if (!profile?.school_id) return { success: false, message: "Unauthorized" };

  const { data: guardian } = await adminClient
    .from("guardians")
    .select("id, full_name, phone, whatsapp_number, student_id")
    .eq("id", guardianId)
    .single();

  if (!guardian) return { success: false, message: "Guardian not found" };

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

export async function searchGuardiansAction(query: string): Promise<{ guardians: any[] }> {
  const adminClient = createAdminClient() as any;
  const { data: profile } = await adminClient
    .from("profiles")
    .select("school_id")
    .limit(1)
    .single();

  if (!profile || !query) return { guardians: [] };

  const { data: guardians } = await adminClient
    .from("guardians")
    .select(`
      id, full_name, phone, whatsapp_number, relationship, is_primary,
      student_id,
      students!inner(full_name, admission_number)
    `)
    .eq("school_id", profile.school_id)
    .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(20);

  return { guardians: guardians ?? [] };
}

export async function getAnnouncementHistoryAction(params?: {
  dateFrom?: string;
  dateTo?: string;
  target?: string;
}): Promise<{ announcements: any[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
