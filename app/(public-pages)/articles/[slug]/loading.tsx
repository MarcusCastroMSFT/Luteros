import { Skeleton } from '@/components/ui/skeleton'

// The article page checks the reader's access per request (paywall), so it streams
// inside this boundary while the site header and footer render immediately.
export default function Loading() {
  return (
    <div className="container mx-auto max-w-[1428px] px-4 py-16" aria-busy="true">
      <div className="mx-auto max-w-4xl">
        <Skeleton className="mb-4 h-5 w-32" />
        <Skeleton className="mb-3 h-10 w-full" />
        <Skeleton className="mb-8 h-10 w-3/4" />
        <Skeleton className="mb-10 aspect-[16/10] w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}
