import { Skeleton } from '@/components/ui/skeleton'

export default function SpecialistLoading() {
  return (
    <div className="mx-auto grid max-w-[1480px] gap-10 px-6 py-16 sm:px-10 md:grid-cols-[minmax(0,340px)_1fr] lg:px-12" aria-busy="true">
      <Skeleton className="aspect-[4/5] w-full max-w-[340px] rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="mt-8 h-40 w-full" />
      </div>
    </div>
  )
}
