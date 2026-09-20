import { SealedCashError } from "./errors.js";
import { validatePreparation, validateRoute, assertAddress } from "./validation.js";
import type {
  Address, ApiErrorBody, Hex, PrivateRoute, PrivateRouteInput, PrivacyBalance,
  PrivacyPreparationInput, PrivacyPreparationIntent, PrivacyProtocolStatus, WalletChallenge, WalletSession
} from "./types.js";

export interface SealedCashClientOptions {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

export class SealedCashClient {
  private readonly baseUrl: string;
  private readonly fetcher: typeof globalThis.fetch;
  private readonly headers: Record<string, string>;
  private readonly credentials: RequestCredentials;

  constructor(options: SealedCashClientOptions) {
    if (!options.baseUrl) throw new TypeError("baseUrl is required");
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.fetcher = options.fetch ?? globalThis.fetch;
    if (!this.fetcher) throw new TypeError("A fetch implementation is required");
    this.headers = { Accept: "application/json", ...options.headers };
    this.credentials = options.credentials ?? "include";
  }

  getPrivacyStatus(): Promise<PrivacyProtocolStatus> { return this.request("/privacy/status"); }
  getPrivacyBalance(): Promise<PrivacyBalance> { return this.request("/privacy/vault"); }
  listPrivacyPreparations(): Promise<PrivacyPreparationIntent[]> { return this.request("/privacy/deposits"); }
  getPrivacyPreparation(depositId: string): Promise<PrivacyPreparationIntent> {
    return this.request(`/privacy/deposits/${encodeURIComponent(depositId)}`);
  }
  createPrivacyPreparation(input: PrivacyPreparationInput): Promise<PrivacyPreparationIntent> {
    validatePreparation(input);
    return this.request("/privacy/deposits", { method: "POST", body: input });
  }
  cancelPrivacyPreparation(depositId: string): Promise<PrivacyPreparationIntent> {
    return this.request(`/privacy/deposits/${encodeURIComponent(depositId)}/cancel`, { method: "POST" });
  }

  createWalletChallenge(address: Address): Promise<WalletChallenge> {
    assertAddress(address);
    return this.request("/wallet-auth/challenges", { method: "POST", body: { address } });
  }
  createWalletSession(challengeId: string, signature: Hex): Promise<WalletSession> {
    return this.request("/wallet-auth/sessions", { method: "POST", body: { challengeId, signature } });
  }
  getWalletSession(): Promise<WalletSession> { return this.request("/wallet-auth/session"); }
  revokeWalletSession(): Promise<void> { return this.request("/wallet-auth/sessions", { method: "DELETE", expectBody: false }); }

  listPrivateRoutes(): Promise<PrivateRoute[]> { return this.request("/private-routes"); }
  getPrivateRoute(routeId: string): Promise<PrivateRoute> { return this.request(`/private-routes/${encodeURIComponent(routeId)}`); }
  createPrivateRoute(input: PrivateRouteInput): Promise<PrivateRoute> {
    validateRoute(input);
    return this.request("/private-routes", { method: "POST", body: input });
  }
  signPrivateRoute(routeId: string, signature: Hex): Promise<PrivateRoute> {
    return this.request(`/private-routes/${encodeURIComponent(routeId)}/signature`, { method: "POST", body: { signature } });
  }
  cancelPrivateRoute(routeId: string): Promise<PrivateRoute> {
    return this.request(`/private-routes/${encodeURIComponent(routeId)}/cancel`, { method: "POST" });
  }

  private async request<T>(path: string, options: { method?: string; body?: unknown; expectBody?: boolean } = {}): Promise<T> {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      method: options.method ?? "GET",
      headers: options.body === undefined ? this.headers : { ...this.headers, "Content-Type": "application/json" },
      credentials: this.credentials,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
    if (!response.ok) {
      let details: ApiErrorBody | undefined;
      try { details = await response.json() as ApiErrorBody; } catch { /* non-JSON error response */ }
      throw new SealedCashError(details?.error ?? `SealedCash API request failed (${response.status})`, response.status, details?.details);
    }
    if (options.expectBody === false || response.status === 204) return undefined as T;
    return await response.json() as T;
  }
}