import { EventDetailSkeleton } from '@/components/events/eventDetailSkeleton'

// Gives this page (which reads `params` at request time) its own <Suspense>.
export default function Loading() {
  return <EventDetailSkeleton />
}
