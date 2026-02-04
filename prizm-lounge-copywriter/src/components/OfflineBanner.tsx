'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useAppStore } from '@/store';
import { WifiOffIcon } from './Icons';

// Subscribe to online/offline events
function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true; // Assume online during SSR
}

export default function OfflineBanner() {
  const { setIsOffline } = useAppStore();
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isOffline = !isOnline;
  const hasInitialized = useRef(false);

  // Sync with store only when value changes (not on initial render)
  useEffect(() => {
    if (hasInitialized.current) {
      setIsOffline(isOffline);
    }
    hasInitialized.current = true;
  }, [isOffline, setIsOffline]);

  if (!isOffline) return null;

  return (
    <div className="offline-banner flex items-center justify-center gap-2">
      <WifiOffIcon size={16} />
      <span>Offline Mode - Limited functionality</span>
    </div>
  );
}
