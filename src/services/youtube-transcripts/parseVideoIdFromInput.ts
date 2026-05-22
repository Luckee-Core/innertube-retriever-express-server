const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
]);

const VIDEO_ID_REGEX = /^[\w-]{11}$/;

/**
 * Parses an 11-character YouTube video id from a URL or returns the id if already bare.
 */
export const parseVideoIdFromInput = (input: { youtubeUrl?: string; videoId?: string }): string => {
  const rawId = typeof input.videoId === 'string' ? input.videoId.trim() : '';
  if (rawId) {
    if (!VIDEO_ID_REGEX.test(rawId)) {
      throw new Error('Invalid videoId: expected 11-character YouTube id');
    }
    return rawId;
  }

  const urlRaw = typeof input.youtubeUrl === 'string' ? input.youtubeUrl.trim() : '';
  if (!urlRaw) {
    throw new Error('Either youtubeUrl or videoId is required');
  }

  let parsed: URL;
  try {
    parsed = new URL(urlRaw);
  } catch {
    throw new Error('Invalid youtubeUrl');
  }

  const host = parsed.hostname.replace(/^www\./, '');
  if (!YOUTUBE_HOSTS.has(parsed.hostname) && !YOUTUBE_HOSTS.has(host)) {
    throw new Error('URL must be a youtube.com or youtu.be link');
  }

  if (parsed.hostname === 'youtu.be' || host === 'youtu.be') {
    const id = parsed.pathname.replace(/^\//, '').split('/')[0] ?? '';
    if (!VIDEO_ID_REGEX.test(id)) {
      throw new Error('Could not parse video id from youtu.be URL');
    }
    return id;
  }

  const v = parsed.searchParams.get('v');
  if (v && VIDEO_ID_REGEX.test(v)) {
    return v;
  }

  const pathParts = parsed.pathname.split('/').filter(Boolean);
  const shortsIdx = pathParts.indexOf('shorts');
  if (shortsIdx >= 0 && pathParts[shortsIdx + 1] && VIDEO_ID_REGEX.test(pathParts[shortsIdx + 1])) {
    return pathParts[shortsIdx + 1];
  }

  const embedIdx = pathParts.indexOf('embed');
  if (embedIdx >= 0 && pathParts[embedIdx + 1] && VIDEO_ID_REGEX.test(pathParts[embedIdx + 1])) {
    return pathParts[embedIdx + 1];
  }

  throw new Error('Could not parse video id from URL');
};
