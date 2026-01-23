import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

// GET - List all system email templates
export async function GET(request: NextRequest) {
  try {
    // Auth check - only admins should access this
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const whereClause: Record<string, unknown> = {}
    if (category) {
      whereClause.category = category
    }

    const templates = await prisma.system_email_templates.findMany({
      where: whereClause,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        category: true,
        subject: true,
        previewText: true,
        htmlContent: true,
        textContent: true,
        variables: true,
        isActive: true,
        updatedById: true,
        createdAt: true,
        updatedAt: true,
        updatedBy: {
          select: {
            id: true,
            fullName: true,
            displayName: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: templates,
    })
  } catch (error) {
    console.error('Error fetching system email templates:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch system email templates' 
      },
      { status: 500 }
    )
  }
}
