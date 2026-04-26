import { Router } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { createUser, findUserByEmail, sanitizeUser } from '../repositories/usersRepository.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { config } from '../config.js';

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
    const input = signupSchema.parse(req.body);
    const existing = await findUserByEmail(input.email);
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const passwordHash = await bcrypt.hash(input.password, 10);
    const userRow = await createUser({
      email: input.email.toLowerCase().trim(),
      name: input.name.trim(),
      passwordHash,
    });
    const token = signToken(userRow.email);
    return res.status(201).json({ token, user: sanitizeUser(userRow) });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const userRow = await findUserByEmail(input.email.toLowerCase().trim());
    if (!userRow) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(input.password, userRow.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(userRow.email);
    return res.json({ token, user: sanitizeUser(userRow) });
  } catch (error) {
    return next(error);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    if (!config.googleClientId) {
      return res.status(503).json({ message: 'Google auth is not configured on server' });
    }

    const googleClient = new OAuth2Client(config.googleClientId);
    const { credential } = googleLoginSchema.parse(req.body);
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(401).json({ message: 'Invalid Google token payload' });
    }

    const email = payload.email.toLowerCase().trim();
    let userRow = await findUserByEmail(email);

    if (!userRow) {
      const generatedPassword = crypto.randomUUID();
      const passwordHash = await bcrypt.hash(generatedPassword, 10);
      userRow = await createUser({
        email,
        name: payload.name?.trim() || email.split('@')[0],
        passwordHash,
      });
    }

    const token = signToken(userRow.email);
    return res.json({ token, user: sanitizeUser(userRow) });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userRow = await findUserByEmail(req.auth.email);
    if (!userRow) return res.status(404).json({ message: 'User not found' });
    return res.json({ user: sanitizeUser(userRow) });
  } catch (error) {
    return next(error);
  }
});

export default router;
