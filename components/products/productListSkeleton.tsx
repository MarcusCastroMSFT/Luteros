import { Skeleton } from '@/components/ui/skeleton';

export function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Image Skeleton */}
          <div className="relative aspect-[4/3]">
            <Skeleton className="absolute inset-0" />
            {/* Badges */}
            <div className="absolute top-2 md:top-3 left-2 md:left-3 flex flex-col gap-1 md:gap-2">
              <Skeleton className="h-4 md:h-6 w-16 md:w-24" />
            </div>
            <div className="absolute top-2 md:top-3 right-2 md:right-3">
              <Skeleton className="h-4 md:h-6 w-10 md:w-16 rounded-full" />
            </div>
          </div>

          {/* Content */}
          <div className="p-2.5 md:p-4">
            {/* Partner - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2 mb-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Title */}
            <Skeleton className="h-4 md:h-6 w-full mb-1 md:mb-2" />
            <Skeleton className="h-4 md:h-6 w-3/4 mb-1 md:mb-2" />

            {/* Description - Hidden on mobile */}
            <div className="hidden md:block">
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-3" />
            </div>

            {/* Category and Tags */}
            <div className="flex gap-1 mb-2 md:mb-3">
              <Skeleton className="h-4 md:h-5 w-12 md:w-16" />
              <Skeleton className="h-4 md:h-5 w-14 md:w-20 hidden md:block" />
            </div>

            {/* Pricing */}
            <div className="flex justify-between mb-2 md:mb-3">
              <div>
                <Skeleton className="h-3 md:h-4 w-12 md:w-16 mb-1" />
                <Skeleton className="h-4 md:h-6 w-16 md:w-20" />
              </div>
              <div className="text-right hidden md:block">
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Promo Code */}
            <Skeleton className="h-6 md:h-8 w-full mb-2 md:mb-3" />

            {/* Valid Until */}
            <Skeleton className="h-3 w-20 md:w-32 mb-2 md:mb-4" />

            {/* Usage Stats - Hidden on mobile */}
            <div className="hidden md:flex justify-between mb-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          {/* Buttons */}
          <div className="p-2.5 md:p-4 pt-0 flex gap-2">
            <Skeleton className="h-8 md:h-9 flex-1" />
            <Skeleton className="h-8 md:h-9 w-20 md:w-24 hidden md:block" />
          </div>
        </div>
      ))}
    </div>
  );
}
