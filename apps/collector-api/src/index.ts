import { logger } from "@telemetry/logger";

const PORT = Number(process.env.COLLECTOR_PORT) || 8081;

logger.info("collector-api starting", { port: PORT });
logger.info("collector-api ready");
