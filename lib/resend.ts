import { Resend } from "resend"
import { env, features } from "@/lib/env"

function getResendClient() {
  if (!features.emailEnabled) return null
  return new Resend(env.RESEND_API_KEY)
}

export async function sendEmail({
  to,
  subject,
  html,
  from = "EduCore <noreply@educore.app>",
}: {
  to: string
  subject: string
  html: string
  from?: string
}) {
  if (!features.emailEnabled) {
    console.warn("Email disabled — RESEND_API_KEY not configured")
    return { success: false, reason: "Email not configured" }
  }

  const client = getResendClient()!

  try {
    const result = await client.emails.send({ from, to, subject, html })
    return { success: true, id: result.data?.id }
  } catch (error: any) {
    console.error("Email failed:", error.message)
    return { success: false, reason: error.message }
  }
}
