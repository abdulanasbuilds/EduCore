"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResponse, AttendanceStatus } from "@/types";
import { z } from "zod";
import { features, schoolConfig } from "@/lib/env";
import { sendSMS, sendWhatsApp } from "@/lib/twilio";
import { absenceAlert } from "@/lib/notifications/templates";

const attendanceRecordSchema = z.object({
  studentId: z.string().uuid(),
  status: z.enum(["Present", "Absent", "Late", "Excused"]),
  remarks: z.string().optional(),
});

const submitAttendanceSchema = z.object({
  classId: z.string().uuid(),
  termId: z.string().uuid(),
  date: z.string(),
  records: z.array(attendanceRecordSchema),
});

export async function submitAttendanceAction(
  formData: z.infer<typeof submitAttendanceSchema>
): Promise<ActionResponse<{ submitted: number; absent: number }>> {
  try {
    const parsed = submitAttendanceSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, message: "Validation failed" };
    }

    const data = parsed.data;
    const supabase = await createClient();
    if (!supabase) return { success: false, message: "Supabase not configured" };
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, school_id")
      .eq("id", user.id)
      .single() as any;

    if (!profile?.school_id || !["school_admin", "class_teacher"].includes(profile?.role)) {
      return { success: false, message: "Unauthorized: Only class teachers and admins can submit attendance" };
    }
 
    // Check for existing attendance on this date for this class
    const { data: existing } = await supabase
      .from("attendance")
      .select("id")
      .eq("class_id", data.classId)
      .eq("date", data.date)
      .limit(1);

    if (existing && existing.length > 0) {
      return { success: false, message: "Attendance has already been marked for this date. Use edit mode to make changes." };
    }

    const records = data.records.map((r) => ({
      student_id: r.studentId,
      class_id: data.classId,
      term_id: data.termId,
      date: data.date,
      status: r.status as AttendanceStatus,
      remarks: r.remarks || null,
      marked_by: user.id,
    }));

    const { error } = await (supabase as any).from("attendance").insert(records);

    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "Attendance already exists for some students on this date" };
      }
      return { success: false, message: error.message };
    }

    const absentCount = data.records.filter((r) => r.status === "Absent").length;

    if (absentCount > 0) {
       // For notifications, we need to look up guardians. Since we're already authenticated,
       // we can use the regular client with RLS for these lookups as they're scoped to the user's school
       const supabaseForNotifications = await createClient();
       
       const { data: profile } = await supabaseForNotifications
         .from("profiles")
         .select("school_id")
         .limit(1)
         .single() as any;

       const absentStudents = data.records.filter((r) => r.status === "Absent");
       for (const student of absentStudents) {
         const { data: guardian } = await supabaseForNotifications
           .from("student_guardians")
           .select("guardians(full_name, phone, whatsapp_number)")
           .eq("student_id", student.studentId)
           .eq("is_primary", true)
           .single();

          const g = (guardian?.guardians as any)?.[0];
         if (!g?.phone) continue;
         const parentName = g.full_name || "Parent";
         const phone = g.whatsapp_number || g.phone;
         const dateStr = new Date(data.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
         const msg = absenceAlert(parentName, dateStr, schoolConfig.name, schoolConfig.phone);

         sendWhatsApp({ to: phone, message: msg, recipientName: parentName, type: "absence" }).catch(() => {});
         if (!features.smsEnabled) {
           sendSMS({ to: phone, message: msg, recipientName: parentName, type: "absence" }).catch(() => {});
         }
       }
     }

    return {
      success: true,
      message: `Attendance submitted for ${data.records.length} students. ${absentCount} marked absent.`,
      data: { submitted: data.records.length, absent: absentCount },
    };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function updateAttendanceAction(
  attendanceId: string,
  status: AttendanceStatus,
  remarks: string
): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    if (!supabase) return { success: false, message: "Supabase not configured" };
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!["school_admin", "class_teacher"].includes(profile?.role || "")) {
      return { success: false, message: "Unauthorized: Only class teachers and admins can update attendance" };
    }

    const { error } = await supabase
      .from("attendance")
      .update({ status, remarks, marked_by: user.id })
      .eq("id", attendanceId);

    if (error) return { success: false, message: error.message };
    return { success: true, message: "Attendance record updated" };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}
