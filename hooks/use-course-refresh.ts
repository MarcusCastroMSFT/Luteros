'use client';

import { useEffect, useEffectEvent, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export const COURSE_REFRESH_INTERVAL_MS = 15_000;

export function subscribeToCourseRefresh(refresh: () => void) {
  const refreshVisiblePage = () => {
    if (document.visibilityState === 'visible' && navigator.onLine) refresh();
  };

  refreshVisiblePage();
  const timer = window.setInterval(refreshVisiblePage, COURSE_REFRESH_INTERVAL_MS);
  window.addEventListener('focus', refreshVisiblePage);
  window.addEventListener('online', refreshVisiblePage);
  document.addEventListener('visibilitychange', refreshVisiblePage);

  return () => {
    window.clearInterval(timer);
    window.removeEventListener('focus', refreshVisiblePage);
    window.removeEventListener('online', refreshVisiblePage);
    document.removeEventListener('visibilitychange', refreshVisiblePage);
  };
}

export function useCourseRefresh() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const refresh = useEffectEvent(() => {
    if (!isPending) {
      startTransition(() => router.refresh());
    }
  });

  useEffect(() => subscribeToCourseRefresh(refresh), []);
}
