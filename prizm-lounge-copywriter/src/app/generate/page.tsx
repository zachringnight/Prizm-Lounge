'use client';

import GenerationForm from '@/components/GenerationForm';

export default function GeneratePage() {
  return (
    <div className="space-y-6">
      <header className="text-center py-4">
        <div className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-widest mb-1">
          Panini America
        </div>
        <h1 className="text-2xl font-bold">
          <span className="text-[var(--panini-red)]">Prizm</span>{' '}
          <span className="text-[var(--panini-yellow)]">Lounge</span>
        </h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Content Generator • Super Bowl LX
        </p>
      </header>

      <GenerationForm />
    </div>
  );
}
