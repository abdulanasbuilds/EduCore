"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { schoolConfig } from "@/lib/env";
import { sendSMS, sendWhatsApp } from "@/lib/twilio";
import { welcomeEnrollment } from "@/lib/notifications/templates";
import { features } from "@/lib/env";
import type { ActionResponse } from "@/types";
import { z } from "zod";

const enrollmentSchema = z.object({
  admissionApplicationId: z.string().uuid(),
  studentName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  gender: z.enum(["Male", "Female"]),
  classId: z.string().uuid(),
  enrollmentDate: z.string().min(1),
  address: z.string().optional(),
  guardianName: z.string().min(1),
  guardianPhone: z.string().min(10),
  guardianWhatsapp: z.string().optional(),
  guardianEmail: z.string().optional(),
  guardianRelationship: z.string().min(1),
});

export async function enrollFromApplicationAction(
  formData: z.infer<typeof enrollmentSchema>
): Promise<ActionResponse<{ studentId: string; admissionNumber: string }>> {
  try {
    const parsed = enrollmentSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, message: "Validation failed" };
    }

    const data = parsed.data;
    const supabase = (await createClient()) as any;
    const admin = createAdminClient() as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    const { data: profile } = await supabase
      .from("profiles").select("role, school_id").eq("id", user.id).single() as any;
    if (!profile?.school_id || !["school_admin", "bursar"].includes(profile.role)) {
      return { success: false, message: "Unauthorized" };
    }

    const { data: existingApp } = await admin
      .from("admission_applications")
      .select("*")
      .eq("id", data.admissionApplicationId)
      .single();
    if (!existingApp) return { success: false, message: "Application not found" };
    if (existingApp.status !== "pending") return { success: false, message: "Application already processed" };

    const { data: currentYear } = await admin
      .from("academic_years")
      .select("id")
      .eq("school_id", profile.school_id)
      .eq("is_current", true)
      .single();
    if (!currentYear) return { success: false, message: "No active academic year found" };

    const { data: activeTerm } = await admin
      .from("terms")
      .select("id, name")
      .eq("academic_year_id", currentYear.id)
      .in("status", ["upcoming", "active"])
      .limit(1)
      .single();

    const admissionNumber = `ADM-${new Date().getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

    const { data: student, error: studentError } = await admin
      .from("students")
      .insert({
        school_id: profile.school_id,
        admission_number: admissionNumber,
        full_name: data.studentName,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        enrollment_date: data.enrollmentDate,
        address: data.address || null,
        previous_school: existingApp.previous_school,
        status: "Active" as const,
      } as any)
      .select("id")
      .single();

    if (studentError || !student) {
      return { success: false, message: studentError?.message || "Failed to create student" };
    }

    await admin.from("student_class_history").insert({
      student_id: student.id,
      class_id: data.classId,
      academic_year_id: currentYear.id,
      is_current: true,
      outcome: "active" as const,
      enrolled_date: data.enrollmentDate,
    } as any);

    await admin.from("student_guardians").insert({
      student_id: student.id,
      guardian_id: null,
    });

    const { data: guardian, error: guardianError } = await admin
      .from("guardians")
      .insert({
        school_id: profile.school_id,
        full_name: data.guardianName,
        phone: data.guardianPhone,
        whatsapp_number: data.guardianWhatsapp || null,
        email: data.guardianEmail || null,
        relationship: data.guardianRelationship,
        is_primary: true,
      } as any)
      .select("id")
      .single();

    if (!guardianError && guardian) {
      await admin.from("student_guardians").update({ guardian_id: guardian.id }).eq("student_id", student.id);
    }

    if (activeTerm) {
      const { data: feeAssignments } = await admin
        .from("fee_assignments")
        .select("id, amount, due_date")
        .eq("class_id", data.classId)
        .eq("term_id", activeTerm.id);

      if (feeAssignments?.length) {
        const feeRecords = feeAssignments.map((fa: any) => ({
          student_id: student.id,
          fee_assignment_id: fa.id,
          amount_owed: fa.amount,
          amount_paid: 0,
          balance: fa.amount,
          status: "Unpaid" as const,
        }));
        await admin.from("student_fees").insert(feeRecords);
      }
    }

    await admin.from("admission_applications")
      .update({ status: "approved" as const, admin_notes: `Enrolled as ${admissionNumber}` } as any)
      .eq("id", data.admissionApplicationId);

    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
    const password = Math.random().toString(36).slice(-8);
    const message = welcomeEnrollment(
      data.guardianName, data.studentName, "", portalUrl, password, schoolConfig.name
    );

    const phone = data.guardianWhatsapp || data.guardianPhone;
    if (phone) {
      await sendWhatsApp({ to: phone, message, recipientName: data.guardianName, type: "enrollment" });
      if (!features.smsEnabled) {
        await sendSMS({ to: phone, message, recipientName: data.guardianName, type: "enrollment" });
      }
    }

    return {
      success: true,
      message: `${data.studentName} enrolled successfully. Admission No: ${admissionNumber}`,
      data: { studentId: student.id, admissionNumber },
    };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
