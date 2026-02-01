'use client';

import GenerationForm from '@/components/GenerationForm';

export default function Home() {
  return (
    <div className="space-y-6">
      <header className="text-center py-4">
        <h1 className="text-2xl font-bold">
          <span className="text-[var(--panini-red)]">Prizm</span>{' '}
          <span className="text-[var(--panini-yellow)]">Lounge</span>
        </h1>
        <p className="text-sm text-[var(--foreground-muted)]">
          Super Bowl LIX • New Orleans
        </p>
      </header>

      <GenerationForm />
    </div>
  );
}
