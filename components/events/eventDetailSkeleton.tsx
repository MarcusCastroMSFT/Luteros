import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function EventDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Page Header Skeleton */}
      <section className="py-16 lg:py-16 bg-cta-background">
        <div className="container mx-auto px-4 max-w-[1428px]">
          {/* Breadcrumbs Skeleton */}
          <div className="flex items-center gap-2 mb-8 text-left">
            <Skeleton className="h-4 w-12" />
            <span className="text-gray-400">/</span>
            <Skeleton className="h-4 w-16" />
            <span className="text-gray-400">/</span>
            <Skeleton className="h-4 w-20" />
          </div>
          
          {/* Title and Description Skeleton */}
          <div className="text-left max-w-4xl">
            <Skeleton className="h-12 w-full max-w-2xl mb-4" />
            <Skeleton className="h-12 w-3/4 max-w-xl mb-6" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-full max-w-3xl" />
              <Skeleton className="h-5 w-2/3 max-w-2xl" />
            </div>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 max-w-[1428px] py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Event Meta Info Skeleton */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Event Description Section Skeleton */}
            <div>
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Event Content Section Skeleton */}
            <div>
              <Skeleton className="h-8 w-32 mb-6" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Skeleton className="w-2 h-2 rounded-full mt-2" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Separator */}
            <div className="border-t border-gray-200 dark:border-gray-700"></div>

            {/* Speakers Section Skeleton */}
            <div>
              <Skeleton className="h-8 w-40 mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="text-center">
                    <Skeleton className="w-36 h-36 mx-auto mb-4 rounded-full" />
                    <Skeleton className="h-5 w-24 mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="lg:-mt-52 relative z-10">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
                {/* Event Image Skeleton */}
                <Skeleton className="w-full h-48 rounded-lg" />
                
                {/* Event Info Skeleton */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
