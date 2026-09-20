import { SealedCashValidationError } from "./errors.js";
import type { Address, Hex, PrivateRouteInput, PrivacyPreparationInput } from "./types.js";

const addressPattern = /^0x[a-fA-F0-9]{40}$/;
const hexPattern = /^0x[a-fA-F0-9]+$/;
const positiveIntegerPattern = /^[1-9][0-9]*$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function assertAddress(value: string, field = "address"): asserts value is Address {
  if (!addressPattern.test(value)) throw new SealedCashValidationError(`${field} must be a 20-byte hexadecimal address`);
}

export function assertHex(value: string, field: string, bytes?: number): asserts value is Hex {
  if (!hexPattern.test(value) || (bytes !== undefined && value.length !== bytes * 2 + 2)) {
    throw new SealedCashValidationError(`${field} must be a hexadecimal value${bytes ? ` of ${bytes} bytes` : ""}`);
  }
}

function assertPositiveInteger(value: string, field: string): void {
  if (!positiveIntegerPattern.test(value)) throw new SealedCashValidationError(`${field} must be a positive integer string`);
}

function assertUuid(value: string, field: string): void {
  if (!uuidPattern.test(value)) throw new SealedCashValidationError(`${field} must be a UUID`);
}

export function validatePreparation(input: PrivacyPreparationInput): void {
  assertAddress(input.inputToken, "inputToken");
  assertPositiveInteger(input.inputAmount, "inputAmount");
  assertUuid(input.idempotencyKey, "idempotencyKey");
}

export function validateRoute(input: PrivateRouteInput): void {
  assertAddress(input.inputToken, "inputToken");
  assertAddress(input.outputToken, "outputToken");
  assertPositiveInteger(input.inputAmount, "inputAmount");
  assertPositiveInteger(input.minimumOutputAmount, "minimumOutputAmount");
  if (!Number.isInteger(input.maximumTotalFeeBps) || input.maximumTotalFeeBps < 0 || input.maximumTotalFeeBps > 1000) {
    throw new SealedCashValidationError("maximumTotalFeeBps must be an integer between 0 and 1000");
  }
  assertHex(input.destinationCommitment, "destinationCommitment", 32);
  if (Number.isNaN(Date.parse(input.expiresAt))) throw new SealedCashValidationError("expiresAt must be an ISO date");
}