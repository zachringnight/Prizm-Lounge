'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { formatTime, getScheduleStatus, QuestionCategory } from '@/types';
import {
  MicIcon,
  QuoteIcon,
  TrashIcon,
  PlusIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  LayersIcon
} from '@/components/Icons';
import { useToast } from '@/components/Toast';
import { interviewQuestions } from '@/data/checklist';
import { getPlayerQuestions } from '@/data/players';

const QUESTION_CATEGORIES: { id: QuestionCategory; label: string }[] = [
  { id: 'career', label: 'Career' },
  { id: 'cards', label: 'Cards & Collecting' },
  { id: 'personal', label: 'Personal' },
  { id: 'event', label: 'Event' }
];

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const {
    players,
    notes,
    addNote,
    deleteNote
  } = useAppStore();
  const player = players.find(p => p.id === id);
  const playerNotes = notes.filter(n => n.playerId === id).sort((a, b) => b.timestamp - a.timestamp);

  const [noteInput, setNoteInput] = useState('');
  const [isQuote, setIsQuote] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'questions' | 'notes'>('info');
  const [isListening, setIsListening] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<QuestionCategory | null>('career');
  const [signingExpanded, setSigningExpanded] = useState(true);
  const [packRipsExpanded, setPackRipsExpanded] = useState(true);
  const { showToast, ToastComponent } = useToast();

  // Get station-specific questions for this player
  const stationQuestions = id ? getPlayerQuestions(id) : null;

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

  // Filter questions based on player category
  const getQuestionsForCategory = (questionCategory: QuestionCategory) => {
    return interviewQuestions.filter(q => {
      if (q.category !== questionCategory) return false;
      if (q.forCategories && !q.forCategories.includes(player.category)) return false;
      return true;
    });
  };

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

  const tabs = [
    { id: 'info' as const, label: 'Info' },
    { id: 'questions' as const, label: 'Questions' },
    { id: 'notes' as const, label: `Notes (${playerNotes.length})` }
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
            {player.position} • {player.team}
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
          {(status === 'live' || status === 'upcoming') && (
            <button
              onClick={() => router.push('/stations')}
              className="mt-3 w-full btn btn-secondary gap-2 !py-3"
            >
              <LayersIcon size={18} />
              <span>Go to Stations</span>
              <ChevronRightIcon size={18} />
            </button>
          )}
        </div>
      )}

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

      {activeTab === 'questions' && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--foreground-muted)]">
            Station questions for {player.name}
          </p>

          {/* Signing Questions */}
          {stationQuestions?.signing && stationQuestions.signing.length > 0 && (
            <div className="card overflow-hidden border-l-4 border-l-[var(--panini-yellow)]">
              <button
                onClick={() => setSigningExpanded(!signingExpanded)}
                className="w-full p-4 flex items-center justify-between bg-[var(--background-secondary)]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[var(--panini-yellow)]">Signing</span>
                  <span className="text-xs px-2 py-0.5 bg-[var(--panini-yellow)] text-black rounded font-medium">
                    {stationQuestions.signing.length} questions
                  </span>
                </div>
                {signingExpanded ? (
                  <ChevronDownIcon size={18} className="text-[var(--foreground-dim)]" />
                ) : (
                  <ChevronRightIcon size={18} className="text-[var(--foreground-dim)]" />
                )}
              </button>
              {signingExpanded && (
                <div className="border-t border-[var(--background-tertiary)] p-4 space-y-3">
                  {stationQuestions.signing.map((q, i) => (
                    <div key={i} className="text-sm text-[var(--foreground-muted)] py-1">
                      <span className="text-[var(--panini-yellow)] font-semibold mr-2">{i + 1}.</span>
                      {q}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pack Rips Questions */}
          {stationQuestions?.packRips && stationQuestions.packRips.length > 0 && (
            <div className="card overflow-hidden border-l-4 border-l-[var(--panini-red)]">
              <button
                onClick={() => setPackRipsExpanded(!packRipsExpanded)}
                className="w-full p-4 flex items-center justify-between bg-[var(--background-secondary)]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[var(--panini-red)]">Pack Rips</span>
                  <span className="text-xs px-2 py-0.5 bg-[var(--panini-red)] text-white rounded font-medium">
                    {stationQuestions.packRips.length} questions
                  </span>
                </div>
                {packRipsExpanded ? (
                  <ChevronDownIcon size={18} className="text-[var(--foreground-dim)]" />
                ) : (
                  <ChevronRightIcon size={18} className="text-[var(--foreground-dim)]" />
                )}
              </button>
              {packRipsExpanded && (
                <div className="border-t border-[var(--background-tertiary)] p-4 space-y-3">
                  {stationQuestions.packRips.map((q, i) => (
                    <div key={i} className="text-sm text-[var(--foreground-muted)] py-1">
                      <span className="text-[var(--panini-red)] font-semibold mr-2">{i + 1}.</span>
                      {q}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* No station questions message */}
          {(!stationQuestions?.signing?.length && !stationQuestions?.packRips?.length) && (
            <div className="card p-4 text-center text-[var(--foreground-muted)]">
              <p>No station-specific questions available for this player.</p>
              <p className="text-sm mt-1">This player may be signing only.</p>
            </div>
          )}

          {/* General Interview Questions */}
          {QUESTION_CATEGORIES.some(cat => getQuestionsForCategory(cat.id).length > 0) && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[var(--foreground-muted)] mb-3 uppercase tracking-wide">
                General Interview Topics
              </h3>
              {QUESTION_CATEGORIES.map(category => {
                const questions = getQuestionsForCategory(category.id);
                if (questions.length === 0) return null;

                const isExpanded = expandedCategory === category.id;

                return (
                  <div key={category.id} className="card overflow-hidden mb-2">
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                      className="w-full p-4 flex items-center justify-between"
                    >
                      <span className="font-medium">{category.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--foreground-muted)]">
                          {questions.length} questions
                        </span>
                        <ChevronRightIcon
                          size={18}
                          className={`text-[var(--foreground-dim)] transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-[var(--background-tertiary)] p-4 space-y-3">
                        {questions.map((q, i) => (
                          <div key={i} className="text-sm text-[var(--foreground-muted)]">
                            {i + 1}. {q.question}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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

      {ToastComponent}
    </div>
  );
}
