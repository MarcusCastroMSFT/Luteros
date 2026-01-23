import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
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

    const template = await prisma.system_email_templates.findUnique({
      where: { id },
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

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: template,
    })
  } catch (error) {
    console.error('Error fetching system email template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}

// PATCH - Update a template
export async function PATCH(
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
    
    // Get current user for audit
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      subject, 
      previewText, 
      htmlContent, 
      textContent,
      isActive,
    } = body

    // Validate required fields
    if (!subject || !htmlContent) {
      return NextResponse.json(
        { success: false, error: 'Subject and HTML content are required' },
        { status: 400 }
      )
    }

    // Validate field lengths
    if (subject.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Subject must be less than 500 characters' },
        { status: 400 }
      )
    }

    if (htmlContent.length > 500000) { // 500KB limit for HTML
      return NextResponse.json(
        { success: false, error: 'HTML content is too large' },
        { status: 400 }
      )
    }

    // Check if template exists
    const existing = await prisma.system_email_templates.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    const template = await prisma.system_email_templates.update({
      where: { id },
      data: {
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        subject,
        previewText: previewText || null,
        htmlContent,
        textContent: textContent || null,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        updatedById: user.id,
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
    })
  } catch (error) {
    console.error('Error updating system email template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a template
export async function DELETE(
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
    
    // Get current user and check admin role
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const userRole = await prisma.user_roles.findFirst({
      where: { userId: user.id },
      select: { role: true },
    })

    if (userRole?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only admins can delete templates' },
        { status: 403 }
      )
    }

    // Check if template exists
    const existing = await prisma.system_email_templates.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Delete the template
    await prisma.system_email_templates.delete({
      where: { id },
    })

    // Invalidate cache for this template
    invalidateTemplateCache(existing.code)

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting system email template:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    )
  }
}
