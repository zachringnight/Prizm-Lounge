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

  // For the event, map to event days
  const eventDay = currentDayName === 'Thursday' ? 'Thursday'
    : currentDayName === 'Friday' ? 'Friday'
    : currentDayName === 'Saturday' ? 'Saturday'
    : null;

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
    <div className="space-y-6">
      <header className="text-center py-4">
        <div className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-widest mb-1">
          Panini America
        </div>
        <h1 className="text-2xl font-bold">
          <span className="text-[var(--panini-red)]">Prizm</span>{' '}
          <span className="text-[var(--panini-yellow)]">Lounge</span>
        </h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Super Bowl LX • San Francisco
        </p>
        <p className="text-xs text-[var(--foreground-dim)] mt-1">
          Feb 6-8, 2026
        </p>
      </header>

      {/* Live Now Banner */}
      {livePlayer && (
        <button
          onClick={() => router.push(`/players/${livePlayer.id}`)}
          className="card p-4 border-[var(--status-live)] w-full text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="status-dot live animate-pulse-live" />
            <span className="text-sm font-semibold text-[var(--status-live)]">LIVE NOW</span>
          </div>
          <div className="font-bold text-lg">{livePlayer.name}</div>
          <div className="text-sm text-[var(--foreground-muted)]">
            {livePlayer.position} • {livePlayer.team}
          </div>
          {livePlayer.schedule && (
            <div className="text-sm text-[var(--foreground-dim)] mt-1">
              Until {formatTime(livePlayer.schedule.endTime)}
            </div>
          )}
        </button>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => router.push('/schedule')}
          className="card p-4 text-center"
        >
          <CalendarIcon size={24} className="mx-auto mb-2 text-[var(--panini-yellow)]" />
          <div className="text-2xl font-bold">{players.filter(p => p.schedule).length}</div>
          <div className="text-xs text-[var(--foreground-muted)]">Players</div>
        </button>
        <button
          onClick={() => router.push('/checklist')}
          className="card p-4 text-center"
        >
          <CheckIcon size={24} className="mx-auto mb-2 text-[var(--status-live)]" />
          <div className="text-2xl font-bold">{checklistComplete}/{checklistTotal}</div>
          <div className="text-xs text-[var(--foreground-muted)]">Checklist</div>
        </button>
        <button
          onClick={() => router.push('/deliverables')}
          className="card p-4 text-center"
        >
          <ClipboardIcon size={24} className="mx-auto mb-2 text-[var(--panini-red)]" />
          <div className="text-2xl font-bold">{deliverablesComplete}/{deliverablesTotal}</div>
          <div className="text-xs text-[var(--foreground-muted)]">Deliverables</div>
        </button>
      </div>

      {/* Upcoming Players */}
      <div>
        <div className="section-header">
          <span className="section-title">Coming Up</span>
          <button
            onClick={() => router.push('/schedule')}
            className="text-sm text-[var(--panini-yellow)]"
          >
            View All
          </button>
        </div>
        <div className="space-y-2">
          {upcomingPlayers.length === 0 ? (
            <div className="card p-4 text-center text-[var(--foreground-muted)]">
              No upcoming appearances
            </div>
          ) : (
            upcomingPlayers.map(player => {
              const status = getScheduleStatus(player.schedule);
              return (
                <button
                  key={player.id}
                  onClick={() => router.push(`/players/${player.id}`)}
                  className="card p-4 w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{player.name}</span>
                        <span className={`badge badge-${player.category.toLowerCase()}`}>
                          {player.category}
                        </span>
                      </div>
                      <div className="text-sm text-[var(--foreground-muted)]">
                        {player.position} • {player.team}
                      </div>
                    </div>
                    <div className="text-right">
                      {player.schedule && (
                        <>
                          <div className="text-sm font-semibold">
                            {formatTime(player.schedule.startTime)}
                          </div>
                          <div className="text-xs text-[var(--foreground-dim)]">
                            {player.schedule.day}
                          </div>
                          {status === 'upcoming' && (
                            <div className="countdown text-sm">
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
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push('/players')}
          className="card p-4 flex items-center gap-3"
        >
          <UsersIcon size={20} className="text-[var(--foreground-muted)]" />
          <span className="font-medium">Player Info</span>
        </button>
        <button
          onClick={() => router.push('/checklist')}
          className="card p-4 flex items-center gap-3"
        >
          <CheckIcon size={20} className="text-[var(--foreground-muted)]" />
          <span className="font-medium">Checklist</span>
        </button>
      </div>
    </div>
  );
}
