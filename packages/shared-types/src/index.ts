export type EventType = "page_view" | "click" | "api_call" | "identify" | "custom";

export interface AnalyticsEvent {
  eventId: string;
  sessionId: string;
  visitorId: string;
  timestamp: number;
  eventType: EventType;
  pageUrl: string;
  userAgent: string;
  payload: Record<string, unknown>;
  userId?: string;
  email?: string;
  fullName?: string;
}

export interface AnalyticsConfig {
  apiKey: string;
  endpoint: string;
  trackingWhitelist?: string[];
  batchSize?: number;
  syncInterval?: number;
}

export interface SyncMetrics {
  enqueued: number;
  synced: number;
  failed: number;
  pending: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: string;
}

export interface Dashboard {
  id: string;
  name: string;
  organizationId: string;
  config: Record<string, unknown>;
}

export interface Alert {
  id: string;
  name: string;
  query: string;
  threshold: number;
  enabled: boolean;
  organizationId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}
