'use client';

import { Player, getScheduleStatus, getTimeUntil, formatTime } from '@/types';
import { useAppStore } from '@/store';
import { ChevronRightIcon } from './Icons';

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  showSchedule?: boolean;
  showContentGaps?: boolean;
  selected?: boolean;
  compact?: boolean;
}

export default function PlayerCard({
  player,
  onClick,
  showSchedule = false,
  showContentGaps = false,
  selected = false,
  compact = false
}: PlayerCardProps) {
  const { getUnusedModes, hasUsedMode } = useAppStore();

  const status = getScheduleStatus(player.schedule);
  const timeUntil = getTimeUntil(player.schedule);
  const unusedModes = getUnusedModes(player.id);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  const getCategoryBadge = () => {
    switch (player.category) {
      case 'Current':
        return <span className="badge badge-current">Current</span>;
      case 'Legend':
        return <span className="badge badge-legend">Legend</span>;
      case 'Prospect':
        return <span className="badge badge-prospect">Prospect</span>;
    }
  };

  const getStatusIndicator = () => {
    if (!player.schedule) return null;

    return (
      <div className="flex items-center gap-3">
        <div className={`status-dot ${status} scale-110`} />
        {status === 'live' && (
          <span className="text-sm font-bold text-[var(--status-live)] animate-pulse-live">
            LIVE NOW
          </span>
        )}
        {status === 'upcoming' && timeUntil && (
          <span className="text-sm font-semibold countdown">
            {timeUntil}
          </span>
        )}
        {status === 'scheduled' && (
          <span className="text-sm text-[var(--foreground-muted)]">
            {player.schedule.day} • {formatTime(player.schedule.startTime)}
          </span>
        )}
        {status === 'completed' && (
          <span className="text-sm text-[var(--foreground-dim)]">Completed</span>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`player-card-enhanced ${selected ? 'border-[var(--panini-yellow)]' : ''} w-full text-left`}
      >
        <div className="avatar">{getInitials(player.name)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold truncate">{player.name}</span>
            {getCategoryBadge()}
          </div>
          <div className="text-base text-[var(--foreground-muted)]">
            {player.position} • {player.team}
          </div>
        </div>
        {showSchedule && getStatusIndicator()}
        <ChevronRightIcon size={24} className="text-[var(--foreground-dim)]" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`player-card-enhanced ${selected ? 'border-[var(--panini-yellow)]' : ''} w-full text-left flex-col items-start gap-4`}
    >
      <div className="flex items-center gap-4 w-full">
        <div className="avatar">{getInitials(player.name)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <span className="text-lg font-bold">{player.name}</span>
            {getCategoryBadge()}
          </div>
          <div className="text-base text-[var(--foreground-muted)]">
            {player.position} • {player.team}
          </div>
        </div>
        <ChevronRightIcon size={24} className="text-[var(--foreground-dim)]" />
      </div>

      {showSchedule && player.schedule && (
        <div className="w-full pt-3 border-t border-[var(--background-tertiary)]">
          {getStatusIndicator()}
        </div>
      )}

      {showContentGaps && unusedModes.length > 0 && unusedModes.length < 8 && (
        <div className="w-full pt-3 border-t border-[var(--background-tertiary)]">
          <div className="text-sm text-[var(--foreground-dim)] mb-2">Content needed:</div>
          <div className="flex flex-wrap gap-2">
            {unusedModes.slice(0, 3).map(mode => (
              <span key={mode} className="text-sm px-3 py-1 bg-[var(--background-tertiary)] rounded-full text-[var(--panini-yellow)]">
                {mode}
              </span>
            ))}
            {unusedModes.length > 3 && (
              <span className="text-sm px-3 py-1 bg-[var(--background-tertiary)] rounded-full text-[var(--foreground-muted)]">
                +{unusedModes.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </button>
  );
}
