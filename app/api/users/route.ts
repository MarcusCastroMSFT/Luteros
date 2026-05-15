import { NextRequest, NextResponse } from 'next/server'
import { ilike, or, asc, desc, count } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

const roleLabelMap: Record<string, string> = {
  ADMIN: 'Administrador',
  INSTRUCTOR: 'Instrutor',
  USER: 'Usuário',
  PROFESSIONAL: 'Profissional',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '0')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')
  const search = searchParams.get('search') || ''
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

  try {
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) return authResult

    const whereClause = search
      ? or(
          ilike(users.name, `%${search}%`),
          ilike(users.displayName, `%${search}%`)
        )
      : undefined

    const orderBy = sortOrder === 'asc' ? asc(users.createdAt) : desc(users.createdAt)

    const [rows, [{ value: totalCount }]] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          displayName: users.displayName,
          image: users.image,
          email: users.email,
          title: users.title,
          company: users.company,
          role: users.role,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(whereClause)
        .orderBy(orderBy)
        .offset(page * pageSize)
        .limit(pageSize),
      db.select({ value: count() }).from(users).where(whereClause),
    ])

    const pageCount = Math.ceil(Number(totalCount) / pageSize)

    const formattedUsers = rows.map((u) => ({
      id: u.id,
      name: u.displayName || u.name || 'No Name',
      username: u.displayName || u.name?.split(' ')[0] || 'user',
      email: u.email || 'N/A',
      profileImg: u.image || null,
      status: u.lastLoginAt ? 'Ativo' : 'Inativo',
      role: roleLabelMap[u.role] || 'Usuário',
    }))

    return NextResponse.json({
      data: formattedUsers,
      totalCount: Number(totalCount),
      pageCount,
      currentPage: page,
      pageSize,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

