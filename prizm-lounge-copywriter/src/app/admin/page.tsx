'use client';

import { useState } from 'react';
import { useAppStore } from '@/store';
import { Player, AppearanceSchedule } from '@/types';
import {
  PlusIcon,
  TrashIcon,
  SaveIcon,
  DownloadIcon,
  CalendarIcon,
  UsersIcon,
  HistoryIcon,
  SparklesIcon,
  GridIcon
} from '@/components/Icons';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

type AdminTab = 'schedule' | 'players' | 'data' | 'tools';

export default function AdminPage() {
  const router = useRouter();
  const {
    players,
    updatePlayerSchedule,
    generatedContent,
    contentTracking,
    notes,
    templates
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('schedule');
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState<Partial<AppearanceSchedule>>({});
  const { showToast, ToastComponent } = useToast();

  const handleScheduleEdit = (player: Player) => {
    setEditingPlayer(player.id);
    if (player.schedule) {
      setScheduleForm({
        day: player.schedule.day,
        date: player.schedule.date,
        startTime: player.schedule.startTime,
        endTime: player.schedule.endTime
      });
    } else {
      setScheduleForm({
        day: 'Thursday',
        date: 'Feb 6',
        startTime: '10:00',
        endTime: '11:00'
      });
    }
  };

  const handleScheduleSave = (playerId: string) => {
    if (scheduleForm.day && scheduleForm.startTime && scheduleForm.endTime) {
      const dateMap: Record<string, string> = {
        'Thursday': 'Feb 6',
        'Friday': 'Feb 7',
        'Saturday': 'Feb 8'
      };

      updatePlayerSchedule(playerId, {
        day: scheduleForm.day as 'Thursday' | 'Friday' | 'Saturday',
        date: dateMap[scheduleForm.day],
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime
      });

      setEditingPlayer(null);
      showToast('Schedule updated', 'success');
    }
  };

  const handleClearSchedule = (playerId: string) => {
    updatePlayerSchedule(playerId, null);
    setEditingPlayer(null);
    showToast('Schedule cleared', 'info');
  };

  const handleExportAllData = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      players: players,
      generatedContent: generatedContent,
      contentTracking: contentTracking,
      notes: notes,
      templates: templates
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prizm-lounge-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Data exported', 'success');
  };

  const tabs: { id: AdminTab; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'schedule', label: 'Schedule', icon: CalendarIcon },
    { id: 'players', label: 'Players', icon: UsersIcon },
    { id: 'data', label: 'Data', icon: HistoryIcon },
    { id: 'tools', label: 'Tools', icon: SparklesIcon }
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-1">Admin</h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Manage schedule, players, and data
        </p>
      </header>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--foreground-muted)]">
            Edit player appearance times. Changes are saved automatically.
          </p>

          {players.map(player => (
            <div key={player.id} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold">{player.name}</div>
                  <div className="text-sm text-[var(--foreground-muted)]">
                    {player.position} - {player.team}
                  </div>
                </div>
                <span className={`badge badge-${player.category.toLowerCase()}`}>
                  {player.category}
                </span>
              </div>

              {editingPlayer === player.id ? (
                <div className="space-y-3 pt-3 border-t border-[var(--background-tertiary)]">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-[var(--foreground-muted)]">Day</label>
                      <select
                        value={scheduleForm.day || ''}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value as any })}
                        className="input select mt-1"
                      >
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--foreground-muted)]">Start</label>
                      <input
                        type="time"
                        value={scheduleForm.startTime || ''}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                        className="input mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[var(--foreground-muted)]">End</label>
                      <input
                        type="time"
                        value={scheduleForm.endTime || ''}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                        className="input mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleScheduleSave(player.id)}
                      className="btn btn-primary flex-1 gap-2"
                    >
                      <SaveIcon size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => handleClearSchedule(player.id)}
                      className="btn btn-secondary"
                    >
                      <TrashIcon size={16} />
                    </button>
                    <button
                      onClick={() => setEditingPlayer(null)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-3 border-t border-[var(--background-tertiary)]">
                  {player.schedule ? (
                    <div className="text-sm">
                      <span className="font-medium">{player.schedule.day}</span>
                      <span className="text-[var(--foreground-muted)]">
                        {' '}{player.schedule.startTime} - {player.schedule.endTime}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--foreground-dim)]">No schedule set</span>
                  )}
                  <button
                    onClick={() => handleScheduleEdit(player)}
                    className="btn btn-secondary !py-2 !px-3"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div className="space-y-4">
          <div className="card p-4 border-[var(--warning)]">
            <p className="text-sm text-[var(--foreground-muted)]">
              Player database is pre-configured with confirmed roster. To add new players,
              edit the <code className="text-[var(--panini-yellow)]">src/data/players.ts</code> file.
            </p>
          </div>

          <div className="section-header">
            <span className="section-title">Current Roster ({players.length})</span>
          </div>

          <div className="space-y-2">
            {players.map(player => (
              <div key={player.id} className="card p-3 flex items-center justify-between">
                <div>
                  <span className="font-medium">{player.name}</span>
                  <span className="text-sm text-[var(--foreground-muted)] ml-2">
                    {player.position}
                  </span>
                </div>
                <span className={`badge badge-${player.category.toLowerCase()}`}>
                  {player.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <div className="text-2xl font-bold">{generatedContent.length}</div>
              <div className="text-sm text-[var(--foreground-muted)]">Generations</div>
            </div>
            <div className="card p-4">
              <div className="text-2xl font-bold">{contentTracking.length}</div>
              <div className="text-sm text-[var(--foreground-muted)]">Posts Tracked</div>
            </div>
            <div className="card p-4">
              <div className="text-2xl font-bold">{notes.length}</div>
              <div className="text-sm text-[var(--foreground-muted)]">Notes</div>
            </div>
            <div className="card p-4">
              <div className="text-2xl font-bold">{templates.length}</div>
              <div className="text-sm text-[var(--foreground-muted)]">Templates</div>
            </div>
          </div>

          <button
            onClick={handleExportAllData}
            className="btn btn-primary w-full gap-2"
          >
            <DownloadIcon size={20} />
            Export All Data
          </button>

          <div className="card p-4">
            <h3 className="font-semibold mb-2">Storage Info</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              All data is stored locally in your browser using localStorage.
              Data persists between sessions but is device-specific.
            </p>
          </div>

          <div className="card p-4 border-[var(--error)]">
            <h3 className="font-semibold mb-2 text-[var(--error)]">Danger Zone</h3>
            <p className="text-sm text-[var(--foreground-muted)] mb-3">
              Clear all stored data. This cannot be undone.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure? This will delete all your data.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="btn bg-[var(--error)] text-white hover:bg-red-700"
            >
              Clear All Data
            </button>
          </div>
        </div>
      )}

      {/* Tools Tab - Internal Tools */}
      {activeTab === 'tools' && (
        <div className="space-y-4">
          <div className="card p-4 border-[var(--panini-yellow)]">
            <p className="text-sm text-[var(--foreground-muted)]">
              Internal tools for the Panini team. These are hidden from the client-facing navigation.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/generate')}
              className="card p-4 w-full text-left flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--panini-red)] flex items-center justify-center">
                <SparklesIcon size={24} className="text-white" />
              </div>
              <div>
                <div className="font-semibold">Content Generator</div>
                <div className="text-sm text-[var(--foreground-muted)]">
                  AI-powered social media copy generator
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/recap')}
              className="card p-4 w-full text-left flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--panini-yellow)] flex items-center justify-center">
                <HistoryIcon size={24} className="text-black" />
              </div>
              <div>
                <div className="font-semibold">Day Recap</div>
                <div className="text-sm text-[var(--foreground-muted)]">
                  Generate end-of-day summary posts
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/tracking')}
              className="card p-4 w-full text-left flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--background-tertiary)] flex items-center justify-center">
                <GridIcon size={24} className="text-[var(--foreground-muted)]" />
              </div>
              <div>
                <div className="font-semibold">Content Tracking</div>
                <div className="text-sm text-[var(--foreground-muted)]">
                  Track coverage and find content gaps
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/stations')}
              className="card p-4 w-full text-left flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-[var(--background-tertiary)] flex items-center justify-center">
                <CalendarIcon size={24} className="text-[var(--foreground-muted)]" />
              </div>
              <div>
                <div className="font-semibold">Stations</div>
                <div className="text-sm text-[var(--foreground-muted)]">
                  View station status and assignments
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {ToastComponent}
    </div>
  );
}
