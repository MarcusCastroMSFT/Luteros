import { Skeleton } from '@/components/ui/skeleton';

export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Breadcrumb Skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Image */}
              <div className="relative aspect-[16/10]">
                <Skeleton className="absolute inset-0" />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="absolute top-4 right-4">
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Partner Info */}
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>

                {/* Title */}
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-3/4 mb-4" />

                {/* Description */}
                <div className="space-y-2 mb-6">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>

                {/* Features */}
                <div className="mb-6">
                  <Skeleton className="h-6 w-32 mb-3" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* How to Use */}
                <div className="mb-6">
                  <Skeleton className="h-6 w-40 mb-3" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Skeleton className="h-6 w-6 rounded-full mt-1" />
                        <Skeleton className="h-4 w-72" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terms */}
                <div>
                  <Skeleton className="h-6 w-48 mb-3" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Price Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                {/* Pricing */}
                <div className="mb-4">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-5 w-28" />
                </div>

                {/* Promo Code */}
                <div className="mb-4">
                  <Skeleton className="h-5 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Valid Until */}
                <Skeleton className="h-4 w-32 mb-6" />

                {/* Buttons */}
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>

                {/* Usage Stats */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>

              {/* Related Products */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-16 h-16 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3 mb-2" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
