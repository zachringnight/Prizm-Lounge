'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store';
import { getScheduleStatus, getTimeUntil, formatTime, Player, AppearanceSchedule } from '@/types';
import PlayerCard from '@/components/PlayerCard';
import { ClockIcon, ArrowDownIcon } from '@/components/Icons';

type DayFilter = 'All' | 'Thursday' | 'Friday' | 'Saturday';

// Helper to check if countdown is urgent (< 5 minutes)
function isCountdownUrgent(schedule: AppearanceSchedule | null): boolean {
  if (!schedule) return false;

  const eventDates: Record<string, string> = {
    'Thursday': '2026-02-06',
    'Friday': '2026-02-07',
    'Saturday': '2026-02-08'
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

// Helper to get smart status message
function getSmartStatus(): { type: 'pre-event' | 'lunch-break' | 'wrap' | 'active' | null; message: string; subMessage: string } {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();

  // Event dates: Thu Feb 6, Fri Feb 7, Sat Feb 8 (2026)
  const eventDates = {
    start: new Date('2026-02-06T00:00:00-08:00'),
    end: new Date('2026-02-08T23:59:59-08:00')
  };

  // Before event starts
  if (now < eventDates.start) {
    const daysUntil = Math.ceil((eventDates.start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      type: 'pre-event',
      message: 'Event Starts Soon',
      subMessage: daysUntil === 1 ? 'Tomorrow!' : `${daysUntil} days until Super Bowl LX`
    };
  }

  // After event ends
  if (now > eventDates.end) {
    return {
      type: 'wrap',
      message: "That's a Wrap!",
      subMessage: 'Super Bowl LX Prizm Lounge has concluded'
    };
  }

  // During event - check for lunch break (12:00 - 13:00)
  if (hour >= 12 && hour < 13) {
    return {
      type: 'lunch-break',
      message: 'Lunch Break',
      subMessage: 'Activities resume at 1:00 PM'
    };
  }

  // Before daily start (before 10 AM)
  if (hour < 10) {
    return {
      type: 'pre-event',
      message: 'Good Morning',
      subMessage: 'Activities begin at 10:00 AM'
    };
  }

  // After daily end (after 6 PM)
  if (hour >= 18) {
    return {
      type: 'wrap',
      message: 'Day Complete',
      subMessage: 'See you tomorrow!'
    };
  }

  return { type: null, message: '', subMessage: '' };
}

export default function SchedulePage() {
  const { players } = useAppStore();
  const [dayFilter, setDayFilter] = useState<DayFilter>('All');
  const [, setTick] = useState(0);
  const nowRef = useRef<HTMLDivElement>(null);

  // Update every minute for countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Jump to now function
  const jumpToNow = () => {
    if (nowRef.current) {
      nowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

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

  // Get smart status for display
  const smartStatus = getSmartStatus();

  return (
    <div className="space-y-8">
      <header className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>Schedule</h1>
            <p>Player appearances at Prizm Lounge</p>
          </div>
          {/* Jump to Now Button */}
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

      {/* Schedule List */}
      <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
        {filteredPlayers.length === 0 ? (
          <div className="empty-state md:col-span-full">
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
                          <div className={`countdown text-base mt-2 ${isCountdownUrgent(player.schedule) ? 'countdown-urgent' : ''}`}>
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
