/**
 * InnerTube YouTube transcript HTTP routes (no DB).
 */

import { Router, Request, Response } from 'express';
import {
  getTranscriptFromYoutube,
  YoutubeTranscriptFetchError,
  type YoutubeTranscriptFetchErrorCode,
} from '../services/youtube-transcripts';

const transcriptFetchErrorStatus = (code: YoutubeTranscriptFetchErrorCode): number => {
  switch (code) {
    case 'INVALID_INPUT':
      return 400;
    case 'AGE_RESTRICTED':
      return 403;
    case 'VIDEO_UNAVAILABLE':
    case 'TRANSCRIPTS_DISABLED':
    case 'NO_MATCHING_LANGUAGE':
      return 404;
    default:
      return 502;
  }
};

export const createTranscriptRouter = (): Router => {
  const router = Router();

  /**
   * POST /api/transcript
   * Body: { youtubeUrl?: string, videoId?: string, languages?: string[], timeoutMs?: number }
   */
  router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
      const body = req.body ?? {};
      const youtubeUrl = typeof body.youtubeUrl === 'string' ? body.youtubeUrl.trim() : '';
      const videoId = typeof body.videoId === 'string' ? body.videoId.trim() : '';
      const languages = Array.isArray(body.languages)
        ? body.languages.filter((x: unknown): x is string => typeof x === 'string')
        : undefined;
      const timeoutMs =
        typeof body.timeoutMs === 'number' && Number.isFinite(body.timeoutMs) && body.timeoutMs > 0
          ? Math.min(Math.floor(body.timeoutMs), 120_000)
          : 15_000;

      if (!youtubeUrl && !videoId) {
        res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'youtubeUrl or videoId is required',
        });
        return;
      }

      const data = await getTranscriptFromYoutube(
        { youtubeUrl: youtubeUrl || undefined, videoId: videoId || undefined },
        { languages, timeoutMs }
      );

      res.status(200).json({
        success: true,
        data,
        message: 'Transcript retrieved successfully',
      });
    } catch (error) {
      if (error instanceof YoutubeTranscriptFetchError) {
        const status = transcriptFetchErrorStatus(error.code);
        console.error('❌ POST /api/transcript:', error.code, error.message);
        res.status(status).json({
          success: false,
          error: error.message,
          code: error.code,
          message: 'Failed to get transcript',
        });
        return;
      }
      console.error('❌ POST /api/transcript:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to get transcript',
      });
    }
  });

  return router;
};
