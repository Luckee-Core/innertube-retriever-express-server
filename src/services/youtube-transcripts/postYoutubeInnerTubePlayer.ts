import { cookieJarToHeader, type CookieJar } from './mergeSetCookieHeader';
import { YoutubeTranscriptFetchError } from './types';

const INNERTUBE_API_URL = 'https://www.youtube.com/youtubei/v1/player?key={apiKey}';

const INNERTUBE_CONTEXT = {
  client: {
    clientName: 'ANDROID',
    clientVersion: '20.10.38',
  },
};

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'User-Agent':
    'com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip',
  Origin: 'https://www.youtube.com',
};

/**
 * POSTs InnerTube `player` for the given video id (same pattern as youtube-transcript-api).
 */
export const postYoutubeInnerTubePlayer = async (
  apiKey: string,
  videoId: string,
  jar: CookieJar,
  signal: AbortSignal
): Promise<unknown> => {
  const url = INNERTUBE_API_URL.replace('{apiKey}', encodeURIComponent(apiKey));
  const headers: Record<string, string> = { ...DEFAULT_HEADERS };
  const cookie = cookieJarToHeader(jar);
  if (cookie) {
    headers.Cookie = cookie;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      context: INNERTUBE_CONTEXT,
      videoId,
    }),
    signal,
  });

  if (res.status === 429) {
    throw new YoutubeTranscriptFetchError('PLAYER_REQUEST_FAILED', 'YouTube rate limited the player request');
  }

  if (!res.ok) {
    throw new YoutubeTranscriptFetchError(
      'PLAYER_REQUEST_FAILED',
      `InnerTube player request failed: ${res.status}`
    );
  }

  try {
    return (await res.json()) as unknown;
  } catch {
    throw new YoutubeTranscriptFetchError('PLAYER_REQUEST_FAILED', 'InnerTube player response was not JSON');
  }
};
