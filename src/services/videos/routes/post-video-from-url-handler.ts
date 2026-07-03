import type { Request, Response } from 'express';
import { getManagedSupabaseClient } from '../../managed';
import {
  createVideo,
  getVideoById,
  getVideoByVideoId,
  updateVideo,
} from '../../../data/videos';
import {
  getTranscriptFromYoutube,
  parseVideoIdFromInput,
  YoutubeTranscriptFetchError,
  type YoutubeTranscriptFetchErrorCode,
} from '../../../services/youtube-transcripts';

const transcriptErrorStatus = (code: YoutubeTranscriptFetchErrorCode): number => {
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

/**
 * POST /videos/from-url — dedupe by video_id, fetch transcript via InnerTube, persist.
 */
export const postVideoFromUrlHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const supabase = getManagedSupabaseClient();
    if (!supabase) {
      res.status(500).json({ success: false, error: 'Service unavailable' });
      return;
    }

    const body = req.body ?? {};
    const youtubeUrl = typeof body.youtubeUrl === 'string' ? body.youtubeUrl.trim() : '';
    const videoIdRaw = typeof body.videoId === 'string' ? body.videoId.trim() : '';
    const languages = Array.isArray(body.languages)
      ? body.languages.filter((x: unknown): x is string => typeof x === 'string')
      : undefined;
    const timeoutMs =
      typeof body.timeoutMs === 'number' && Number.isFinite(body.timeoutMs) && body.timeoutMs > 0
        ? Math.min(Math.floor(body.timeoutMs), 120_000)
        : 90_000;

    if (!youtubeUrl && !videoIdRaw) {
      res.status(400).json({ success: false, error: 'youtubeUrl or videoId is required' });
      return;
    }

    let videoId: string;
    try {
      videoId = parseVideoIdFromInput({
        youtubeUrl: youtubeUrl || undefined,
        videoId: videoIdRaw || undefined,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid input';
      res.status(400).json({ success: false, error: msg, code: 'INVALID_INPUT' });
      return;
    }

    const existing = await getVideoByVideoId(supabase, videoId);
    if (existing) {
      res.status(200).json({ success: true, data: existing, message: 'Video already exists' });
      return;
    }

    let result;
    try {
      result = await getTranscriptFromYoutube(
        { youtubeUrl: youtubeUrl || undefined, videoId },
        { languages, timeoutMs }
      );
    } catch (e) {
      if (e instanceof YoutubeTranscriptFetchError) {
        const status = transcriptErrorStatus(e.code);
        res.status(status).json({ success: false, error: e.message, code: e.code });
        return;
      }
      throw e;
    }

    const video = await createVideo(supabase, {
      video_id: result.videoId,
      video_url: result.videoUrl,
      title: result.title ?? null,
      author: result.author ?? null,
      raw_transcript: result.transcriptText,
      language_code: result.languageCode,
      language_label: result.languageLabel,
      is_generated: result.isGenerated,
      segment_count: result.segments.length,
      segments: result.segments,
      status: 'ready',
    });

    res.status(201).json({ success: true, data: video });
  } catch (error) {
    console.error('❌ postVideoFromUrlHandler error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /videos/:id/refetch-transcript — re-run InnerTube fetch and update row.
 */
export const postRefetchTranscriptHandler = async (req: Request, res: Response): Promise<void> => {
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

    const existing = await getVideoById(supabase, id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Video not found' });
      return;
    }

    const body = req.body ?? {};
    const languages = Array.isArray(body.languages)
      ? body.languages.filter((x: unknown): x is string => typeof x === 'string')
      : undefined;
    const timeoutMs =
      typeof body.timeoutMs === 'number' && Number.isFinite(body.timeoutMs) && body.timeoutMs > 0
        ? Math.min(Math.floor(body.timeoutMs), 120_000)
        : 90_000;

    let result;
    try {
      result = await getTranscriptFromYoutube(
        { videoId: existing.video_id },
        { languages, timeoutMs }
      );
    } catch (e) {
      if (e instanceof YoutubeTranscriptFetchError) {
        const status = transcriptErrorStatus(e.code);
        res.status(status).json({ success: false, error: e.message, code: e.code });
        return;
      }
      throw e;
    }

    const video = await updateVideo(supabase, id, {
      video_url: result.videoUrl,
      title: result.title ?? null,
      author: result.author ?? null,
      raw_transcript: result.transcriptText,
      language_code: result.languageCode,
      language_label: result.languageLabel,
      is_generated: result.isGenerated,
      segment_count: result.segments.length,
      segments: result.segments,
      status: 'ready',
      fetch_error_code: null,
      fetch_error_message: null,
    });

    res.status(200).json({ success: true, data: video });
  } catch (error) {
    console.error('❌ postRefetchTranscriptHandler error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
