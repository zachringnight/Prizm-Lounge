'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import {
  Station,
  STATIONS,
  CommitmentType,
  COMMITMENT_TYPES,
  getScheduleStatus,
  formatTime
} from '@/types';
import { useToast } from '@/components/Toast';
import { ChevronDownIcon, ChevronUpIcon, ChevronRightIcon } from '@/components/Icons';

interface StationData {
  station: Station;
  status: 'active' | 'idle' | 'setup';
  currentPlayer: string | null;
  currentCommitment: CommitmentType | null;
  notes: string;
  expanded: boolean;
}

const STATION_DESCRIPTIONS: Record<Station, string> = {
  'LED Wall': 'LED Wall content capture station (capacity: 1)',
  'Signing': 'Autograph station for fan signings',
  'PR Interview': 'PR/Media interview area (capacity: 1)',
  'Pack Rips': 'Pack rip content station (capacity: 1)',
  'Free': 'Buffer/break time (no station)'
};

export default function StationsPage() {
  const router = useRouter();
  const { players } = useAppStore();
  const { showToast, ToastComponent } = useToast();
  const [, setTick] = useState(0);

  // Initialize station data
  const [stationData, setStationData] = useState<StationData[]>(
    STATIONS.map((station, index) => ({
      station,
      status: 'idle',
      currentPlayer: null,
      currentCommitment: null,
      notes: '',
      expanded: index === 0 // Auto-expand first station
    }))
  );

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-expand station with live player
  useEffect(() => {
    const livePlayers = players.filter(p => getScheduleStatus(p.schedule) === 'live');
    if (livePlayers.length > 0) {
      setStationData(prev =>
        prev.map(s => ({
          ...s,
          expanded: s.currentPlayer && livePlayers.some(p => p.id === s.currentPlayer) ? true : s.expanded
        }))
      );
    }
  }, [players]);

  const updateStation = (
    station: Station,
    updates: Partial<StationData>
  ) => {
    setStationData(prev =>
      prev.map(s =>
        s.station === station ? { ...s, ...updates } : s
      )
    );
  };

  const toggleStation = (station: Station) => {
    setStationData(prev =>
      prev.map(s =>
        s.station === station ? { ...s, expanded: !s.expanded } : s
      )
    );
  };

  const expandAll = () => {
    setStationData(prev => prev.map(s => ({ ...s, expanded: true })));
  };

  const collapseAll = () => {
    setStationData(prev => prev.map(s => ({ ...s, expanded: false })));
  };

  const allExpanded = stationData.every(s => s.expanded);
  const allCollapsed = stationData.every(s => !s.expanded);

  const getStatusColor = (status: 'active' | 'idle' | 'setup') => {
    switch (status) {
      case 'active': return 'var(--status-live)';
      case 'setup': return 'var(--panini-yellow)';
      case 'idle': return 'var(--foreground-dim)';
    }
  };

  const getStatusLabel = (status: 'active' | 'idle' | 'setup') => {
    switch (status) {
      case 'active': return 'LIVE';
      case 'setup': return 'SETUP';
      case 'idle': return 'IDLE';
    }
  };

  // Find currently live players
  const livePlayers = players.filter(p => getScheduleStatus(p.schedule) === 'live');
  const upcomingPlayers = players.filter(p => getScheduleStatus(p.schedule) === 'upcoming');

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Stations</h1>
          <p className="text-sm text-[var(--foreground-muted)]">
            Manage activation stations
          </p>
        </div>
        <button
          onClick={allExpanded ? collapseAll : expandAll}
          className="expand-collapse-all"
        >
          {allExpanded ? (
            <>
              <ChevronUpIcon size={16} />
              <span>Collapse All</span>
            </>
          ) : (
            <>
              <ChevronDownIcon size={16} />
              <span>Expand All</span>
            </>
          )}
        </button>
      </header>

      {/* Quick Status */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card p-3 text-center">
          <div className="text-lg font-bold text-[var(--status-live)]">
            {stationData.filter(s => s.status === 'active').length}
          </div>
          <div className="text-xs text-[var(--foreground-muted)]">Active</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-lg font-bold text-[var(--panini-yellow)]">
            {stationData.filter(s => s.status === 'setup').length}
          </div>
          <div className="text-xs text-[var(--foreground-muted)]">Setup</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-lg font-bold">
            {stationData.filter(s => s.status === 'idle').length}
          </div>
          <div className="text-xs text-[var(--foreground-muted)]">Idle</div>
        </div>
      </div>

      {/* Live/Upcoming Players Quick Reference */}
      {(livePlayers.length > 0 || upcomingPlayers.length > 0) && (
        <div className="card p-4">
          <div className="text-xs font-semibold text-[var(--foreground-muted)] uppercase mb-2">
            Currently On-Site
          </div>
          <div className="space-y-2">
            {livePlayers.map(p => (
              <button
                key={p.id}
                onClick={() => router.push(`/players/${p.id}`)}
                className="flex items-center justify-between w-full p-2 -mx-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
              >
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-[var(--status-live)]">LIVE NOW</span>
              </button>
            ))}
            {upcomingPlayers.map(p => (
              <button
                key={p.id}
                onClick={() => router.push(`/players/${p.id}`)}
                className="flex items-center justify-between w-full p-2 -mx-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
              >
                <span className="font-medium text-[var(--foreground-muted)]">{p.name}</span>
                <span className="text-xs text-[var(--panini-yellow)]">UP NEXT</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Station Cards */}
      <div className="space-y-3">
        {stationData.map(data => {
          const assignedPlayer = data.currentPlayer
            ? players.find(p => p.id === data.currentPlayer)
            : null;

          return (
            <div key={data.station}>
              {/* Station Header - Clickable */}
              <button
                onClick={() => toggleStation(data.station)}
                className={`station-header w-full ${data.expanded ? 'expanded' : ''}`}
                style={{
                  borderColor: data.status === 'active' ? 'var(--status-live)' : undefined
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getStatusColor(data.status) }}
                  />
                  <div className="text-left">
                    <h3 className="font-semibold text-base">{data.station}</h3>
                    {!data.expanded && assignedPlayer && (
                      <p className="text-sm text-[var(--foreground-muted)]">
                        {assignedPlayer.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: getStatusColor(data.status),
                      color: data.status === 'idle' ? 'white' : 'var(--background)'
                    }}
                  >
                    {getStatusLabel(data.status)}
                  </div>
                  {data.expanded ? (
                    <ChevronUpIcon size={20} className="text-[var(--foreground-muted)]" />
                  ) : (
                    <ChevronDownIcon size={20} className="text-[var(--foreground-muted)]" />
                  )}
                </div>
              </button>

              {/* Station Content - Expandable */}
              {data.expanded && (
                <div className="station-content">
                  <p className="text-xs text-[var(--foreground-dim)] mb-4">
                    {STATION_DESCRIPTIONS[data.station]}
                  </p>

                  {/* Status Toggle */}
                  <div className="flex gap-2 mb-4">
                    {(['idle', 'setup', 'active'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => updateStation(data.station, { status })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                          ${data.status === status
                            ? 'bg-[var(--background-tertiary)] text-[var(--foreground)]'
                            : 'bg-transparent text-[var(--foreground-dim)]'
                          }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Player Assignment */}
                  <div className="mb-4">
                    <label className="text-xs text-[var(--foreground-muted)] mb-1 block">
                      Current Player
                    </label>
                    <select
                      value={data.currentPlayer || ''}
                      onChange={(e) => updateStation(data.station, {
                        currentPlayer: e.target.value || null
                      })}
                      className="input select"
                    >
                      <option value="">None assigned</option>
                      {players.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Show player info if assigned */}
                  {assignedPlayer && (
                    <button
                      onClick={() => router.push(`/players/${assignedPlayer.id}`)}
                      className="mb-4 p-3 bg-[var(--background)] rounded-lg w-full text-left hover:bg-[var(--background-tertiary)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="avatar w-10 h-10 text-sm">
                          {assignedPlayer.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{assignedPlayer.name}</div>
                          <div className="text-sm text-[var(--foreground-muted)]">
                            {assignedPlayer.position} • {assignedPlayer.team}
                          </div>
                        </div>
                        <div className="text-[var(--foreground-dim)]">
                          <ChevronRightIcon size={18} />
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Commitment Type */}
                  <div className="mb-4">
                    <label className="text-xs text-[var(--foreground-muted)] mb-1 block">
                      Activity
                    </label>
                    <select
                      value={data.currentCommitment || ''}
                      onChange={(e) => updateStation(data.station, {
                        currentCommitment: (e.target.value as CommitmentType) || null
                      })}
                      className="input select"
                    >
                      <option value="">Select activity...</option>
                      {COMMITMENT_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs text-[var(--foreground-muted)] mb-1 block">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={data.notes}
                      onChange={(e) => updateStation(data.station, { notes: e.target.value })}
                      placeholder="e.g., 200 autos remaining, ESPN at 3pm..."
                      className="input"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {ToastComponent}
    </div>
  );
}
