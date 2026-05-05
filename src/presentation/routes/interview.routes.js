import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middleware/auth.js';

export const makeInterviewRoutes = ({ generateInterviewQuestionsUseCase, evaluateInterviewAnswerUseCase }) => {
  const router = Router();

  const questionsSchema = z.object({
    type: z.enum(['DSA', 'System Design', 'HR / Behavioral', 'Case Study', 'Mixed']),
    jobDescription: z.string().optional(),
    resumeData: z.any().optional(),
    personaStyle: z.string().optional(),
  });

  const evaluationSchema = z.object({
    question: z.string().min(1),
    answer: z.string().optional(),
    elapsedSec: z.number().nonnegative(),
    bodyLanguageScore: z.number().min(0).max(100),
    finishedInTime: z.boolean(),
  });

  router.use(requireAuth);

  router.post('/questions', async (req, res, next) => {
    try {
      const params = questionsSchema.parse(req.body);
      const questions = generateInterviewQuestionsUseCase.execute(params);
      return res.json({ questions });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/evaluate', async (req, res, next) => {
    try {
      const params = evaluationSchema.parse(req.body);
      const evaluation = evaluateInterviewAnswerUseCase.execute(params);
      return res.json(evaluation);
    } catch (error) {
      return next(error);
    }
  });

  return router;
};
