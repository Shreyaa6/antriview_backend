import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.js';
import { sanitizeUser } from '../../infrastructure/repositories/usersRepository.js';

export const makeSessionsRoutes = ({ addSessionUseCase, sessionRepository }) => {
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
      const updatedUser = await addSessionUseCase.execute(req.auth.email, item, track);
      return res.status(201).json({ user: sanitizeUser(updatedUser) });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      return next(error);
    }
  });

  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const limit = Math.min(200, Number(req.query.limit ?? 50));
      const sessions = await sessionRepository.getSessionsByUser(req.auth.email, limit);
      return res.json({ sessions });
    } catch (error) {
      return next(error);
    }
  });

  return router;
};
