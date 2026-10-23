import { connection, NextRequest, NextResponse } from 'next/server'
import { desc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { subscriptionWaitlist } from '@/lib/db/schema'
import { waitlistToCsv } from '@/lib/waitlist'

export async function GET(request: NextRequest) {
  await connection()
  try {
    const access = await requireAdmin(request)
    if (access instanceof NextResponse) return access

    const rows = await db
      .select({
        email: subscriptionWaitlist.email,
        audience: subscriptionWaitlist.audience,
        source: subscriptionWaitlist.source,
        createdAt: subscriptionWaitlist.createdAt,
      })
      .from(subscriptionWaitlist)
      .orderBy(desc(subscriptionWaitlist.createdAt))

    const day = new Date().toISOString().slice(0, 10)
    return new NextResponse(waitlistToCsv(rows), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="lista-de-espera-lutteros-${day}.csv"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error('Waitlist export failed:', error instanceof Error ? error.name : 'Unknown error')
    return NextResponse.json({ error: 'Não foi possível exportar a lista.' }, { status: 500 })
  }
}
