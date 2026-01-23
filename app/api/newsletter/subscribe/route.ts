import { NextRequest, NextResponse, connection } from 'next/server'
import prisma from '@/lib/prisma'
import { sanitizeInput } from '@/lib/utils'
import { validateEmail } from '@/lib/email-validation'
import { sendWelcomeEmail } from '@/lib/email'

// Rate limiting for newsletter subscriptions
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX_SUBSCRIPTIONS = 5 // max 5 subscription attempts per hour per IP

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const limit = rateLimitStore.get(identifier)
  
  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }
  
  if (limit.count >= RATE_LIMIT_MAX_SUBSCRIPTIONS) {
    return false
  }
  
  limit.count++
  return true
}

// Get client IP from request headers
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    await connection()

    // Get client IP for rate limiting
    const clientIP = getClientIP(request)
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Por favor, aguarde um momento.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { email, source } = body

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      )
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Comprehensive email validation (format, disposable domains, fake patterns)
    const validationResult = validateEmail(trimmedEmail)
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      )
    }

    // Sanitize source
    const sanitizedSource = source ? sanitizeInput(String(source)).slice(0, 50) : 'footer'

    // Check if email already exists
    const existingSubscriber = await prisma.newsletter_subscribers.findUnique({
      where: { email: trimmedEmail },
    })

    if (existingSubscriber) {
      // If already subscribed and active, return success (don't reveal subscription status)
      if (existingSubscriber.status === 'ACTIVE') {
        return NextResponse.json({
          success: true,
          message: 'Obrigado! Você receberá nossas novidades em breve.',
        })
      }
      
      // If unsubscribed, reactivate
      if (existingSubscriber.status === 'UNSUBSCRIBED') {
        await prisma.newsletter_subscribers.update({
          where: { email: trimmedEmail },
          data: {
            status: 'ACTIVE',
            unsubscribedAt: null,
            confirmedAt: new Date(),
            source: sanitizedSource,
            ipAddress: clientIP,
          },
        })

        // Send welcome back email (don't wait for it)
        sendWelcomeEmail(trimmedEmail).catch(err => 
          console.error('Failed to send welcome back email:', err)
        )
        
        return NextResponse.json({
          success: true,
          message: 'Bem-vindo de volta! Você foi reativado em nossa newsletter.',
        })
      }

      // If pending, just acknowledge
      return NextResponse.json({
        success: true,
        message: 'Obrigado! Você receberá nossas novidades em breve.',
      })
    }

    // Create new subscriber
    // Note: In production, you might want to set status to PENDING and send a confirmation email
    await prisma.newsletter_subscribers.create({
      data: {
        email: trimmedEmail,
        source: sanitizedSource,
        ipAddress: clientIP,
        status: 'ACTIVE', // Auto-confirm for now, change to PENDING if implementing double opt-in
        confirmedAt: new Date(),
      },
    })

    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(trimmedEmail).catch(err => 
      console.error('Failed to send welcome email:', err)
    )

    return NextResponse.json({
      success: true,
      message: 'Obrigado! Você foi inscrito em nossa newsletter.',
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    
    // Handle unique constraint violation (race condition)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({
        success: true,
        message: 'Obrigado! Você receberá nossas novidades em breve.',
      })
    }

    return NextResponse.json(
      { error: 'Erro ao processar inscrição. Tente novamente.' },
      { status: 500 }
    )
  }
}
