import { connection, NextRequest, NextResponse } from 'next/server'
import { and, desc, ilike, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { subscriptionWaitlist } from '@/lib/db/schema'
import { waitlistListQuerySchema } from '@/lib/waitlist'

export async function GET(request: NextRequest) {
  await connection()
  try {
    const access = await requireAdmin(request)
    if (access instanceof NextResponse) return access

    const parsed = waitlistListQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Parâmetros de busca inválidos.' }, { status: 400 })
    }
    const { page, pageSize, search } = parsed.data
    const pattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`
    const where = and(search ? ilike(subscriptionWaitlist.email, pattern) : undefined)

    const [[{ totalCount }], data] = await db.batch([
      db.select({ totalCount: sql<number>`count(*)::int` }).from(subscriptionWaitlist).where(where),
      db
        .select({
          id: subscriptionWaitlist.id,
          email: subscriptionWaitlist.email,
          audience: subscriptionWaitlist.audience,
          source: subscriptionWaitlist.source,
          createdAt: subscriptionWaitlist.createdAt,
        })
        .from(subscriptionWaitlist)
        .where(where)
        .orderBy(desc(subscriptionWaitlist.createdAt), desc(subscriptionWaitlist.id))
        .limit(pageSize)
        .offset(page * pageSize),
    ])

    return NextResponse.json(
      { data, totalCount, pageCount: Math.ceil(totalCount / pageSize) },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) {
    console.error('Waitlist admin query failed:', error instanceof Error ? error.name : 'Unknown error')
    return NextResponse.json({ error: 'Não foi possível carregar a lista de espera.' }, { status: 500 })
  }
}
