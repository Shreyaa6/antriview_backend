/**
 * ISessionRepository — Port Interface (Domain Layer).
 *
 * Abstraction for session (interview) data access.
 * Use cases depend on this port, not on the concrete database implementation.
 *
 * System Design Concepts:
 *
 *  1. DEPENDENCY INVERSION PRINCIPLE (DIP):
 *     - AddSessionUseCase depends on this interface.
 *     - PostgreSQL implementation fulfills this contract.
 *
 *  2. REPOSITORY PATTERN:
 *     - Collection-like interface for Session entities.
 *     - Encapsulates query logic behind a clean API.
 *
 * @typedef {object} ISessionRepository
 * @property {function(object): Promise<object>} create
 *   Insert a new session record. Returns the created record.
 * @property {function(string, number): Promise<object[]>} findByUserEmail
 *   Get sessions for a user, ordered by most recent, with limit.
 * @property {function(string): Promise<number>} countByUserEmail
 *   Count total sessions for a user.
 * @property {function(string): Promise<object|null>} findLatestByUserEmail
 *   Get the most recent session for a user.
 */

/**
 * Validates that an object implements the ISessionRepository contract.
 *
 * @param {object} repo - The repository implementation to validate
 * @throws {Error} If any required method is missing
 */
export function assertSessionRepository(repo) {
  const required = ['create', 'findByUserEmail', 'countByUserEmail', 'findLatestByUserEmail'];
  for (const method of required) {
    if (typeof repo[method] !== 'function') {
      throw new Error(
        `ISessionRepository contract violation: missing method "${method}". ` +
        `The repository must implement: ${required.join(', ')}`
      );
    }
  }
}
