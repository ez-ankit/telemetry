import { logger } from "@telemetry/logger";

export async function getEvents(filters: { page?: number; pageSize?: number; eventType?: string }) {
  logger.debug("events.service.getEvents", filters);
  return { events: [], total: 0 };
}

export async function getEventById(id: string) {
  logger.debug("events.service.getEventById", { id });
  return null;
}
