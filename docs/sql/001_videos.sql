CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL UNIQUE,
  video_url TEXT NOT NULL,
  title TEXT,
  author TEXT,
  raw_transcript TEXT,
  language_code TEXT,
  language_label TEXT,
  is_generated BOOLEAN NOT NULL DEFAULT false,
  segment_count INTEGER NOT NULL DEFAULT 0,
  segments JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'ready'
    CHECK (status IN ('ready', 'fetch_failed')),
  fetch_error_code TEXT,
  fetch_error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videos_video_id ON videos(video_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

COMMENT ON TABLE videos IS 'YouTube videos with InnerTube-fetched transcripts';
