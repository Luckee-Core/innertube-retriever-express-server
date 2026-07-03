import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateVideoParams, VideoRecord } from './types';

/**
 * Inserts a new video row.
 */
export const createVideo = async (
  supabaseClient: SupabaseClient,
  params: CreateVideoParams
): Promise<VideoRecord> => {
  const now = new Date().toISOString();
  const { data, error } = await supabaseClient
    .from('videos')
    .insert({
      video_id: params.video_id,
      video_url: params.video_url,
      title: params.title ?? null,
      author: params.author ?? null,
      raw_transcript: params.raw_transcript ?? null,
      language_code: params.language_code ?? null,
      language_label: params.language_label ?? null,
      is_generated: params.is_generated ?? false,
      segment_count: params.segment_count ?? 0,
      segments: params.segments ?? [],
      status: params.status ?? 'ready',
      fetch_error_code: params.fetch_error_code ?? null,
      fetch_error_message: params.fetch_error_message ?? null,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create video: ${error.message}`);
  }

  return data as VideoRecord;
};
