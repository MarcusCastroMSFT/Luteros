import { Skeleton } from '@/components/ui/skeleton';

export function CommunityContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header and Create Post Button */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Posts Skeleton */}
      {[1, 2, 3, 4, 5].map((post) => (
        <div key={post} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <div className="flex items-center space-x-2 mb-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-6" />
          </div>

          {/* Post Content */}
          <div className="mb-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[1, 2, 3].map((tag) => (
              <Skeleton key={tag} className="h-6 w-16" />
            ))}
          </div>

          {/* Post Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}
