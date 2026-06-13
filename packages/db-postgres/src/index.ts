import { logger } from "@telemetry/logger";

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export async function query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
  logger.debug("pg query", sql, params);
  return { rows: [], rowCount: 0 };
}

export async function connect(): Promise<void> {
  logger.info("postgres connected (mock)");
}
