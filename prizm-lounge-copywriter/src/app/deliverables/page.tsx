'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { DeliverableStatus, DeliverableType } from '@/types';
import {
  CheckIcon,
  CameraIcon,
  VideoIcon,
  MessageIcon,
  FileTextIcon,
  ClipboardIcon
} from '@/components/Icons';

const STATUS_LABELS: Record<DeliverableStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
  delivered: 'Delivered'
};

const STATUS_COLORS: Record<DeliverableStatus, string> = {
  pending: 'bg-[var(--background-tertiary)] text-[var(--foreground-muted)]',
  'in-progress': 'bg-[var(--panini-yellow)] text-black',
  completed: 'bg-[var(--status-live)] text-white',
  delivered: 'bg-[var(--panini-red)] text-white'
};

const TYPE_ICONS: Record<DeliverableType, React.ComponentType<{ size?: number; className?: string }>> = {
  photo: CameraIcon,
  video: VideoIcon,
  social: MessageIcon,
  document: FileTextIcon,
  other: ClipboardIcon
};

export default function DeliverablesPage() {
  const { deliverables, updateDeliverableStatus, initializeDeliverables } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<DeliverableStatus | 'all'>('all');

  useEffect(() => {
    initializeDeliverables();
  }, [initializeDeliverables]);

  const statuses: (DeliverableStatus | 'all')[] = ['all', 'pending', 'in-progress', 'completed', 'delivered'];

  const filteredDeliverables = deliverables.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    return true;
  });

  const completedCount = deliverables.filter(d => d.status === 'completed' || d.status === 'delivered').length;
  const totalCount = deliverables.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const cycleStatus = (currentStatus: DeliverableStatus): DeliverableStatus => {
    const order: DeliverableStatus[] = ['pending', 'in-progress', 'completed', 'delivered'];
    const currentIndex = order.indexOf(currentStatus);
    return order[(currentIndex + 1) % order.length];
  };

  return (
    <div className="space-y-8">
      <header className="page-header">
        <h1>Deliverables</h1>
        <p>Track content deliverables</p>
      </header>

      {/* Progress Card */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-semibold">Completion</span>
          <span className="text-base text-[var(--foreground-muted)]">
            {completedCount} / {totalCount} done
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-center mt-3">
          <span className="text-3xl font-bold text-[var(--panini-red)]">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Status Filter */}
      <div className="tabs-enhanced overflow-x-auto">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`tab-enhanced whitespace-nowrap ${statusFilter === status ? 'active' : ''}`}
          >
            {status === 'all' ? 'All' : STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Deliverables List */}
      <div className="space-y-4">
        {filteredDeliverables.length === 0 ? (
          <div className="empty-state">
            <ClipboardIcon size={56} className="mx-auto mb-4 opacity-40" />
            <p className="text-lg">No deliverables to show</p>
          </div>
        ) : (
          filteredDeliverables.map(deliverable => {
            const TypeIcon = TYPE_ICONS[deliverable.type];
            return (
              <div key={deliverable.id} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--background-tertiary)] flex items-center justify-center flex-shrink-0">
                    <TypeIcon size={24} className="text-[var(--foreground-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-semibold mb-1">{deliverable.title}</div>
                    {deliverable.description && (
                      <div className="text-base text-[var(--foreground-muted)]">
                        {deliverable.description}
                      </div>
                    )}
                    {deliverable.dueDay && (
                      <div className="text-sm text-[var(--foreground-dim)] mt-2">
                        Due: {deliverable.dueDay}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => updateDeliverableStatus(deliverable.id, cycleStatus(deliverable.status))}
                    className={`px-4 py-2 text-sm rounded-full font-semibold transition-colors ${STATUS_COLORS[deliverable.status]}`}
                  >
                    {STATUS_LABELS[deliverable.status]}
                  </button>
                </div>
                {deliverable.status === 'completed' || deliverable.status === 'delivered' ? (
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--background-tertiary)]">
                    <CheckIcon size={18} className="text-[var(--status-live)]" />
                    <span className="text-sm text-[var(--foreground-muted)]">
                      {deliverable.completedAt
                        ? `Completed ${new Date(deliverable.completedAt).toLocaleDateString()}`
                        : 'Completed'}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="info-card">
        <div className="text-sm text-[var(--foreground-muted)] mb-3">Tap status badge to cycle through:</div>
        <div className="flex flex-wrap gap-3">
          {(['pending', 'in-progress', 'completed', 'delivered'] as DeliverableStatus[]).map(status => (
            <span
              key={status}
              className={`px-3 py-1.5 text-sm rounded-full font-medium ${STATUS_COLORS[status]}`}
            >
              {STATUS_LABELS[status]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
