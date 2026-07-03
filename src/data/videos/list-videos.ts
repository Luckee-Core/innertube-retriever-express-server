import type { SupabaseClient } from '@supabase/supabase-js';
import type { VideoRecord } from './types';

/**
 * Lists all videos, newest first.
 */
export const listVideos = async (supabaseClient: SupabaseClient): Promise<VideoRecord[]> => {
  const { data, error } = await supabaseClient
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list videos: ${error.message}`);
  }

  return (data ?? []) as VideoRecord[];
};
