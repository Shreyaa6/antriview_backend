import { Router } from 'express';

import { requireAuth } from '../../middleware/auth.js';

export const makeResumeRoutes = (resumeController) => {
  const router = Router();

  router.use(requireAuth);

  router.post('/', resumeController.createResume);
  router.get('/', resumeController.getAllResumes);
  router.get('/:id', resumeController.getResumeById);
  router.put('/:id', resumeController.updateResume);
  router.delete('/:id', resumeController.deleteResume);

  router.post('/evaluate', resumeController.evaluateResume);
  router.post('/generate-latex', resumeController.generateLatex);
  router.post('/parse-latex', resumeController.parseLatex);
  router.post('/compile', resumeController.compileResume);

  return router;
};
