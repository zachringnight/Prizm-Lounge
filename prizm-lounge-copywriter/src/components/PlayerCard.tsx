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
      <div className="flex items-center gap-2">
        <div className={`status-dot ${status}`} />
        {status === 'live' && (
          <span className="text-xs font-semibold text-[var(--status-live)] animate-pulse-live">
            LIVE NOW
          </span>
        )}
        {status === 'upcoming' && timeUntil && (
          <span className="text-xs font-semibold countdown">
            {timeUntil}
          </span>
        )}
        {status === 'scheduled' && (
          <span className="text-xs text-[var(--foreground-muted)]">
            {player.schedule.day} {formatTime(player.schedule.startTime)}
          </span>
        )}
        {status === 'completed' && (
          <span className="text-xs text-[var(--foreground-dim)]">Completed</span>
        )}
      </div>
    );
  };

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`player-card ${selected ? 'selected' : ''} w-full text-left`}
      >
        <div className="avatar">{getInitials(player.name)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{player.name}</span>
            {getCategoryBadge()}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">
            {player.position} - {player.team}
          </div>
        </div>
        {showSchedule && getStatusIndicator()}
        <ChevronRightIcon size={20} className="text-[var(--foreground-dim)]" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`player-card ${selected ? 'selected' : ''} w-full text-left flex-col items-start gap-3`}
    >
      <div className="flex items-center gap-3 w-full">
        <div className="avatar">{getInitials(player.name)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{player.name}</span>
            {getCategoryBadge()}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">
            {player.position} - {player.team}
          </div>
        </div>
      </div>

      {showSchedule && player.schedule && (
        <div className="w-full pt-2 border-t border-[var(--background-tertiary)]">
          {getStatusIndicator()}
        </div>
      )}

      {showContentGaps && unusedModes.length > 0 && unusedModes.length < 8 && (
        <div className="w-full pt-2 border-t border-[var(--background-tertiary)]">
          <div className="text-xs text-[var(--foreground-dim)] mb-1">Content needed:</div>
          <div className="flex flex-wrap gap-1">
            {unusedModes.slice(0, 3).map(mode => (
              <span key={mode} className="text-xs px-2 py-0.5 bg-[var(--background-tertiary)] rounded-full text-[var(--panini-yellow)]">
                {mode}
              </span>
            ))}
            {unusedModes.length > 3 && (
              <span className="text-xs px-2 py-0.5 bg-[var(--background-tertiary)] rounded-full text-[var(--foreground-muted)]">
                +{unusedModes.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </button>
  );
}
