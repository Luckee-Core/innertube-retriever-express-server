import type { CaptionTrack } from './types';

type RawCaptionTrack = {
  baseUrl?: string;
  languageCode?: string;
  name?: { runs?: Array<{ text?: string }> };
  kind?: string;
};

/**
 * Maps InnerTube `player` JSON caption tracks into a flat list.
 */
export const extractCaptionTracksFromPlayer = (playerJson: unknown): CaptionTrack[] => {
  if (!playerJson || typeof playerJson !== 'object') {
    return [];
  }
  const root = playerJson as Record<string, unknown>;
  const captions = root.captions as Record<string, unknown> | undefined;
  const renderer = captions?.playerCaptionsTracklistRenderer as Record<string, unknown> | undefined;
  const rawTracks = renderer?.captionTracks;
  if (!Array.isArray(rawTracks)) {
    return [];
  }

  const out: CaptionTrack[] = [];
  for (const t of rawTracks as RawCaptionTrack[]) {
    if (!t?.baseUrl || !t.languageCode) {
      continue;
    }
    const label = t.name?.runs?.[0]?.text?.trim() || t.languageCode;
    out.push({
      baseUrl: t.baseUrl,
      languageCode: t.languageCode,
      languageLabel: label,
      isGenerated: t.kind === 'asr',
    });
  }
  return out;
};
