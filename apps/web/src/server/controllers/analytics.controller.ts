import { getUsageTrend, getTrafficDistribution, getActiveUsersTimeline, getUserGrowth, getTopPages } from "../services/analytics.service";
import { logger } from "@telemetry/logger";
import type { ApiResponse } from "@telemetry/shared-types";

export async function handleGetUsageTrend(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const days = Number(url.searchParams.get("days")) || 30;
  const data = await getUsageTrend(days);
  const response: ApiResponse<typeof data> = { success: true, data };
  return Response.json(response);
}

export async function handleGetTrafficDistribution(): Promise<Response> {
  const data = await getTrafficDistribution();
  const response: ApiResponse<typeof data> = { success: true, data };
  return Response.json(response);
}

export async function handleGetActiveUsers(): Promise<Response> {
  const data = await getActiveUsersTimeline(24);
  const response: ApiResponse<typeof data> = { success: true, data };
  return Response.json(response);
}

export async function handleGetUserGrowth(): Promise<Response> {
  const data = await getUserGrowth(12);
  const response: ApiResponse<typeof data> = { success: true, data };
  return Response.json(response);
}

export async function handleGetTopPages(): Promise<Response> {
  const data = await getTopPages(10);
  const response: ApiResponse<typeof data> = { success: true, data };
  return Response.json(response);
}
