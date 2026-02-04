'use client';

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import {
  Station,
  CommitmentType,
  COMMITMENT_TYPES,
  getScheduleStatus,
  formatTime,
  getTimeUntil,
  Player,
} from '@/types';
import { useToast } from '@/components/Toast';
import { ChevronDownIcon, ChevronUpIcon, ChevronRightIcon, ClockIcon, CheckIcon } from '@/components/Icons';
import { getPlayerQuestions } from '@/data/players';

const STATION_ICONS: Record<Station, string> = {
  'LED Wall': '📺',
  'Signing': '✍️',
  'PR Interview': '🎤',
  'Pack Rips': '📦',
  'Free': '☕'
};

// Format elapsed time
const formatElapsedTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

// Memoized Station Card for performance
const StationCard = memo(function StationCard({
  station,
  status,
  currentPlayer,
  currentCommitment,
  notes,
  expanded,
  assignedPlayer,
  players,
  scheduledPlayers,
  elapsedTime,
  onToggle,
  onUpdate,
  onPlayerClick
}: {
  station: Station;
  status: 'active' | 'idle' | 'setup';
  currentPlayer: string | null;
  currentCommitment: CommitmentType | null;
  notes: string;
  expanded: boolean;
  assignedPlayer: { id: string; name: string; position: string; team: string } | null;
  players: Array<{ id: string; name: string }>;
  scheduledPlayers: { player: Player; startTime: string; endTime: string }[];
  elapsedTime: number | null;
  onToggle: () => void;
  onUpdate: (updates: { status?: 'active' | 'idle' | 'setup'; currentPlayer?: string | null; currentCommitment?: CommitmentType | null; notes?: string }) => void;
  onPlayerClick: (playerId: string) => void;
}) {
  const playerQuestions = assignedPlayer ? getPlayerQuestions(assignedPlayer.id) : null;
  const showSigningQuestions =
    (station === 'Signing' || currentCommitment === 'Signing') &&
    ((playerQuestions?.signing?.length ?? 0) > 0);
  const showPackRipsQuestions =
    (station === 'Pack Rips' || currentCommitment === 'Pack Rips') &&
    ((playerQuestions?.packRips?.length ?? 0) > 0);

  return (
    <div className={`station-card ${status === 'active' ? 'is-active' : ''}`}>
      {/* Station Header */}
      <button onClick={onToggle} className="station-card-header">
        <div className="station-card-left">
          <span className="station-icon">{STATION_ICONS[station]}</span>
          <div>
            <h3 className="station-name">{station}</h3>
            {!expanded && assignedPlayer && (
              <p className="station-player-preview">
                {assignedPlayer.name}
                {elapsedTime !== null && <span> • {formatElapsedTime(elapsedTime)}</span>}
              </p>
            )}
          </div>
        </div>
        <div className="station-card-right">
          <span className={`station-status-badge ${status}`}>
            {status === 'active' ? 'LIVE' : status === 'setup' ? 'SETUP' : 'IDLE'}
          </span>
          {expanded ? (
            <ChevronUpIcon size={18} className="text-[var(--foreground-dim)]" />
          ) : (
            <ChevronDownIcon size={18} className="text-[var(--foreground-dim)]" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="station-card-content">
          {/* Status Toggle */}
          <div className="station-status-toggle">
            {(['idle', 'setup', 'active'] as const).map(s => (
              <button
                key={s}
                onClick={() => onUpdate({ status: s })}
                className={`station-status-btn ${status === s ? 'active' : ''} ${s}`}
              >
                {s === 'active' ? 'Live' : s === 'setup' ? 'Setup' : 'Idle'}
              </button>
            ))}
          </div>

          {/* Player Assignment */}
          <div className="station-field">
            <label>Current Player</label>
            <select
              value={currentPlayer || ''}
              onChange={(e) => onUpdate({ currentPlayer: e.target.value || null })}
              className="input select"
            >
              <option value="">None assigned</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Show assigned player info */}
          {assignedPlayer && (
            <button
              onClick={() => onPlayerClick(assignedPlayer.id)}
              className="station-assigned-player"
            >
              <div className="avatar w-10 h-10 text-sm">{assignedPlayer.name.charAt(0)}</div>
              <div className="flex-1">
                <div className="font-semibold">{assignedPlayer.name}</div>
                <div className="text-sm text-[var(--foreground-muted)]">
                  {assignedPlayer.position} • {assignedPlayer.team}
                </div>
                {elapsedTime !== null && (
                  <div className="text-xs text-[var(--panini-yellow)] mt-1 flex items-center gap-1">
                    <ClockIcon size={12} />
                    On-site: {formatElapsedTime(elapsedTime)}
                  </div>
                )}
              </div>
              <ChevronRightIcon size={18} className="text-[var(--foreground-dim)]" />
            </button>
          )}

          {/* Activity */}
          <div className="station-field">
            <label>Activity</label>
            <select
              value={currentCommitment || ''}
              onChange={(e) => onUpdate({ currentCommitment: (e.target.value as CommitmentType) || null })}
              className="input select"
            >
              <option value="">Select activity...</option>
              {COMMITMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="station-field">
            <label>Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="e.g., 200 autos remaining..."
              className="input"
            />
          </div>

          {/* Questions for Signing */}
          {showSigningQuestions && assignedPlayer && (
            <div className="station-questions signing">
              <h4>Signing Questions for {assignedPlayer.name}</h4>
              <div className="questions-list">
                {playerQuestions?.signing?.map((q, i) => (
                  <div key={i} className="question-item">
                    <span className="question-num">{i + 1}</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions for Pack Rips */}
          {showPackRipsQuestions && assignedPlayer && (
            <div className="station-questions pack-rips">
              <h4>Pack Rips Questions for {assignedPlayer.name}</h4>
              <div className="questions-list">
                {playerQuestions?.packRips?.map((q, i) => (
                  <div key={i} className="question-item">
                    <span className="question-num">{i + 1}</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduled Players */}
          {scheduledPlayers.length > 0 && (
            <div className="station-scheduled">
              <h4>Scheduled at this Station</h4>
              <div className="scheduled-list">
                {scheduledPlayers.slice(0, 5).map(({ player, startTime }, i) => {
                  const playerStatus = getScheduleStatus(player.schedule);
                  return (
                    <button
                      key={`${player.id}-${i}`}
                      onClick={() => onPlayerClick(player.id)}
                      className={`scheduled-item ${playerStatus === 'live' ? 'is-live' : ''}`}
                    >
                      <span className="scheduled-time">{formatTime(startTime).replace(' ', '')}</span>
                      <span className="scheduled-name">{player.name}</span>
                      {playerStatus === 'live' && <span className="scheduled-live">LIVE</span>}
                      {playerStatus === 'upcoming' && (
                        <span className="scheduled-countdown">{getTimeUntil(player.schedule)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default function StationsPage() {
  const router = useRouter();
  const {
    players,
    stations,
    updateStation,
    initializeStations,
    playerArrivals,
    markPlayerArrived,
    markPlayerDeparted
  } = useAppStore();
  const { showToast, ToastComponent } = useToast();
  const [expandedStations, setExpandedStations] = useState<Set<Station>>(new Set(['LED Wall']));
  const [, setTick] = useState(0);

  useEffect(() => {
    initializeStations();
  }, [initializeStations]);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  const getElapsedTime = useCallback((playerId: string): number | null => {
    const arrival = playerArrivals.find(a => a.playerId === playerId && !a.departedAt);
    if (!arrival) return null;
    return Math.round((Date.now() - arrival.arrivedAt) / (1000 * 60));
  }, [playerArrivals]);

  const hasArrived = useCallback((playerId: string): boolean => {
    return playerArrivals.some(a => a.playerId === playerId && !a.departedAt);
  }, [playerArrivals]);

  const toggleStation = useCallback((station: Station) => {
    setExpandedStations(prev => {
      const next = new Set(prev);
      if (next.has(station)) {
        next.delete(station);
      } else {
        next.add(station);
      }
      return next;
    });
  }, []);

  const handleUpdate = useCallback((station: Station, updates: Partial<{
    status: 'active' | 'idle' | 'setup';
    currentPlayer: string | null;
    currentCommitment: CommitmentType | null;
    notes: string;
  }>) => {
    updateStation(station, updates);
  }, [updateStation]);

  const handlePlayerArrival = useCallback((playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      if (hasArrived(playerId)) {
        markPlayerDeparted(playerId);
        showToast(`${player.name} departed`, 'info');
      } else {
        markPlayerArrived(playerId);
        showToast(`${player.name} arrived!`, 'success');
      }
    }
  }, [players, hasArrived, markPlayerArrived, markPlayerDeparted, showToast]);

  // Find live and upcoming players
  const livePlayers = players.filter(p => getScheduleStatus(p.schedule) === 'live');
  const upcomingPlayers = players
    .filter(p => getScheduleStatus(p.schedule) === 'upcoming')
    .slice(0, 3);

  // Station-to-players mapping
  const stationPlayersMap = useMemo(() => {
    const map = new Map<Station, { player: Player; startTime: string; endTime: string }[]>();
    stations.forEach(s => map.set(s.station, []));

    players.forEach(player => {
      if (player.schedule?.commitments) {
        player.schedule.commitments.forEach(commitment => {
          const stationPlayers = map.get(commitment.station);
          if (stationPlayers) {
            stationPlayers.push({
              player,
              startTime: commitment.startTime,
              endTime: commitment.endTime
            });
          }
        });
      }
    });

    const dayOrder: Record<string, number> = { 'Thursday': 0, 'Friday': 1, 'Saturday': 2 };
    map.forEach(stationPlayers => {
      stationPlayers.sort((a, b) => {
        const dayDiff = (dayOrder[a.player.schedule?.day || 'Thursday'] ?? 0) - (dayOrder[b.player.schedule?.day || 'Thursday'] ?? 0);
        if (dayDiff !== 0) return dayDiff;
        return a.startTime.localeCompare(b.startTime);
      });
    });

    return map;
  }, [players, stations]);

  const activeCount = stations.filter(s => s.status === 'active').length;
  const setupCount = stations.filter(s => s.status === 'setup').length;

  return (
    <div className="stations-page">
      {/* Header */}
      <header className="stations-header">
        <div>
          <h1>Stations</h1>
          <p className="stations-summary">
            <span className="live">{activeCount} live</span>
            {setupCount > 0 && <span className="setup"> • {setupCount} setup</span>}
          </p>
        </div>
      </header>

      {/* Player Arrivals */}
      {(livePlayers.length > 0 || upcomingPlayers.length > 0) && (
        <div className="arrivals-section">
          <h2>Player Arrivals</h2>
          <div className="arrivals-list">
            {livePlayers.map(p => {
              const arrived = hasArrived(p.id);
              const elapsed = getElapsedTime(p.id);
              return (
                <div key={p.id} className="arrival-item live">
                  <button
                    onClick={() => router.push(`/players/${p.id}`)}
                    className="arrival-info"
                  >
                    <span className="arrival-name">{p.name}</span>
                    <span className="arrival-meta">
                      {p.schedule && `${formatTime(p.schedule.startTime)} - ${formatTime(p.schedule.endTime)}`}
                      {arrived && elapsed !== null && ` • ${formatElapsedTime(elapsed)}`}
                    </span>
                  </button>
                  <div className="arrival-actions">
                    <span className="arrival-status live">LIVE</span>
                    <button
                      onClick={() => handlePlayerArrival(p.id)}
                      className={`arrival-btn ${arrived ? 'arrived' : ''}`}
                    >
                      {arrived ? <><CheckIcon size={14} /> Here</> : <><ClockIcon size={14} /> Mark</>}
                    </button>
                  </div>
                </div>
              );
            })}
            {upcomingPlayers.map(p => {
              const arrived = hasArrived(p.id);
              return (
                <div key={p.id} className="arrival-item upcoming">
                  <button
                    onClick={() => router.push(`/players/${p.id}`)}
                    className="arrival-info"
                  >
                    <span className="arrival-name">{p.name}</span>
                    <span className="arrival-meta">
                      {p.schedule && formatTime(p.schedule.startTime)}
                      {' • '}{getTimeUntil(p.schedule)}
                      {arrived && ' • here early!'}
                    </span>
                  </button>
                  <div className="arrival-actions">
                    <span className="arrival-status upcoming">NEXT</span>
                    <button
                      onClick={() => handlePlayerArrival(p.id)}
                      className={`arrival-btn ${arrived ? 'arrived' : ''}`}
                    >
                      {arrived ? <><CheckIcon size={14} /> Here</> : <><ClockIcon size={14} /> Mark</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Station Cards */}
      <div className="stations-grid">
        {stations.map(data => {
          const assignedPlayer = data.currentPlayer
            ? players.find(p => p.id === data.currentPlayer) || null
            : null;
          const elapsed = data.currentPlayer ? getElapsedTime(data.currentPlayer) : null;
          const scheduledPlayers = stationPlayersMap.get(data.station) || [];

          return (
            <StationCard
              key={data.station}
              station={data.station}
              status={data.status}
              currentPlayer={data.currentPlayer}
              currentCommitment={data.currentCommitment}
              notes={data.notes}
              expanded={expandedStations.has(data.station)}
              assignedPlayer={assignedPlayer}
              players={players}
              scheduledPlayers={scheduledPlayers}
              elapsedTime={elapsed}
              onToggle={() => toggleStation(data.station)}
              onUpdate={(updates) => handleUpdate(data.station, updates)}
              onPlayerClick={(id) => router.push(`/players/${id}`)}
            />
          );
        })}
      </div>

      {ToastComponent}
    </div>
  );
}
