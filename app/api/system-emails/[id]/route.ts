import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { requireAdmin, requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { systemEmailTemplates, users } from '@/lib/db/schema'
import { invalidateTemplateCache } from '@/lib/system-email'

// Validate UUID format
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// GET - Get a single template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!isValidUUID(id)) return NextResponse.json({ success: false, error: 'Invalid template ID' }, { status: 400 })

    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) return authUser

    const row = await db.select({ id: systemEmailTemplates.id, code: systemEmailTemplates.code, name: systemEmailTemplates.name, description: systemEmailTemplates.description, category: systemEmailTemplates.category, subject: systemEmailTemplates.subject, previewText: systemEmailTemplates.previewText, htmlContent: systemEmailTemplates.htmlContent, textContent: systemEmailTemplates.textContent, variables: systemEmailTemplates.variables, isActive: systemEmailTemplates.isActive, updatedById: systemEmailTemplates.updatedById, createdAt: systemEmailTemplates.createdAt, updatedAt: systemEmailTemplates.updatedAt, updaterName: users.name, updaterDisplayName: users.displayName }).from(systemEmailTemplates).leftJoin(users, eq(systemEmailTemplates.updatedById, users.id)).where(eq(systemEmailTemplates.id, id)).limit(1).then((r) => r[0] ?? null)

    if (!row) return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: { ...row, updatedBy: row.updatedById ? { id: row.updatedById, name: row.updaterDisplayName || row.updaterName } : null } })
  } catch (error) {
    console.error('Error fetching system email template:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch template' }, { status: 500 })
  }
}

// PATCH - Update a template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!isValidUUID(id)) return NextResponse.json({ success: false, error: 'Invalid template ID' }, { status: 400 })

    const authUser = await requireAdmin(request)
    if (authUser instanceof NextResponse) return authUser

    const body = await request.json()
    const { name, description, subject, previewText, htmlContent, textContent, isActive } = body

    if (!subject || !htmlContent) return NextResponse.json({ success: false, error: 'Subject and HTML content are required' }, { status: 400 })
    if (subject.length > 500) return NextResponse.json({ success: false, error: 'Subject must be less than 500 characters' }, { status: 400 })
    if (htmlContent.length > 500000) return NextResponse.json({ success: false, error: 'HTML content is too large' }, { status: 400 })

    const existing = await db.select().from(systemEmailTemplates).where(eq(systemEmailTemplates.id, id)).limit(1).then((r) => r[0] ?? null)
    if (!existing) return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 })

    const [template] = await db.update(systemEmailTemplates).set({
      name: name || existing.name,
      description: description !== undefined ? description : existing.description,
      subject,
      previewText: previewText || null,
      htmlContent,
      textContent: textContent || null,
      isActive: isActive !== undefined ? isActive : existing.isActive,
      updatedById: authUser.user.id,
    }).where(eq(systemEmailTemplates.id, id)).returning()

    invalidateTemplateCache(existing.code)

    return NextResponse.json({ success: true, data: template })
  } catch (error) {
    console.error('Error updating system email template:', error)
    return NextResponse.json({ success: false, error: 'Failed to update template' }, { status: 500 })
  }
}

// DELETE - Delete a template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!isValidUUID(id)) return NextResponse.json({ success: false, error: 'Invalid template ID' }, { status: 400 })

    const authUser = await requireAdmin(request)
    if (authUser instanceof NextResponse) return authUser

    const existing = await db.select().from(systemEmailTemplates).where(eq(systemEmailTemplates.id, id)).limit(1).then((r) => r[0] ?? null)
    if (!existing) return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 })

    await db.delete(systemEmailTemplates).where(eq(systemEmailTemplates.id, id))
    invalidateTemplateCache(existing.code)

    return NextResponse.json({ success: true, message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Error deleting system email template:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete template' }, { status: 500 })
  }
}
