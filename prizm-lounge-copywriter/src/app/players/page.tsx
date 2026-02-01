'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import PlayerCard from '@/components/PlayerCard';
import { SearchIcon } from '@/components/Icons';
import { PlayerCategory } from '@/types';

export default function PlayersPage() {
  const router = useRouter();
  const { players, setSelectedPlayer } = useAppStore();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PlayerCategory | 'All'>('All');

  const filteredPlayers = players.filter(player => {
    if (categoryFilter !== 'All' && player.category !== categoryFilter) {
      return false;
    }
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

  const handlePlayerClick = (playerId: string) => {
    router.push(`/players/${playerId}`);
  };

  const categories: (PlayerCategory | 'All')[] = ['All', 'Current', 'Legend', 'Prospect'];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-1">Players</h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          {players.length} players confirmed
        </p>
      </header>

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
            {cat !== 'All' && (
              <span className="text-xs ml-1 opacity-50">
                ({players.filter(p => p.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Player List */}
      <div className="space-y-3">
        {filteredPlayers.length === 0 ? (
          <div className="empty-state">
            <p>No players found</p>
          </div>
        ) : (
          filteredPlayers.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              onClick={() => handlePlayerClick(player.id)}
              showSchedule
              showContentGaps
            />
          ))
        )}
      </div>
    </div>
  );
}
