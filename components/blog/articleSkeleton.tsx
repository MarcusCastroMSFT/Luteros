import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ArticleCardSkeleton() {
  return (
    <div className="overflow-hidden">
      {/* Image skeleton */}
      <div className="relative overflow-hidden rounded-lg">
        <Skeleton className="w-full h-60" />
      </div>
      
      {/* Content skeleton */}
      <div className="pt-6">
        {/* Title skeleton */}
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-4" />
        
        {/* Metadata skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ArticleListSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ArticleCardSkeleton key={index} />
      ))}
    </div>
  );
}
