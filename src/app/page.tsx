'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useProgressStore } from '@/store/progress-store';
import { useModelStore } from '@/store/model-store';
import { useEffect } from 'react';

export default function Home() {
  const hydrateProgress = useProgressStore(s => s._hydrate);
  const hydrateModel = useModelStore(s => s._hydrate);

  useEffect(() => {
    hydrateProgress();
    hydrateModel();
  }, [hydrateProgress, hydrateModel]);

  return <AppShell />;
}
