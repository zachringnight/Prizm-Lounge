'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import {
  Station,
  STATIONS,
  CommitmentType,
  COMMITMENT_TYPES,
  getScheduleStatus
} from '@/types';
import { useToast } from '@/components/Toast';

interface StationData {
  station: Station;
  status: 'active' | 'idle' | 'setup';
  currentPlayer: string | null;
  currentCommitment: CommitmentType | null;
  notes: string;
}

const STATION_DESCRIPTIONS: Record<Station, string> = {
  'LED Wall': 'LED Wall content capture (capacity: 1)',
  'Signing': 'Autograph station (unlimited capacity)',
  'PR Interview': 'PR/Media interview area (capacity: 1)',
  'Pack Rips': 'Pack rip content station (capacity: 1)',
  'Free': 'Buffer/break time (no physical station)'
};

export default function StationsPage() {
  const { players } = useAppStore();
  const { ToastComponent } = useToast();
  const [, setTick] = useState(0);

  // Initialize station data
  const [stationData, setStationData] = useState<StationData[]>(
    STATIONS.map(station => ({
      station,
      status: 'idle',
      currentPlayer: null,
      currentCommitment: null,
      notes: ''
    }))
  );

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

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
      <header>
        <h1 className="text-2xl font-bold mb-1">Stations</h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Manage activation stations
        </p>
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
              <div key={p.id} className="flex items-center justify-between">
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-[var(--status-live)]">LIVE NOW</span>
              </div>
            ))}
            {upcomingPlayers.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <span className="font-medium text-[var(--foreground-muted)]">{p.name}</span>
                <span className="text-xs text-[var(--panini-yellow)]">UP NEXT</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Station Cards */}
      <div className="space-y-4">
        {stationData.map(data => (
          <div
            key={data.station}
            className="card p-4"
            style={{
              borderColor: data.status === 'active' ? 'var(--status-live)' : undefined
            }}
          >
            {/* Station Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{data.station}</h3>
                <p className="text-xs text-[var(--foreground-dim)]">
                  {STATION_DESCRIPTIONS[data.station]}
                </p>
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: getStatusColor(data.status),
                  color: data.status === 'idle' ? 'white' : 'var(--background)'
                }}
              >
                {getStatusLabel(data.status)}
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex gap-2 mb-3">
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
            <div className="mb-3">
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

            {/* Commitment Type */}
            <div className="mb-3">
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
        ))}
      </div>

      {ToastComponent}
    </div>
  );
}
