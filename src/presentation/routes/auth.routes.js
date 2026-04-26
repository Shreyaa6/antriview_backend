import { Router } from 'express';
import { z } from 'zod';
import { findUserByEmail, sanitizeUser } from '../../infrastructure/repositories/usersRepository.js';
import { requireAuth, signToken } from '../../middleware/auth.js';
import { config } from '../../config.js';

export const makeAuthRoutes = ({ signupUseCase, loginUseCase, googleLoginUseCase }) => {
  const router = Router();

  const signupSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
    password: z.string().min(6),
  });

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const googleLoginSchema = z.object({
    credential: z.string().min(10),
  });

  router.post('/signup', async (req, res, next) => {
    try {
      const { email, name, password } = signupSchema.parse(req.body);
      const result = await signupUseCase.execute(email, name, password);
      return res.status(201).json(result);
    } catch (error) {
      if (error.message === 'Email already exists') {
        return res.status(409).json({ message: error.message });
      }
      return next(error);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await loginUseCase.execute(email, password);
      return res.json(result);
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ message: error.message });
      }
      return next(error);
    }
  });

  router.post('/google', async (req, res, next) => {
    try {
      const { credential } = googleLoginSchema.parse(req.body);
      const result = await googleLoginUseCase.execute(credential);
      return res.json(result);
    } catch (error) {
      if (error.message.includes('Google auth is not configured')) {
        return res.status(503).json({ message: error.message });
      }
      if (error.message.includes('Invalid Google token payload')) {
        return res.status(401).json({ message: error.message });
      }
      return next(error);
    }
  });

  router.get('/me', requireAuth, async (req, res, next) => {
    try {
      // For simplicity, we directly fetch via repository here or via a GetUserUseCase.
      // We'll leave this intact using the repository directly for now.
      const userRow = await findUserByEmail(req.auth.email);
      if (!userRow) return res.status(404).json({ message: 'User not found' });
      return res.json({ user: sanitizeUser(userRow) });
    } catch (error) {
      return next(error);
    }
  });

  return router;
};
