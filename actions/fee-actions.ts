"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResponse } from "@/types";
import { z } from "zod";

const paymentSchema = z.object({
  studentFeeId: z.string().uuid(),
  studentId: z.string().uuid(),
  amount: z.number().positive("Amount must be positive"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.enum(["Cash", "Mobile Money", "Bank Transfer", "Card", "Other"]),
  referenceNumber: z.string().optional(),
});

export async function recordPaymentAction(
  formData: z.infer<typeof paymentSchema>
): Promise<ActionResponse<{ receiptNumber: string }>> {
  try {
    const parsed = paymentSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, message: "Validation failed" };
    }

    const data = parsed.data;
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    // Get current fee record
    const { data: studentFee } = await supabase
      .from("student_fees")
      .select("amount_owed, amount_paid, balance")
      .eq("id", data.studentFeeId)
      .single();

    if (!studentFee) {
      return { success: false, message: "Fee record not found" };
    }

    if (data.amount > studentFee.balance) {
      return { success: false, message: `Amount exceeds outstanding balance of ${studentFee.balance}` };
    }

    // Generate receipt number
    const now = new Date();
    const receiptNumber = `RCP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

    // Create payment record
    const { error: paymentError } = await supabase.from("fee_payments").insert({
      student_fee_id: data.studentFeeId,
      student_id: data.studentId,
      amount: data.amount,
      payment_date: data.paymentDate,
      payment_method: data.paymentMethod,
      reference_number: data.referenceNumber || null,
      receipt_number: receiptNumber,
      recorded_by: user.id,
    });

    if (paymentError) {
      return { success: false, message: paymentError.message };
    }

    // Update student fee amount_paid
    const newAmountPaid = studentFee.amount_paid + data.amount;
    const { error: updateError } = await supabase
      .from("student_fees")
      .update({ amount_paid: newAmountPaid })
      .eq("id", data.studentFeeId);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    return {
      success: true,
      message: `Payment of GHS ${(data.amount / 100).toFixed(2)} recorded successfully`,
      data: { receiptNumber },
    };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}

const feeSetupSchema = z.object({
  termId: z.string().uuid(),
  assignments: z.array(
    z.object({
      classId: z.string().uuid(),
      feeTypeId: z.string().uuid(),
      amount: z.number().min(0),
      dueDate: z.string(),
    })
  ),
});

export async function setupFeesAction(
  formData: z.infer<typeof feeSetupSchema>
): Promise<ActionResponse> {
  try {
    const parsed = feeSetupSchema.safeParse(formData);
    if (!parsed.success) {
      return { success: false, message: "Validation failed" };
    }

    const data = parsed.data;
    const supabase = (await createClient()) as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    for (const assignment of data.assignments) {
      const { data: fa, error: faError } = await supabase
        .from("fee_assignments")
        .insert({
          term_id: data.termId,
          class_id: assignment.classId,
          fee_type_id: assignment.feeTypeId,
          amount: assignment.amount,
          due_date: assignment.dueDate,
        })
        .select("id")
        .single();

      if (faError || !fa) continue;

      // Get all active students in this class
      const { data: students } = await supabase
        .from("student_class_history")
        .select("student_id")
        .eq("class_id", assignment.classId)
        .eq("is_current", true);

      if (students) {
        const feeRecords = students.map((s: any) => ({
          student_id: s.student_id,
          fee_assignment_id: fa.id,
          amount_owed: assignment.amount,
          amount_paid: 0,
          status: "Unpaid" as const,
        }));

        await supabase.from("student_fees").insert(feeRecords);
      }
    }

    return { success: true, message: "Fees set up and assigned to students" };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function createFeeTypeAction(
  name: string,
  description: string
): Promise<ActionResponse<{ id: string }>> {
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

    const { data: feeType, error } = await supabase
      .from("fee_types")
      .insert({ school_id: profile.school_id, name, description })
      .select("id")
      .single();

    if (error || !feeType) return { success: false, message: error?.message || "Failed" };
    return { success: true, message: "Fee type created", data: { id: feeType.id } };
  } catch {
    return { success: false, message: "An unexpected error occurred" };
  }
}
