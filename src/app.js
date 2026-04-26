import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import { makeHealthRoutes } from './presentation/routes/health.routes.js';
import { makeAuthRoutes } from './presentation/routes/auth.routes.js';
import { makeUsersRoutes } from './presentation/routes/users.routes.js';
import { makeSessionsRoutes } from './presentation/routes/sessions.routes.js';
import { makeDashboardRoutes } from './presentation/routes/dashboard.routes.js';
import { makeResumeRoutes } from './presentation/routes/resume.routes.js';
import { makeResumeController } from './presentation/controllers/resumeController.js';
import { diContainer } from './diContainer.js';
import { pool } from './infrastructure/database/pool.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '2mb' }));

  // Dependency Injection Wiring
  const { infrastructure, useCases } = diContainer;

  // Instantiate Controllers
  const resumeController = makeResumeController({
    generateLatexUseCase: useCases.generateLatexUseCase,
    parseLatexUseCase: useCases.parseLatexUseCase,
    evaluateResumeUseCase: useCases.evaluateResumeUseCase,
    compileResumeUseCase: useCases.compileResumeUseCase,
    resumeRepository: infrastructure.resumeRepository,
    usersRepository: infrastructure.usersRepository
  });

  // Instantiate Routes
  const healthRoutes = makeHealthRoutes({ pool });
  const authRoutes = makeAuthRoutes({
    signupUseCase: useCases.signupUseCase,
    loginUseCase: useCases.loginUseCase,
    googleLoginUseCase: useCases.googleLoginUseCase
  });
  const usersRoutes = makeUsersRoutes({
    usersRepository: infrastructure.usersRepository
  });
  const sessionsRoutes = makeSessionsRoutes({
    addSessionUseCase: useCases.addSessionUseCase,
    sessionRepository: infrastructure.sessionRepository
  });
  const dashboardRoutes = makeDashboardRoutes({ pool });
  const resumeRouter = makeResumeRoutes(resumeController);

  app.get('/', (_req, res) => res.json({ service: 'antriview-backend', ok: true }));
  
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/sessions', sessionsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/resume', resumeRouter);

  app.use(errorHandler);

  return app;
}
