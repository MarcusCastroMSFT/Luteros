import { Skeleton } from '@/components/ui/skeleton';

export function CourseLessonsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <Skeleton className="h-8 w-96 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Left Column - Course Content Skeleton */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <Skeleton className="h-6 w-40 mb-4" />
              
              {/* Course Sections Skeleton */}
              <div className="space-y-4">
                {[1, 2, 3].map((section) => (
                  <div key={section} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    {/* Section Header */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-64" />
                        <Skeleton className="h-4 w-4" />
                      </div>
                      <Skeleton className="h-4 w-32 mt-1" />
                    </div>
                    
                    {/* Lessons Skeleton */}
                    <div className="p-2">
                      {[1, 2, 3, 4].map((lesson) => (
                        <div key={lesson} className="flex items-center p-3 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <Skeleton className="h-4 w-4 mr-3" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-48 mb-1" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <Skeleton className="h-4 w-4" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Lesson Viewer Skeleton */}
          <div className="xl:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Lesson Header Skeleton */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-7 w-80" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Lesson Content Skeleton */}
              <div className="p-6">
                {/* Video/Content Area */}
                <div className="mb-6">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                </div>

                {/* Lesson Description */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>

              {/* Navigation Skeleton */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
