import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import healthRoutes from './presentation/routes/health.routes.js';
import authRoutes from './presentation/routes/auth.routes.js';
import usersRoutes from './presentation/routes/users.routes.js';
import sessionsRoutes from './presentation/routes/sessions.routes.js';
import dashboardRoutes from './presentation/routes/dashboard.routes.js';
import resumeRoutes from './presentation/routes/resume.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '2mb' }));

  app.get('/', (_req, res) => res.json({ service: 'antriview-backend', ok: true }));
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/sessions', sessionsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/resume', resumeRoutes);

  app.use(errorHandler);

  return app;
}
