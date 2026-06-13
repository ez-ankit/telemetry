import { logger } from "@telemetry/logger";

export async function getAlerts(orgId: string) {
  logger.debug("alerts.service.getAlerts", { orgId });
  return [];
}

export async function createAlert(data: { name: string; query: string; threshold: number }) {
  logger.debug("alerts.service.createAlert", data);
  return { id: crypto.randomUUID(), ...data, enabled: true };
}
