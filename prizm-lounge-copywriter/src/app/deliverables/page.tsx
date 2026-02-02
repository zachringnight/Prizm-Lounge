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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-1">Deliverables</h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Track content deliverables
        </p>
      </header>

      {/* Progress */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Completion</span>
          <span className="text-sm text-[var(--foreground-muted)]">
            {completedCount} / {totalCount} done
          </span>
        </div>
        <div className="h-3 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--panini-red)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="tabs overflow-x-auto">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`tab whitespace-nowrap ${statusFilter === status ? 'active' : ''}`}
          >
            {status === 'all' ? 'All' : STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      {/* Deliverables List */}
      <div className="space-y-3">
        {filteredDeliverables.length === 0 ? (
          <div className="empty-state">
            <ClipboardIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>No deliverables to show</p>
          </div>
        ) : (
          filteredDeliverables.map(deliverable => {
            const TypeIcon = TYPE_ICONS[deliverable.type];
            return (
              <div key={deliverable.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--background-tertiary)] flex items-center justify-center flex-shrink-0">
                    <TypeIcon size={20} className="text-[var(--foreground-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{deliverable.title}</div>
                    {deliverable.description && (
                      <div className="text-sm text-[var(--foreground-muted)] mt-1">
                        {deliverable.description}
                      </div>
                    )}
                    {deliverable.dueDay && (
                      <div className="text-xs text-[var(--foreground-dim)] mt-1">
                        Due: {deliverable.dueDay}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => updateDeliverableStatus(deliverable.id, cycleStatus(deliverable.status))}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${STATUS_COLORS[deliverable.status]}`}
                  >
                    {STATUS_LABELS[deliverable.status]}
                  </button>
                </div>
                {deliverable.status === 'completed' || deliverable.status === 'delivered' ? (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--background-tertiary)]">
                    <CheckIcon size={14} className="text-[var(--status-live)]" />
                    <span className="text-xs text-[var(--foreground-muted)]">
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
      <div className="card p-4">
        <div className="text-xs text-[var(--foreground-muted)] mb-2">Tap status to cycle:</div>
        <div className="flex flex-wrap gap-2">
          {(['pending', 'in-progress', 'completed', 'delivered'] as DeliverableStatus[]).map(status => (
            <span
              key={status}
              className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[status]}`}
            >
              {STATUS_LABELS[status]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
