import type { CaptionTrack } from './types';

/**
 * Picks a caption track: manual over auto-generated, honoring language preference order.
 */
export const selectPreferredCaptionTrack = (
  tracks: CaptionTrack[],
  languagePreferences: string[]
): CaptionTrack | null => {
  if (tracks.length === 0) {
    return null;
  }

  for (const lang of languagePreferences) {
    const manual = tracks.find((t) => t.languageCode === lang && !t.isGenerated);
    if (manual) {
      return manual;
    }
    const generated = tracks.find((t) => t.languageCode === lang && t.isGenerated);
    if (generated) {
      return generated;
    }
  }

  const anyManual = tracks.find((t) => !t.isGenerated);
  if (anyManual) {
    return anyManual;
  }

  return tracks[0] ?? null;
};
