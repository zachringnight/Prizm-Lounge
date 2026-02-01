'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { formatTime, getScheduleStatus, ContentMode } from '@/types';
import {
  ChevronRightIcon,
  MicIcon,
  QuoteIcon,
  TrashIcon,
  PlusIcon,
  SparklesIcon
} from '@/components/Icons';
import { useToast } from '@/components/Toast';

const ALL_MODES: ContentMode[] = [
  'Player Spotlight',
  'Pack Reveal / Hit',
  'Signing Session',
  'Legend Tribute',
  'Current Star Hype',
  'Event Promo',
  'Behind the Scenes'
];

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    players,
    notes,
    contentTracking,
    addNote,
    deleteNote,
    setSelectedPlayer,
    setSelectedMode
  } = useAppStore();
  const player = players.find(p => p.id === id);
  const playerNotes = notes.filter(n => n.playerId === id).sort((a, b) => b.timestamp - a.timestamp);
  const playerTracking = contentTracking.filter(t => t.playerId === id);

  const [noteInput, setNoteInput] = useState('');
  const [isQuote, setIsQuote] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'content'>('info');
  const [isListening, setIsListening] = useState(false);
  const { showToast, ToastComponent } = useToast();

  if (!player) {
    return (
      <div className="empty-state">
        <p>Player not found</p>
        <button onClick={() => router.back()} className="btn btn-secondary mt-4">
          Go Back
        </button>
      </div>
    );
  }

  const status = getScheduleStatus(player.schedule);

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    addNote(id, noteInput.trim(), isQuote);
    setNoteInput('');
    setIsQuote(false);
    showToast(isQuote ? 'Quote saved' : 'Note saved', 'success');
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      showToast('Voice input not supported', 'error');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNoteInput(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      showToast('Voice input failed', 'error');
    };

    recognition.start();
  };

  const handleGenerateForMode = (mode: ContentMode) => {
    setSelectedPlayer(id);
    setSelectedMode(mode);
    router.push('/');
  };

  const hasUsedMode = (mode: ContentMode) => {
    return playerTracking.some(t => t.mode === mode);
  };

  // Filter modes based on player category
  const availableModes = ALL_MODES.filter(mode => {
    if (mode === 'Legend Tribute' && player.category !== 'Legend') return false;
    if (mode === 'Current Star Hype' && player.category !== 'Current') return false;
    return true;
  });

  const tabs = [
    { id: 'info' as const, label: 'Info' },
    { id: 'notes' as const, label: `Notes (${playerNotes.length})` },
    { id: 'content' as const, label: 'Content' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-start gap-4">
        <div className="avatar text-xl w-16 h-16">
          {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{player.name}</h1>
          <div className="text-[var(--foreground-muted)]">
            {player.position} - {player.team}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`badge badge-${player.category.toLowerCase()}`}>
              {player.category}
            </span>
            {status === 'live' && (
              <span className="badge bg-[var(--status-live)] text-white">LIVE</span>
            )}
          </div>
        </div>
      </header>

      {/* Schedule */}
      {player.schedule && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--foreground-muted)]">Scheduled Appearance</div>
              <div className="font-semibold">
                {player.schedule.day}, {player.schedule.date}
              </div>
              <div className="text-sm">
                {formatTime(player.schedule.startTime)} - {formatTime(player.schedule.endTime)}
              </div>
            </div>
            <div className={`status-dot ${status} scale-150`} />
          </div>
        </div>
      )}

      {/* Quick Generate Button */}
      <button
        onClick={() => handleGenerateForMode('Player Spotlight')}
        className="btn btn-primary w-full gap-2"
      >
        <SparklesIcon size={20} />
        Generate Content
      </button>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          {/* Key Stats */}
          <div>
            <h3 className="section-title mb-3">Key Stats</h3>
            <ul className="space-y-2">
              {player.keyStats.map((stat, i) => (
                <li key={i} className="text-sm text-[var(--foreground-muted)] flex items-start gap-2">
                  <span className="text-[var(--panini-yellow)]">•</span>
                  {stat}
                </li>
              ))}
            </ul>
          </div>

          {/* Defining Moments */}
          <div>
            <h3 className="section-title mb-3">Defining Moments</h3>
            <ul className="space-y-2">
              {player.definingMoments.map((moment, i) => (
                <li key={i} className="text-sm text-[var(--foreground-muted)] flex items-start gap-2">
                  <span className="text-[var(--panini-red)]">•</span>
                  {moment}
                </li>
              ))}
            </ul>
          </div>

          {/* Card History */}
          <div>
            <h3 className="section-title mb-3">Card History</h3>
            <ul className="space-y-2">
              {player.cardHistory.map((card, i) => (
                <li key={i} className="text-sm text-[var(--foreground-muted)] flex items-start gap-2">
                  <span className="text-[var(--foreground-dim)]">•</span>
                  {card}
                </li>
              ))}
            </ul>
          </div>

          {/* Personal Details */}
          <div>
            <h3 className="section-title mb-3">Personal Details</h3>
            <ul className="space-y-2">
              {player.personalDetails.map((detail, i) => (
                <li key={i} className="text-sm text-[var(--foreground-muted)] flex items-start gap-2">
                  <span className="text-[var(--foreground-dim)]">•</span>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Note Input */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setIsQuote(!isQuote)}
                className={`btn ${isQuote ? 'btn-accent' : 'btn-secondary'} gap-2`}
              >
                <QuoteIcon size={18} />
                Quote
              </button>
              <button
                onClick={handleVoiceInput}
                className={`btn ${isListening ? 'bg-[var(--panini-red)] text-white' : 'btn-secondary'}`}
              >
                <MicIcon size={18} />
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder={isQuote ? 'Enter direct quote...' : 'Add a note...'}
                className="input flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button
                onClick={handleAddNote}
                disabled={!noteInput.trim()}
                className="btn btn-primary"
              >
                <PlusIcon size={20} />
              </button>
            </div>
          </div>

          {/* Notes List */}
          {playerNotes.length === 0 ? (
            <div className="empty-state">
              <p>No notes yet</p>
              <p className="text-sm mt-1">Capture quotes and observations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {playerNotes.map(note => (
                <div key={note.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    {note.isQuote && (
                      <QuoteIcon size={16} className="text-[var(--panini-yellow)] flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm ${note.isQuote ? 'italic' : ''}`}>
                        {note.isQuote ? `"${note.content}"` : note.content}
                      </p>
                      <p className="text-xs text-[var(--foreground-dim)] mt-2">
                        {new Date(note.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        deleteNote(note.id);
                        showToast('Note deleted', 'info');
                      }}
                      className="p-2 text-[var(--foreground-dim)] hover:text-[var(--error)]"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--foreground-muted)]">
            Track which content modes you've used for {player.name}
          </p>

          <div className="space-y-2">
            {availableModes.map(mode => {
              const used = hasUsedMode(mode);
              return (
                <button
                  key={mode}
                  onClick={() => handleGenerateForMode(mode)}
                  className={`w-full p-4 rounded-xl flex items-center justify-between transition-all
                    ${used
                      ? 'bg-[var(--background-tertiary)] border border-[var(--status-live)]'
                      : 'bg-[var(--background-secondary)] border border-[var(--background-tertiary)]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${used ? 'bg-[var(--status-live)]' : 'bg-[var(--background-tertiary)]'}`} />
                    <span className={used ? 'text-[var(--foreground-muted)]' : 'text-[var(--foreground)]'}>
                      {mode}
                    </span>
                  </div>
                  {used ? (
                    <span className="text-xs text-[var(--status-live)]">Done</span>
                  ) : (
                    <ChevronRightIcon size={18} className="text-[var(--foreground-dim)]" />
                  )}
                </button>
              );
            })}
          </div>

          {playerTracking.length > 0 && (
            <div className="mt-6">
              <h3 className="section-title mb-3">Recent Posts</h3>
              <div className="space-y-2">
                {playerTracking.slice(0, 5).map((track, i) => (
                  <div key={i} className="text-sm text-[var(--foreground-muted)] flex justify-between">
                    <span>{track.mode}</span>
                    <span className="text-[var(--foreground-dim)]">
                      {new Date(track.usedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {ToastComponent}
    </div>
  );
}
