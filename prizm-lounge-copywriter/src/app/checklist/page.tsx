'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { ChecklistCategory } from '@/types';
import { CheckIcon } from '@/components/Icons';

const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  setup: 'Setup',
  player: 'Player Arrivals',
  content: 'Content Capture',
  teardown: 'Teardown'
};

const CATEGORY_COLORS: Record<ChecklistCategory, string> = {
  setup: 'text-[var(--panini-yellow)]',
  player: 'text-[var(--status-live)]',
  content: 'text-[var(--panini-red)]',
  teardown: 'text-[var(--foreground-muted)]'
};

type DayFilter = 'All' | 'Thursday' | 'Friday' | 'Saturday';

export default function ChecklistPage() {
  const { checklist, toggleChecklistItem, initializeChecklist } = useAppStore();
  const [categoryFilter, setCategoryFilter] = useState<ChecklistCategory | 'all'>('all');
  const [dayFilter, setDayFilter] = useState<DayFilter>('All');
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    initializeChecklist();
  }, [initializeChecklist]);

  const categories: (ChecklistCategory | 'all')[] = ['all', 'setup', 'player', 'content', 'teardown'];
  const days: DayFilter[] = ['All', 'Thursday', 'Friday', 'Saturday'];

  const filteredChecklist = checklist.filter(item => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (dayFilter !== 'All' && item.dueDay && item.dueDay !== dayFilter) return false;
    if (!showCompleted && item.completed) return false;
    return true;
  });

  // Group by category
  const groupedChecklist = filteredChecklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<ChecklistCategory, typeof checklist>);

  const completedCount = checklist.filter(c => c.completed).length;
  const totalCount = checklist.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-1">Event Checklist</h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Track tasks for Super Bowl LX
        </p>
      </header>

      {/* Progress Bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-[var(--foreground-muted)]">
            {completedCount} / {totalCount} complete
          </span>
        </div>
        <div className="h-3 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--status-live)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="tabs overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`tab whitespace-nowrap ${categoryFilter === cat ? 'active' : ''}`}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {days.map(day => (
              <button
                key={day}
                onClick={() => setDayFilter(day)}
                className={`px-3 py-1 text-xs rounded-full transition-colors
                  ${dayFilter === day
                    ? 'bg-[var(--panini-yellow)] text-black'
                    : 'bg-[var(--background-tertiary)] text-[var(--foreground-muted)]'
                  }`}
              >
                {day === 'All' ? 'All Days' : day.slice(0, 3)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-xs text-[var(--foreground-muted)]"
          >
            {showCompleted ? 'Hide done' : 'Show done'}
          </button>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-6">
        {Object.entries(groupedChecklist).map(([category, items]) => (
          <div key={category}>
            <h3 className={`section-title mb-3 ${CATEGORY_COLORS[category as ChecklistCategory]}`}>
              {CATEGORY_LABELS[category as ChecklistCategory]}
            </h3>
            <div className="space-y-2">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`card p-4 w-full text-left flex items-start gap-3 transition-all
                    ${item.completed ? 'opacity-60' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                    ${item.completed
                      ? 'bg-[var(--status-live)] border-[var(--status-live)]'
                      : 'border-[var(--foreground-dim)]'
                    }`}
                  >
                    {item.completed && <CheckIcon size={14} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${item.completed ? 'line-through' : ''}`}>
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="text-sm text-[var(--foreground-muted)] mt-1">
                        {item.description}
                      </div>
                    )}
                    {item.dueDay && (
                      <div className="text-xs text-[var(--foreground-dim)] mt-1">
                        {item.dueDay}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredChecklist.length === 0 && (
          <div className="empty-state">
            <CheckIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>No items to show</p>
            {!showCompleted && (
              <button
                onClick={() => setShowCompleted(true)}
                className="text-sm text-[var(--panini-yellow)] mt-2"
              >
                Show completed items
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
