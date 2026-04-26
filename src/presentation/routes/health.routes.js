import { Router } from 'express';

export const makeHealthRoutes = ({ pool }) => {
  const router = Router();

  router.get('/', async (_req, res, next) => {
    try {
      const db = await pool.query('SELECT NOW() as now');
      res.json({ ok: true, now: db.rows[0].now });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
