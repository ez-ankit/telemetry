import { query as pgQuery } from "@telemetry/db-postgres";
import { queryEvents } from "@telemetry/db-clickhouse";
import { logger } from "@telemetry/logger";

export async function findUsageTrend(days: number) {
  logger.debug("analytics.repo.findUsageTrend", { days });
  return [];
}

export async function findTrafficDistribution() {
  logger.debug("analytics.repo.findTrafficDistribution");
  return [];
}

export async function findTopPages(limit: number) {
  logger.debug("analytics.repo.findTopPages", { limit });
  return [];
}
