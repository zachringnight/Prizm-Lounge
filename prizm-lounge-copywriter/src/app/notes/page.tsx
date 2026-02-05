'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import {
  IssueCategory,
  IssuePriority,
  IssueStatus,
  Station,
  ISSUE_CATEGORIES,
  ISSUE_CATEGORY_CONFIG,
  ISSUE_PRIORITY_CONFIG,
  ISSUE_STATUS_CONFIG,
  STATIONS
} from '@/types';

// Format relative time
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function NotesPage() {
  const {
    issueNotes,
    players,
    addIssueNote,
    deleteIssueNote,
    resolveIssueNote,
    setIssueNoteStatus,
    getOpenIssueCount,
    getUrgentIssueCount,
    clearResolvedIssues
  } = useAppStore();

  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Add form state
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<IssueCategory>('general');
  const [newPriority, setNewPriority] = useState<IssuePriority>('medium');
  const [newStationId, setNewStationId] = useState<Station | ''>('');
  const [newPlayerId, setNewPlayerId] = useState<string>('');

  const openCount = getOpenIssueCount();
  const urgentCount = getUrgentIssueCount();

  // Filter notes
  const filteredNotes = useMemo(() => {
    return issueNotes.filter(note => {
      if (statusFilter !== 'all' && note.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && note.category !== categoryFilter) return false;
      return true;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [issueNotes, statusFilter, categoryFilter]);

  // Status counts
  const statusCounts = useMemo(() => {
    return {
      open: issueNotes.filter(n => n.status === 'open').length,
      'in-progress': issueNotes.filter(n => n.status === 'in-progress').length,
      resolved: issueNotes.filter(n => n.status === 'resolved').length,
    };
  }, [issueNotes]);

  const handleAddNote = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    addIssueNote({
      content: newContent.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'open',
      stationId: newStationId || undefined,
      playerId: newPlayerId || undefined,
    });

    // Reset form
    setNewContent('');
    setNewCategory('general');
    setNewPriority('medium');
    setNewStationId('');
    setNewPlayerId('');
    setShowAddForm(false);
  }, [newContent, newCategory, newPriority, newStationId, newPlayerId, addIssueNote]);

  const handleStatusChange = useCallback((noteId: string, status: IssueStatus) => {
    if (status === 'resolved') {
      resolveIssueNote(noteId);
    } else {
      setIssueNoteStatus(noteId, status);
    }
  }, [resolveIssueNote, setIssueNoteStatus]);

  const getPlayerName = (playerId?: string) => {
    if (!playerId) return null;
    const player = players.find(p => p.id === playerId);
    return player?.name || null;
  };

  return (
    <div className="notes-page">
      {/* Header */}
      <div className="notes-header">
        <h1 className="hidden md:block">Notes & Issues</h1>
        <div className="notes-stats">
          <div className="notes-stat">
            <span className="notes-stat-value">{openCount}</span>
            <span className="notes-stat-label">Open</span>
          </div>
          <div className="notes-stat urgent">
            <span className="notes-stat-value">{urgentCount}</span>
            <span className="notes-stat-label">Urgent</span>
          </div>
          <div className="notes-stat">
            <span className="notes-stat-value">{issueNotes.length}</span>
            <span className="notes-stat-label">Total</span>
          </div>
        </div>
      </div>

      {/* Filters - horizontally scrollable on mobile */}
      <div className="notes-filters notes-filters-scroll">
        {/* Status Filter */}
        <button
          onClick={() => setStatusFilter('all')}
          className={`notes-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
        >
          All <span className="notes-filter-count">({issueNotes.length})</span>
        </button>
        {(['open', 'in-progress', 'resolved'] as IssueStatus[]).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`notes-filter-btn ${statusFilter === status ? 'active' : ''}`}
          >
            {ISSUE_STATUS_CONFIG[status].label}
            <span className="notes-filter-count">({statusCounts[status]})</span>
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="notes-filters notes-filters-scroll" style={{ marginTop: '-12px' }}>
        <button
          onClick={() => setCategoryFilter('all')}
          className={`notes-filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
        >
          All
        </button>
        {ISSUE_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`notes-filter-btn ${categoryFilter === cat ? 'active' : ''}`}
          >
            {ISSUE_CATEGORY_CONFIG[cat].icon} {ISSUE_CATEGORY_CONFIG[cat].label}
          </button>
        ))}
      </div>

      {/* Clear Resolved Button */}
      {statusCounts.resolved > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={clearResolvedIssues}
            className="notes-filter-btn"
            style={{ color: 'var(--error)' }}
          >
            Clear {statusCounts.resolved} Resolved
          </button>
        </div>
      )}

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="notes-empty">
          <div className="notes-empty-icon">
            {categoryFilter !== 'all' ? ISSUE_CATEGORY_CONFIG[categoryFilter].icon : '📝'}
          </div>
          <h3>No Notes Found</h3>
          <p>
            {statusFilter === 'all' && categoryFilter === 'all'
              ? 'Add your first note using the button below.'
              : 'No notes match the current filters.'}
          </p>
        </div>
      ) : (
        <div className="notes-list">
          {filteredNotes.map(note => {
            const isExpanded = expandedNoteId === note.id;
            const categoryConfig = ISSUE_CATEGORY_CONFIG[note.category];
            const priorityConfig = ISSUE_PRIORITY_CONFIG[note.priority];
            const statusConfig = ISSUE_STATUS_CONFIG[note.status];
            const playerName = getPlayerName(note.playerId);

            return (
              <div key={note.id} className="note-card">
                <div
                  className="note-card-header"
                  onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                >
                  <div className="note-card-left">
                    <div
                      className="note-category-icon"
                      style={{ backgroundColor: `${categoryConfig.color}20`, color: categoryConfig.color }}
                    >
                      {categoryConfig.icon}
                    </div>
                    <div className="note-card-meta">
                      <span className="note-card-category" style={{ color: categoryConfig.color }}>
                        {categoryConfig.label}
                      </span>
                      <span className="note-card-time">
                        {formatRelativeTime(note.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="note-card-badges">
                    <span className={`note-priority-badge ${note.priority}`}>
                      {priorityConfig.label}
                    </span>
                    <span className={`note-status-badge ${note.status}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                <div className="note-card-body">
                  <p className="note-content">{note.content}</p>

                  {/* Links */}
                  {(note.stationId || playerName) && (
                    <div className="note-card-links">
                      {note.stationId && (
                        <Link href="/stations" className="note-link">
                          @ {note.stationId}
                        </Link>
                      )}
                      {playerName && note.playerId && (
                        <Link href={`/players/${note.playerId}`} className="note-link">
                          {playerName}
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {isExpanded && (
                    <div className="note-card-actions">
                      {note.status !== 'resolved' && (
                        <>
                          {note.status === 'open' && (
                            <button
                              className="note-action-btn"
                              onClick={() => handleStatusChange(note.id, 'in-progress')}
                            >
                              Start
                            </button>
                          )}
                          <button
                            className="note-action-btn resolve"
                            onClick={() => handleStatusChange(note.id, 'resolved')}
                          >
                            Resolve
                          </button>
                        </>
                      )}
                      {note.status === 'resolved' && (
                        <button
                          className="note-action-btn"
                          onClick={() => handleStatusChange(note.id, 'open')}
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        className="note-action-btn delete"
                        onClick={() => deleteIssueNote(note.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Note FAB */}
      <button
        className="add-note-fab"
        onClick={() => setShowAddForm(true)}
        aria-label="Add note"
      >
        +
      </button>

      {/* Add Note Modal */}
      {showAddForm && (
        <div className="add-note-modal" onClick={() => setShowAddForm(false)}>
          <form
            className="add-note-form"
            onClick={e => e.stopPropagation()}
            onSubmit={handleAddNote}
          >
            <div className="add-note-header">
              <h2>Add Note</h2>
              <button
                type="button"
                className="add-note-close"
                onClick={() => setShowAddForm(false)}
              >
                &times;
              </button>
            </div>

            <div className="add-note-body">
              {/* Content */}
              <div className="add-note-field">
                <label className="add-note-label">Description</label>
                <textarea
                  className="input textarea"
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="Describe the issue or note..."
                  rows={3}
                  autoFocus
                />
              </div>

              {/* Category */}
              <div className="add-note-field">
                <label className="add-note-label">Category</label>
                <div className="add-note-categories">
                  {ISSUE_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`add-note-category-btn ${newCategory === cat ? 'selected' : ''}`}
                    >
                      {ISSUE_CATEGORY_CONFIG[cat].icon} {ISSUE_CATEGORY_CONFIG[cat].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div className="add-note-field">
                <label className="add-note-label">Priority</label>
                <div className="add-note-priorities">
                  {(['low', 'medium', 'high'] as IssuePriority[]).map(priority => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setNewPriority(priority)}
                      className={`add-note-priority-btn ${priority} ${newPriority === priority ? 'selected' : ''}`}
                    >
                      {ISSUE_PRIORITY_CONFIG[priority].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Station */}
              <div className="add-note-field">
                <label className="add-note-label">Station (Optional)</label>
                <select
                  className="input select"
                  value={newStationId}
                  onChange={e => setNewStationId(e.target.value as Station | '')}
                >
                  <option value="">No station</option>
                  {STATIONS.map(station => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </div>

              {/* Optional Player */}
              <div className="add-note-field">
                <label className="add-note-label">Player (Optional)</label>
                <select
                  className="input select"
                  value={newPlayerId}
                  onChange={e => setNewPlayerId(e.target.value)}
                >
                  <option value="">No player</option>
                  {players.map(player => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="add-note-submit"
                disabled={!newContent.trim()}
              >
                Add Note
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
