import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { systemEmailTemplates } from '@/lib/db/schema'
import { systemEmailTemplates as defaultTemplates } from '@/data/system-email-templates'
import { invalidateTemplateCache } from '@/lib/system-email'

// Validate UUID format
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// POST - Reset a template to its default values
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!isValidUUID(id)) return NextResponse.json({ success: false, error: 'Invalid template ID' }, { status: 400 })

    const authUser = await requireAuth(request)
    if (authUser instanceof NextResponse) return authUser

    const existing = await db.select().from(systemEmailTemplates).where(eq(systemEmailTemplates.id, id)).limit(1).then((r) => r[0] ?? null)
    if (!existing) return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 })

    const defaultTemplate = defaultTemplates.find((t) => t.code === existing.code)
    if (!defaultTemplate) return NextResponse.json({ success: false, error: 'No default template found for this code' }, { status: 404 })

    const [template] = await db.update(systemEmailTemplates).set({
      name: defaultTemplate.name,
      description: defaultTemplate.description,
      subject: defaultTemplate.subject,
      previewText: defaultTemplate.previewText,
      htmlContent: defaultTemplate.htmlContent,
      textContent: defaultTemplate.textContent,
      variables: defaultTemplate.variables,
      updatedById: null,
    }).where(eq(systemEmailTemplates.id, id)).returning()

    invalidateTemplateCache(existing.code)

    return NextResponse.json({ success: true, data: template, message: 'Template reset to default values' })
  } catch (error) {
    console.error('Error resetting system email template:', error)
    return NextResponse.json({ success: false, error: 'Failed to reset template' }, { status: 500 })
  }
}
