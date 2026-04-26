/**
 * Application Error Hierarchy — Domain Layer.
 *
 * Structured error classes that map business-level failures to HTTP semantics.
 *
 * System Design Concepts:
 *
 *  1. OPEN/CLOSED PRINCIPLE (OCP — the "O" in SOLID):
 *     - New error types can be ADDED by creating subclasses.
 *     - Existing error handling code does NOT need to be modified.
 *     - The error handler middleware uses `instanceof` checks — adding a new
 *       error subclass automatically works with the existing handler.
 *
 *  2. LISKOV SUBSTITUTION PRINCIPLE (LSP — the "L" in SOLID):
 *     - Every subclass (ValidationError, NotFoundError, etc.) can be used
 *       wherever an AppError is expected.
 *     - The error handler treats them uniformly via the base class contract.
 *
 *  3. STRATEGY PATTERN (implicit):
 *     - Each error subclass defines its own HTTP status code.
 *     - The error handler doesn't need a giant switch/case — the strategy
 *       is encoded in the error itself.
 *
 * Usage:
 *   throw new NotFoundError('User');         → 404 "User not found"
 *   throw new ConflictError('Email already exists'); → 409
 *   throw new ValidationError('Invalid email format'); → 400
 */

/**
 * Base application error.
 * All custom errors extend this class.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

/**
 * 400 Bad Request — Input validation failed.
 * Use when: user sends malformed data, missing fields, wrong types.
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized — Authentication failed.
 * Use when: invalid credentials, expired token, missing auth header.
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Invalid credentials') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden — Authenticated but not authorized.
 * Use when: user doesn't have permission for the requested resource.
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * 404 Not Found — Resource does not exist.
 * Use when: looking up a user, session, or resume that doesn't exist.
 */
export class NotFoundError extends AppError {
  /**
   * @param {string} resource - Name of the resource (e.g., 'User', 'Session')
   */
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

/**
 * 409 Conflict — Resource already exists.
 * Use when: duplicate email on signup, duplicate record insertion.
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

/**
 * 503 Service Unavailable — External service not configured or down.
 * Use when: Google OAuth not configured, AI service unavailable.
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable') {
    super(message, 503);
  }
}
