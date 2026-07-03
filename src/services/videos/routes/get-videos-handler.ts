import type { Request, Response } from 'express';
import { getManagedSupabaseClient } from '../../managed';
import { listVideos } from '../../../data/videos';

/** GET /videos */
export const getVideosHandler = async (_req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getManagedSupabaseClient();
    if (!supabase) {
      res.status(500).json({ success: false, error: 'Service unavailable' });
      return;
    }
    const videos = await listVideos(supabase);
    res.status(200).json({ success: true, data: videos });
  } catch (error) {
    console.error('❌ getVideosHandler error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
