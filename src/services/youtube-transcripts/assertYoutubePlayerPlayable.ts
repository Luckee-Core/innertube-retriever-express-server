import { YoutubeTranscriptFetchError } from './types';

type PlayabilityStatus = {
  status?: string;
  reason?: string;
};

/**
 * Throws typed errors when the InnerTube player response is not playable.
 */
export const assertYoutubePlayerPlayable = (
  playability: PlayabilityStatus | undefined,
  videoId: string
): void => {
  const status = playability?.status;
  if (status === 'OK' || status === undefined) {
    return;
  }

  const reason = playability?.reason ?? '';

  if (status === 'LOGIN_REQUIRED') {
    if (reason.includes('inappropriate')) {
      throw new YoutubeTranscriptFetchError('AGE_RESTRICTED', `Video is age-restricted: ${videoId}`);
    }
    if (reason.includes('not a bot') || reason.includes('Sign in')) {
      throw new YoutubeTranscriptFetchError(
        'PLAYBACK_BLOCKED',
        'YouTube blocked this request (bot check). Retry later or use a different network.'
      );
    }
  }

  if (status === 'ERROR' && reason.includes('unavailable')) {
    throw new YoutubeTranscriptFetchError('VIDEO_UNAVAILABLE', `Video unavailable: ${videoId}`);
  }

  throw new YoutubeTranscriptFetchError(
    'PLAYBACK_BLOCKED',
    `Video not playable (${status}): ${reason || 'unknown reason'}`
  );
};
