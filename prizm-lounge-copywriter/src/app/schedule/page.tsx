'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import {
  getScheduleStatus,
  getTimeUntil,
  formatTime,
  AppearanceSchedule,
  StationChecklistItem,
  STATION_ICONS,
} from '@/types';
import { ClockIcon, ArrowDownIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon } from '@/components/Icons';

type DayFilter = 'All' | 'Thursday' | 'Friday' | 'Saturday';

// Helper to check if countdown is urgent (< 5 minutes)
function isCountdownUrgent(schedule: AppearanceSchedule | null): boolean {
  if (!schedule) return false;

  const eventDates: Record<string, string> = {
    'Thursday': '2026-02-05',
    'Friday': '2026-02-06',
    'Saturday': '2026-02-07'
  };

  const dateStr = eventDates[schedule.day];
  if (!dateStr) return false;

  const startDateTime = new Date(`${dateStr}T${schedule.startTime}:00-08:00`);
  const now = new Date();

  if (now >= startDateTime) return false;

  const diffMs = startDateTime.getTime() - now.getTime();
  const diffMins = diffMs / (1000 * 60);
  return diffMins > 0 && diffMins <= 5;
}

// Format duration for display
function formatDuration(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}

// Format elapsed seconds into mm:ss
function formatTimer(elapsedMs: number, durationMinutes: number): { display: string; isOver: boolean; pct: number } {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const targetSeconds = durationMinutes * 60;
  const remainingSeconds = targetSeconds - totalSeconds;
  const isOver = remainingSeconds <= 0;

  const absSeconds = Math.abs(remainingSeconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  const display = `${isOver ? '+' : ''}${mins}:${secs.toString().padStart(2, '0')}`;
  const pct = Math.min((totalSeconds / targetSeconds) * 100, 100);

  return { display, isOver, pct };
}

// Helper to get smart status message
function getSmartStatus(): { type: 'pre-event' | 'lunch-break' | 'wrap' | 'active' | null; message: string; subMessage: string } {
  const now = new Date();
  const hour = now.getHours();

  const eventDates = {
    start: new Date('2026-02-05T00:00:00-08:00'),
    end: new Date('2026-02-07T23:59:59-08:00')
  };

  if (now < eventDates.start) {
    const daysUntil = Math.ceil((eventDates.start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      type: 'pre-event',
      message: 'Event Starts Soon',
      subMessage: daysUntil === 1 ? 'Tomorrow!' : `${daysUntil} days until Super Bowl LX`
    };
  }

  if (now > eventDates.end) {
    return {
      type: 'wrap',
      message: "That's a Wrap!",
      subMessage: 'Super Bowl LX Prizm Lounge has concluded'
    };
  }

  if (hour >= 12 && hour < 13) {
    return {
      type: 'lunch-break',
      message: 'Lunch Break',
      subMessage: 'Activities resume at 1:00 PM'
    };
  }

  if (hour < 10) {
    return {
      type: 'pre-event',
      message: 'Good Morning',
      subMessage: 'Activities begin at 10:00 AM'
    };
  }

  if (hour >= 18) {
    return {
      type: 'wrap',
      message: 'Day Complete',
      subMessage: 'See you tomorrow!'
    };
  }

  return { type: null, message: '', subMessage: '' };
}

// Station checklist row component
function ChecklistRow({
  item,
  playerId,
  startedAt,
  completedAt,
  onStart,
  onComplete,
  onReset,
  now,
}: {
  item: StationChecklistItem;
  playerId: string;
  startedAt?: number;
  completedAt?: number;
  onStart: () => void;
  onComplete: () => void;
  onReset: () => void;
  now: number;
}) {
  const isStarted = !!startedAt;
  const isCompleted = !!completedAt;

  const elapsedMs = isStarted && !isCompleted ? now - startedAt : 0;
  const timer = isStarted && !isCompleted
    ? formatTimer(elapsedMs, item.durationMinutes)
    : null;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        isCompleted
          ? 'border-[var(--success)] bg-[var(--success)]/10 opacity-70'
          : isStarted
          ? timer?.isOver
            ? 'border-[var(--error)] bg-[var(--error)]/10'
            : 'border-[var(--panini-yellow)] bg-[var(--panini-yellow)]/10'
          : 'border-[var(--background-tertiary)] bg-[var(--background-secondary)]'
      }`}
    >
      {/* Station icon and name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-lg flex-shrink-0">{STATION_ICONS[item.station]}</span>
        <div className="min-w-0">
          <div className={`font-medium text-sm ${isCompleted ? 'line-through text-[var(--foreground-dim)]' : ''}`}>
            {item.station}
          </div>
          {item.isPresetTime && item.presetStartTime && item.presetEndTime && (
            <div className="text-xs text-[var(--panini-yellow)] font-medium">
              {formatTime(item.presetStartTime)} - {formatTime(item.presetEndTime)}
            </div>
          )}
          {item.notes && (
            <div className="text-xs text-[var(--foreground-muted)] truncate">{item.notes}</div>
          )}
        </div>
      </div>

      {/* Duration / Timer */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isCompleted ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-[var(--success)] font-medium">Done</span>
            <button
              onClick={(e) => { e.stopPropagation(); onReset(); }}
              className="text-xs text-[var(--foreground-dim)] hover:text-[var(--foreground)] px-1"
              title="Reset"
            >
              ↻
            </button>
          </div>
        ) : isStarted ? (
          <div className="flex items-center gap-2">
            {/* Timer display */}
            <div className="text-right">
              <div className={`font-mono text-sm font-bold ${
                timer?.isOver ? 'text-[var(--error)]' : 'text-[var(--panini-yellow)]'
              }`}>
                {timer?.display}
              </div>
              {/* Progress bar */}
              <div className="w-16 h-1 bg-[var(--background-tertiary)] rounded-full mt-0.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    timer?.isOver ? 'bg-[var(--error)]' : 'bg-[var(--panini-yellow)]'
                  }`}
                  style={{ width: `${timer?.pct ?? 0}%` }}
                />
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onComplete(); }}
              className="w-8 h-8 rounded-full bg-[var(--success)] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
              title="Mark complete"
            >
              <CheckIcon size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--foreground-dim)]">{formatDuration(item.durationMinutes)}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onStart(); }}
              className="px-3 py-1.5 rounded-lg bg-[var(--panini-blue)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Start
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const router = useRouter();
  const {
    players,
    stationChecklistProgress,
    startStationChecklist,
    completeStationChecklist,
    resetStationChecklist,
    resetAllPlayerChecklist,
  } = useAppStore();
  const [dayFilter, setDayFilter] = useState<DayFilter>('All');
  const [now, setNow] = useState(Date.now());
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const nowRef = useRef<HTMLDivElement>(null);

  // Update every second for timers
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Jump to now function
  const jumpToNow = () => {
    if (nowRef.current) {
      nowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const togglePlayer = useCallback((playerId: string) => {
    setExpandedPlayers(prev => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  }, []);

  const days: DayFilter[] = ['All', 'Thursday', 'Friday', 'Saturday'];

  const filteredPlayers = players
    .filter(p => {
      if (!p.schedule) return false;
      if (dayFilter === 'All') return true;
      return p.schedule.day === dayFilter;
    })
    .sort((a, b) => {
      if (!a.schedule || !b.schedule) return 0;
      const dayOrder = { 'Thursday': 0, 'Friday': 1, 'Saturday': 2 };
      const dayDiff = dayOrder[a.schedule.day] - dayOrder[b.schedule.day];
      if (dayDiff !== 0) return dayDiff;
      return a.schedule.startTime.localeCompare(b.schedule.startTime);
    });

  // Find current/next appearance
  const livePlayer = players.find(p => getScheduleStatus(p.schedule) === 'live');
  const upcomingPlayer = players.find(p => getScheduleStatus(p.schedule) === 'upcoming');

  const getDateDisplay = (day: 'Thursday' | 'Friday' | 'Saturday') => {
    switch (day) {
      case 'Thursday': return 'Feb 5';
      case 'Friday': return 'Feb 6';
      case 'Saturday': return 'Feb 7';
    }
  };

  // Get progress for a player's station
  const getProgress = (playerId: string, stationId: string) => {
    return stationChecklistProgress.find(
      p => p.playerId === playerId && p.stationId === stationId
    );
  };

  // Count completed items for a player
  const getCompletionCount = (playerId: string, checklist?: StationChecklistItem[]) => {
    if (!checklist) return { completed: 0, total: 0 };
    const completed = checklist.filter(item => {
      const progress = getProgress(playerId, item.id);
      return !!progress?.completedAt;
    }).length;
    return { completed, total: checklist.length };
  };

  // Check if any station is currently active (started but not completed) for a player
  const hasActiveStation = (playerId: string, checklist?: StationChecklistItem[]) => {
    if (!checklist) return false;
    return checklist.some(item => {
      const progress = getProgress(playerId, item.id);
      return progress?.startedAt && !progress?.completedAt;
    });
  };

  const smartStatus = getSmartStatus();

  return (
    <div className="space-y-8">
      <header className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>Schedule</h1>
            <p>Station checklist for each player</p>
          </div>
          {(livePlayer || upcomingPlayer) && (
            <button
              onClick={jumpToNow}
              className="jump-to-now-btn"
            >
              <ArrowDownIcon size={18} />
              <span>Jump to Now</span>
            </button>
          )}
        </div>
      </header>

      {/* Smart Status Banner */}
      {smartStatus.type && (
        <div className={`status-banner ${smartStatus.type}`}>
          <div className="status-banner-icon">
            {smartStatus.type === 'pre-event' && '🎯'}
            {smartStatus.type === 'lunch-break' && '🍽️'}
            {smartStatus.type === 'wrap' && '🎉'}
          </div>
          <div className="status-banner-content">
            <h3>{smartStatus.message}</h3>
            <p>{smartStatus.subMessage}</p>
          </div>
        </div>
      )}

      {/* Live/Up Next Banner */}
      {(livePlayer || upcomingPlayer) && (
        <div
          ref={nowRef}
          className={`card p-5 ${livePlayer ? 'card-live' : 'border-[var(--panini-yellow)]'}`}
        >
          {livePlayer ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="status-dot live animate-pulse-live scale-125" />
                <span className="text-sm font-bold text-[var(--status-live)] tracking-wide">LIVE NOW</span>
              </div>
              <div className="font-bold text-xl mb-1">{livePlayer.name}</div>
              <div className="text-base text-[var(--foreground-muted)]">
                {livePlayer.position} • {livePlayer.team}
              </div>
              {livePlayer.schedule && (
                <div className="text-sm text-[var(--foreground-dim)] mt-2">
                  Until {formatTime(livePlayer.schedule.endTime)}
                </div>
              )}
            </div>
          ) : upcomingPlayer && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="status-dot upcoming scale-125" />
                <span className="text-sm font-bold text-[var(--panini-yellow)] tracking-wide">UP NEXT</span>
              </div>
              <div className="font-bold text-xl mb-1">{upcomingPlayer.name}</div>
              <div className="text-base text-[var(--foreground-muted)]">
                {upcomingPlayer.position} • {upcomingPlayer.team}
              </div>
              <div className={`countdown text-xl mt-3 ${isCountdownUrgent(upcomingPlayer.schedule) ? 'countdown-urgent' : ''}`}>
                {getTimeUntil(upcomingPlayer.schedule)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Day Filter */}
      <div className="tabs-enhanced">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setDayFilter(day)}
            className={`tab-enhanced ${dayFilter === day ? 'active' : ''}`}
          >
            {day === 'All' ? 'All Days' : (
              <span className="flex flex-col items-center">
                <span>{day}</span>
                <span className="text-xs opacity-60">
                  {getDateDisplay(day as Exclude<DayFilter, 'All'>)}
                </span>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Player Checklist Cards */}
      <div className="space-y-4">
        {filteredPlayers.length === 0 ? (
          <div className="empty-state">
            <ClockIcon size={56} className="mx-auto mb-4 opacity-40" />
            <p className="text-lg">No appearances scheduled</p>
          </div>
        ) : (
          filteredPlayers.map(player => {
            const status = getScheduleStatus(player.schedule);
            const checklist = player.schedule?.stationChecklist;
            const { completed, total } = getCompletionCount(player.id, checklist);
            const isExpanded = expandedPlayers.has(player.id);
            const isActive = hasActiveStation(player.id, checklist);
            const allDone = total > 0 && completed === total;

            return (
              <div
                key={player.id}
                className={`card overflow-hidden ${
                  status === 'live' ? 'card-live' : ''
                } ${isActive ? 'border-[var(--panini-yellow)]' : ''} ${
                  allDone ? 'border-[var(--success)]' : ''
                }`}
              >
                {/* Player Header - clickable to expand */}
                <button
                  onClick={() => togglePlayer(player.id)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-base truncate max-w-[200px] sm:max-w-none">
                        {player.name}
                      </span>
                      <span className={`badge badge-${player.category.toLowerCase()}`}>
                        {player.category}
                      </span>
                      {status === 'live' && (
                        <span className="badge bg-[var(--status-live)] text-white">LIVE</span>
                      )}
                      {isActive && (
                        <span className="badge bg-[var(--panini-yellow)] text-black text-xs">IN PROGRESS</span>
                      )}
                    </div>
                    <div className="text-sm text-[var(--foreground-muted)]">
                      {player.position} • {player.team}
                    </div>
                    {player.schedule && (
                      <div className="flex items-center gap-2 mt-1 text-xs text-[var(--foreground-dim)]">
                        <span>{player.schedule.day}</span>
                        <span>•</span>
                        <span>{formatTime(player.schedule.startTime)} - {formatTime(player.schedule.endTime)}</span>
                        {status === 'upcoming' && (
                          <span className={`countdown ml-1 ${isCountdownUrgent(player.schedule) ? 'countdown-urgent' : ''}`}>
                            {getTimeUntil(player.schedule)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Completion indicator + expand */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {total > 0 && (
                      <div className="text-center">
                        <div className={`text-sm font-bold ${
                          allDone ? 'text-[var(--success)]' : 'text-[var(--foreground-muted)]'
                        }`}>
                          {completed}/{total}
                        </div>
                        {/* Mini progress bar */}
                        <div className="w-12 h-1.5 bg-[var(--background-tertiary)] rounded-full mt-0.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              allDone ? 'bg-[var(--success)]' : 'bg-[var(--panini-yellow)]'
                            }`}
                            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronDownIcon size={18} className="text-[var(--foreground-dim)]" />
                    ) : (
                      <ChevronRightIcon size={18} className="text-[var(--foreground-dim)]" />
                    )}
                  </div>
                </button>

                {/* Expanded Checklist */}
                {isExpanded && checklist && (
                  <div className="border-t border-[var(--background-tertiary)] p-4 space-y-2">
                    {/* Preset overall times */}
                    {player.schedule && (
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <ClockIcon size={14} className="text-[var(--foreground-dim)]" />
                        <span className="text-xs text-[var(--foreground-dim)]">
                          Overall: {formatTime(player.schedule.startTime)} - {formatTime(player.schedule.endTime)} ({player.schedule.day})
                        </span>
                      </div>
                    )}

                    {checklist.map(item => {
                      const progress = getProgress(player.id, item.id);
                      return (
                        <ChecklistRow
                          key={item.id}
                          item={item}
                          playerId={player.id}
                          startedAt={progress?.startedAt}
                          completedAt={progress?.completedAt}
                          onStart={() => startStationChecklist(player.id, item.id)}
                          onComplete={() => completeStationChecklist(player.id, item.id)}
                          onReset={() => resetStationChecklist(player.id, item.id)}
                          now={now}
                        />
                      );
                    })}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-[var(--background-tertiary)]">
                      <button
                        onClick={() => router.push(`/players/${player.id}`)}
                        className="text-xs text-[var(--panini-blue)] hover:underline"
                      >
                        View Player Details
                      </button>
                      {completed > 0 && (
                        <button
                          onClick={() => resetAllPlayerChecklist(player.id)}
                          className="text-xs text-[var(--foreground-dim)] hover:text-[var(--error)]"
                        >
                          Reset All
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
