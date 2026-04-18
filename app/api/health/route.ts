import { NextResponse } from "next/server"
import { features } from "@/lib/env"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    configured: {
      supabase: features.supabaseEnabled,
      sms: features.smsEnabled,
      email: features.emailEnabled,
      images: features.imageUploadEnabled,
    },
  })
}
