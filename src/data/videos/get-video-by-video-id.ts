import type { SupabaseClient } from '@supabase/supabase-js';
import type { VideoRecord } from './types';

/**
 * Fetches a video by YouTube video id (11-char).
 */
export const getVideoByVideoId = async (
  supabaseClient: SupabaseClient,
  videoId: string
): Promise<VideoRecord | null> => {
  const { data, error } = await supabaseClient
    .from('videos')
    .select('*')
    .eq('video_id', videoId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch video by video_id: ${error.message}`);
  }

  return (data as VideoRecord | null) ?? null;
};
