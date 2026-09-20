export type Address = `0x${string}`;
export type Hex = `0x${string}`;

export interface PrivacyProtocolStatus {
  network: "Robinhood Chain Mainnet";
  protocol: "SealedCash";
  executionAvailable: boolean;
  state: "not_configured" | "ready";
  components: {
    node: boolean;
    prover: boolean;
    bridge: boolean;
    relayer: boolean;
    settlementMonitor: boolean;
    release: boolean;
  };
}

export interface PrivacyBalance {
  network: "Robinhood Chain Mainnet";
  protocol: "SealedCash";
  privateBalance: string | null;
  pendingDeposits: number;
  executionAvailable: boolean;
  state: "not_configured" | "ready";
}

export interface PrivacyPreparationInput {
  inputToken: Address;
  inputAmount: string;
  idempotencyKey: string;
}

export interface PrivacyPreparationIntent {
  id: string;
  chainId: 4663;
  inputToken: string;
  inputSymbol: string;
  inputDecimals: number;
  inputAmount: string;
  status: "draft" | "cancelled" | "awaiting_execution" | "submitted" | "proving" | "confirmed" | "failed";
  executionAvailable: boolean;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WalletChallenge {
  challengeId: string;
  message: string;
  expiresAt: string;
}

export interface WalletSession {
  address: Address;
  expiresAt: string;
}

export interface PrivateRouteInput {
  inputToken: Address;
  inputAmount: string;
  outputToken: Address;
  minimumOutputAmount: string;
  maximumTotalFeeBps: number;
  destinationCommitment: Hex;
  expiresAt: string;
}

export interface PrivateRoute {
  id: string;
  ownerAddress: Address;
  chainId: 4663;
  inputToken: string;
  inputAmount: string;
  outputToken: string;
  minimumOutputAmount: string;
  maximumTotalFeeBps: number;
  destinationCommitment: string;
  status: "intent_created" | "intent_signed" | "cancelled" | "expired";
  signingPayload: Record<string, unknown>;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorBody {
  error: string;
  details?: unknown;
}