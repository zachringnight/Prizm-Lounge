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
    <div className="space-y-8">
      <header className="page-header">
        <h1>Players</h1>
        <p>{players.length} confirmed appearances</p>
      </header>

      {/* Search */}
      <div className="relative">
        <SearchIcon
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground-dim)]"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search players..."
          className="input pl-12 text-base"
        />
      </div>

      {/* Category Filter */}
      <div className="tabs-enhanced">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`tab-enhanced ${categoryFilter === cat ? 'active' : ''}`}
          >
            {cat}
            {cat !== 'All' && (
              <span className="text-sm ml-1 opacity-60">
                ({players.filter(p => p.category === cat).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Player List */}
      <div className="space-y-4">
        {filteredPlayers.length === 0 ? (
          <div className="empty-state">
            <p className="text-lg">No players found</p>
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
