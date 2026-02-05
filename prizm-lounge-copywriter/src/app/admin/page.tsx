'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/store';
import { formatTime } from '@/types';

type AdminTab = 'settings' | 'schedule' | 'data';

export default function AdminPage() {
  const {
    players,
    largeTextMode,
    toggleLargeTextMode,
    notificationsEnabled,
    setNotificationsEnabled,
    notificationSound,
    setNotificationSound,
    issueNotes,
    clipMarkers,
    clearAllClipMarkers,
    clearResolvedIssues
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('settings');
  const [showClearClipsConfirm, setShowClearClipsConfirm] = useState(false);
  const [showClearNotesConfirm, setShowClearNotesConfirm] = useState(false);

  // Get players with schedules
  const scheduledPlayers = players.filter(p => p.schedule).sort((a, b) => {
    if (!a.schedule || !b.schedule) return 0;
    const dayOrder = { 'Thursday': 0, 'Friday': 1, 'Saturday': 2 };
    const dayDiff = dayOrder[a.schedule.day] - dayOrder[b.schedule.day];
    if (dayDiff !== 0) return dayDiff;
    return a.schedule.startTime.localeCompare(b.schedule.startTime);
  });

  const handleClearClips = useCallback(() => {
    clearAllClipMarkers();
    setShowClearClipsConfirm(false);
  }, [clearAllClipMarkers]);

  const handleClearNotes = useCallback(() => {
    clearResolvedIssues();
    setShowClearNotesConfirm(false);
  }, [clearResolvedIssues]);

  const handleRequestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, [setNotificationsEnabled]);

  const exportData = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      clipMarkers,
      issueNotes,
      playersCount: players.length,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prizm-lounge-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [clipMarkers, issueNotes, players.length]);

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <h1>Admin Settings</h1>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button
          className={`admin-tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
        <button
          className={`admin-tab ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          Data
        </button>
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <>
          {/* Display Settings */}
          <div className="admin-section">
            <div className="admin-section-title">
              Display Settings
            </div>

            <div className="admin-setting">
              <div className="admin-setting-info">
                <span className="admin-setting-title">Large Text Mode</span>
                <span className="admin-setting-desc">Increase text size for better readability</span>
              </div>
              <button
                className={`toggle-switch ${largeTextMode ? 'active' : ''}`}
                onClick={toggleLargeTextMode}
                aria-label="Toggle large text mode"
              />
            </div>
          </div>

          {/* Notification Settings */}
          <div className="admin-section">
            <div className="admin-section-title">
              Notifications
            </div>

            <div className="admin-setting">
              <div className="admin-setting-info">
                <span className="admin-setting-title">Push Notifications</span>
                <span className="admin-setting-desc">Get notified about schedule changes</span>
              </div>
              <button
                className={`toggle-switch ${notificationsEnabled ? 'active' : ''}`}
                onClick={() => {
                  if (!notificationsEnabled) {
                    handleRequestNotificationPermission();
                  } else {
                    setNotificationsEnabled(false);
                  }
                }}
                aria-label="Toggle notifications"
              />
            </div>

            <div className="admin-setting">
              <div className="admin-setting-info">
                <span className="admin-setting-title">Sound Alerts</span>
                <span className="admin-setting-desc">Play sounds for timer and notifications</span>
              </div>
              <button
                className={`toggle-switch ${notificationSound ? 'active' : ''}`}
                onClick={() => setNotificationSound(!notificationSound)}
                aria-label="Toggle sound alerts"
              />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="admin-section admin-danger-zone">
            <div className="admin-section-title" style={{ color: 'var(--error)' }}>
              Danger Zone
            </div>

            <div className="admin-setting">
              <div className="admin-setting-info">
                <span className="admin-setting-title">Clear All Clip Markers</span>
                <span className="admin-setting-desc">{clipMarkers.length} markers will be deleted</span>
              </div>
              <button
                className="admin-danger-btn"
                onClick={() => setShowClearClipsConfirm(true)}
                disabled={clipMarkers.length === 0}
              >
                Clear Clips
              </button>
            </div>

            <div className="admin-setting">
              <div className="admin-setting-info">
                <span className="admin-setting-title">Clear Resolved Notes</span>
                <span className="admin-setting-desc">
                  {issueNotes.filter(n => n.status === 'resolved').length} resolved notes
                </span>
              </div>
              <button
                className="admin-danger-btn"
                onClick={() => setShowClearNotesConfirm(true)}
                disabled={issueNotes.filter(n => n.status === 'resolved').length === 0}
              >
                Clear Resolved
              </button>
            </div>
          </div>
        </>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="admin-section">
          <div className="admin-section-title">
            Player Schedule Overview
          </div>

          {scheduledPlayers.length === 0 ? (
            <p style={{ color: 'var(--foreground-muted)', textAlign: 'center', padding: '40px 0' }}>
              No players scheduled yet.
            </p>
          ) : (
            <div className="schedule-editor">
              {scheduledPlayers.map(player => (
                <div key={player.id} className="schedule-slot-card">
                  <div className="schedule-slot-time">
                    {player.schedule?.day.slice(0, 3)} {formatTime(player.schedule?.startTime || '')}
                  </div>
                  <div className="schedule-slot-player">
                    {player.name}
                  </div>
                  <div className="schedule-slot-station">
                    {player.schedule?.commitments?.map(c => c.station).join(', ') || 'TBD'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <>
          <div className="admin-section">
            <div className="admin-section-title">
              Data Statistics
            </div>

            <div className="admin-setting">
              <div className="admin-setting-info">
                <span className="admin-setting-title">Players</span>
                <span className="admin-setting-desc">Total players in database</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>
                {players.length}
              </span>
            </div>

            <div className="admin-setting">
              <div className="admin-setting-info">
                <span className="admin-setting-title">Scheduled Players</span>
                <span className="admin-setting-desc">Players with appearances</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>
                {scheduledPlayers.length}
              </span>
            </div>

            <div className="admin-setting">
              <div className="admin-setting-info">
                <span className="admin-setting-title">Clip Markers</span>
                <span className="admin-setting-desc">Total marked clips</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>
                {clipMarkers.length}
              </span>
            </div>

            <div className="admin-setting">
              <div className="admin-setting-info">
                <span className="admin-setting-title">Issue Notes</span>
                <span className="admin-setting-desc">Open / Total</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--foreground)' }}>
                {issueNotes.filter(n => n.status !== 'resolved').length} / {issueNotes.length}
              </span>
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section-title">
              Export Data
            </div>

            <div className="admin-setting">
              <div className="admin-setting-info">
                <span className="admin-setting-title">Export All Data</span>
                <span className="admin-setting-desc">Download as JSON file</span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={exportData}
                style={{ padding: '10px 20px', minHeight: 'auto' }}
              >
                Export
              </button>
            </div>
          </div>
        </>
      )}

      {/* Clear Clips Confirmation Modal */}
      {showClearClipsConfirm && (
        <div className="add-note-modal" onClick={() => setShowClearClipsConfirm(false)}>
          <div className="add-note-form" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="add-note-header">
              <h2>Clear All Clip Markers?</h2>
              <button
                className="add-note-close"
                onClick={() => setShowClearClipsConfirm(false)}
              >
                &times;
              </button>
            </div>
            <div className="add-note-body">
              <p style={{ color: 'var(--foreground-muted)', marginBottom: '16px' }}>
                This will permanently delete all {clipMarkers.length} clip markers.
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowClearClipsConfirm(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="admin-danger-btn"
                  onClick={handleClearClips}
                  style={{ flex: 1 }}
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Notes Confirmation Modal */}
      {showClearNotesConfirm && (
        <div className="add-note-modal" onClick={() => setShowClearNotesConfirm(false)}>
          <div className="add-note-form" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="add-note-header">
              <h2>Clear Resolved Notes?</h2>
              <button
                className="add-note-close"
                onClick={() => setShowClearNotesConfirm(false)}
              >
                &times;
              </button>
            </div>
            <div className="add-note-body">
              <p style={{ color: 'var(--foreground-muted)', marginBottom: '16px' }}>
                This will delete {issueNotes.filter(n => n.status === 'resolved').length} resolved notes.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowClearNotesConfirm(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="admin-danger-btn"
                  onClick={handleClearNotes}
                  style={{ flex: 1 }}
                >
                  Clear Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
