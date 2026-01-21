import { Skeleton } from '@/components/ui/skeleton';

export function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Image Skeleton */}
          <div className="relative aspect-[4/3]">
            <Skeleton className="absolute inset-0" />
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="absolute top-3 right-3">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Partner */}
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Title */}
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-2" />

            {/* Description */}
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-3" />

            {/* Category and Tags */}
            <div className="flex gap-1 mb-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>

            {/* Pricing */}
            <div className="flex justify-between mb-3">
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="text-right">
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Promo Code */}
            <Skeleton className="h-8 w-full mb-3" />

            {/* Valid Until */}
            <Skeleton className="h-3 w-32 mb-4" />

            {/* Usage Stats */}
            <div className="flex justify-between mb-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          {/* Buttons */}
          <div className="p-4 pt-0 flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
