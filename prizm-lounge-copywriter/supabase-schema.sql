-- Supabase Schema for Prizm Lounge Clip Markers
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Create the clip_markers table
CREATE TABLE IF NOT EXISTS clip_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station TEXT NOT NULL CHECK (station IN ('LED Wall', 'Signing', 'PR Interview', 'Pack Rips', 'Free')),
  player_id TEXT,
  player_name TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note TEXT,
  marked_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_clip_markers_station ON clip_markers(station);
CREATE INDEX IF NOT EXISTS idx_clip_markers_player_id ON clip_markers(player_id);
CREATE INDEX IF NOT EXISTS idx_clip_markers_timestamp ON clip_markers(timestamp DESC);

-- Enable Row Level Security (but allow all operations for this app)
ALTER TABLE clip_markers ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations (no auth required for this event tool)
-- For production, you may want to add authentication
CREATE POLICY "Allow all operations on clip_markers" ON clip_markers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable real-time subscriptions for this table
ALTER PUBLICATION supabase_realtime ADD TABLE clip_markers;

-- Grant permissions
GRANT ALL ON clip_markers TO anon;
GRANT ALL ON clip_markers TO authenticated;
