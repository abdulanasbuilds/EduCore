"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse, AttendanceStatus } from "@/types";
import { z } from "zod";

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
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

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

    const { error } = await supabase.from("attendance").insert(records);

    if (error) {
      if (error.code === "23505") {
        return { success: false, message: "Attendance already exists for some students on this date" };
      }
      return { success: false, message: error.message };
    }

    const absentCount = data.records.filter((r) => r.status === "Absent").length;

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
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

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
