'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store';
import { PlayerCategory } from '@/types';
import PlayerCard from './PlayerCard';
import { SearchIcon } from './Icons';

interface PlayerSelectorProps {
  onSelect?: (playerId: string) => void;
}

export default function PlayerSelector({ onSelect }: PlayerSelectorProps) {
  const { players, selectedPlayerId, setSelectedPlayer } = useAppStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PlayerCategory | 'All'>('All');

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      // Category filter
      if (categoryFilter !== 'All' && player.category !== categoryFilter) {
        return false;
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          player.name.toLowerCase().includes(searchLower) ||
          player.team.toLowerCase().includes(searchLower) ||
          player.position.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [players, categoryFilter, search]);

  const handleSelect = (playerId: string) => {
    setSelectedPlayer(playerId);
    onSelect?.(playerId);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const categories: (PlayerCategory | 'All')[] = ['All', 'Current', 'Legend', 'Prospect'];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <SearchIcon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-dim)]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search players..."
          className="input pl-11"
        />
      </div>

      {/* Category Filter */}
      <div className="tabs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`tab ${categoryFilter === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Player List */}
      <div className="space-y-2">
        {filteredPlayers.length === 0 ? (
          <div className="empty-state">
            <p>No players found</p>
          </div>
        ) : (
          filteredPlayers.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              onClick={() => handleSelect(player.id)}
              selected={selectedPlayerId === player.id}
              showSchedule
              compact
            />
          ))
        )}
      </div>
    </div>
  );
}
