import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import sessionsRoutes from './routes/sessions.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import resumeRoutes from './routes/resume.routes.js';
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
