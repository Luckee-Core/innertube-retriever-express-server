import type { SupabaseClient } from '@supabase/supabase-js';
import type { UpdateVideoParams, VideoRecord } from './types';

/**
 * Updates an existing video row by UUID.
 */
export const updateVideo = async (
  supabaseClient: SupabaseClient,
  id: string,
  params: UpdateVideoParams
): Promise<VideoRecord> => {
  const now = new Date().toISOString();
  const { data, error } = await supabaseClient
    .from('videos')
    .update({
      ...params,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update video: ${error.message}`);
  }

  return data as VideoRecord;
};
