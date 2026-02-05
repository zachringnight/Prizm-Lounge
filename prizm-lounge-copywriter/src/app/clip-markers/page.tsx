'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { Station, ClipMarker, formatClipTimestamp, STATION_ICONS } from '@/types';
import { useToast } from '@/components/Toast';

type ViewMode = 'timeline' | 'by-station' | 'by-athlete';

// Format date for grouping
function formatDateGroup(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

// Export clip markers to JSON
function exportToJSON(markers: ClipMarker[]): void {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalMarkers: markers.length,
    markers: markers.map(m => ({
      id: m.id,
      timestamp: new Date(m.timestamp).toISOString(),
      station: m.station,
      playerId: m.playerId,
      playerName: m.playerName,
      note: m.note || null,
      markedBy: m.markedBy || null
    }))
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clip-markers-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export clip markers to CSV
function exportToCSV(markers: ClipMarker[]): void {
  const headers = ['Timestamp', 'Time', 'Station', 'Player ID', 'Player Name', 'Note', 'Marked By'];
  const rows = markers.map(m => [
    new Date(m.timestamp).toISOString(),
    formatClipTimestamp(m.timestamp),
    m.station,
    m.playerId || '',
    m.playerName || '',
    (m.note || '').replace(/"/g, '""'),
    m.markedBy || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clip-markers-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ClipMarkersPage() {
  const router = useRouter();
  const {
    clipMarkers,
    deleteClipMarker,
    updateClipMarkerNote,
    clearAllClipMarkers,
    getAllClipMarkers
  } = useAppStore();
  const { showToast, ToastComponent } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allMarkers = useMemo(() => getAllClipMarkers(), [clipMarkers]);

  // Group markers by station
  const markersByStation = useMemo(() => {
    const grouped = new Map<Station, ClipMarker[]>();
    allMarkers.forEach(marker => {
      const existing = grouped.get(marker.station) || [];
      grouped.set(marker.station, [...existing, marker]);
    });
    return grouped;
  }, [allMarkers]);

  // Group markers by athlete
  const markersByAthlete = useMemo(() => {
    const grouped = new Map<string, { name: string; markers: ClipMarker[] }>();

    allMarkers.forEach(marker => {
      const key = marker.playerId || 'unknown';
      const name = marker.playerName || 'Unknown Player';
      const existing = grouped.get(key);
      if (existing) {
        existing.markers.push(marker);
      } else {
        grouped.set(key, { name, markers: [marker] });
      }
    });

    return grouped;
  }, [allMarkers]);

  // Group markers by date for timeline view
  const markersByDate = useMemo(() => {
    const grouped = new Map<string, ClipMarker[]>();
    allMarkers.forEach(marker => {
      const dateKey = formatDateGroup(marker.timestamp);
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, marker]);
    });
    return grouped;
  }, [allMarkers]);

  const handleDeleteMarker = useCallback((markerId: string) => {
    deleteClipMarker(markerId);
    showToast('Clip marker deleted', 'info');
  }, [deleteClipMarker, showToast]);

  const handleEditNote = useCallback((marker: ClipMarker) => {
    setEditingNoteId(marker.id);
    setNoteText(marker.note || '');
  }, []);

  const handleSaveNote = useCallback(() => {
    if (editingNoteId) {
      updateClipMarkerNote(editingNoteId, noteText);
      setEditingNoteId(null);
      setNoteText('');
      showToast('Note saved', 'success');
    }
  }, [editingNoteId, noteText, updateClipMarkerNote, showToast]);

  const handleCancelNote = useCallback(() => {
    setEditingNoteId(null);
    setNoteText('');
  }, []);

  const handleExportJSON = useCallback(() => {
    exportToJSON(allMarkers);
    showToast('Exported as JSON', 'success');
  }, [allMarkers, showToast]);

  const handleExportCSV = useCallback(() => {
    exportToCSV(allMarkers);
    showToast('Exported as CSV', 'success');
  }, [allMarkers, showToast]);

  const handleClearAll = useCallback(() => {
    clearAllClipMarkers();
    setShowClearConfirm(false);
    showToast('All clip markers cleared', 'info');
  }, [clearAllClipMarkers, showToast]);

  // Render individual marker item
  const renderMarkerItem = (marker: ClipMarker, showStation = true, showPlayer = true) => (
    <div key={marker.id} className="clip-marker-item">
      <div className="clip-marker-item-main">
        <div className="clip-marker-item-time">{formatClipTimestamp(marker.timestamp)}</div>
        <div className="clip-marker-item-meta">
          {showPlayer && marker.playerName && (
            <span className="clip-marker-item-player">{marker.playerName}</span>
          )}
          {showStation && (
            <span className="clip-marker-item-station">
              {STATION_ICONS[marker.station]} {marker.station}
            </span>
          )}
        </div>
        {marker.note && (
          <div className="clip-marker-item-note">&quot;{marker.note}&quot;</div>
        )}
      </div>
      <div className="clip-marker-item-actions">
        <button
          onClick={() => handleEditNote(marker)}
          className="clip-marker-action-btn"
          title="Add/Edit Note"
          aria-label="Add or edit note"
        >
          📝
        </button>
        <button
          onClick={() => handleDeleteMarker(marker.id)}
          className="clip-marker-action-btn delete"
          title="Delete"
          aria-label="Delete marker"
        >
          🗑️
        </button>
      </div>
    </div>
  );

  return (
    <main className="flex-1 p-4 pb-24 md:pb-8">
      <div className="clip-markers-page">
        {/* Header */}
        <div className="clip-markers-header">
          <div>
            <h1>Clip Markers</h1>
            <p className="clip-markers-count">
              <strong>{allMarkers.length}</strong> markers saved
            </p>
          </div>
          <div className="clip-markers-controls">
            {allMarkers.length > 0 && (
              <>
                <button onClick={handleExportJSON} className="clip-markers-export-btn">
                  📤 JSON
                </button>
                <button onClick={handleExportCSV} className="clip-markers-export-btn">
                  📊 CSV
                </button>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="clip-markers-clear-btn"
                >
                  🗑️ Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="clip-markers-view-toggle">
          <button
            onClick={() => setViewMode('timeline')}
            className={`clip-markers-view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode('by-station')}
            className={`clip-markers-view-btn ${viewMode === 'by-station' ? 'active' : ''}`}
          >
            By Station
          </button>
          <button
            onClick={() => setViewMode('by-athlete')}
            className={`clip-markers-view-btn ${viewMode === 'by-athlete' ? 'active' : ''}`}
          >
            By Athlete
          </button>
        </div>

        {/* Content */}
        {allMarkers.length === 0 ? (
          <div className="clip-markers-empty">
            <div className="clip-markers-empty-icon">🎬</div>
            <h3>No Clip Markers Yet</h3>
            <p>
              Go to the Stations page and press the &quot;Mark Clip&quot; button when you capture a great moment!
            </p>
            <button
              onClick={() => router.push('/stations')}
              className="btn btn-primary mt-4"
            >
              Go to Stations
            </button>
          </div>
        ) : (
          <div className="clip-markers-list">
            {/* Timeline View */}
            {viewMode === 'timeline' && (
              <>
                {Array.from(markersByDate.entries()).map(([dateLabel, markers]) => (
                  <div key={dateLabel} className="clip-marker-group">
                    <div className="clip-marker-group-header">
                      <span className="clip-marker-group-title">
                        <span className="clip-marker-group-icon">📅</span>
                        {dateLabel}
                      </span>
                      <span className="clip-marker-group-count">{markers.length}</span>
                    </div>
                    <div className="clip-marker-group-items">
                      {markers.map(marker => renderMarkerItem(marker))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* By Station View */}
            {viewMode === 'by-station' && (
              <>
                {Array.from(markersByStation.entries()).map(([station, markers]) => (
                  <div key={station} className="clip-marker-group">
                    <div className="clip-marker-group-header">
                      <span className="clip-marker-group-title">
                        <span className="clip-marker-group-icon">{STATION_ICONS[station]}</span>
                        {station}
                      </span>
                      <span className="clip-marker-group-count">{markers.length}</span>
                    </div>
                    <div className="clip-marker-group-items">
                      {markers.map(marker => renderMarkerItem(marker, false, true))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* By Athlete View */}
            {viewMode === 'by-athlete' && (
              <>
                {Array.from(markersByAthlete.entries()).map(([playerId, { name, markers }]) => (
                  <div key={playerId} className="clip-marker-group">
                    <div className="clip-marker-group-header">
                      <button
                        onClick={() => playerId !== 'unknown' && router.push(`/players/${playerId}`)}
                        className="clip-marker-group-title"
                        style={{ background: 'none', border: 'none', cursor: playerId !== 'unknown' ? 'pointer' : 'default' }}
                      >
                        <span className="clip-marker-group-icon">🏈</span>
                        {name}
                      </button>
                      <span className="clip-marker-group-count">{markers.length}</span>
                    </div>
                    <div className="clip-marker-group-items">
                      {markers.map(marker => renderMarkerItem(marker, true, false))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Edit Note Modal */}
        {editingNoteId && (
          <div className="clip-marker-note-modal" onClick={handleCancelNote}>
            <div className="clip-marker-note-content" onClick={e => e.stopPropagation()}>
              <div className="clip-marker-note-header">
                <h3>Add Note</h3>
                <button onClick={handleCancelNote} className="clip-marker-note-close">
                  ✕
                </button>
              </div>
              <div className="clip-marker-note-body">
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Describe the clip (e.g., 'Great answer about rookie season')"
                  autoFocus
                />
                <div className="clip-marker-note-actions">
                  <button onClick={handleCancelNote} className="clip-marker-note-cancel">
                    Cancel
                  </button>
                  <button onClick={handleSaveNote} className="clip-marker-note-save">
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clear All Confirmation Modal */}
        {showClearConfirm && (
          <div className="clip-marker-note-modal" onClick={() => setShowClearConfirm(false)}>
            <div className="clip-marker-note-content" onClick={e => e.stopPropagation()}>
              <div className="clip-marker-note-header">
                <h3>Clear All Markers?</h3>
                <button onClick={() => setShowClearConfirm(false)} className="clip-marker-note-close">
                  ✕
                </button>
              </div>
              <div className="clip-marker-note-body">
                <p style={{ marginBottom: '16px', color: 'var(--foreground-muted)' }}>
                  This will delete all {allMarkers.length} clip markers. This action cannot be undone.
                </p>
                <div className="clip-marker-note-actions">
                  <button onClick={() => setShowClearConfirm(false)} className="clip-marker-note-cancel">
                    Cancel
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="clip-marker-note-save"
                    style={{ background: 'var(--error)' }}
                  >
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {ToastComponent}
      </div>
    </main>
  );
}
