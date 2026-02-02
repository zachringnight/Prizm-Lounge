'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { getScheduleStatus, getTimeUntil, formatTime } from '@/types';
import { CalendarIcon, CheckIcon, UsersIcon, ClipboardIcon } from '@/components/Icons';

export default function Home() {
  const router = useRouter();
  const { players, checklist, deliverables, initializeChecklist, initializeDeliverables } = useAppStore();
  const [, setTick] = useState(0);

  // Initialize checklist and deliverables on first load
  useEffect(() => {
    initializeChecklist();
    initializeDeliverables();
  }, [initializeChecklist, initializeDeliverables]);

  // Update every minute for countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get today's schedule
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[today.getDay()];

  // Find live/upcoming players
  const livePlayer = players.find(p => getScheduleStatus(p.schedule) === 'live');
  const upcomingPlayers = players
    .filter(p => getScheduleStatus(p.schedule) === 'upcoming' || getScheduleStatus(p.schedule) === 'scheduled')
    .filter(p => p.schedule)
    .sort((a, b) => {
      if (!a.schedule || !b.schedule) return 0;
      const dayOrder = { 'Thursday': 0, 'Friday': 1, 'Saturday': 2 };
      const dayDiff = dayOrder[a.schedule.day] - dayOrder[b.schedule.day];
      if (dayDiff !== 0) return dayDiff;
      return a.schedule.startTime.localeCompare(b.schedule.startTime);
    })
    .slice(0, 3);

  // Calculate checklist progress
  const checklistComplete = checklist.filter(c => c.completed).length;
  const checklistTotal = checklist.length;

  // Calculate deliverables progress
  const deliverablesComplete = deliverables.filter(d => d.status === 'completed' || d.status === 'delivered').length;
  const deliverablesTotal = deliverables.length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="brand-text">Panini America</div>
        <h1>
          <span className="text-[var(--panini-red)]">Prizm</span>{' '}
          <span className="text-[var(--panini-yellow)]">Lounge</span>
        </h1>
        <p className="event-info">Super Bowl LX • San Francisco</p>
        <p className="event-dates">February 6-8, 2026</p>
      </div>

      {/* Live Now Banner */}
      {livePlayer && (
        <button
          onClick={() => router.push(`/players/${livePlayer.id}`)}
          className="card card-live p-5 w-full text-left"
        >
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
        </button>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => router.push('/schedule')}
          className="stat-card"
        >
          <div className="stat-icon">
            <CalendarIcon size={28} className="mx-auto text-[var(--panini-yellow)]" />
          </div>
          <div className="stat-value">{players.filter(p => p.schedule).length}</div>
          <div className="stat-label">Players</div>
        </button>
        <button
          onClick={() => router.push('/checklist')}
          className="stat-card"
        >
          <div className="stat-icon">
            <CheckIcon size={28} className="mx-auto text-[var(--status-live)]" />
          </div>
          <div className="stat-value">{checklistComplete}/{checklistTotal}</div>
          <div className="stat-label">Tasks</div>
        </button>
        <button
          onClick={() => router.push('/deliverables')}
          className="stat-card"
        >
          <div className="stat-icon">
            <ClipboardIcon size={28} className="mx-auto text-[var(--panini-red)]" />
          </div>
          <div className="stat-value">{deliverablesComplete}/{deliverablesTotal}</div>
          <div className="stat-label">Deliverables</div>
        </button>
      </div>

      {/* Upcoming Players */}
      <div>
        <div className="section-header">
          <span className="section-title">Coming Up</span>
          <button
            onClick={() => router.push('/schedule')}
            className="text-sm font-semibold text-[var(--panini-yellow)]"
          >
            View All →
          </button>
        </div>
        <div className="space-y-3">
          {upcomingPlayers.length === 0 ? (
            <div className="card p-6 text-center text-[var(--foreground-muted)]">
              No upcoming appearances
            </div>
          ) : (
            upcomingPlayers.map(player => {
              const status = getScheduleStatus(player.schedule);
              return (
                <button
                  key={player.id}
                  onClick={() => router.push(`/players/${player.id}`)}
                  className="schedule-card w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="player-name truncate">{player.name}</span>
                        <span className={`badge badge-${player.category.toLowerCase()}`}>
                          {player.category}
                        </span>
                      </div>
                      <div className="player-details">
                        {player.position} • {player.team}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      {player.schedule && (
                        <>
                          <div className="time-display">
                            {formatTime(player.schedule.startTime)}
                          </div>
                          <div className="text-sm text-[var(--foreground-dim)]">
                            {player.schedule.day}
                          </div>
                          {status === 'upcoming' && (
                            <div className="countdown text-base mt-1">
                              {getTimeUntil(player.schedule)}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => router.push('/players')}
          className="card p-5 flex items-center gap-4"
        >
          <UsersIcon size={24} className="text-[var(--panini-yellow)]" />
          <span className="font-semibold text-base">Player Info</span>
        </button>
        <button
          onClick={() => router.push('/checklist')}
          className="card p-5 flex items-center gap-4"
        >
          <CheckIcon size={24} className="text-[var(--status-live)]" />
          <span className="font-semibold text-base">Checklist</span>
        </button>
      </div>
    </div>
  );
}
