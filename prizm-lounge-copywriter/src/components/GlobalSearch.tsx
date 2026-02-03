'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { getScheduleStatus, formatTime, Player } from '@/types';
import { SearchIcon, XIcon } from './Icons';

export default function GlobalSearch() {
  const router = useRouter();
  const { players, searchOpen: isOpen, setSearchOpen: setIsOpen } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Filter players based on search query
  const filteredPlayers = query.trim()
    ? players.filter(player => {
        const searchLower = query.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.team.toLowerCase().includes(searchLower) ||
          player.position.toLowerCase().includes(searchLower) ||
          player.category.toLowerCase().includes(searchLower)
        );
      })
    : [];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle navigation within results
  const handleKeyNavigation = useCallback((e: React.KeyboardEvent) => {
    if (filteredPlayers.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < filteredPlayers.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev > 0 ? prev - 1 : filteredPlayers.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPlayers[selectedIndex]) {
        navigateToPlayer(filteredPlayers[selectedIndex]);
      }
    }
  }, [filteredPlayers, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && filteredPlayers.length > 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, filteredPlayers.length]);

  const navigateToPlayer = (player: Player) => {
    router.push(`/players/${player.id}`);
    setIsOpen(false);
  };

  const getStatusBadge = (player: Player) => {
    const status = getScheduleStatus(player.schedule);
    if (status === 'live') {
      return <span className="badge bg-[var(--status-live)] text-white ml-2">LIVE</span>;
    }
    if (status === 'upcoming') {
      return <span className="badge bg-[var(--panini-yellow)] text-black ml-2">UP NEXT</span>;
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div
      className="command-palette-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="command-palette">
        {/* Search Header */}
        <div className="command-palette-header">
          <SearchIcon size={20} className="text-[var(--foreground-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyNavigation}
            placeholder="Search players by name, team, or position..."
            className="command-palette-input"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="command-palette-close"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="command-palette-results" ref={resultsRef}>
          {query.trim() === '' ? (
            <div className="command-palette-empty">
              <p className="text-[var(--foreground-muted)]">
                Type to search players...
              </p>
              <p className="text-sm text-[var(--foreground-dim)] mt-2">
                Search by name, team, or position
              </p>
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="command-palette-empty">
              <p className="text-[var(--foreground-muted)]">
                No players found for "{query}"
              </p>
            </div>
          ) : (
            filteredPlayers.map((player, index) => (
              <button
                key={player.id}
                onClick={() => navigateToPlayer(player)}
                className={`command-palette-item ${index === selectedIndex ? 'selected' : ''}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="avatar w-10 h-10 text-sm flex-shrink-0">
                    {player.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{player.name}</span>
                      <span className={`badge badge-${player.category.toLowerCase()}`}>
                        {player.category}
                      </span>
                      {getStatusBadge(player)}
                    </div>
                    <div className="text-sm text-[var(--foreground-muted)]">
                      {player.position} • {player.team}
                    </div>
                  </div>
                </div>
                {player.schedule && (
                  <div className="text-right text-sm flex-shrink-0">
                    <div className="text-[var(--foreground-muted)]">
                      {player.schedule.day}
                    </div>
                    <div className="text-[var(--foreground-dim)]">
                      {formatTime(player.schedule.startTime)}
                    </div>
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="command-palette-footer">
          <div className="flex items-center gap-4 text-xs text-[var(--foreground-dim)]">
            <span><kbd>↑↓</kbd> Navigate</span>
            <span><kbd>Enter</kbd> Select</span>
            <span><kbd>Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
