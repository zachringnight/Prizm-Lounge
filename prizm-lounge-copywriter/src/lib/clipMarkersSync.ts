import { supabase, isSupabaseConfigured, dbToAppMarker, appToDbMarker, DbClipMarker } from './supabase';
import { ClipMarker } from '@/types';
import { RealtimeChannel } from '@supabase/supabase-js';

// Callback type for real-time updates
type OnMarkersUpdate = (markers: ClipMarker[]) => void;

let realtimeChannel: RealtimeChannel | null = null;
let updateCallback: OnMarkersUpdate | null = null;

// Fetch all clip markers from Supabase
export async function fetchClipMarkers(): Promise<ClipMarker[]> {
  if (!isSupabaseConfigured || !supabase) {
    console.log('Supabase not configured, using local storage only');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('clip_markers')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching clip markers:', error);
      return [];
    }

    return (data as DbClipMarker[]).map(dbToAppMarker);
  } catch (err) {
    console.error('Failed to fetch clip markers:', err);
    return [];
  }
}

// Add a new clip marker to Supabase
export async function addClipMarkerToDb(marker: ClipMarker): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false;
  }

  try {
    const dbMarker = appToDbMarker(marker);
    const { error } = await supabase
      .from('clip_markers')
      .insert([dbMarker]);

    if (error) {
      console.error('Error adding clip marker:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to add clip marker:', err);
    return false;
  }
}

// Delete a clip marker from Supabase
export async function deleteClipMarkerFromDb(markerId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('clip_markers')
      .delete()
      .eq('id', markerId);

    if (error) {
      console.error('Error deleting clip marker:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to delete clip marker:', err);
    return false;
  }
}

// Update a clip marker note in Supabase
export async function updateClipMarkerNoteInDb(markerId: string, note: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('clip_markers')
      .update({ note })
      .eq('id', markerId);

    if (error) {
      console.error('Error updating clip marker note:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to update clip marker note:', err);
    return false;
  }
}

// Clear all clip markers from Supabase
export async function clearAllClipMarkersFromDb(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('clip_markers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) {
      console.error('Error clearing clip markers:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to clear clip markers:', err);
    return false;
  }
}

// Subscribe to real-time updates
export function subscribeToClipMarkers(onUpdate: OnMarkersUpdate): () => void {
  if (!isSupabaseConfigured || !supabase) {
    console.log('Supabase not configured, real-time sync disabled');
    return () => {};
  }

  updateCallback = onUpdate;

  // Create the channel for real-time updates
  realtimeChannel = supabase
    .channel('clip_markers_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'clip_markers'
      },
      async () => {
        // When any change occurs, refetch all markers
        // This ensures consistency and handles all event types
        const markers = await fetchClipMarkers();
        if (updateCallback) {
          updateCallback(markers);
        }
      }
    )
    .subscribe((status) => {
      console.log('Realtime subscription status:', status);
    });

  // Return unsubscribe function
  return () => {
    if (realtimeChannel) {
      supabase?.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
    updateCallback = null;
  };
}

// Check if Supabase is available
export function isCloudSyncEnabled(): boolean {
  return isSupabaseConfigured;
}
