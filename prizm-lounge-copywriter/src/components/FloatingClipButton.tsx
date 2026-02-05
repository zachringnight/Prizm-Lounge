'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { Station, STATIONS, formatClipTimestamp, STATION_ICONS } from '@/types';

const STATION_COLORS: Record<Station, string> = {
  'LED Wall': '#3B82F6',
  'Signing': '#22C55E',
  'PR Interview': '#8B5CF6',
  'Pack Rips': '#F59E0B',
  'Kid Reporter': '#EC4899',
  'Custom Gifting': '#F97316',
  'Free': '#6B7280'
};

export default function FloatingClipButton() {
  const router = useRouter();
  const {
    stations,
    players,
    clipMarkers,
    addClipMarker
  } = useAppStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [justMarked, setJustMarked] = useState(false);
  const [lastMarkedInfo, setLastMarkedInfo] = useState<{station: Station; playerName: string | null; time: string} | null>(null);

  const totalMarkers = clipMarkers.length;

  // Close expanded menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.floating-clip-container')) {
        setIsExpanded(false);
        setShowQuickAdd(false);
        setSelectedStation(null);
      }
    };

    if (isExpanded || showQuickAdd) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isExpanded, showQuickAdd]);

  // Get active stations with players
  const activeStations = stations.filter(s => s.status === 'active' && s.currentPlayer);

  // Quick mark for a specific station
  const handleQuickMark = useCallback((station: Station) => {
    const stationStatus = stations.find(s => s.station === station);
    const player = stationStatus?.currentPlayer
      ? players.find(p => p.id === stationStatus.currentPlayer)
      : null;

    addClipMarker(station, player?.id || null, player?.name || null);

    const timestamp = formatClipTimestamp(Date.now());
    setLastMarkedInfo({
      station,
      playerName: player?.name || null,
      time: timestamp
    });

    setJustMarked(true);
    setShowQuickAdd(false);
    setIsExpanded(false);

    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }

    // Reset visual feedback after animation
    setTimeout(() => setJustMarked(false), 500);
    setTimeout(() => setLastMarkedInfo(null), 3000);
  }, [stations, players, addClipMarker]);

  // Handle main button click - if there are active stations, show quick add, otherwise go to clips page
  const handleMainClick = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false);
      setShowQuickAdd(false);
      return;
    }
    setIsExpanded(true);
  }, [isExpanded]);

  // Navigate to clip markers page
  const goToClips = useCallback(() => {
    router.push('/clip-markers');
    setIsExpanded(false);
  }, [router]);

  return (
    <div className="floating-clip-container">
      {/* Feedback toast */}
      {lastMarkedInfo && (
        <div className="floating-clip-toast">
          <span className="floating-clip-toast-icon">✓</span>
          <div className="floating-clip-toast-content">
            <span className="floating-clip-toast-time">{lastMarkedInfo.time}</span>
            <span className="floating-clip-toast-details">
              {STATION_ICONS[lastMarkedInfo.station]} {lastMarkedInfo.station}
              {lastMarkedInfo.playerName && ` - ${lastMarkedInfo.playerName}`}
            </span>
          </div>
        </div>
      )}

      {/* Expanded Menu */}
      {isExpanded && (
        <div className="floating-clip-menu">
          {/* Quick Mark Stations */}
          <div className="floating-clip-menu-section">
            <div className="floating-clip-menu-label">Quick Mark</div>
            <div className="floating-clip-station-grid">
              {STATIONS.filter(s => s !== 'Free').map(station => {
                const stationStatus = stations.find(s => s.station === station);
                const player = stationStatus?.currentPlayer
                  ? players.find(p => p.id === stationStatus.currentPlayer)
                  : null;
                const isActive = stationStatus?.status === 'active';

                return (
                  <button
                    key={station}
                    onClick={() => handleQuickMark(station)}
                    className={`floating-clip-station-btn ${isActive ? 'active' : ''}`}
                    style={{
                      '--station-color': STATION_COLORS[station],
                      borderColor: isActive ? STATION_COLORS[station] : undefined
                    } as React.CSSProperties}
                  >
                    <span className="floating-clip-station-icon">{STATION_ICONS[station]}</span>
                    <span className="floating-clip-station-name">{station}</span>
                    {player && (
                      <span className="floating-clip-station-player">{player.name.split(' ')[1] || player.name}</span>
                    )}
                    {isActive && <span className="floating-clip-station-live">LIVE</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Now - Quick access */}
          {activeStations.length > 0 && (
            <div className="floating-clip-menu-section">
              <div className="floating-clip-menu-label">Active Now</div>
              <div className="floating-clip-active-list">
                {activeStations.map(stationStatus => {
                  const player = players.find(p => p.id === stationStatus.currentPlayer);
                  return (
                    <button
                      key={stationStatus.station}
                      onClick={() => handleQuickMark(stationStatus.station)}
                      className="floating-clip-active-item"
                      style={{ borderLeftColor: STATION_COLORS[stationStatus.station] }}
                    >
                      <div className="floating-clip-active-info">
                        <span className="floating-clip-active-station">
                          {STATION_ICONS[stationStatus.station]} {stationStatus.station}
                        </span>
                        <span className="floating-clip-active-player">
                          {player?.name || 'Unknown'}
                        </span>
                      </div>
                      <span className="floating-clip-mark-btn">MARK</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* View All Link */}
          <button onClick={goToClips} className="floating-clip-view-all">
            <span>View All Clips</span>
            <span className="floating-clip-count-badge">{totalMarkers}</span>
          </button>
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={handleMainClick}
        className={`floating-clip-btn ${justMarked ? 'marked' : ''} ${isExpanded ? 'expanded' : ''}`}
        aria-label="Mark clip"
      >
        <span className="floating-clip-icon">🎬</span>
        {totalMarkers > 0 && !isExpanded && (
          <span className="floating-clip-badge">{totalMarkers}</span>
        )}
      </button>
    </div>
  );
}
