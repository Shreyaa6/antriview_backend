/**
 * Error Handler Middleware — Presentation Layer.
 *
 * Centralized error handling following Clean Architecture principles.
 *
 * System Design Concepts:
 *
 *  1. CHAIN OF RESPONSIBILITY PATTERN:
 *     - Express error middleware forms a chain.
 *     - This handler is the final link — catches all unhandled errors.
 *
 *  2. OPEN/CLOSED PRINCIPLE (OCP):
 *     - New error types (AppError subclasses) automatically work here.
 *     - Adding a new error type (e.g., RateLimitError) requires NO changes
 *       to this handler — just create the subclass with its statusCode.
 *
 *  3. SEPARATION OF CONCERNS:
 *     - Use cases throw DOMAIN errors (ConflictError, NotFoundError).
 *     - This handler translates them to HTTP responses.
 *     - Use cases never know about HTTP — clean boundary.
 *
 *  4. GRACEFUL DEGRADATION:
 *     - Known errors (AppError) → structured JSON with correct status.
 *     - Zod errors → 400 with validation details.
 *     - Unknown errors → 500 with generic message (don't leak internals).
 */

import { AppError } from '../domain/errors/AppError.js';

/**
 * Express error-handling middleware.
 * Must have exactly 4 parameters for Express to recognize it as error middleware.
 */
export function errorHandler(err, _req, res, _next) {
  // 1. Domain errors (AppError hierarchy) — OCP in action
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  // 2. Zod validation errors — input validation failures
  if (err.name === 'ZodError') {
    const issues = err.issues?.map((i) => ({
      path: i.path.join('.'),
      message: i.message,
    }));
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Invalid request data',
      details: issues,
    });
  }

  // 3. JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'UnauthorizedError',
      message: 'Invalid or expired token',
    });
  }

  // 4. Unknown errors — don't leak internals
  console.error('[ErrorHandler] Unhandled error:', err);
  return res.status(500).json({
    error: 'InternalServerError',
    message: 'An unexpected error occurred',
  });
}
