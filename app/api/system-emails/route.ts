import { NextRequest, NextResponse, connection } from 'next/server'
import { asc, eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { systemEmailTemplates, users } from '@/lib/db/schema'

// GET - List all system email templates
export async function GET(request: NextRequest) {
  await connection()

  try {
    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) return authUser

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const rows = await db
      .select({
        id: systemEmailTemplates.id,
        code: systemEmailTemplates.code,
        name: systemEmailTemplates.name,
        description: systemEmailTemplates.description,
        category: systemEmailTemplates.category,
        subject: systemEmailTemplates.subject,
        previewText: systemEmailTemplates.previewText,
        htmlContent: systemEmailTemplates.htmlContent,
        textContent: systemEmailTemplates.textContent,
        variables: systemEmailTemplates.variables,
        isActive: systemEmailTemplates.isActive,
        updatedById: systemEmailTemplates.updatedById,
        createdAt: systemEmailTemplates.createdAt,
        updatedAt: systemEmailTemplates.updatedAt,
        updatedByName: users.name,
        updatedByDisplayName: users.displayName,
      })
      .from(systemEmailTemplates)
      .leftJoin(users, eq(systemEmailTemplates.updatedById, users.id))
      .where(category ? eq(systemEmailTemplates.category, category as 'AUTHENTICATION' | 'ACCOUNT' | 'NOTIFICATION' | 'TRANSACTION' | 'ENGAGEMENT') : undefined)
      .orderBy(asc(systemEmailTemplates.category), asc(systemEmailTemplates.name))

    const data = rows.map((r) => ({
      ...r,
      updatedBy: r.updatedById ? { id: r.updatedById, name: r.updatedByDisplayName || r.updatedByName || 'Unknown' } : null,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching system email templates:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch system email templates' }, { status: 500 })
  }
}
