import { Skeleton } from '@/components/ui/skeleton'
import { USER_PAGE_CONTAINER } from '@/components/common/user-area'

// The profile is read from the session per request, so this page streams inside this boundary.
export default function Loading() {
  return (
    <div className={USER_PAGE_CONTAINER} aria-busy="true">
      <Skeleton className="mb-6 mt-10 h-12 w-64" />
      <Skeleton className="mb-4 h-40 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}
