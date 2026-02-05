-- Supabase Schema for Prizm Lounge Clip Markers
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Create enum for station types (better than CHECK constraint)
CREATE TYPE station_type AS ENUM ('LED Wall', 'Signing', 'PR Interview', 'Pack Rips', 'Free');

-- Create the clip_markers table
CREATE TABLE clip_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station station_type NOT NULL,
  player_id TEXT,
  player_name TEXT,
  timestamp BIGINT NOT NULL,  -- Unix timestamp in milliseconds (matches JS Date.now())
  note TEXT,
  marked_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_clip_markers_station ON clip_markers(station);
CREATE INDEX idx_clip_markers_player_id ON clip_markers(player_id) WHERE player_id IS NOT NULL;
CREATE INDEX idx_clip_markers_timestamp ON clip_markers(timestamp DESC);
CREATE INDEX idx_clip_markers_created_at ON clip_markers(created_at DESC);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clip_markers_updated_at
  BEFORE UPDATE ON clip_markers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE clip_markers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (no auth required for this event tool)
-- For production with auth, replace with user-specific policies
CREATE POLICY "Allow all operations on clip_markers" ON clip_markers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE clip_markers;

-- Grant permissions to anonymous and authenticated users
GRANT ALL ON clip_markers TO anon;
GRANT ALL ON clip_markers TO authenticated;

-- Grant usage on the enum type
GRANT USAGE ON TYPE station_type TO anon;
GRANT USAGE ON TYPE station_type TO authenticated;
