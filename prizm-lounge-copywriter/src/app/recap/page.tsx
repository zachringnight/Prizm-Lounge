'use client';

import DayRecapForm from '@/components/DayRecapForm';

export default function RecapPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold mb-1">Day Recap</h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Generate end-of-day wrap-up content
        </p>
      </header>

      <DayRecapForm />
    </div>
  );
}
