import { redirect } from 'next/navigation'
import { sql } from 'drizzle-orm'
import { getAuthUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { subscriptionWaitlist } from '@/lib/db/schema'
import { WaitlistAdmin } from './waitlist-admin'

export default async function WaitlistAdminPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login?redirectTo=/admin/waitlist')
  if (user.role !== 'ADMIN') redirect('/admin')

  const [summary] = await db
    .select({
      total: sql<number>`count(*)::int`,
      doctors: sql<number>`count(*) filter (where ${subscriptionWaitlist.audience} = 'doctors')::int`,
      general: sql<number>`count(*) filter (where ${subscriptionWaitlist.audience} = 'general')::int`,
      lastWeek: sql<number>`count(*) filter (where ${subscriptionWaitlist.createdAt} > now() - interval '7 days')::int`,
    })
    .from(subscriptionWaitlist)

  return <WaitlistAdmin summary={summary} />
}
