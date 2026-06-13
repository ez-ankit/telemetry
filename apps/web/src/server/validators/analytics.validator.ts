import { logger } from "@telemetry/logger";

export interface DateRange {
  start: string;
  end: string;
}

export function validateDateRange(params: URLSearchParams): DateRange | null {
  const start = params.get("start");
  const end = params.get("end");
  if (start && end) {
    return { start, end };
  }
  return null;
}

export function validatePagination(params: URLSearchParams): { page: number; pageSize: number } {
  const page = Math.max(1, Number(params.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(params.get("pageSize")) || 20));
  return { page, pageSize };
}
