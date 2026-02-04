'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';
import ErrorBoundary from './ErrorBoundary';

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const { largeTextMode } = useAppStore();

  // Apply large text mode class to body
  useEffect(() => {
    if (largeTextMode) {
      document.body.classList.add('large-text-mode');
    } else {
      document.body.classList.remove('large-text-mode');
    }
  }, [largeTextMode]);

  return <ErrorBoundary>{children}</ErrorBoundary>;
}
