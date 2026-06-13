import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@telemetry/shared-types",
    "@telemetry/config",
    "@telemetry/logger",
    "@telemetry/auth",
    "@telemetry/analytics-core",
    "@telemetry/db-postgres",
    "@telemetry/db-clickhouse",
  ],
};

export default nextConfig;
