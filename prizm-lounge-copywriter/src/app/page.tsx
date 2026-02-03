'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { players } from '@/data/players';
import DateTimeDisplay from '@/components/DateTimeDisplay';
import { EVENT_CONFIG, DAY_STYLES, VIEW_MODES, ViewMode, STATIONS, CATEGORY_STYLES } from '@/lib/constants';
import {
  getCurrentPlayer,
  getNextPlayer,
  getDayStats,
  getScheduledPlayers,
  formatTimeDisplay,
  formatCountdown,
  getTimeRemaining,
  isPlayerCurrent,
} from '@/lib/schedule-utils';
import { SparklesIcon, HistoryIcon, GridIcon, SettingsIcon, SearchIcon, TypeIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import { getPlayerQuestions } from '@/data/players';

export default function Home() {
  const router = useRouter();
  const { setSearchOpen } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>('now');
  const [largeTextMode, setLargeTextMode] = useState(false);
  const [dayFilter, setDayFilter] = useState<'all' | 'Thursday' | 'Friday' | 'Saturday'>('all');
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const [, setTick] = useState(0);

  // Update every second for real-time clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentPlayer = getCurrentPlayer();
  const nextPlayer = getNextPlayer();
  const scheduledPlayers = getScheduledPlayers();

  const filteredPlayers = useMemo(() => {
    if (dayFilter === 'all') return scheduledPlayers;
    return scheduledPlayers.filter(p => p.schedule?.day === dayFilter);
  }, [scheduledPlayers, dayFilter]);

  const togglePlayerExpanded = (playerId: string) => {
    setExpandedPlayers(prev => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedPlayers(new Set(filteredPlayers.map(p => p.id)));
  };

  const collapseAll = () => {
    setExpandedPlayers(new Set());
  };

  // Get stats for all days
  const thursdayStats = getDayStats('Thursday');
  const fridayStats = getDayStats('Friday');
  const saturdayStats = getDayStats('Saturday');
  const totalStats = {
    completed: thursdayStats.completed + fridayStats.completed + saturdayStats.completed,
    remaining: thursdayStats.remaining + fridayStats.remaining + saturdayStats.remaining,
    total: thursdayStats.total + fridayStats.total + saturdayStats.total,
  };

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#2a2a2a] -mx-4 md:-mx-8 lg:-mx-12 px-4 md:px-8 lg:px-12 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg md:text-xl font-bold">
              <span className="text-[var(--panini-red)]">PANINI</span>{' '}
              <span className="text-[var(--panini-yellow)]">CREW APP</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-400">{EVENT_CONFIG.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLargeTextMode(!largeTextMode)}
              className={`p-2 rounded-lg transition-colors ${
                largeTextMode ? 'bg-[var(--panini-yellow)]/20 text-[var(--panini-yellow)]' : 'hover:bg-[#2a2a2a] text-gray-400'
              }`}
              title="Toggle Large Text Mode"
            >
              <TypeIcon size={20} />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg hover:bg-[#2a2a2a] text-gray-400 transition-colors"
              title="Search (Cmd+K)"
            >
              <SearchIcon size={20} />
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
          {VIEW_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                viewMode === mode.id
                  ? 'bg-[var(--panini-yellow)]/20 text-[var(--panini-yellow)]'
                  : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-300'
              }`}
            >
              <span>{mode.icon}</span>
              <span className="hidden md:inline">{mode.label}</span>
              <span className="md:hidden">{mode.shortLabel}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="py-6">
        {/* LIVE NOW VIEW */}
        {viewMode === 'now' && (
          <div className="space-y-6">
            {/* Real-time Clock */}
            <DateTimeDisplay className="py-4" />

            {/* Current Player */}
            {currentPlayer ? (
              <div className="space-y-4">
                <button
                  onClick={() => router.push(`/players/${currentPlayer.id}`)}
                  className="card w-full text-left p-5 border-2 border-[var(--panini-yellow)] bg-[var(--panini-yellow)]/5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="status-dot live animate-pulse-live scale-125" />
                    <span className="text-sm font-bold text-[var(--panini-yellow)] tracking-wide">NOW AT STATION</span>
                    <span className="ml-auto text-2xl font-mono font-bold text-[var(--panini-yellow)]">
                      {formatCountdown(getTimeRemaining(currentPlayer))}
                    </span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--panini-red)] flex items-center justify-center text-2xl font-bold text-white">
                      {currentPlayer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{currentPlayer.name}</h3>
                      <p className="text-gray-400">{currentPlayer.position} • {currentPlayer.team}</p>
                      {currentPlayer.schedule && (
                        <p className="text-sm text-gray-500 mt-1">
                          {formatTimeDisplay(currentPlayer.schedule.startTime)} - {formatTimeDisplay(currentPlayer.schedule.endTime)}
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${CATEGORY_STYLES[currentPlayer.category].bg} ${CATEGORY_STYLES[currentPlayer.category].text}`}>
                      {currentPlayer.category}
                    </span>
                  </div>
                </button>

                {/* Up Next */}
                {nextPlayer && (
                  <button
                    onClick={() => router.push(`/players/${nextPlayer.id}`)}
                    className="card w-full text-left p-4 border border-blue-500/30 hover:border-blue-500/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Up Next</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400">
                        {nextPlayer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{nextPlayer.name}</h4>
                        <p className="text-sm text-gray-500">{nextPlayer.position} • {nextPlayer.team}</p>
                      </div>
                      {nextPlayer.schedule && (
                        <div className="text-right">
                          <p className="font-mono font-medium">{formatTimeDisplay(nextPlayer.schedule.startTime)}</p>
                          <p className="text-xs text-gray-500">{nextPlayer.schedule.day}</p>
                        </div>
                      )}
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <div className="text-4xl mb-3">⏳</div>
                <h3 className="text-xl font-bold mb-2">No Active Session</h3>
                <p className="text-gray-400">
                  {nextPlayer
                    ? `Next: ${nextPlayer.name} at ${nextPlayer.schedule ? formatTimeDisplay(nextPlayer.schedule.startTime) : 'TBD'}`
                    : 'Check the schedule for upcoming sessions'}
                </p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{totalStats.completed}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Completed</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">{totalStats.remaining}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Remaining</div>
              </div>
              <div className="card p-4 text-center">
                <div className="text-2xl font-bold text-gray-300">{totalStats.total}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
              </div>
            </div>

            {/* Station Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Stations</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {STATIONS.filter(s => s.id !== 'free').map(station => (
                  <div key={station.id} className="card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{station.icon}</span>
                      <span className="font-medium">{station.shortName}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{station.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Crew Tools */}
            <div className="pt-4 border-t border-[#2a2a2a]">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Crew Tools</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => router.push('/generate')}
                  className="card p-4 flex flex-col items-center gap-2 text-center hover:border-[var(--panini-red)] transition-colors"
                >
                  <SparklesIcon size={24} className="text-[var(--panini-red)]" />
                  <span className="text-sm font-medium">Content Generator</span>
                </button>
                <button
                  onClick={() => router.push('/recap')}
                  className="card p-4 flex flex-col items-center gap-2 text-center hover:border-[var(--panini-yellow)] transition-colors"
                >
                  <HistoryIcon size={24} className="text-[var(--panini-yellow)]" />
                  <span className="text-sm font-medium">Day Recap</span>
                </button>
                <button
                  onClick={() => router.push('/tracking')}
                  className="card p-4 flex flex-col items-center gap-2 text-center hover:border-gray-500 transition-colors"
                >
                  <GridIcon size={24} className="text-gray-400" />
                  <span className="text-sm font-medium">Content Tracking</span>
                </button>
                <button
                  onClick={() => router.push('/admin')}
                  className="card p-4 flex flex-col items-center gap-2 text-center hover:border-gray-500 transition-colors"
                >
                  <SettingsIcon size={24} className="text-gray-400" />
                  <span className="text-sm font-medium">Admin</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCHEDULE VIEW */}
        {viewMode === 'schedule' && (
          <div className="space-y-4">
            {/* Day Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setDayFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  dayFilter === 'all' ? 'bg-[var(--panini-yellow)]/20 text-[var(--panini-yellow)]' : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
                }`}
              >
                All Days
              </button>
              {(['Thursday', 'Friday', 'Saturday'] as const).map(day => (
                <button
                  key={day}
                  onClick={() => setDayFilter(day)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    dayFilter === day
                      ? `${DAY_STYLES[day].badgeBg} ${DAY_STYLES[day].badgeText}`
                      : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
                  }`}
                >
                  {DAY_STYLES[day].emoji} {day}
                </button>
              ))}
            </div>

            {/* Schedule List */}
            <div className="space-y-2">
              {filteredPlayers.map(player => {
                const isCurrent = isPlayerCurrent(player);
                const dayStyle = player.schedule ? DAY_STYLES[player.schedule.day] : DAY_STYLES.Thursday;

                return (
                  <button
                    key={player.id}
                    onClick={() => router.push(`/players/${player.id}`)}
                    className={`card w-full text-left p-4 transition-all ${
                      isCurrent
                        ? 'border-2 border-[var(--panini-yellow)] bg-[var(--panini-yellow)]/5'
                        : `${dayStyle.borderColor} hover:${dayStyle.borderColorHover}`
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCurrent ? 'bg-[var(--panini-yellow)]/20 text-[var(--panini-yellow)]' : 'bg-[#2a2a2a] text-gray-300'
                      }`}>
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{player.name}</h3>
                          {isCurrent && (
                            <span className="flex items-center gap-1 text-xs font-medium text-[var(--panini-yellow)]">
                              <span className="w-2 h-2 rounded-full bg-[var(--panini-yellow)] animate-pulse" />
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{player.position} • {player.team}</p>
                      </div>
                      <div className="text-right">
                        {player.schedule && (
                          <>
                            <p className="font-mono font-medium">{formatTimeDisplay(player.schedule.startTime)}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${dayStyle.badgeBg} ${dayStyle.badgeText}`}>
                              {dayStyle.label}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STATION TOOL VIEW */}
        {viewMode === 'station' && (
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[#1a1a1a] text-gray-300 hover:bg-[#2a2a2a]"
                >
                  Collapse All
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                <button
                  onClick={() => setDayFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                    dayFilter === 'all' ? 'bg-[var(--panini-yellow)]/20 text-[var(--panini-yellow)]' : 'bg-[#1a1a1a] text-gray-400'
                  }`}
                >
                  All
                </button>
                {(['Thursday', 'Friday', 'Saturday'] as const).map(day => (
                  <button
                    key={day}
                    onClick={() => setDayFilter(day)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                      dayFilter === day
                        ? `${DAY_STYLES[day].badgeBg} ${DAY_STYLES[day].badgeText}`
                        : 'bg-[#1a1a1a] text-gray-400'
                    }`}
                  >
                    {DAY_STYLES[day].emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Collapsible Player Cards */}
            <div className="space-y-3">
              {filteredPlayers.map(player => {
                const isExpanded = expandedPlayers.has(player.id);
                const isCurrent = isPlayerCurrent(player);
                const dayStyle = player.schedule ? DAY_STYLES[player.schedule.day] : DAY_STYLES.Thursday;
                const questions = getPlayerQuestions(player.id);

                return (
                  <div
                    key={player.id}
                    className={`card overflow-hidden transition-all ${
                      isCurrent
                        ? 'border-2 border-[var(--panini-yellow)]'
                        : dayStyle.borderColor
                    }`}
                  >
                    {/* Header (always visible) */}
                    <button
                      onClick={() => togglePlayerExpanded(player.id)}
                      className="w-full p-4 text-left flex items-center gap-4"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        isCurrent ? 'bg-[var(--panini-yellow)]/20 text-[var(--panini-yellow)]' : 'bg-[#2a2a2a] text-gray-300'
                      }`}>
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-bold ${largeTextMode ? 'text-lg' : 'text-base'}`}>{player.name}</h3>
                          {isCurrent && (
                            <span className="flex items-center gap-1 text-xs font-medium text-[var(--panini-yellow)]">
                              <span className="w-2 h-2 rounded-full bg-[var(--panini-yellow)] animate-pulse" />
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className={`text-gray-500 ${largeTextMode ? 'text-base' : 'text-sm'}`}>
                          {player.position} • {player.team}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {player.schedule && (
                            <>
                              <span className="text-xs text-gray-400 font-mono">
                                {formatTimeDisplay(player.schedule.startTime)}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${dayStyle.badgeBg} ${dayStyle.badgeText}`}>
                                {dayStyle.label}
                              </span>
                            </>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_STYLES[player.category].bg} ${CATEGORY_STYLES[player.category].text}`}>
                            {player.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-gray-400">
                        {isExpanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-[#2a2a2a] pt-4 space-y-4">
                        {/* Background */}
                        {player.personalDetails && player.personalDetails.length > 0 && (
                          <div>
                            <h4 className={`font-semibold text-gray-300 mb-2 ${largeTextMode ? 'text-base' : 'text-sm'}`}>Background</h4>
                            <ul className={`space-y-1 text-gray-400 ${largeTextMode ? 'text-base' : 'text-sm'}`}>
                              {player.personalDetails.slice(0, 3).map((detail, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-gray-600">•</span>
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Talking Points */}
                        {player.paniniContentBeats && player.paniniContentBeats.length > 0 && (
                          <div>
                            <h4 className={`font-semibold text-gray-300 mb-2 ${largeTextMode ? 'text-base' : 'text-sm'}`}>Talking Points</h4>
                            <ul className={`space-y-1 text-gray-400 ${largeTextMode ? 'text-base' : 'text-sm'}`}>
                              {player.paniniContentBeats.slice(0, 3).map((point, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-[var(--panini-yellow)]">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Questions */}
                        {questions && (
                          <div className="space-y-4">
                            {/* Signing Questions */}
                            {questions.signing && questions.signing.length > 0 && (
                              <div>
                                <h4 className={`font-semibold text-[var(--panini-yellow)] mb-2 flex items-center gap-2 ${largeTextMode ? 'text-base' : 'text-sm'}`}>
                                  Signing Questions
                                </h4>
                                <ol className={`space-y-2 ${largeTextMode ? 'text-base' : 'text-sm'}`}>
                                  {questions.signing.map((q, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                      <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-[var(--panini-yellow)]/20 text-[var(--panini-yellow)] flex items-center justify-center text-xs font-bold ${largeTextMode ? 'w-7 h-7' : ''}`}>
                                        {i + 1}
                                      </span>
                                      <span className="text-gray-300">{q}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {/* Pack Rips Questions */}
                            {questions.packRips && questions.packRips.length > 0 && (
                              <div>
                                <h4 className={`font-semibold text-[var(--panini-red)] mb-2 flex items-center gap-2 ${largeTextMode ? 'text-base' : 'text-sm'}`}>
                                  Pack Rips Questions
                                </h4>
                                <ol className={`space-y-2 ${largeTextMode ? 'text-base' : 'text-sm'}`}>
                                  {questions.packRips.map((q, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                      <span className={`flex-shrink-0 w-6 h-6 rounded-full bg-[var(--panini-red)]/20 text-[var(--panini-red)] flex items-center justify-center text-xs font-bold ${largeTextMode ? 'w-7 h-7' : ''}`}>
                                        {i + 1}
                                      </span>
                                      <span className="text-gray-300">{q}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>
                        )}

                        {/* View Full Profile */}
                        <button
                          onClick={() => router.push(`/players/${player.id}`)}
                          className="w-full py-2 text-sm font-medium text-[var(--panini-yellow)] hover:underline"
                        >
                          View Full Profile
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PLAYERS VIEW */}
        {viewMode === 'players' && (
          <div className="space-y-4">
            {/* Day Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setDayFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  dayFilter === 'all' ? 'bg-[var(--panini-yellow)]/20 text-[var(--panini-yellow)]' : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
                }`}
              >
                All Players
              </button>
              {(['Thursday', 'Friday', 'Saturday'] as const).map(day => (
                <button
                  key={day}
                  onClick={() => setDayFilter(day)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    dayFilter === day
                      ? `${DAY_STYLES[day].badgeBg} ${DAY_STYLES[day].badgeText}`
                      : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#2a2a2a]'
                  }`}
                >
                  {DAY_STYLES[day].emoji} {day}
                </button>
              ))}
            </div>

            {/* Player Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(dayFilter === 'all' ? players : players.filter(p => p.schedule?.day === dayFilter)).map(player => {
                const dayStyle = player.schedule ? DAY_STYLES[player.schedule.day] : null;

                return (
                  <button
                    key={player.id}
                    onClick={() => router.push(`/players/${player.id}`)}
                    className={`card p-4 text-left transition-all hover:bg-[#1a1a1a] ${
                      dayStyle ? `${dayStyle.borderColor} ${dayStyle.borderColorHover}` : 'border-[#2a2a2a]'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-full bg-[#2a2a2a] flex items-center justify-center text-lg font-bold text-gray-300 flex-shrink-0">
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-base truncate">{player.name}</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{player.position} • {player.team}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {dayStyle && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dayStyle.badgeBg} ${dayStyle.badgeText}`}>
                              {dayStyle.label}
                            </span>
                          )}
                          {player.schedule && (
                            <span className="text-xs text-gray-500">{formatTimeDisplay(player.schedule.startTime)}</span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_STYLES[player.category].bg} ${CATEGORY_STYLES[player.category].text}`}>
                            {player.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    {player.keyStats && player.keyStats[0] && (
                      <p className="text-sm text-gray-500 mt-3 line-clamp-2">{player.keyStats[0]}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
