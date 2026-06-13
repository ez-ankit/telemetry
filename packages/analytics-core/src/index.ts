import type { AnalyticsEvent } from "@telemetry/shared-types";

export function buildFunnel(
  events: AnalyticsEvent[],
  steps: string[],
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const step of steps) {
    result[step] = events.filter((e) => e.eventType === step).length;
  }
  return result;
}

export function computeRetention(
  events: AnalyticsEvent[],
  periodDays: number,
): number[] {
  return [0];
}

export function aggregateHourly(events: AnalyticsEvent[]): Record<string, number> {
  const buckets: Record<string, number> = {};
  for (const e of events) {
    const hour = new Date(e.timestamp).toISOString().slice(0, 13);
    buckets[hour] = (buckets[hour] ?? 0) + 1;
  }
  return buckets;
}

export function aggregateRealtime(events: AnalyticsEvent[], windowMs: number): number {
  const cutoff = Date.now() - windowMs;
  return events.filter((e) => e.timestamp > cutoff).length;
}
