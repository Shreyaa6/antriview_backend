import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.js';

export const makeUsersRoutes = ({ usersRepository }) => {
  const router = Router();

  const updateSchema = z.object({
    name: z.string().min(2).optional(),
    password: z.string().min(6).optional(),
    resumeData: z.any().optional(),
    selectedPersona: z.string().optional(),
    skills: z.array(z.any()).optional(),
    stats: z.any().optional(),
    history: z.array(z.any()).optional(),
    streak: z.number().int().nonnegative().optional(),
    lastSessionDate: z.string().optional(),
  });

  router.patch('/me', requireAuth, async (req, res, next) => {
    try {
      const updates = updateSchema.parse(req.body);
      const existing = await usersRepository.findUserByEmail(req.auth.email);
      if (!existing) return res.status(404).json({ message: 'User not found' });

      const updated = await usersRepository.updateUserByEmail(req.auth.email, {
        ...updates,
        passwordHash: updates.password ? await bcrypt.hash(updates.password, 10) : undefined,
      });

      return res.json({ user: usersRepository.sanitizeUser(updated) });
    } catch (error) {
      return next(error);
    }
  });

  return router;
};
