import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  // Verify this is called by the cron scheduler
  const authHeader = request.headers.get("authorization")
  if (
    process.env.CRON_SECRET &&
    authHeader !== "Bearer " + process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    // Simple ping — just count schools
    const { count, error } = await supabase
      .from("schools")
      .select("*", { count: "exact", head: true })

    if (error) throw error

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      message: "Database is alive",
      count
    })
  } catch (error: any) {
    console.error("Keep-alive failed:", error.message)
    return NextResponse.json({
      ok: false,
      error: error.message,
    }, { status: 500 })
  }
}
