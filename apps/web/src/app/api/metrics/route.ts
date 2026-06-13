import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      activeUsers: 284,
      totalSessions: 48219,
      pageViews: 312884,
      avgSession: "6m 24s",
    },
  });
}
