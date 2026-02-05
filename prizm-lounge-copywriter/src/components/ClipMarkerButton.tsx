'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store';
import { Station, formatClipTimestamp } from '@/types';

interface ClipMarkerButtonProps {
  station: Station;
  playerId: string | null;
  playerName: string | null;
  onMarked?: (markerId: string) => void;
}

export default function ClipMarkerButton({
  station,
  playerId,
  playerName,
  onMarked
}: ClipMarkerButtonProps) {
  const { addClipMarker } = useAppStore();
  const [isPressed, setIsPressed] = useState(false);
  const [lastMarkedTime, setLastMarkedTime] = useState<string | null>(null);

  const handleMarkClip = useCallback(() => {
    const markerId = addClipMarker(station, playerId, playerName);
    const timestamp = formatClipTimestamp(Date.now());
    setLastMarkedTime(timestamp);
    setIsPressed(true);

    // Visual feedback - reset after animation
    setTimeout(() => setIsPressed(false), 300);

    // Clear the "last marked" display after 5 seconds
    setTimeout(() => setLastMarkedTime(null), 5000);

    if (onMarked) {
      onMarked(markerId);
    }
  }, [station, playerId, playerName, addClipMarker, onMarked]);

  return (
    <div className="clip-marker-container">
      <button
        onClick={handleMarkClip}
        className={`clip-marker-btn ${isPressed ? 'pressed' : ''}`}
        aria-label="Mark clip"
      >
        <span className="clip-marker-icon">🎬</span>
        <span className="clip-marker-text">MARK CLIP</span>
      </button>
      {lastMarkedTime && (
        <div className="clip-marker-feedback">
          Marked at {lastMarkedTime}
          {playerName && <span> - {playerName}</span>}
        </div>
      )}
    </div>
  );
}
