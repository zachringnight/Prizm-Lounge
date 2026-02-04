'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';

/**
 * ClipMarkersSync Component
 *
 * This component handles:
 * 1. Initial load of clip markers from Supabase
 * 2. Real-time subscription for updates from other users
 *
 * Mount this component once at the app level (e.g., in AppWrapper)
 */
export default function ClipMarkersSync() {
  const { initializeClipMarkers, setClipMarkers } = useAppStore();

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function initialize() {
      // Initialize clip markers from Supabase (or just mark as loaded if not configured)
      await initializeClipMarkers();

      // Set up real-time subscription
      try {
        const { subscribeToClipMarkers, isCloudSyncEnabled } = await import('@/lib/clipMarkersSync');

        if (isCloudSyncEnabled()) {
          unsubscribe = subscribeToClipMarkers((markers) => {
            setClipMarkers(markers);
          });
          console.log('Clip markers cloud sync enabled');
        } else {
          console.log('Clip markers using local storage only (Supabase not configured)');
        }
      } catch (err) {
        console.error('Failed to set up clip markers sync:', err);
      }
    }

    initialize();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initializeClipMarkers, setClipMarkers]);

  // This component doesn't render anything
  return null;
}
