import { Router } from 'express';
import {
  getVideoByIdHandler,
  getVideosHandler,
  postRefetchTranscriptHandler,
  postVideoFromUrlHandler,
} from './routes';

/**
 * Creates the videos data router.
 */
export const createVideosRouter = (): Router => {
  const router = Router();
  router.get('/', getVideosHandler);
  router.post('/from-url', postVideoFromUrlHandler);
  router.get('/:id', getVideoByIdHandler);
  router.post('/:id/refetch-transcript', postRefetchTranscriptHandler);
  return router;
};
