import { logger } from "@telemetry/logger";

const PORT = Number(process.env.REALTIME_PORT) || 8082;

logger.info("realtime-gateway starting", { port: PORT });
logger.info("realtime-gateway ready");
