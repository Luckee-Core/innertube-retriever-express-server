export type YoutubeTranscriptSegment = {
  text: string;
  start: number;
  duration: number;
};

export type GetTranscriptFromYoutubeOptions = {
  languages?: string[];
  timeoutMs?: number;
};

export type GetTranscriptFromYoutubeResult = {
  videoId: string;
  languageCode: string;
  languageLabel: string;
  isGenerated: boolean;
  segments: YoutubeTranscriptSegment[];
  transcriptText: string;
  title?: string;
  author?: string;
  videoUrl: string;
};

export type CaptionTrack = {
  baseUrl: string;
  languageCode: string;
  languageLabel: string;
  isGenerated: boolean;
};

export type YoutubeTranscriptFetchErrorCode =
  | 'INVALID_INPUT'
  | 'INNERTUBE_KEY_MISSING'
  | 'PLAYER_REQUEST_FAILED'
  | 'VIDEO_UNAVAILABLE'
  | 'AGE_RESTRICTED'
  | 'PLAYBACK_BLOCKED'
  | 'TRANSCRIPTS_DISABLED'
  | 'NO_MATCHING_LANGUAGE'
  | 'CAPTION_URL_BLOCKED'
  | 'CAPTION_FETCH_FAILED'
  | 'CAPTION_PARSE_FAILED';

export class YoutubeTranscriptFetchError extends Error {
  readonly code: YoutubeTranscriptFetchErrorCode;

  constructor(code: YoutubeTranscriptFetchErrorCode, message: string) {
    super(message);
    this.name = 'YoutubeTranscriptFetchError';
    this.code = code;
  }
}
