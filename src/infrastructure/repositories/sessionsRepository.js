/**
 * SessionRepository — Infrastructure Layer (PostgreSQL).
 *
 * Concrete implementation of the ISessionRepository port.
 *
 * System Design Concepts:
 *
 *  1. REPOSITORY PATTERN:
 *     - Implements the ISessionRepository port defined in the domain layer.
 *     - Translates between domain operations and SQL queries.
 *     - The application layer never sees SQL — only the port interface.
 *
 *  2. DEPENDENCY INVERSION PRINCIPLE (DIP):
 *     - Use cases depend on the PORT (ISessionRepository).
 *     - This file IMPLEMENTS the port with PostgreSQL.
 *     - Swapping to MongoDB would only change this file.
 *
 *  3. SINGLE RESPONSIBILITY PRINCIPLE (SRP):
 *     - Only handles session persistence operations.
 *     - No business logic — that belongs in use cases.
 */

import { pool } from '../database/pool.js';

/**
 * PostgreSQL implementation of ISessionRepository.
 *
 * Implements: ISessionRepository
 * @see ../../domain/ports/ISessionRepository.js
 */
const sessionsRepository = {
  /**
   * Insert a new session record.
   * @param {object} session - Session entity from domain layer
   * @returns {Promise<object>} Created session row
   */
  async create(session) {
    const result = await pool.query(
      `INSERT INTO sessions (user_email, role, type, track, score_text, report)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)
       RETURNING *`,
      [
        session.userEmail,
        session.role,
        session.type,
        session.track,
        session.scoreText,
        session.report ? JSON.stringify(session.report) : null,
      ],
    );
    return result.rows[0];
  },

  /**
   * Find sessions for a user, ordered by most recent.
   * @param {string} userEmail
   * @param {number} limit
   * @returns {Promise<object[]>}
   */
  async findByUserEmail(userEmail, limit = 50) {
    const result = await pool.query(
      `SELECT id, role, type, track, score_text, report, created_at
       FROM sessions
       WHERE user_email = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userEmail, limit],
    );
    return result.rows;
  },

  /**
   * Count total sessions for a user.
   * @param {string} userEmail
   * @returns {Promise<number>}
   */
  async countByUserEmail(userEmail) {
    const result = await pool.query(
      'SELECT COUNT(*)::int AS total FROM sessions WHERE user_email = $1',
      [userEmail],
    );
    return result.rows[0]?.total ?? 0;
  },

  /**
   * Get the most recent session for a user.
   * @param {string} userEmail
   * @returns {Promise<object|null>}
   */
  async findLatestByUserEmail(userEmail) {
    const result = await pool.query(
      `SELECT created_at, role, type, score_text
       FROM sessions
       WHERE user_email = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userEmail],
    );
    return result.rows[0] ?? null;
  },
};

export default sessionsRepository;
