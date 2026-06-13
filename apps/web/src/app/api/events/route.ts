import { NextResponse } from "next/server";
import { getEvents } from "@/server/services/events.service";
import type { AnalyticsEvent } from "@telemetry/shared-types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const pageSize = Number(url.searchParams.get("pageSize")) || 20;
  const result = await getEvents({ page, pageSize });
  return NextResponse.json({ success: true, ...result });
}

export async function POST(req: Request) {
  const body = (await req.json()) as AnalyticsEvent;
  return NextResponse.json({ success: true, data: body }, { status: 201 });
}
