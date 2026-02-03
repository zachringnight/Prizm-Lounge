'use client';

import { useState, useEffect, useCallback, memo } from 'react';
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

const STATION_DESCRIPTIONS: Record<Station, string> = {
  'LED Wall': 'LED Wall content capture station (capacity: 1)',
  'Signing': 'Autograph station for fan signings',
  'PR Interview': 'PR/Media interview area (capacity: 1)',
  'Pack Rips': 'Pack rip content station (capacity: 1)',
  'Free': 'Buffer/break time (no station)'
};

// Memoized status color helper
const getStatusColor = (status: 'active' | 'idle' | 'setup') => {
  switch (status) {
    case 'active': return 'var(--status-live)';
    case 'setup': return 'var(--panini-yellow)';
    case 'idle': return 'var(--foreground-dim)';
  }
};

const getStatusLabel = (status: 'active' | 'idle' | 'setup') => {
  switch (status) {
    case 'active': return 'LIVE';
    case 'setup': return 'SETUP';
    case 'idle': return 'IDLE';
  }
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

// Memoized Player Card Component for performance
const PlayerCard = memo(function PlayerCard({
  player,
  onClick,
  elapsedTime
}: {
  player: { id: string; name: string; position: string; team: string };
  onClick: () => void;
  elapsedTime: number | null;
}) {
  return (
    <button
      onClick={onClick}
      className="mb-4 p-3 bg-[var(--background)] rounded-lg w-full text-left hover:bg-[var(--background-tertiary)] transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="avatar w-10 h-10 text-sm">
          {player.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{player.name}</div>
          <div className="text-sm text-[var(--foreground-muted)]">
            {player.position} • {player.team}
          </div>
          {elapsedTime !== null && (
            <div className="text-xs text-[var(--panini-yellow)] mt-1 flex items-center gap-1">
              <ClockIcon size={12} />
              On-site: {formatElapsedTime(elapsedTime)}
            </div>
          )}
        </div>
        <div className="text-[var(--foreground-dim)]">
          <ChevronRightIcon size={18} />
        </div>
      </div>
    </button>
  );
});

// Get players scheduled for a specific station
const getPlayersForStation = (stationName: Station, allPlayers: Player[]): { player: Player; startTime: string; endTime: string }[] => {
  const result: { player: Player; startTime: string; endTime: string }[] = [];

  allPlayers.forEach(player => {
    if (player.schedule?.commitments) {
      player.schedule.commitments.forEach(commitment => {
        if (commitment.station === stationName) {
          result.push({
            player,
            startTime: commitment.startTime,
            endTime: commitment.endTime
          });
        }
      });
    }
  });

  // Sort by day and time
  return result.sort((a, b) => {
    const dayOrder = { 'Thursday': 0, 'Friday': 1, 'Saturday': 2 };
    const dayDiff = (dayOrder[a.player.schedule?.day || 'Thursday'] || 0) - (dayOrder[b.player.schedule?.day || 'Thursday'] || 0);
    if (dayDiff !== 0) return dayDiff;
    return a.startTime.localeCompare(b.startTime);
  });
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
  allPlayers,
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
  allPlayers: Player[];
  elapsedTime: number | null;
  onToggle: () => void;
  onUpdate: (updates: { status?: 'active' | 'idle' | 'setup'; currentPlayer?: string | null; currentCommitment?: CommitmentType | null; notes?: string }) => void;
  onPlayerClick: (playerId: string) => void;
}) {
  // Get scheduled players for this station
  const scheduledPlayers = getPlayersForStation(station, allPlayers);

  // Get questions for the assigned player if at Signing or Pack Rips
  const playerQuestions = assignedPlayer ? getPlayerQuestions(assignedPlayer.id) : null;
  const showSigningQuestions =
    (station === 'Signing' || currentCommitment === 'Signing') &&
    ((playerQuestions?.signing?.length ?? 0) > 0);
  const showPackRipsQuestions =
    (station === 'Pack Rips' || currentCommitment === 'Pack Rips') &&
    ((playerQuestions?.packRips?.length ?? 0) > 0);
  return (
    <div>
      {/* Station Header - Clickable */}
      <button
        onClick={onToggle}
        className={`station-header w-full ${expanded ? 'expanded' : ''}`}
        style={{
          borderColor: status === 'active' ? 'var(--status-live)' : undefined
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: getStatusColor(status) }}
          />
          <div className="text-left">
            <h3 className="font-semibold text-base">{station}</h3>
            {!expanded && assignedPlayer && (
              <p className="text-sm text-[var(--foreground-muted)]">
                {assignedPlayer.name}
                {elapsedTime !== null && ` • ${formatElapsedTime(elapsedTime)}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              backgroundColor: getStatusColor(status),
              color: status === 'idle' ? 'white' : 'var(--background)'
            }}
          >
            {getStatusLabel(status)}
          </div>
          {expanded ? (
            <ChevronUpIcon size={20} className="text-[var(--foreground-muted)]" />
          ) : (
            <ChevronDownIcon size={20} className="text-[var(--foreground-muted)]" />
          )}
        </div>
      </button>

      {/* Station Content - Expandable */}
      {expanded && (
        <div className="station-content">
          <p className="text-xs text-[var(--foreground-dim)] mb-4">
            {STATION_DESCRIPTIONS[station]}
          </p>

          {/* Status Toggle */}
          <div className="flex gap-2 mb-4">
            {(['idle', 'setup', 'active'] as const).map(s => (
              <button
                key={s}
                onClick={() => onUpdate({ status: s })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                  ${status === s
                    ? 'bg-[var(--background-tertiary)] text-[var(--foreground)]'
                    : 'bg-transparent text-[var(--foreground-dim)]'
                  }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Player Assignment */}
          <div className="mb-4">
            <label className="text-xs text-[var(--foreground-muted)] mb-1 block">
              Current Player
            </label>
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

          {/* Show player info if assigned */}
          {assignedPlayer && (
            <PlayerCard
              player={assignedPlayer}
              onClick={() => onPlayerClick(assignedPlayer.id)}
              elapsedTime={elapsedTime}
            />
          )}

          {/* Commitment Type */}
          <div className="mb-4">
            <label className="text-xs text-[var(--foreground-muted)] mb-1 block">
              Activity
            </label>
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
          <div className="mb-4">
            <label className="text-xs text-[var(--foreground-muted)] mb-1 block">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="e.g., 200 autos remaining, ESPN at 3pm..."
              className="input"
            />
          </div>

          {/* Questions for Signing Station */}
          {showSigningQuestions && assignedPlayer && (
            <div className="mt-4 p-4 md:p-5 bg-[var(--background)] rounded-lg border-l-4 border-l-[var(--panini-yellow)]">
              <h4 className="text-sm md:text-base font-bold text-[var(--panini-yellow)] mb-3 uppercase tracking-wide">
                Signing Questions for {assignedPlayer.name}
              </h4>
              <div className="station-questions">
                {/* Mobile view */}
                <div className="md:hidden space-y-2">
                  {playerQuestions?.signing?.map((q, i) => (
                    <div key={i} className="text-sm text-[var(--foreground)] py-2 border-b border-[var(--background-tertiary)] last:border-0">
                      <span className="text-[var(--panini-yellow)] font-bold mr-2">{i + 1}.</span>
                      {q}
                    </div>
                  ))}
                </div>
                {/* Desktop view */}
                <div className="hidden md:block space-y-3">
                  {playerQuestions?.signing?.map((q, i) => (
                    <div key={i} className="text-base text-[var(--foreground)] py-3 border-b border-[var(--background-tertiary)] last:border-0">
                      <span className="text-[var(--panini-yellow)] font-bold mr-3 text-lg">{i + 1}.</span>
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Questions for Pack Rips Station */}
          {showPackRipsQuestions && assignedPlayer && (
            <div className="mt-4 p-4 md:p-5 bg-[var(--background)] rounded-lg border-l-4 border-l-[var(--panini-red)]">
              <h4 className="text-sm md:text-base font-bold text-[var(--panini-red)] mb-3 uppercase tracking-wide">
                Pack Rips Questions for {assignedPlayer.name}
              </h4>
              <div className="station-questions">
                {/* Mobile view */}
                <div className="md:hidden space-y-2">
                  {playerQuestions?.packRips?.map((q, i) => (
                    <div key={i} className="text-sm text-[var(--foreground)] py-2 border-b border-[var(--background-tertiary)] last:border-0">
                      <span className="text-[var(--panini-red)] font-bold mr-2">{i + 1}.</span>
                      {q}
                    </div>
                  ))}
                </div>
                {/* Desktop view */}
                <div className="hidden md:block space-y-3">
                  {playerQuestions?.packRips?.map((q, i) => (
                    <div key={i} className="text-base text-[var(--foreground)] py-3 border-b border-[var(--background-tertiary)] last:border-0">
                      <span className="text-[var(--panini-red)] font-bold mr-3 text-lg">{i + 1}.</span>
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Players for this station */}
          {scheduledPlayers.length > 0 && (
            <div className="mt-4 p-4 md:p-5 bg-[var(--background)] rounded-lg">
              <h4 className="text-xs md:text-sm font-semibold text-[var(--foreground-muted)] mb-3 uppercase tracking-wide">
                Scheduled at this Station
              </h4>
              <div className="space-y-2 md:space-y-3">
                {scheduledPlayers.map(({ player, startTime }, i) => {
                  const dayLabel = player.schedule?.day || '';
                  const playerStatus = getScheduleStatus(player.schedule);
                  return (
                    <button
                      key={`${player.id}-${i}`}
                      onClick={() => onPlayerClick(player.id)}
                      className={`w-full flex items-center justify-between p-2 md:p-3 rounded hover:bg-[var(--background-tertiary)] transition-colors ${
                        playerStatus === 'live' ? 'bg-[var(--status-live)]/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 md:gap-3 text-left">
                        <span className="text-xs md:text-sm text-[var(--foreground-dim)] font-mono w-12 md:w-16">
                          {formatTime(startTime).replace(' ', '')}
                        </span>
                        <span className="text-sm md:text-base font-medium">{player.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs md:text-sm text-[var(--foreground-dim)]">{dayLabel}</span>
                        {playerStatus === 'live' && (
                          <span className="text-xs md:text-sm font-bold text-[var(--status-live)]">LIVE</span>
                        )}
                        {playerStatus === 'upcoming' && (
                          <span className="text-xs md:text-sm text-[var(--panini-yellow)]">{getTimeUntil(player.schedule)}</span>
                        )}
                      </div>
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

  // Initialize stations on mount
  useEffect(() => {
    initializeStations();
  }, [initializeStations]);

  // Auto-refresh every 10 seconds for elapsed time updates
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  // Get elapsed time for a player
  const getElapsedTime = useCallback((playerId: string): number | null => {
    const arrival = playerArrivals.find(a => a.playerId === playerId && !a.departedAt);
    if (!arrival) return null;
    return Math.round((Date.now() - arrival.arrivedAt) / (1000 * 60));
  }, [playerArrivals]);

  // Check if player has arrived
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

  const expandAll = useCallback(() => {
    setExpandedStations(new Set(stations.map(s => s.station)));
  }, [stations]);

  const collapseAll = useCallback(() => {
    setExpandedStations(new Set());
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
        showToast(`${player.name} marked as departed`, 'info');
      } else {
        markPlayerArrived(playerId);
        showToast(`${player.name} has arrived!`, 'success');
      }
    }
  }, [players, hasArrived, markPlayerArrived, markPlayerDeparted, showToast]);

  const allExpanded = expandedStations.size === stations.length;

  // Find currently live players
  const livePlayers = players.filter(p => getScheduleStatus(p.schedule) === 'live');
  const upcomingPlayers = players.filter(p => getScheduleStatus(p.schedule) === 'upcoming');

  // Get today's scheduled players (including scheduled status)
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const eventDays = ['Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[now.getDay()];
  const isEventDay = eventDays.includes(currentDayName);

  const todaySchedule = players
    .filter(p => {
      if (!p.schedule) return false;
      // Show all players scheduled for today (or all if not an event day for testing)
      return isEventDay ? p.schedule.day === currentDayName : true;
    })
    .sort((a, b) => {
      if (!a.schedule || !b.schedule) return 0;
      // Sort by day first, then time
      const dayOrder = { 'Thursday': 0, 'Friday': 1, 'Saturday': 2 };
      const dayDiff = (dayOrder[a.schedule.day] || 0) - (dayOrder[b.schedule.day] || 0);
      if (dayDiff !== 0) return dayDiff;
      return a.schedule.startTime.localeCompare(b.schedule.startTime);
    });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Stations</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Manage activation stations
          </p>
        </div>
        <button
          onClick={allExpanded ? collapseAll : expandAll}
          className="expand-collapse-all"
        >
          {allExpanded ? (
            <>
              <ChevronUpIcon size={16} />
              <span>Collapse All</span>
            </>
          ) : (
            <>
              <ChevronDownIcon size={16} />
              <span>Expand All</span>
            </>
          )}
        </button>
      </header>

      {/* Quick Status */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card p-3 text-center">
          <div className="text-lg font-bold text-[var(--status-live)]">
            {stations.filter(s => s.status === 'active').length}
          </div>
          <div className="text-xs text-[var(--foreground-muted)]">Active</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-lg font-bold text-[var(--panini-yellow)]">
            {stations.filter(s => s.status === 'setup').length}
          </div>
          <div className="text-xs text-[var(--foreground-muted)]">Setup</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-lg font-bold">
            {stations.filter(s => s.status === 'idle').length}
          </div>
          <div className="text-xs text-[var(--foreground-muted)]">Idle</div>
        </div>
      </div>

      {/* Live/Upcoming Players Quick Reference with Arrival Buttons */}
      {(livePlayers.length > 0 || upcomingPlayers.length > 0) && (
        <div className="card p-4">
          <div className="text-xs font-semibold text-[var(--foreground-muted)] uppercase mb-3">
            Player Arrivals
          </div>
          <div className="space-y-2">
            {livePlayers.map(p => {
              const arrived = hasArrived(p.id);
              const elapsed = getElapsedTime(p.id);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg"
                >
                  <button
                    onClick={() => router.push(`/players/${p.id}`)}
                    className="flex-1 text-left hover:text-[var(--panini-yellow)] transition-colors"
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-[var(--foreground-dim)] flex items-center gap-2">
                      {p.schedule && (
                        <span>{formatTime(p.schedule.startTime)} - {formatTime(p.schedule.endTime)}</span>
                      )}
                      {arrived && elapsed !== null && (
                        <span className="text-[var(--panini-yellow)]">• {formatElapsedTime(elapsed)} on-site</span>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--status-live)]">LIVE</span>
                    <button
                      onClick={() => handlePlayerArrival(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        arrived
                          ? 'bg-[var(--status-live)] text-white'
                          : 'bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:bg-[var(--panini-yellow)] hover:text-black'
                      }`}
                    >
                      {arrived ? (
                        <>
                          <CheckIcon size={12} />
                          <span>Here</span>
                        </>
                      ) : (
                        <>
                          <ClockIcon size={12} />
                          <span>Arrived</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
            {upcomingPlayers.map(p => {
              const arrived = hasArrived(p.id);
              const elapsed = getElapsedTime(p.id);
              const countdown = getTimeUntil(p.schedule);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg"
                >
                  <button
                    onClick={() => router.push(`/players/${p.id}`)}
                    className="flex-1 text-left hover:text-[var(--panini-yellow)] transition-colors"
                  >
                    <div className="font-medium text-[var(--foreground-muted)]">{p.name}</div>
                    <div className="text-xs text-[var(--foreground-dim)] flex items-center gap-2">
                      {p.schedule && (
                        <span>{formatTime(p.schedule.startTime)}</span>
                      )}
                      {countdown && (
                        <span className="text-[var(--panini-yellow)]">in {countdown}</span>
                      )}
                      {arrived && elapsed !== null && (
                        <span className="text-[var(--status-live)]">• here early!</span>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--panini-yellow)]">UP NEXT</span>
                    <button
                      onClick={() => handlePlayerArrival(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        arrived
                          ? 'bg-[var(--status-live)] text-white'
                          : 'bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:bg-[var(--panini-yellow)] hover:text-black'
                      }`}
                    >
                      {arrived ? (
                        <>
                          <CheckIcon size={12} />
                          <span>Here</span>
                        </>
                      ) : (
                        <>
                          <ClockIcon size={12} />
                          <span>Arrived</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      {todaySchedule.length > 0 && (
        <div className="card p-4">
          <div className="text-xs font-semibold text-[var(--foreground-muted)] uppercase mb-3">
            {isEventDay ? `${currentDayName}'s Schedule` : 'Full Schedule'}
          </div>
          <div className="space-y-1">
            {todaySchedule.map(p => {
              const status = getScheduleStatus(p.schedule);
              const arrived = hasArrived(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => router.push(`/players/${p.id}`)}
                  className={`w-full flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors ${
                    status === 'live' ? 'bg-[var(--status-live)]/10' : ''
                  } ${status === 'completed' ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-mono text-[var(--foreground-dim)] w-20">
                      {p.schedule && formatTime(p.schedule.startTime)}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-[var(--foreground-dim)]">
                        {p.position} • {p.team}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {arrived && (
                      <span className="text-xs text-[var(--status-live)] flex items-center gap-1">
                        <CheckIcon size={10} />
                        Here
                      </span>
                    )}
                    {status === 'live' && (
                      <span className="text-xs font-bold text-[var(--status-live)]">LIVE</span>
                    )}
                    {status === 'upcoming' && (
                      <span className="text-xs text-[var(--panini-yellow)]">{getTimeUntil(p.schedule)}</span>
                    )}
                    {status === 'completed' && (
                      <span className="text-xs text-[var(--foreground-dim)]">Done</span>
                    )}
                    {!isEventDay && p.schedule && (
                      <span className="text-xs text-[var(--foreground-dim)]">{p.schedule.day}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Station Cards */}
      <div className="space-y-3">
        {stations.map(data => {
          const assignedPlayer = data.currentPlayer
            ? players.find(p => p.id === data.currentPlayer) || null
            : null;
          const elapsed = data.currentPlayer ? getElapsedTime(data.currentPlayer) : null;

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
              allPlayers={players as Player[]}
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
