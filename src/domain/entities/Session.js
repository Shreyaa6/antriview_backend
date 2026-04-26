/**
 * Session Entity — Domain Layer.
 *
 * Represents a single interview session completed by a user.
 *
 * System Design Concepts:
 *
 *  1. DOMAIN ENTITY:
 *     - Pure business object with no framework dependencies.
 *     - Validates its own invariants (e.g., track must be valid).
 *
 *  2. VALUE OBJECT — TRACK:
 *     - The track ('dsa', 'hr', 'dev') is a constrained value.
 *     - `VALID_TRACKS` acts as an enumeration enforcing valid states.
 *
 *  3. FACTORY METHOD:
 *     - `createSessionEntity()` ensures every Session is created consistently.
 */

/** Valid interview tracks — acts as a domain-level enum */
export const VALID_TRACKS = ['dsa', 'hr', 'dev'];

/**
 * Factory function — creates a new Session entity.
 *
 * @param {object} params
 * @param {string} params.userEmail - The user who completed the session
 * @param {string} params.role - Interview role (e.g., 'SDE', 'PM')
 * @param {string} params.type - Session type (e.g., 'DSA', 'System Design')
 * @param {string} params.track - Must be one of VALID_TRACKS
 * @param {string} params.scoreText - Score as display string (e.g., '85%')
 * @param {object} [params.report] - Optional detailed report
 * @returns {object} A valid Session entity
 * @throws {Error} If track is invalid
 */
export function createSessionEntity({ userEmail, role, type, track, scoreText, report = null }) {
  if (!VALID_TRACKS.includes(track)) {
    throw new Error(`Invalid track "${track}". Must be one of: ${VALID_TRACKS.join(', ')}`);
  }

  return {
    userEmail,
    role,
    type,
    track,
    scoreText,
    report,
  };
}

/**
 * Compute the updated streak value based on the last session date.
 *
 * Domain Logic: This is a pure business rule — no I/O, no side effects.
 * It belongs in the domain because streak computation is a core business concept.
 *
 * @param {number} currentStreak - The user's current streak count
 * @param {string|null} lastSessionDate - ISO date string of last session
 * @returns {number} Updated streak value
 */
export function computeStreak(currentStreak, lastSessionDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!lastSessionDate) return 1;

  const last = new Date(lastSessionDate);
  last.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - last.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return Math.max(currentStreak, 1);
  if (diffDays === 1) return currentStreak + 1;
  return 1; // Gap > 1 day — reset
}
