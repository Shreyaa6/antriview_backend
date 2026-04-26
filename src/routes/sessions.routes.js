import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { computeStreak } from '../lib/streak.js';
import { pool } from '../db/pool.js';
import { findUserByEmail, sanitizeUser, updateUserByEmail } from '../repositories/usersRepository.js';

const router = Router();

const addSessionSchema = z.object({
  item: z.object({
    id: z.string(),
    role: z.string(),
    date: z.string(),
    score: z.string(),
    type: z.string(),
    report: z.any().optional(),
  }),
  track: z.enum(['dsa', 'hr', 'dev']),
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { item, track } = addSessionSchema.parse(req.body);
    const user = await findUserByEmail(req.auth.email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await pool.query(
      `INSERT INTO sessions (user_email, role, type, track, score_text, report)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [
        req.auth.email,
        item.role,
        item.type,
        track,
        item.score,
        item.report ? JSON.stringify(item.report) : null,
      ],
    );

    const history = [item, ...(user.history ?? [])];
    const stats = { ...(user.stats ?? {}) };
    stats[track] = {
      sessions: Number(stats[track]?.sessions ?? 0) + 1,
      progress: Math.min(100, Number(stats[track]?.progress ?? 0) + 15),
    };

    const skills = Array.isArray(user.skills) ? [...user.skills] : [];
    if (skills.length > 0) {
      const idx = Math.floor(Math.random() * skills.length);
      skills[idx] = {
        ...skills[idx],
        score: Math.min(100, Number(skills[idx].score ?? 0) + 10),
      };
    }

    const streak = computeStreak(Number(user.streak ?? 0), user.last_session_date);
    const lastSessionDate = new Date().toISOString().split('T')[0];

    const updated = await updateUserByEmail(req.auth.email, {
      history,
      stats,
      skills,
      streak,
      lastSessionDate,
    });

    return res.status(201).json({ user: sanitizeUser(updated) });
  } catch (error) {
    return next(error);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const limit = Math.min(200, Number(req.query.limit ?? 50));
    const rows = await pool.query(
      `SELECT id, role, type, track, score_text, report, created_at
       FROM sessions
       WHERE user_email = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [req.auth.email, limit],
    );
    return res.json({ sessions: rows.rows });
  } catch (error) {
    return next(error);
  }
});

export default router;
