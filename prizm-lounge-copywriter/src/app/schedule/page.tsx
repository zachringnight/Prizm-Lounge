'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { getScheduleStatus, getTimeUntil, formatTime } from '@/types';
import { ClockIcon } from '@/components/Icons';

type DayFilter = 'All' | 'Thursday' | 'Friday' | 'Saturday';

export default function SchedulePage() {
  const { players } = useAppStore();
  const [dayFilter, setDayFilter] = useState<DayFilter>('All');
  const [, setTick] = useState(0);

  // Update every minute for countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 60000);
    return () => clearInterval(interval);
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

      // Sort by day first
      const dayOrder = { 'Thursday': 0, 'Friday': 1, 'Saturday': 2 };
      const dayDiff = dayOrder[a.schedule.day] - dayOrder[b.schedule.day];
      if (dayDiff !== 0) return dayDiff;

      // Then by time
      return a.schedule.startTime.localeCompare(b.schedule.startTime);
    });

  // Find current/next appearance
  const livePlayer = players.find(p => getScheduleStatus(p.schedule) === 'live');
  const upcomingPlayer = players.find(p => getScheduleStatus(p.schedule) === 'upcoming');

  const getDateDisplay = (day: 'Thursday' | 'Friday' | 'Saturday') => {
    switch (day) {
      case 'Thursday': return 'Feb 6';
      case 'Friday': return 'Feb 7';
      case 'Saturday': return 'Feb 8';
    }
  };

  return (
    <div className="space-y-8">
      <header className="page-header">
        <h1>Schedule</h1>
        <p>Player appearances at Prizm Lounge</p>
      </header>

      {/* Live/Up Next Banner */}
      {(livePlayer || upcomingPlayer) && (
        <div className={`card p-5 ${livePlayer ? 'card-live' : 'border-[var(--panini-yellow)]'}`}>
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
              <div className="countdown text-xl mt-3">
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

      {/* Schedule List */}
      <div className="space-y-4">
        {filteredPlayers.length === 0 ? (
          <div className="empty-state">
            <ClockIcon size={56} className="mx-auto mb-4 opacity-40" />
            <p className="text-lg">No appearances scheduled</p>
          </div>
        ) : (
          filteredPlayers.map(player => {
            const status = getScheduleStatus(player.schedule);

            return (
              <div
                key={player.id}
                className={`schedule-card ${status === 'live' ? 'is-live' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="player-name truncate">{player.name}</span>
                      <span className={`badge badge-${player.category.toLowerCase()}`}>
                        {player.category}
                      </span>
                      {status === 'live' && (
                        <span className="badge bg-[var(--status-live)] text-white">LIVE</span>
                      )}
                    </div>
                    <div className="player-details">
                      {player.position} • {player.team}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {player.schedule && (
                      <>
                        <div className="time-display text-lg">
                          {formatTime(player.schedule.startTime)}
                        </div>
                        <div className="text-sm text-[var(--foreground-dim)]">
                          to {formatTime(player.schedule.endTime)}
                        </div>
                        <div className="text-sm text-[var(--foreground-dim)] mt-1">
                          {player.schedule.day}
                        </div>
                        {status === 'upcoming' && (
                          <div className="countdown text-base mt-2">
                            {getTimeUntil(player.schedule)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
