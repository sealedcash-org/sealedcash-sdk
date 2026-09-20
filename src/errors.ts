export class SealedCashError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "SealedCashError";
    this.status = status;
    this.details = details;
  }
}

export class SealedCashValidationError extends TypeError {
  constructor(message: string) {
    super(message);
    this.name = "SealedCashValidationError";
  }
}