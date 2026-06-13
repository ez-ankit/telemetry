import type { AnalyticsConfig } from "@telemetry/shared-types";

function env(key: string, fallback: string): string {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key]!;
  }
  return fallback;
}

export function loadConfig(): { apiEndpoint: string; appName: string; environment: string } {
  return {
    apiEndpoint: env("NEXT_PUBLIC_API_ENDPOINT", "/api/analytics"),
    appName: env("NEXT_PUBLIC_APP_NAME", "telemetry"),
    environment: env("NODE_ENV", "development"),
  };
}

export function loadSdkConfig(): Partial<AnalyticsConfig> {
  return {
    endpoint: env("NEXT_PUBLIC_COLLECTOR_ENDPOINT", "/api/analytics/collect"),
    batchSize: Number(env("NEXT_PUBLIC_SDK_BATCH_SIZE", "20")) || 20,
    syncInterval: Number(env("NEXT_PUBLIC_SDK_SYNC_INTERVAL", "5000")) || 5000,
  };
}
