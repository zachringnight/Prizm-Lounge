'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { getScheduleStatus, getTimeUntil, formatTime, Player } from '@/types';
import PlayerCard from '@/components/PlayerCard';
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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-1">Schedule</h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Player appearances at Prizm Lounge
        </p>
      </header>

      {/* Live/Up Next Banner */}
      {(livePlayer || upcomingPlayer) && (
        <div className={`card p-4 ${livePlayer ? 'border-[var(--status-live)]' : 'border-[var(--panini-yellow)]'}`}>
          {livePlayer ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="status-dot live animate-pulse-live" />
                <span className="text-sm font-semibold text-[var(--status-live)]">LIVE NOW</span>
              </div>
              <div className="font-bold text-lg">{livePlayer.name}</div>
              <div className="text-sm text-[var(--foreground-muted)]">
                {livePlayer.position} - {livePlayer.team}
              </div>
              {livePlayer.schedule && (
                <div className="text-sm text-[var(--foreground-dim)] mt-1">
                  Until {formatTime(livePlayer.schedule.endTime)}
                </div>
              )}
            </div>
          ) : upcomingPlayer && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="status-dot upcoming" />
                <span className="text-sm font-semibold text-[var(--panini-yellow)]">UP NEXT</span>
              </div>
              <div className="font-bold text-lg">{upcomingPlayer.name}</div>
              <div className="text-sm text-[var(--foreground-muted)]">
                {upcomingPlayer.position} - {upcomingPlayer.team}
              </div>
              <div className="countdown text-lg mt-2">
                {getTimeUntil(upcomingPlayer.schedule)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Day Filter */}
      <div className="tabs">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setDayFilter(day)}
            className={`tab ${dayFilter === day ? 'active' : ''}`}
          >
            {day === 'All' ? 'All Days' : (
              <>
                {day}
                <span className="text-xs ml-1 opacity-50">
                  {getDateDisplay(day as Exclude<DayFilter, 'All'>)}
                </span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Schedule List */}
      <div className="space-y-3">
        {filteredPlayers.length === 0 ? (
          <div className="empty-state">
            <ClockIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>No appearances scheduled</p>
          </div>
        ) : (
          filteredPlayers.map(player => {
            const status = getScheduleStatus(player.schedule);

            return (
              <div
                key={player.id}
                className={`card p-4 ${status === 'live' ? 'border-[var(--status-live)]' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{player.name}</span>
                      <span className={`badge badge-${player.category.toLowerCase()}`}>
                        {player.category}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--foreground-muted)]">
                      {player.position} - {player.team}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <div className={`status-dot ${status}`} />
                      {status === 'live' && (
                        <span className="text-xs font-semibold text-[var(--status-live)]">LIVE</span>
                      )}
                    </div>
                    {player.schedule && (
                      <>
                        <div className="text-sm font-semibold mt-1">
                          {formatTime(player.schedule.startTime)} - {formatTime(player.schedule.endTime)}
                        </div>
                        <div className="text-xs text-[var(--foreground-dim)]">
                          {player.schedule.day}, {player.schedule.date}
                        </div>
                        {status === 'upcoming' && (
                          <div className="countdown text-sm mt-1">
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
