// Typed API error hierarchy. SSR-AA-04: auth errors must be distinguishable from validation/network errors.
// CRITICAL: `name` uses explicit `public override readonly name: string = '...'` (not shorthand)
// because the parent Error class declares `name` as a literal type — shorthand causes TS2416.
export class ApiError extends Error {
  public override readonly name: string = 'ApiError';
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class NetworkError extends Error {
  public override readonly name: string = 'NetworkError';
  constructor(message = 'Network error') {
    super(message);
  }
}

// FR-IAM-04: 401-driven refresh flow relies on `instanceof AuthError` checks.
export class AuthError extends ApiError {
  public override readonly name: string = 'AuthError';
  constructor(status: number, message: string, code?: string) {
    super(status, message, code);
  }
}

// Validation errors carry a typed fieldErrors map; not assigned via shorthand in params.
export class ValidationError extends ApiError {
  public override readonly name: string = 'ValidationError';
  public readonly fieldErrors: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string[]>,
    code?: string,
  ) {
    super(status, message, code, fieldErrors);
    this.fieldErrors = fieldErrors;
  }
}
