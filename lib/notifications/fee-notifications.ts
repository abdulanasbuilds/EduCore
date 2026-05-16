import { createAdminClient } from "@/lib/supabase/admin";
import { sendSMS, sendWhatsApp } from "@/lib/twilio";
import { paymentReceipt } from "@/lib/notifications/templates";
import { schoolConfig } from "@/lib/env";

interface PaymentNotificationParams {
  studentId: string;
  studentName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  receiptNumber: string;
  remainingBalance: number;
}

export async function sendPaymentReceiptNotification(params: PaymentNotificationParams) {
  const supabase = createAdminClient();

  const { data: guardians } = await supabase
    .from("guardians")
    .select("id, full_name, phone, whatsapp_number, is_primary, school_id")
    .eq("student_id", params.studentId)
    .order("is_primary", { ascending: false })
    .limit(1);

  const guardian = guardians?.[0];
  if (!guardian) {
    console.warn("No guardian found for student", params.studentId);
    return;
  }

  const phone = guardian.whatsapp_number || guardian.phone;
  if (!phone) {
    console.warn("No phone number for guardian", guardian.id);
    return;
  }

  const message = paymentReceipt({
    schoolName: schoolConfig.name,
    parentName: guardian.full_name,
    studentName: params.studentName,
    amount: params.amount,
    paymentDate: params.paymentDate,
    paymentMethod: params.paymentMethod,
    receiptNumber: params.receiptNumber,
    remainingBalance: params.remainingBalance,
  });

  const waResult = await sendWhatsApp({
    schoolId: guardian.school_id,
    to: phone,
    message,
    recipientName: guardian.full_name,
    type: "payment_receipt",
  });

  if (!waResult.success) {
    await sendSMS({
      schoolId: guardian.school_id,
      to: phone,
      message,
      recipientName: guardian.full_name,
      type: "payment_receipt",
    });
  }
}
