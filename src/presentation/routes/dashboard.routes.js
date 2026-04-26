import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { pool } from '../../infrastructure/database/pool.js';

const router = Router();

router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const email = req.auth.email;
    const sessionsCount = await pool.query(
      'SELECT COUNT(*)::int AS total FROM sessions WHERE user_email = $1',
      [email],
    );
    const latest = await pool.query(
      'SELECT created_at, role, type, score_text FROM sessions WHERE user_email = $1 ORDER BY created_at DESC LIMIT 1',
      [email],
    );

    return res.json({
      totalSessions: sessionsCount.rows[0]?.total ?? 0,
      latestSession: latest.rows[0] ?? null,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
