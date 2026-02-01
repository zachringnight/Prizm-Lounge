'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { WifiOffIcon } from './Icons';

export default function OfflineBanner() {
  const { isOffline, setIsOffline } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Check initial state
    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOffline]);

  if (!mounted || !isOffline) return null;

  return (
    <div className="offline-banner flex items-center justify-center gap-2">
      <WifiOffIcon size={16} />
      <span>Offline Mode - Limited functionality</span>
    </div>
  );
}
