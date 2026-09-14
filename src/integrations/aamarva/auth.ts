/**
 * AAMARVA × A2A Integration — Authoritative Authentication & Token Manager
 *
 * Implements the lifecycle of AAMARVA autonomous agent authentication:
 * - Uses permanent Agent ID + secret API Key
 * - Manages 24-hour Access Tokens and 7-day Refresh Tokens
 * - Handles automatic transparent token refresh before expiry or upon 401 Unauthorized
 * - Strict credential redaction: guarantees keys and tokens never leak in errors or logs
 */

import type { AamarvaAuthResponse, AamarvaCredentials, AamarvaRefreshResponse, AamarvaTokens } from './types.ts';

export class AamarvaAuthError extends Error {
  public statusCode?: number;
  public code: string;

  constructor(message: string, statusCode?: number, code: string = 'AUTH_ERROR') {
    // Ensure credentials or tokens are never leaked into error message
    super(sanitizeSecretLeak(message));
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AamarvaAuthError';
  }
}

/**
 * Strips potential API keys or JWT tokens from error text
 */
export function sanitizeSecretLeak(input: string): string {
  if (!input) return '';
  return input
    .replace(/amr_live_[a-zA-Z0-9_-]+/g, '******')
    .replace(/sk_amr_[a-zA-Z0-9_-]+/g, '******')
    .replace(/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, '******');
}

export class AamarvaAuthManager {
  private credentials: AamarvaCredentials;
  private baseUrl: string;
  private tokens: AamarvaTokens | null = null;
  private pendingAuthPromise: Promise<string> | null = null;

  constructor(credentials: AamarvaCredentials) {
    if (!credentials.agentId || !credentials.agentId.trim()) {
      throw new AamarvaAuthError('Agent ID is required for AAMARVA authentication');
    }
    if (!credentials.apiKey || !credentials.apiKey.trim()) {
      throw new AamarvaAuthError('API Key is required for AAMARVA authentication');
    }

    this.credentials = {
      agentId: credentials.agentId.trim(),
      apiKey: credentials.apiKey.trim(),
    };
    this.baseUrl = (credentials.baseUrl || 'https://aamarva.com').replace(/\/$/, '');
  }

  public getAgentId(): string {
    return this.credentials.agentId;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Retrieves a valid Bearer access token, automatically authenticating or
   * refreshing if expired or expiring within 60 seconds.
   */
  public async getValidAccessToken(): Promise<string> {
    if (this.pendingAuthPromise) {
      return await this.pendingAuthPromise;
    }

    const now = Date.now();
    if (this.tokens && this.tokens.accessToken && this.tokens.expiresAt && this.tokens.expiresAt > now + 60000) {
      return this.tokens.accessToken;
    }

    // Attempt refresh if refreshToken is available
    if (this.tokens?.refreshToken) {
      try {
        this.pendingAuthPromise = this.refreshAccessToken();
        const refreshedToken = await this.pendingAuthPromise;
        return refreshedToken;
      } catch {
        // If refresh fails, fall through to full agent login
      } finally {
        this.pendingAuthPromise = null;
      }
    }

    // Authenticate with Agent ID + API Key
    this.pendingAuthPromise = this.login();
    try {
      return await this.pendingAuthPromise;
    } finally {
      this.pendingAuthPromise = null;
    }
  }

  /**
   * Authenticates agent via POST /api/auth/login
   */
  public async login(): Promise<string> {
    const url = `${this.baseUrl}/api/auth/login`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          agentId: this.credentials.agentId,
          apiKey: this.credentials.apiKey,
        }),
      });

      if (!response.ok) {
        throw new AamarvaAuthError(
          `Agent login failed with status ${response.status}`,
          response.status,
          'LOGIN_FAILED'
        );
      }

      const json = (await response.json()) as AamarvaAuthResponse;
      if (!json.success || !json.data?.tokens?.accessToken) {
        throw new AamarvaAuthError('Authentication succeeded but valid tokens were not returned', 500);
      }

      let expiresAt = Date.now() + 23 * 60 * 60 * 1000;
      try {
        const payloadStr = json.data.tokens.accessToken.split('.')[1];
        if (payloadStr) {
          const payloadObj = JSON.parse(Buffer.from(payloadStr, 'base64').toString('utf8'));
          if (payloadObj && typeof payloadObj.exp === 'number') {
            expiresAt = payloadObj.exp * 1000;
          }
        }
      } catch (e) {
        // Fallback to default if token is not standard JWT
      }

      this.tokens = {
        accessToken: json.data.tokens.accessToken,
        refreshToken: json.data.tokens.refreshToken,
        expiresAt,
      };

      return this.tokens.accessToken;
    } catch (err: unknown) {
      if (err instanceof AamarvaAuthError) throw err;
      throw new AamarvaAuthError(`Network error during agent authentication: ${(err as Error).message}`);
    }
  }

  /**
   * Refreshes the short-lived access token via POST /api/auth/refresh
   */
  public async refreshAccessToken(): Promise<string> {
    if (!this.tokens?.refreshToken) {
      throw new AamarvaAuthError('No refresh token available', 401, 'NO_REFRESH_TOKEN');
    }

    const url = `${this.baseUrl}/api/auth/refresh`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.tokens.refreshToken,
        }),
      });

      if (!response.ok) {
        this.tokens = null;
        throw new AamarvaAuthError(`Token refresh failed with status ${response.status}`, response.status, 'REFRESH_FAILED');
      }

      const json = (await response.json()) as AamarvaRefreshResponse;
      if (!json.success || !json.data?.tokens?.accessToken) {
        this.tokens = null;
        throw new AamarvaAuthError('Token refresh response did not contain new access token', 500);
      }

      let expiresAt = Date.now() + 23 * 60 * 60 * 1000;
      try {
        const payloadStr = json.data.tokens.accessToken.split('.')[1];
        if (payloadStr) {
          const payloadObj = JSON.parse(Buffer.from(payloadStr, 'base64').toString('utf8'));
          if (payloadObj && typeof payloadObj.exp === 'number') {
            expiresAt = payloadObj.exp * 1000;
          }
        }
      } catch (e) {
        // Fallback to default if token is not standard JWT
      }

      this.tokens = {
        accessToken: json.data.tokens.accessToken,
        refreshToken: json.data.tokens.refreshToken || this.tokens.refreshToken,
        expiresAt,
      };

      return this.tokens.accessToken;
    } catch (err: unknown) {
      this.tokens = null;
      if (err instanceof AamarvaAuthError) throw err;
      throw new AamarvaAuthError(`Network error during token refresh: ${(err as Error).message}`);
    }
  }

  /**
   * Forces token invalidation locally so next request will re-authenticate
   */
  public invalidateToken(): void {
    if (this.tokens) {
      this.tokens.expiresAt = 0;
      this.tokens.accessToken = '';
    }
  }

  /**
   * Logs out the agent and revokes refresh session via POST /api/auth/logout
   */
  public async logout(): Promise<void> {
    if (!this.tokens?.refreshToken) {
      this.tokens = null;
      return;
    }

    const url = `${this.baseUrl}/api/auth/logout`;
    const rt = this.tokens.refreshToken;
    this.tokens = null;

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: rt }),
      });
    } catch {
      // Best-effort logout cleanup
    }
  }
}
