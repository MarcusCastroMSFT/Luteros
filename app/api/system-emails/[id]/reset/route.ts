import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { systemEmailTemplates } from '@/data/system-email-templates'
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

    // Validate ID format
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid template ID' },
        { status: 400 }
      )
    }

    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the current template
    const existing = await prisma.system_email_templates.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Find the default template by code
    const defaultTemplate = systemEmailTemplates.find(t => t.code === existing.code)

    if (!defaultTemplate) {
      return NextResponse.json(
        { success: false, error: 'No default template found for this code' },
        { status: 404 }
      )
    }

    // Reset to default values
    const template = await prisma.system_email_templates.update({
      where: { id },
      data: {
        name: defaultTemplate.name,
        description: defaultTemplate.description,
        subject: defaultTemplate.subject,
        previewText: defaultTemplate.previewText,
        htmlContent: defaultTemplate.htmlContent,
        textContent: defaultTemplate.textContent,
        variables: defaultTemplate.variables,
        updatedById: null, // Clear the updatedBy since it's reset to default
      },
      include: {
        updatedBy: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
          },
        },
      },
    })

    // Invalidate cache for this template
    invalidateTemplateCache(existing.code)

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Template reset to default values',
    })
  } catch (error) {
    console.error('Error resetting system email template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset template' },
      { status: 500 }
    )
  }
}
