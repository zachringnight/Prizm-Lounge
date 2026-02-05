'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import {
  getScheduleStatus,
  getTimeUntil,
  formatTime,
  isCountdownUrgent,
  StationChecklistItem,
  STATION_ICONS,
} from '@/types';
import { ClockIcon, ArrowDownIcon, CheckIcon, ChevronDownIcon, ChevronRightIcon } from '@/components/Icons';

type DayFilter = 'All' | 'Thursday' | 'Friday' | 'Saturday';

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

// Station checklist row component — simplified tap-to-complete
function ChecklistRow({
  item,
  completedAt,
  onToggle,
}: {
  item: StationChecklistItem;
  completedAt?: number;
  onToggle: () => void;
}) {
  const isCompleted = !!completedAt;
  const isPR = item.station === 'PR Interview';

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-all text-left ${
        isCompleted
          ? 'border-[var(--success)]/40 bg-[var(--success)]/10'
          : 'border-[var(--background-tertiary)] bg-[var(--background-secondary)] active:scale-[0.98]'
      }`}
    >
      {/* Checkbox */}
      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        isCompleted
          ? 'border-[var(--success)] bg-[var(--success)]'
          : 'border-[var(--foreground-dim)]'
      }`}>
        {isCompleted && <CheckIcon size={14} className="text-white" />}
      </div>

      {/* Station icon and name */}
      <span className="text-base flex-shrink-0">{STATION_ICONS[item.station]}</span>
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-sm ${isCompleted ? 'line-through text-[var(--foreground-dim)]' : ''}`}>
          {item.station}
        </div>
        {isPR && item.isPresetTime && item.presetStartTime && item.presetEndTime && (
          <div className="text-xs text-[var(--panini-yellow)] font-medium">
            {formatTime(item.presetStartTime)} - {formatTime(item.presetEndTime)}
          </div>
        )}
        {item.notes && (
          <div className="text-xs text-[var(--foreground-muted)] truncate">{item.notes}</div>
        )}
      </div>
    </button>
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
  const [, setTick] = useState(0);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const nowRef = useRef<HTMLDivElement>(null);

  // Update every 30 seconds for countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 30000);
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

  const smartStatus = getSmartStatus();

  return (
    <div className="space-y-5 md:space-y-8">
      <header className="page-header md:mb-6 mb-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 hidden md:block">
            <h1>Schedule</h1>
            <p>Station checklist for each player</p>
          </div>
          {(livePlayer || upcomingPlayer) && (
            <button
              onClick={jumpToNow}
              className="jump-to-now-btn flex-shrink-0 md:ml-0 ml-auto"
            >
              <ArrowDownIcon size={18} />
              <span className="hidden sm:inline">Jump to Now</span>
              <span className="sm:hidden">Now</span>
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
            const allDone = total > 0 && completed === total;

            return (
              <div
                key={player.id}
                className={`card overflow-hidden ${
                  status === 'live' ? 'card-live' : ''
                } ${allDone ? 'border-[var(--success)]' : ''}`}
              >
                {/* Player Header - clickable to expand */}
                <button
                  onClick={() => togglePlayer(player.id)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-base truncate max-w-[55vw] sm:max-w-none">
                        {player.name}
                      </span>
                      <span className={`badge badge-${player.category.toLowerCase()}`}>
                        {player.category}
                      </span>
                      {status === 'live' && (
                        <span className="badge bg-[var(--status-live)] text-white">LIVE</span>
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
                      const isComplete = !!progress?.completedAt;
                      return (
                        <ChecklistRow
                          key={item.id}
                          item={item}
                          completedAt={progress?.completedAt}
                          onToggle={() => {
                            if (isComplete) {
                              resetStationChecklist(player.id, item.id);
                            } else {
                              // Mark both started and completed in one tap
                              startStationChecklist(player.id, item.id);
                              completeStationChecklist(player.id, item.id);
                            }
                          }}
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
