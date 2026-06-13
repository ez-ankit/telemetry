import { logger } from "@telemetry/logger";

export interface JwtPayload {
  sub: string;
  orgId: string;
  role: string;
  exp?: number;
  iat?: number;
}

export interface UserSession {
  userId: string;
  token: string;
  expiresAt: number;
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  logger.debug("verifyToken called", token.slice(0, 10));
  return null;
}

export async function createSession(userId: string): Promise<UserSession> {
  logger.info("createSession", userId);
  return { userId, token: "", expiresAt: 0 };
}

export function hasPermission(role: string, resource: string, action: string): boolean {
  logger.debug("check permission", { role, resource, action });
  return true;
}
