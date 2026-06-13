import { logger } from "@telemetry/logger";
import type { AnalyticsEvent } from "@telemetry/shared-types";

export async function getUsageTrend(days: number) {
  logger.debug("analytics.service.getUsageTrend", { days });
  return [];
}

export async function getTrafficDistribution() {
  logger.debug("analytics.service.getTrafficDistribution");
  return [];
}

export async function getActiveUsersTimeline(hours: number) {
  logger.debug("analytics.service.getActiveUsersTimeline", { hours });
  return [];
}

export async function getUserGrowth(months: number) {
  logger.debug("analytics.service.getUserGrowth", { months });
  return [];
}

export async function getTopPages(limit: number) {
  logger.debug("analytics.service.getTopPages", { limit });
  return [];
}

export async function ingestEvent(event: AnalyticsEvent) {
  logger.debug("analytics.service.ingestEvent", event.eventType);
}
