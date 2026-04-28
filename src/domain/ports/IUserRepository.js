/**
 * IUserRepository — Port Interface (Domain Layer).
 *
 * This is the PORT — an abstraction that sits at the domain boundary.
 * The Application layer depends on THIS interface, not on the
 * concrete PostgreSQL implementation.
 *
 * System Design Concepts:
 *
 *  1. DEPENDENCY INVERSION PRINCIPLE (DIP — the "D" in SOLID):
 *     - High-level modules (use cases) depend on abstractions (this port).
 *     - Low-level modules (PostgreSQL repository) implement this port.
 *     - Both depend on the abstraction, not on each other.
 *
 *  2. REPOSITORY PATTERN:
 *     - Provides a collection-like interface for accessing User entities.
 *     - Hides the storage mechanism (could be PostgreSQL, MongoDB, in-memory).
 *
 *  3. INTERFACE SEGREGATION PRINCIPLE (ISP — the "I" in SOLID):
 *     - Small, focused interface with only the methods needed.
 *     - Not polluted with unrelated operations.
 *
 * In JavaScript, we document the interface via JSDoc since there are no
 * native interfaces. The concrete implementation must follow this contract.
 *
 * @typedef {object} IUserRepository
 * @property {function(string): Promise<object|null>} findUserByEmail
 *   Find a user by their email address. Returns null if not found.
 * @property {function(object): Promise<object>} createUser
 *   Create a new user. Returns the created user record.
 * @property {function(string, object): Promise<object>} updateUserByEmail
 *   Update a user by email. Returns the updated user record.
 */

/**
 * Validates that an object implements the IUserRepository contract.
 *
 * Design Pattern: CONTRACT VERIFICATION
 * - Runtime check that a repository implementation fulfills the port.
 * - Fails fast if a required method is missing.
 *
 * @param {object} repo - The repository implementation to validate
 * @throws {Error} If any required method is missing
 */
export function assertUserRepository(repo) {
  const required = ['findUserByEmail', 'createUser', 'updateUserByEmail'];
  for (const method of required) {
    if (typeof repo[method] !== 'function') {
      throw new Error(
        `IUserRepository contract violation: missing method "${method}". ` +
        `The repository must implement: ${required.join(', ')}`
      );
    }
  }
}
