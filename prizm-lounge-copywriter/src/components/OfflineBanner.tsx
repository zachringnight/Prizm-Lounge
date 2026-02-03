'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useAppStore } from '@/store';
import { WifiOffIcon } from './Icons';

// Use useSyncExternalStore for hydration-safe client-side only state
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function OfflineBanner() {
  const { isOffline, setIsOffline } = useAppStore();
  const isMounted = useIsMounted();
  const initializedRef = useRef(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Check initial state only once
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (typeof navigator !== 'undefined') {
        setIsOffline(!navigator.onLine);
      }
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOffline]);

  if (!isMounted || !isOffline) return null;

  return (
    <div className="offline-banner flex items-center justify-center gap-2">
      <WifiOffIcon size={16} />
      <span>Offline Mode - Limited functionality</span>
    </div>
  );
}
