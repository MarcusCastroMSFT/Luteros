import { connection, NextRequest, NextResponse } from 'next/server'
import { and, desc, ilike, or, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { contactMessages } from '@/lib/db/schema'
import { contactListQuerySchema } from '@/lib/contact'

export async function GET(request: NextRequest) {
  await connection()
  try {
    const access = await requireAdmin(request)
    if (access instanceof NextResponse) return access
    const parsed = contactListQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
    if (!parsed.success) {
      return NextResponse.json({ error: 'Parâmetros de busca inválidos.' }, { status: 400 })
    }
    const { page, pageSize, search } = parsed.data
    const pattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`
    const where = and(search ? or(
      ilike(contactMessages.name, pattern),
      ilike(contactMessages.email, pattern),
      ilike(contactMessages.subject, pattern),
    ) : undefined)
    const [[{ totalCount }], data] = await db.batch([
      db.select({ totalCount: sql<number>`count(*)::int` }).from(contactMessages).where(where),
      db.select({
        id: contactMessages.id,
        name: contactMessages.name,
        email: contactMessages.email,
        reason: contactMessages.reason,
        subject: contactMessages.subject,
        createdAt: contactMessages.createdAt,
      }).from(contactMessages).where(where)
        .orderBy(desc(contactMessages.createdAt), desc(contactMessages.id))
        .limit(pageSize).offset(page * pageSize),
    ])
    return NextResponse.json({ data, totalCount, pageCount: Math.ceil(totalCount / pageSize) }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    console.error('Contact inbox query failed:', error instanceof Error ? error.name : 'Unknown error')
    return NextResponse.json({ error: 'Não foi possível carregar as mensagens.' }, { status: 500 })
  }
}
