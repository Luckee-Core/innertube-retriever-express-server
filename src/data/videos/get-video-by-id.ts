import type { SupabaseClient } from '@supabase/supabase-js';
import type { VideoRecord } from './types';

/**
 * Fetches a single video by UUID.
 */
export const getVideoById = async (
  supabaseClient: SupabaseClient,
  id: string
): Promise<VideoRecord | null> => {
  const { data, error } = await supabaseClient.from('videos').select('*').eq('id', id).maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch video: ${error.message}`);
  }

  return (data as VideoRecord | null) ?? null;
};
