// Database seed script placeholder
import { logger } from "@telemetry/logger";

async function main() {
  logger.info("Seeding database...");
  logger.info("Seed complete");
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
