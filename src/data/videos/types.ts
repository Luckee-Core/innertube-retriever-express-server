export type VideoStatus = 'ready' | 'fetch_failed';

export type VideoSegment = {
  text: string;
  start: number;
  duration: number;
};

export type VideoRecord = {
  id: string;
  video_id: string;
  video_url: string;
  title: string | null;
  author: string | null;
  raw_transcript: string | null;
  language_code: string | null;
  language_label: string | null;
  is_generated: boolean;
  segment_count: number;
  segments: VideoSegment[];
  status: VideoStatus;
  fetch_error_code: string | null;
  fetch_error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateVideoParams = {
  video_id: string;
  video_url: string;
  title?: string | null;
  author?: string | null;
  raw_transcript?: string | null;
  language_code?: string | null;
  language_label?: string | null;
  is_generated?: boolean;
  segment_count?: number;
  segments?: VideoSegment[];
  status?: VideoStatus;
  fetch_error_code?: string | null;
  fetch_error_message?: string | null;
};

export type UpdateVideoParams = Partial<CreateVideoParams>;
