import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function SpecialistCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Avatar skeleton */}
        <Skeleton className="w-full h-48" />
        
        {/* Content skeleton */}
        <div className="p-6 space-y-3">
          {/* Stats skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          
          {/* Name skeleton */}
          <Skeleton className="h-6 w-3/4" />
          
          {/* Profession skeleton */}
          <Skeleton className="h-4 w-2/3" />
          
          {/* Specialties skeleton */}
          <div className="flex gap-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>
          
          {/* Rating and experience skeleton */}
          <div className="flex justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SpecialistFilterSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search skeleton */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>

      {/* Specialty Filters skeleton */}
      <div>
        <Skeleton className="h-4 w-24 mb-3" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-18 rounded-md" />
          <Skeleton className="h-8 w-22 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-18 rounded-md" />
          <Skeleton className="h-8 w-26 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export function SpecialistListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <SpecialistCardSkeleton key={index} />
      ))}
    </div>
  );
}
