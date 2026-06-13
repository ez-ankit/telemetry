import { logger } from "@telemetry/logger";

export interface ClickHouseEvent {
  eventId: string;
  sessionId: string;
  visitorId: string;
  timestamp: Date;
  eventType: string;
  pageUrl: string;
  payload: string;
}

export async function insertEvents(events: ClickHouseEvent[]): Promise<void> {
  logger.debug("clickhouse insert", events.length, "events");
}

export async function queryEvents(sql: string): Promise<ClickHouseEvent[]> {
  logger.debug("clickhouse query", sql);
  return [];
}
