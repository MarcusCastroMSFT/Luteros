import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
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
            {/* Course Meta Info Skeleton */}
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Course Overview Section Skeleton */}
            <div>
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* What You'll Learn Section Skeleton */}
            <div>
              <Skeleton className="h-8 w-56 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Skeleton className="w-5 h-5 mt-0.5" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content Section Skeleton */}
            <div>
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, lessonIndex) => (
                        <div key={lessonIndex} className="flex items-center gap-3">
                          <Skeleton className="w-4 h-4" />
                          <Skeleton className="h-4 flex-1" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor Section Skeleton */}
            <div>
              <Skeleton className="h-8 w-32 mb-6" />
              <div className="flex items-start gap-6 p-6 bg-white rounded-lg border border-gray-200">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="lg:-mt-52 relative z-10">
              <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                {/* Course Image/Video Skeleton */}
                <Skeleton className="w-full h-48 rounded-lg" />
                
                {/* Price and Action Buttons Skeleton */}
                <div className="space-y-4">
                  <div className="text-center">
                    <Skeleton className="h-8 w-24 mx-auto mb-2" />
                    <Skeleton className="h-5 w-20 mx-auto" />
                  </div>
                  
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>

                {/* Course Info Skeleton */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
