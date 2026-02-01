'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, useContentGaps } from '@/store';
import { ContentMode } from '@/types';
import { AlertIcon, CheckIcon, DownloadIcon, HistoryIcon } from '@/components/Icons';
import { useToast } from '@/components/Toast';

const ALL_MODES: ContentMode[] = [
  'Player Spotlight',
  'Pack Reveal / Hit',
  'Signing Session',
  'Legend Tribute',
  'Current Star Hype',
  'Event Promo',
  'Behind the Scenes',
  'Day Recap'
];

export default function TrackingPage() {
  const router = useRouter();
  const {
    players,
    contentTracking,
    generatedContent,
    setSelectedPlayer,
    setSelectedMode
  } = useAppStore();
  const contentGaps = useContentGaps();
  const { showToast, ToastComponent } = useToast();

  // Calculate stats
  const stats = useMemo(() => {
    const totalPosts = contentTracking.length;
    const uniquePlayers = new Set(contentTracking.map(t => t.playerId)).size;
    const todayPosts = contentTracking.filter(t => {
      const today = new Date();
      const postDate = new Date(t.usedAt);
      return postDate.toDateString() === today.toDateString();
    }).length;

    return { totalPosts, uniquePlayers, todayPosts };
  }, [contentTracking]);

  // Export session history
  const handleExport = () => {
    const history = generatedContent.map(gc => ({
      timestamp: new Date(gc.createdAt).toISOString(),
      player: gc.playerName,
      mode: gc.mode,
      platform: gc.platform,
      cardType: gc.cardType || '',
      product: gc.product || '',
      variations: gc.variations.map(v => ({
        label: v.label,
        content: v.content,
        used: v.used
      }))
    }));

    const csv = [
      ['Timestamp', 'Player', 'Mode', 'Platform', 'Card Type', 'Product', 'Variation', 'Content', 'Used'].join(','),
      ...history.flatMap(h =>
        h.variations.map(v =>
          [
            h.timestamp,
            `"${h.player}"`,
            `"${h.mode}"`,
            h.platform,
            h.cardType,
            h.product,
            v.label,
            `"${v.content.replace(/"/g, '""')}"`,
            v.used
          ].join(',')
        )
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prizm-lounge-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('History exported', 'success');
  };

  const handleGapClick = (playerId: string, mode: ContentMode) => {
    setSelectedPlayer(playerId);
    setSelectedMode(mode);
    router.push('/');
  };

  // Build tracking grid
  const trackingGrid = useMemo(() => {
    return players.map(player => {
      const playerTracking = contentTracking.filter(t => t.playerId === player.id);
      const modesUsed = new Set(playerTracking.map(t => t.mode));

      // Filter modes by player category
      const relevantModes = ALL_MODES.filter(mode => {
        if (mode === 'Legend Tribute' && player.category !== 'Legend') return false;
        if (mode === 'Current Star Hype' && player.category !== 'Current') return false;
        return true;
      });

      return {
        player,
        modes: relevantModes.map(mode => ({
          mode,
          used: modesUsed.has(mode)
        }))
      };
    });
  }, [players, contentTracking]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-1">Content Tracking</h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Track your coverage and find content gaps
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-[var(--panini-yellow)]">{stats.todayPosts}</div>
          <div className="text-xs text-[var(--foreground-muted)]">Today</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-[var(--panini-red)]">{stats.totalPosts}</div>
          <div className="text-xs text-[var(--foreground-muted)]">Total Posts</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold">{stats.uniquePlayers}</div>
          <div className="text-xs text-[var(--foreground-muted)]">Players</div>
        </div>
      </div>

      {/* Content Gaps Alert */}
      {contentGaps.length > 0 && (
        <div className="card p-4 border-[var(--warning)]">
          <div className="flex items-center gap-2 mb-3">
            <AlertIcon size={18} className="text-[var(--warning)]" />
            <span className="font-semibold text-[var(--warning)]">Content Gaps</span>
          </div>
          <div className="space-y-2">
            {contentGaps.slice(0, 3).map(({ player, unusedModes }) => (
              <div key={player.id} className="text-sm">
                <span className="text-[var(--foreground)]">{player.name}</span>
                <span className="text-[var(--foreground-muted)]"> needs: </span>
                {unusedModes.slice(0, 2).map((mode, i) => (
                  <button
                    key={mode}
                    onClick={() => handleGapClick(player.id, mode)}
                    className="text-[var(--panini-yellow)] hover:underline"
                  >
                    {mode}{i < Math.min(unusedModes.length, 2) - 1 ? ', ' : ''}
                  </button>
                ))}
                {unusedModes.length > 2 && (
                  <span className="text-[var(--foreground-dim)]"> +{unusedModes.length - 2}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracking Grid */}
      <div>
        <div className="section-header">
          <span className="section-title">Player x Mode Grid</span>
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="min-w-[600px] space-y-2">
            {trackingGrid.map(({ player, modes }) => (
              <div key={player.id} className="flex items-center gap-2">
                <div className="w-32 truncate text-sm font-medium">{player.name}</div>
                <div className="flex gap-1 flex-1">
                  {modes.map(({ mode, used }) => (
                    <button
                      key={mode}
                      onClick={() => handleGapClick(player.id, mode)}
                      className={`w-8 h-8 rounded flex items-center justify-center transition-colors
                        ${used
                          ? 'bg-[var(--status-live)] text-white'
                          : 'bg-[var(--background-tertiary)] text-[var(--foreground-dim)] hover:bg-[var(--background-secondary)]'
                        }`}
                      title={mode}
                    >
                      {used ? <CheckIcon size={14} /> : <span className="text-xs">{mode[0]}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 text-xs text-[var(--foreground-dim)]">
          P = Spotlight, H = Hit, S = Signing, L = Legend, C = Current, E = Event, B = BTS, D = Recap
        </div>
      </div>

      {/* Recent History */}
      <div>
        <div className="section-header">
          <span className="section-title">Recent Activity</span>
          <button onClick={handleExport} className="btn btn-secondary gap-2 !py-2 !px-3">
            <DownloadIcon size={16} />
            Export
          </button>
        </div>

        {generatedContent.length === 0 ? (
          <div className="empty-state">
            <HistoryIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>No content generated yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {generatedContent.slice(0, 10).map(gc => {
              const usedVariation = gc.variations.find(v => v.used);
              return (
                <div key={gc.id} className="card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{gc.playerName}</span>
                    <span className="text-xs text-[var(--foreground-dim)]">
                      {new Date(gc.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                    <span>{gc.mode}</span>
                    <span>•</span>
                    <span>{gc.platform}</span>
                    {usedVariation && (
                      <>
                        <span>•</span>
                        <span className="text-[var(--status-live)]">Used {usedVariation.label}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {ToastComponent}
    </div>
  );
}
