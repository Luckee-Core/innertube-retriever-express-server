import { assertYoutubePlayerPlayable } from './assertYoutubePlayerPlayable';
import { extractCaptionTracksFromPlayer } from './extractCaptionTracksFromPlayer';
import { extractInnertubeApiKeyFromHtml } from './extractInnertubeApiKeyFromHtml';
import { extractVideoDetailsFromPlayer } from './extractVideoDetailsFromPlayer';
import { fetchCaptionTrackXml } from './fetchCaptionTrackXml';
import { fetchYoutubeWatchHtml } from './fetchYoutubeWatchHtml';
import type { CookieJar } from './mergeSetCookieHeader';
import { parseCaptionXmlToSegments } from './parseCaptionXmlToSegments';
import { parseVideoIdFromInput } from './parseVideoIdFromInput';
import { postYoutubeInnerTubePlayer } from './postYoutubeInnerTubePlayer';
import { selectPreferredCaptionTrack } from './selectPreferredCaptionTrack';
import type { GetTranscriptFromYoutubeOptions, GetTranscriptFromYoutubeResult } from './types';
import { YoutubeTranscriptFetchError } from './types';

const DEFAULT_LANGUAGES = ['en'];

const createTimeoutSignal = (ms: number): { signal: AbortSignal; cancel: () => void } => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    cancel: () => clearTimeout(id),
  };
};

/**
 * Fetches a public YouTube transcript via InnerTube + caption track URLs (no n8n / Apify).
 */
export const getTranscriptFromYoutube = async (
  input: { youtubeUrl?: string; videoId?: string },
  options?: GetTranscriptFromYoutubeOptions
): Promise<GetTranscriptFromYoutubeResult> => {
  const timeoutMs = options?.timeoutMs ?? 15000;
  const languages = options?.languages?.length ? options.languages : DEFAULT_LANGUAGES;

  let videoId: string;
  try {
    videoId = parseVideoIdFromInput(input);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid input';
    throw new YoutubeTranscriptFetchError('INVALID_INPUT', msg);
  }

  const { signal, cancel } = createTimeoutSignal(timeoutMs);
  const jar: CookieJar = {};

  try {
    const html = await fetchYoutubeWatchHtml(videoId, jar, signal);
    const apiKey = extractInnertubeApiKeyFromHtml(html);
    if (!apiKey) {
      if (html.includes('class="g-recaptcha"')) {
        throw new YoutubeTranscriptFetchError(
          'PLAYBACK_BLOCKED',
          'YouTube served a challenge page instead of the watch HTML'
        );
      }
      throw new YoutubeTranscriptFetchError(
        'INNERTUBE_KEY_MISSING',
        'Could not extract INNERTUBE_API_KEY from watch page'
      );
    }

    const playerJson = await postYoutubeInnerTubePlayer(apiKey, videoId, jar, signal);
    const playability = (playerJson as { playabilityStatus?: { status?: string; reason?: string } })
      ?.playabilityStatus;
    assertYoutubePlayerPlayable(playability, videoId);

    const tracks = extractCaptionTracksFromPlayer(playerJson);
    if (tracks.length === 0) {
      throw new YoutubeTranscriptFetchError('TRANSCRIPTS_DISABLED', 'No captions available for this video');
    }

    const selected = selectPreferredCaptionTrack(tracks, languages);
    if (!selected) {
      throw new YoutubeTranscriptFetchError(
        'NO_MATCHING_LANGUAGE',
        `No caption track for languages: ${languages.join(', ')}`
      );
    }

    const xml = await fetchCaptionTrackXml(selected.baseUrl, jar, signal);
    const segments = parseCaptionXmlToSegments(xml);
    if (segments.length === 0) {
      throw new YoutubeTranscriptFetchError('CAPTION_PARSE_FAILED', 'Caption document contained no segments');
    }

    const transcriptText = segments.map((s) => s.text).join(' ');
    const details = extractVideoDetailsFromPlayer(playerJson);
    const videoUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;

    return {
      videoId,
      languageCode: selected.languageCode,
      languageLabel: selected.languageLabel,
      isGenerated: selected.isGenerated,
      segments,
      transcriptText,
      title: details.title,
      author: details.author,
      videoUrl,
    };
  } catch (e) {
    if (e instanceof YoutubeTranscriptFetchError) {
      throw e;
    }
    if (e instanceof Error && e.name === 'AbortError') {
      throw new YoutubeTranscriptFetchError('PLAYER_REQUEST_FAILED', `Request timed out after ${timeoutMs}ms`);
    }
    throw e;
  } finally {
    cancel();
  }
};
