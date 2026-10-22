import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function EventCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-[12px_36px_12px_12px] border border-brand-600/15 bg-white/60 p-6 sm:p-8" aria-hidden="true">
      <div className="mb-6 flex items-start justify-between">
        <Skeleton className="size-20 rounded-[42%_58%_52%_38%]" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <div className="mb-3">
        <Skeleton className="mb-2 h-7 w-full" />
        <Skeleton className="h-7 w-3/4" />
      </div>
      <div className="mb-6 flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="space-y-3 border-t border-brand-600/15 pt-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

export function EventListSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}
