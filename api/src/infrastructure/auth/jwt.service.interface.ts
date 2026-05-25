export interface IJwtService {
  sign(payload: Record<string, unknown>): string;
  signRefresh(payload: Record<string, unknown>): string;
  verify(token: string): Record<string, unknown>;
  verifyRefresh(token: string): Record<string, unknown>;
}

export const JWT_SERVICE = Symbol('IJwtService');
