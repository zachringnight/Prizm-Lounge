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
    <div className="space-y-8">
      <header className="page-header">
        <h1>Event Checklist</h1>
        <p>Track tasks for Super Bowl LX</p>
      </header>

      {/* Progress Card */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-semibold">Progress</span>
          <span className="text-base text-[var(--foreground-muted)]">
            {completedCount} / {totalCount} complete
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center mt-3">
          <span className="text-3xl font-bold text-[var(--status-live)]">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="tabs-enhanced overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`tab-enhanced whitespace-nowrap ${categoryFilter === cat ? 'active' : ''}`}
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
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors
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
            className="text-sm font-medium text-[var(--foreground-muted)]"
          >
            {showCompleted ? 'Hide done' : 'Show done'}
          </button>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-8">
        {Object.entries(groupedChecklist).map(([category, items]) => (
          <div key={category}>
            <h3 className={`section-title mb-4 ${CATEGORY_COLORS[category as ChecklistCategory]}`}>
              {CATEGORY_LABELS[category as ChecklistCategory]}
            </h3>
            <div className="space-y-3">
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`checklist-item w-full text-left transition-all
                    ${item.completed ? 'completed' : ''}`}
                >
                  <div className={`checkbox ${item.completed ? 'checked' : ''}`}>
                    {item.completed && <CheckIcon size={16} className="text-white" />}
                  </div>
                  <div className="item-content flex-1 min-w-0">
                    <h4 className={item.completed ? 'line-through opacity-70' : ''}>
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="mt-1">{item.description}</p>
                    )}
                    {item.dueDay && (
                      <p className="text-sm text-[var(--foreground-dim)] mt-2">
                        {item.dueDay}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredChecklist.length === 0 && (
          <div className="empty-state">
            <CheckIcon size={56} className="mx-auto mb-4 opacity-40" />
            <p className="text-lg">No items to show</p>
            {!showCompleted && (
              <button
                onClick={() => setShowCompleted(true)}
                className="text-base font-medium text-[var(--panini-yellow)] mt-3"
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
