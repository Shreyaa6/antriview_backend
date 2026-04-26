import { pool } from '../database/pool.js';

/**
 * @implements {ISessionRepository}
 */
class SessionRepository {
  async createSession({ userEmail, role, type, track, scoreText, report }) {
    const result = await pool.query(
      `INSERT INTO sessions (user_email, role, type, track, score_text, report)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb) RETURNING *`,
      [
        userEmail,
        role,
        type,
        track,
        scoreText,
        report ? JSON.stringify(report) : null,
      ],
    );
    return result.rows[0];
  }

  async getSessionsByUser(userEmail, limit = 50) {
    const result = await pool.query(
      `SELECT id, role, type, track, score_text, report, created_at
       FROM sessions
       WHERE user_email = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userEmail, limit],
    );
    return result.rows;
  }
}

export default SessionRepository;
