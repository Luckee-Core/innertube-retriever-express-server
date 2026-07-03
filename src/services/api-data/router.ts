import { Router } from 'express';
import { createVideosRouter } from '../videos/router';

/**
 * Aggregates all /api/data entity routers.
 */
export const createDataRouter = (): Router => {
  const router = Router();
  router.use('/videos', createVideosRouter());
  return router;
};
