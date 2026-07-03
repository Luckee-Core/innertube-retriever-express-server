import type { Request, Response } from 'express';
import { getManagedSupabaseClient } from '../../managed';
import { getVideoById } from '../../../data/videos';

/** GET /videos/:id */
export const getVideoByIdHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getManagedSupabaseClient();
    if (!supabase) {
      res.status(500).json({ success: false, error: 'Service unavailable' });
      return;
    }
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!id) {
      res.status(400).json({ success: false, error: 'Video id is required' });
      return;
    }
    const video = await getVideoById(supabase, id);
    if (!video) {
      res.status(404).json({ success: false, error: 'Video not found' });
      return;
    }
    res.status(200).json({ success: true, data: video });
  } catch (error) {
    console.error('❌ getVideoByIdHandler error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
