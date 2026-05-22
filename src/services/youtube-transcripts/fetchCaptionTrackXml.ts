import { cookieJarToHeader, type CookieJar } from './mergeSetCookieHeader';
import { normalizeCaptionBaseUrl } from './normalizeCaptionBaseUrl';
import { YoutubeTranscriptFetchError } from './types';

const DEFAULT_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

/**
 * Downloads caption document XML for a caption track baseUrl.
 */
export const fetchCaptionTrackXml = async (
  baseUrl: string,
  jar: CookieJar,
  signal: AbortSignal
): Promise<string> => {
  const normalized = normalizeCaptionBaseUrl(baseUrl);
  if (normalized.includes('&exp=xpe')) {
    throw new YoutubeTranscriptFetchError(
      'CAPTION_URL_BLOCKED',
      'This video requires a PO token for captions; cannot fetch transcript with this client.'
    );
  }

  const headers: Record<string, string> = { ...DEFAULT_HEADERS };
  const cookie = cookieJarToHeader(jar);
  if (cookie) {
    headers.Cookie = cookie;
  }

  const res = await fetch(normalized, { method: 'GET', headers, signal });
  if (!res.ok) {
    throw new YoutubeTranscriptFetchError(
      'CAPTION_FETCH_FAILED',
      `Caption download failed: ${res.status}`
    );
  }
  return res.text();
};
