'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { getScheduleStatus, getTimeUntil, formatTime, Player, AppearanceSchedule } from '@/types';
import { CalendarIcon, UsersIcon, LayersIcon, ChevronRightIcon, ClockIcon, CheckIcon } from '@/components/Icons';

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

export default function Home() {
  const router = useRouter();
  const { players, playerArrivals, markPlayerArrived, markPlayerDeparted } = useAppStore();
  const [, setTick] = useState(0);

  // Update every 30 seconds for countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Find live/upcoming players
  const livePlayer = players.find(p => getScheduleStatus(p.schedule) === 'live');
  const upcomingPlayers = players
    .filter(p => getScheduleStatus(p.schedule) === 'upcoming')
    .sort((a, b) => {
      if (!a.schedule || !b.schedule) return 0;
      return a.schedule.startTime.localeCompare(b.schedule.startTime);
    });

  const nextPlayer = upcomingPlayers[0];

  // Today's remaining schedule
  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const eventDays = ['Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[now.getDay()];
  const isEventDay = eventDays.includes(currentDayName);

  const todaySchedule = players
    .filter(p => {
      if (!p.schedule) return false;
      const status = getScheduleStatus(p.schedule);
      if (status === 'completed') return false;
      return isEventDay ? p.schedule.day === currentDayName : true;
    })
    .sort((a, b) => {
      if (!a.schedule || !b.schedule) return 0;
      const dayOrder: Record<string, number> = { 'Thursday': 0, 'Friday': 1, 'Saturday': 2 };
      const dayDiff = (dayOrder[a.schedule.day] ?? 0) - (dayOrder[b.schedule.day] ?? 0);
      if (dayDiff !== 0) return dayDiff;
      return a.schedule.startTime.localeCompare(b.schedule.startTime);
    })
    .slice(0, 6);

  // Check arrival status
  const hasArrived = (playerId: string): boolean => {
    return playerArrivals.some(a => a.playerId === playerId && !a.departedAt);
  };

  const handleArrival = (player: Player) => {
    if (hasArrived(player.id)) {
      markPlayerDeparted(player.id);
    } else {
      markPlayerArrived(player.id);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            <span className="text-[var(--panini-red)]">Prizm</span>{' '}
            <span className="text-[var(--panini-yellow)]">Lounge</span>
          </h1>
          <p className="dashboard-subtitle">Super Bowl LX • Feb 6-8</p>
        </div>
      </div>

      {/* Live Player - Most Prominent */}
      {livePlayer && (
        <div className="live-card">
          <div className="live-card-header">
            <div className="live-indicator">
              <div className="status-dot live animate-pulse-live" />
              <span>LIVE NOW</span>
            </div>
            {livePlayer.schedule && (
              <span className="live-until">
                until {formatTime(livePlayer.schedule.endTime)}
              </span>
            )}
          </div>
          <button
            onClick={() => router.push(`/players/${livePlayer.id}`)}
            className="live-card-content"
          >
            <div className="avatar">{livePlayer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
            <div className="live-card-info">
              <div className="live-player-name">{livePlayer.name}</div>
              <div className="live-player-details">
                {livePlayer.position} • {livePlayer.team}
              </div>
            </div>
            <ChevronRightIcon size={20} className="text-[var(--foreground-dim)]" />
          </button>
          <div className="live-card-actions">
            <button
              onClick={() => handleArrival(livePlayer)}
              className={`arrival-btn ${hasArrived(livePlayer.id) ? 'arrived' : ''}`}
            >
              {hasArrived(livePlayer.id) ? <CheckIcon size={16} /> : <ClockIcon size={16} />}
              {hasArrived(livePlayer.id) ? 'On Site' : 'Mark Arrived'}
            </button>
            <button
              onClick={() => router.push('/stations')}
              className="stations-btn"
            >
              <LayersIcon size={16} />
              Go to Stations
            </button>
          </div>
        </div>
      )}

      {/* Up Next - Secondary Prominence */}
      {nextPlayer && !livePlayer && (
        <button
          onClick={() => router.push(`/players/${nextPlayer.id}`)}
          className="next-card"
        >
          <div className="next-card-header">
            <div className="next-indicator">
              <div className="status-dot upcoming" />
              <span>UP NEXT</span>
            </div>
            {nextPlayer.schedule && (
              <span className="next-time">
                {formatTime(nextPlayer.schedule.startTime)}
              </span>
            )}
          </div>
          <div className="next-card-content">
            <div className="avatar">{nextPlayer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
            <div className="next-card-info">
              <div className="next-player-name">{nextPlayer.name}</div>
              <div className="next-player-details">
                {nextPlayer.position} • {nextPlayer.team}
              </div>
            </div>
            <div className={`next-countdown ${isCountdownUrgent(nextPlayer.schedule) ? 'urgent' : ''}`}>
              {getTimeUntil(nextPlayer.schedule)}
            </div>
          </div>
        </button>
      )}

      {/* Also show next when live */}
      {nextPlayer && livePlayer && (
        <button
          onClick={() => router.push(`/players/${nextPlayer.id}`)}
          className="next-inline"
        >
          <div className="next-inline-left">
            <div className="status-dot upcoming" />
            <span className="next-inline-label">NEXT</span>
            <span className="next-inline-name">{nextPlayer.name}</span>
          </div>
          <div className="next-inline-right">
            <span className="next-inline-time">
              {nextPlayer.schedule && formatTime(nextPlayer.schedule.startTime)}
            </span>
            <span className={`next-inline-countdown ${isCountdownUrgent(nextPlayer.schedule) ? 'urgent' : ''}`}>
              {getTimeUntil(nextPlayer.schedule)}
            </span>
          </div>
        </button>
      )}

      {/* Quick Actions */}
      <div className="quick-actions-grid three-col">
        <button onClick={() => router.push('/stations')} className="quick-action-card primary">
          <LayersIcon size={22} />
          <span>Stations</span>
        </button>
        <button onClick={() => router.push('/schedule')} className="quick-action-card">
          <CalendarIcon size={22} />
          <span>Schedule</span>
        </button>
        <button onClick={() => router.push('/players')} className="quick-action-card">
          <UsersIcon size={22} />
          <span>Players</span>
        </button>
      </div>

      {/* Today's Schedule Preview */}
      {todaySchedule.length > 0 && (
        <div className="schedule-preview">
          <div className="schedule-preview-header">
            <span>{isEventDay ? "Today's Schedule" : 'Coming Up'}</span>
            <button onClick={() => router.push('/schedule')}>
              View All
            </button>
          </div>
          <div className="schedule-list">
            {todaySchedule.map(player => {
              const status = getScheduleStatus(player.schedule);
              const arrived = hasArrived(player.id);

              return (
                <button
                  key={player.id}
                  onClick={() => router.push(`/players/${player.id}`)}
                  className={`schedule-item ${status === 'live' ? 'is-live' : ''}`}
                >
                  <div className="schedule-item-left">
                    <span className="schedule-time">
                      {player.schedule && formatTime(player.schedule.startTime).replace(' ', '')}
                    </span>
                    <span className="schedule-name">{player.name}</span>
                    {arrived && <CheckIcon size={12} className="schedule-arrived" />}
                  </div>
                  <div className="schedule-item-right">
                    {status === 'live' && <span className="schedule-status live">LIVE</span>}
                    {status === 'upcoming' && (
                      <span className={`schedule-countdown ${isCountdownUrgent(player.schedule) ? 'urgent' : ''}`}>
                        {getTimeUntil(player.schedule)}
                      </span>
                    )}
                    {!isEventDay && player.schedule && (
                      <span className="schedule-day">{player.schedule.day.slice(0, 3)}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!livePlayer && !nextPlayer && todaySchedule.length === 0 && (
        <div className="empty-dashboard">
          <CalendarIcon size={48} />
          <p>No scheduled appearances</p>
          <button onClick={() => router.push('/players')} className="btn btn-secondary">
            View All Players
          </button>
        </div>
      )}
    </div>
  );
}
