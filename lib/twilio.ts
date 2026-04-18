import twilio from "twilio"
import { env, features } from "@/lib/env"
import { createAdminClient } from "@/lib/supabase/admin"

function getTwilioClient() {
  if (!features.smsEnabled) return null
  return twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
}

// Format any phone number to E.164 format
// Handles Ghana numbers: 024... → +23324...
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("0") && digits.length === 10) {
    // Ghana local format → international
    return "+233" + digits.slice(1)
  }
  if (!digits.startsWith("+")) {
    return "+" + digits
  }
  return digits
}

async function logNotification({
  recipientPhone,
  recipientName,
  channel,
  type,
  messageBody,
  status,
  errorMessage,
}: {
  recipientPhone: string
  recipientName: string
  channel: "sms" | "whatsapp" | "email"
  type: string
  messageBody: string
  status: "sent" | "failed" | "pending"
  errorMessage?: string
}) {
  try {
    const supabase = createAdminClient()
    await supabase.from("notification_logs").insert({
      recipient_phone: recipientPhone,
      recipient_name: recipientName,
      channel,
      type,
      message_body: messageBody,
      status,
      error_message: errorMessage ?? null,
      sent_at: new Date().toISOString(),
    } as any)
  } catch (err) {
    // Never crash the main operation because of a log failure
    console.error("Failed to log notification:", err)
  }
}

export async function sendSMS({
  to,
  message,
  recipientName,
  type,
}: {
  to: string
  message: string
  recipientName: string
  type: string
}) {
  if (!features.smsEnabled) {
    console.warn("SMS disabled — TWILIO_ACCOUNT_SID not configured")
    return { success: false, reason: "SMS not configured" }
  }

  const formattedPhone = formatPhone(to)
  const client = getTwilioClient()!

  try {
    await client.messages.create({
      body: message,
      from: env.TWILIO_PHONE_NUMBER!,
      to: formattedPhone,
    })

    await logNotification({
      recipientPhone: formattedPhone,
      recipientName,
      channel: "sms",
      type,
      messageBody: message,
      status: "sent",
    })

    return { success: true }
  } catch (error: any) {
    await logNotification({
      recipientPhone: formattedPhone,
      recipientName,
      channel: "sms",
      type,
      messageBody: message,
      status: "failed",
      errorMessage: error.message,
    })

    console.error("SMS failed:", error.message)
    return { success: false, reason: error.message }
  }
}

export async function sendWhatsApp({
  to,
  message,
  recipientName,
  type,
}: {
  to: string
  message: string
  recipientName: string
  type: string
}) {
  if (!features.smsEnabled) {
    console.warn("WhatsApp disabled — TWILIO_ACCOUNT_SID not configured")
    return { success: false, reason: "WhatsApp not configured" }
  }

  const formattedPhone = formatPhone(to)
  const client = getTwilioClient()!

  try {
    await client.messages.create({
      body: message,
      from: "whatsapp:" + env.TWILIO_PHONE_NUMBER!,
      to: "whatsapp:" + formattedPhone,
    })

    await logNotification({
      recipientPhone: formattedPhone,
      recipientName,
      channel: "whatsapp",
      type,
      messageBody: message,
      status: "sent",
    })

    return { success: true }
  } catch (error: any) {
    await logNotification({
      recipientPhone: formattedPhone,
      recipientName,
      channel: "whatsapp",
      type,
      messageBody: message,
      status: "failed",
      errorMessage: error.message,
    })

    console.error("WhatsApp failed:", error.message)
    return { success: false, reason: error.message }
  }
}
