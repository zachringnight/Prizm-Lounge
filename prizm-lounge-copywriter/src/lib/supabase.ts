import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Create a project at https://supabase.com and add these env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create client (will be null if not configured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;

// Database types for clip markers
export interface DbClipMarker {
  id: string;
  station: string;
  player_id: string | null;
  player_name: string | null;
  timestamp: number; // Unix timestamp in milliseconds (BIGINT in DB)
  note: string | null;
  marked_by: string | null;
  created_at: string;
  updated_at: string;
}

// Convert DB format to app format
export function dbToAppMarker(db: DbClipMarker) {
  return {
    id: db.id,
    station: db.station as 'LED Wall' | 'Signing' | 'PR Interview' | 'Pack Rips' | 'Free',
    playerId: db.player_id,
    playerName: db.player_name,
    timestamp: db.timestamp,
    note: db.note || undefined,
    markedBy: db.marked_by || undefined
  };
}

// Convert app format to DB format
export function appToDbMarker(marker: {
  id: string;
  station: string;
  playerId: string | null;
  playerName: string | null;
  timestamp: number;
  note?: string;
  markedBy?: string;
}): Omit<DbClipMarker, 'created_at' | 'updated_at'> {
  return {
    id: marker.id,
    station: marker.station,
    player_id: marker.playerId,
    player_name: marker.playerName,
    timestamp: marker.timestamp,
    note: marker.note || null,
    marked_by: marker.markedBy || null
  };
}
