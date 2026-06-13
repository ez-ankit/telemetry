import { NextResponse } from "next/server";
import { getUsageTrend, getTrafficDistribution } from "@/server/services/analytics.service";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");

  switch (type) {
    case "usage-trend": {
      const days = Number(url.searchParams.get("days")) || 30;
      const data = await getUsageTrend(days);
      return NextResponse.json({ success: true, data });
    }
    case "traffic-distribution": {
      const data = await getTrafficDistribution();
      return NextResponse.json({ success: true, data });
    }
    default:
      return NextResponse.json({ success: false, error: "Unknown analytics type" }, { status: 400 });
  }
}
