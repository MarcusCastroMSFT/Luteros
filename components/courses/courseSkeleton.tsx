import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden">
      {/* Image skeleton */}
      <div className="relative overflow-hidden rounded-lg">
        <Skeleton className="w-full h-48" />
      </div>

      {/* Content skeleton */}
      <div className="pt-6">
        {/* Meta info skeleton */}
        <div className="flex items-center gap-4 mb-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>

        {/* Title skeleton */}
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-3" />

        {/* Rating and instructor skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function CourseListSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
}
