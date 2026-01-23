import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import { renderEmailTemplate } from '@/data/system-email-templates'

// Simple email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Validate UUID format
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// POST - Send a test email for this template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate ID format to prevent injection
    if (!isValidUUID(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid template ID' },
        { status: 400 }
      )
    }
    
    // Get current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized or no email available' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email: targetEmail } = body

    // Validate and sanitize email
    const recipientEmail = (targetEmail || user.email).trim().toLowerCase()
    
    if (!isValidEmail(recipientEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Find the template
    const template = await prisma.system_email_templates.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        subject: true,
        htmlContent: true,
        textContent: true,
      },
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Get user profile for sample data
    const userProfile = await prisma.user_profiles.findUnique({
      where: { id: user.id },
      select: { fullName: true, displayName: true },
    })

    const userName = userProfile?.displayName || userProfile?.fullName || 'Usuário'

    // Sample variables for test email
    const sampleVariables: Record<string, string> = {
      name: userName,
      email: recipientEmail,
      verificationLink: `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=sample-token`,
      resetLink: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=sample-token`,
      expiresIn: '24 horas',
      changedAt: new Date().toLocaleString('pt-BR'),
      updatedAt: new Date().toLocaleString('pt-BR'),
      oldEmail: 'antigo@exemplo.com',
      newEmail: recipientEmail,
      courseName: 'Curso de Exemplo',
      courseUrl: `${process.env.NEXT_PUBLIC_APP_URL}/courses/exemplo`,
      instructorName: 'Professor Exemplo',
      progress: '65',
      lastLesson: 'Introdução ao Tema',
      eventName: 'Evento de Exemplo',
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      eventLocation: 'Online',
      eventUrl: `${process.env.NEXT_PUBLIC_APP_URL}/events/exemplo`,
      certificateUrl: `${process.env.NEXT_PUBLIC_APP_URL}/certificates/exemplo`,
      completedAt: new Date().toLocaleDateString('pt-BR'),
      orderNumber: '12345',
      orderDate: new Date().toLocaleDateString('pt-BR'),
      items: 'Curso Premium - R$ 197,00',
      total: 'R$ 197,00',
      paymentMethod: 'Cartão de Crédito',
      lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    }

    // Render the template with sample variables
    const rendered = renderEmailTemplate(
      {
        htmlContent: template.htmlContent,
        textContent: template.textContent || '',
        subject: template.subject,
      },
      sampleVariables
    )

    // Send test email with [TESTE] prefix
    const result = await sendEmail({
      to: recipientEmail,
      subject: `[TESTE] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
      tags: [
        { name: 'type', value: 'test' },
        { name: 'template', value: template.code },
      ],
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send test email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${recipientEmail}`,
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
