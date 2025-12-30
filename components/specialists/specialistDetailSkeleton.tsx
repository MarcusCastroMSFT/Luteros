import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SpecialistDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header Skeleton */}
      <section className="py-16 lg:py-16 bg-cta-background">
        <div className="container mx-auto px-4 max-w-[1428px]">
          <div className="text-left">
            {/* Breadcrumb skeleton */}
            <div className="flex items-center gap-2 mb-6">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-1" />
              <Skeleton className="h-4 w-24" />
            </div>
            
            {/* Title skeleton */}
            <Skeleton className="h-12 w-80 mb-4" />
            
            {/* Description skeleton */}
            <Skeleton className="h-6 w-96" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-[1428px] py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-12">
            {/* Meta Info Skeleton */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Bio Section Skeleton */}
            <div>
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Expertise Section Skeleton */}
            <div>
              <Skeleton className="h-8 w-56 mb-6" />
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-2 h-2 rounded-full mt-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="flex items-start gap-3">
                  <Skeleton className="w-2 h-2 rounded-full mt-2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="flex items-start gap-3">
                  <Skeleton className="w-2 h-2 rounded-full mt-2" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="lg:-mt-52 relative z-10 space-y-6">
              {/* Main Info Card Skeleton */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="h-64 w-full" />
                  
                  <div className="p-6 space-y-4">
                    {/* Name and Profession */}
                    <div className="text-center space-y-2">
                      <Skeleton className="h-6 w-32 mx-auto" />
                      <Skeleton className="h-4 w-40 mx-auto" />
                    </div>

                    {/* Experience */}
                    <div className="flex items-center justify-center gap-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-28" />
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-center gap-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-20" />
                    </div>

                    {/* Separator */}
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="space-y-2">
                        <Skeleton className="w-4 h-4 mx-auto" />
                        <Skeleton className="h-6 w-8 mx-auto" />
                        <Skeleton className="h-3 w-16 mx-auto" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="w-4 h-4 mx-auto" />
                        <Skeleton className="h-6 w-8 mx-auto" />
                        <Skeleton className="h-3 w-12 mx-auto" />
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specialties Card Skeleton */}
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-5 w-24 mb-4" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-18 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
