import { buildConsentCookieValue } from './buildConsentCookieValue';
import { cookieJarToHeader, mergeSetCookieHeader, type CookieJar } from './mergeSetCookieHeader';
import { YoutubeTranscriptFetchError } from './types';

const WATCH_URL = 'https://www.youtube.com/watch?v={videoId}';

const DEFAULT_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

/**
 * Fetches the watch page HTML, handling the EU consent interstitial when present.
 */
export const fetchYoutubeWatchHtml = async (
  videoId: string,
  jar: CookieJar,
  signal: AbortSignal
): Promise<string> => {
  const url = WATCH_URL.replace('{videoId}', encodeURIComponent(videoId));

  const doGet = async (): Promise<string> => {
    const headers: Record<string, string> = { ...DEFAULT_HEADERS };
    const cookie = cookieJarToHeader(jar);
    if (cookie) {
      headers.Cookie = cookie;
    }
    const res = await fetch(url, { method: 'GET', headers, signal });
    mergeSetCookieHeader(jar, res.headers.get('set-cookie'));
    if (!res.ok) {
      throw new YoutubeTranscriptFetchError(
        'PLAYER_REQUEST_FAILED',
        `Watch page request failed: ${res.status}`
      );
    }
    return res.text();
  };

  let html = await doGet();

  if (html.includes('action="https://consent.youtube.com/s"')) {
    const consentValue = buildConsentCookieValue(html);
    if (!consentValue) {
      throw new YoutubeTranscriptFetchError(
        'PLAYER_REQUEST_FAILED',
        'Could not parse YouTube consent form'
      );
    }
    jar.CONSENT = consentValue;
    html = await doGet();
    if (html.includes('action="https://consent.youtube.com/s"')) {
      throw new YoutubeTranscriptFetchError('PLAYER_REQUEST_FAILED', 'YouTube consent could not be satisfied');
    }
  }

  return html;
};
