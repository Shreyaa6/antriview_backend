import { Router } from 'express';
import * as resumeController from '../controllers/resumeController.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', resumeController.createResume);
router.get('/', resumeController.getAllResumes);
router.get('/:id', resumeController.getResumeById);
router.put('/:id', resumeController.updateResume);

router.post('/evaluate', resumeController.evaluateResume);
router.post('/generate-latex', resumeController.generateLatex);
router.post('/parse-latex', resumeController.parseLatex);
router.post('/compile', resumeController.compileResume);

export default router;
