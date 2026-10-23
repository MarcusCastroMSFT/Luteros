import { SpecialistDetailSkeleton } from '@/components/specialists/specialistDetailSkeleton'

// Gives this client page (which reads `params` at request time) its own <Suspense>.
export default function Loading() {
  return <SpecialistDetailSkeleton />
}
