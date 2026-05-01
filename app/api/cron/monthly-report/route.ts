import { NextResponse } from "next/server"

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
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      message: "Monthly report cron executed",
    })
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message,
    }, { status: 500 })
  }
}
