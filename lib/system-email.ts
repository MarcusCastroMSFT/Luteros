import prisma from '@/lib/prisma'
import { sendEmail, type EmailResult } from '@/lib/email'
import { 
  renderEmailTemplate,
  getSystemEmailTemplateByCode 
} from '@/data/system-email-templates'

// Type for template variables
export type SystemEmailVariables = Record<string, string>

// Simple in-memory cache for templates (TTL: 5 minutes)
const templateCache = new Map<string, { data: TemplateData; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface TemplateData {
  htmlContent: string
  textContent: string
  subject: string
  previewText: string | null
}

/**
 * Get a system email template from the database with caching
 * Falls back to default template if not found in DB
 */
async function getTemplate(code: string): Promise<TemplateData | null> {
  // Check cache first
  const cached = templateCache.get(code)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  try {
    // Try to get from database first
    const dbTemplate = await prisma.system_email_templates.findUnique({
      where: { code },
      select: {
        htmlContent: true,
        textContent: true,
        subject: true,
        previewText: true,
        isActive: true,
      },
    })

    // If template exists but is inactive, return null (don't send email)
    if (dbTemplate && !dbTemplate.isActive) {
      console.log(`Template ${code} is inactive, email will not be sent`)
      return null
    }

    if (dbTemplate) {
      const data: TemplateData = {
        htmlContent: dbTemplate.htmlContent,
        textContent: dbTemplate.textContent || '',
        subject: dbTemplate.subject,
        previewText: dbTemplate.previewText,
      }
      
      // Cache the result
      templateCache.set(code, { data, timestamp: Date.now() })
      return data
    }

    // Fallback to default template only if not in database
    const defaultTemplate = getSystemEmailTemplateByCode(code)
    if (defaultTemplate) {
      const data: TemplateData = {
        htmlContent: defaultTemplate.htmlContent,
        textContent: defaultTemplate.textContent,
        subject: defaultTemplate.subject,
        previewText: defaultTemplate.previewText,
      }
      
      // Cache the default too
      templateCache.set(code, { data, timestamp: Date.now() })
      return data
    }

    return null
  } catch (error) {
    console.error(`Error fetching template ${code}:`, error)
    
    // Fallback to default on error (don't cache errors)
    const defaultTemplate = getSystemEmailTemplateByCode(code)
    if (defaultTemplate) {
      return {
        htmlContent: defaultTemplate.htmlContent,
        textContent: defaultTemplate.textContent,
        subject: defaultTemplate.subject,
        previewText: defaultTemplate.previewText,
      }
    }
    
    return null
  }
}

/**
 * Invalidate cache for a specific template (call after updates)
 */
export function invalidateTemplateCache(code?: string): void {
  if (code) {
    templateCache.delete(code)
  } else {
    templateCache.clear()
  }
}

/**
 * Send a system email using a template from the database
 * Returns success: true with skipped: true if template is inactive
 */
export async function sendSystemEmail(
  code: string,
  to: string,
  variables: SystemEmailVariables = {}
): Promise<EmailResult> {
  try {
    const template = await getTemplate(code)
    
    if (!template) {
      // Template is either not found or inactive
      console.log(`Template ${code} not available (not found or inactive), skipping email`)
      return { success: true, skipped: true, message: `Template ${code} is inactive or not found` }
    }

    // Render the template with variables
    const rendered = renderEmailTemplate(template, variables)

    // Send the email
    return sendEmail({
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      tags: [
        { name: 'type', value: 'system' },
        { name: 'template', value: code },
      ],
    })
  } catch (error) {
    console.error(`Error sending system email ${code}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================
// Convenience functions for specific emails
// ============================================

// NOTE: Authentication emails (welcome, email verification, password reset,
// password changed, email changed) are now handled by Supabase Auth.
// Configure them in Supabase Dashboard > Authentication > Email Templates

/**
 * Send profile updated notification email
 */
export async function sendProfileUpdatedEmail(
  to: string,
  name: string
): Promise<EmailResult> {
  return sendSystemEmail('profile_updated', to, {
    name,
    email: to,
    updatedAt: new Date().toLocaleString('pt-BR'),
  })
}

/**
 * Send course enrollment confirmation email
 */
export async function sendCourseEnrollmentEmail(
  to: string,
  name: string,
  courseName: string,
  courseUrl: string,
  instructorName: string
): Promise<EmailResult> {
  return sendSystemEmail('course_enrollment', to, {
    name,
    email: to,
    courseName,
    courseUrl,
    instructorName,
  })
}

/**
 * Send event registration confirmation email
 */
export async function sendEventRegistrationEmail(
  to: string,
  name: string,
  eventName: string,
  eventDate: string,
  eventLocation: string,
  eventUrl: string
): Promise<EmailResult> {
  return sendSystemEmail('event_registration', to, {
    name,
    email: to,
    eventName,
    eventDate,
    eventLocation,
    eventUrl,
  })
}

/**
 * Send certificate issued notification email
 */
export async function sendCertificateIssuedEmail(
  to: string,
  name: string,
  courseName: string,
  certificateUrl: string,
  completedAt: string
): Promise<EmailResult> {
  return sendSystemEmail('certificate_issued', to, {
    name,
    email: to,
    courseName,
    certificateUrl,
    completedAt,
  })
}

/**
 * Send purchase confirmation email
 */
export async function sendPurchaseConfirmationEmail(
  to: string,
  name: string,
  orderNumber: string,
  orderDate: string,
  items: string,
  total: string,
  paymentMethod: string
): Promise<EmailResult> {
  return sendSystemEmail('purchase_confirmation', to, {
    name,
    email: to,
    orderNumber,
    orderDate,
    items,
    total,
    paymentMethod,
  })
}

/**
 * Send inactive user reminder email
 */
export async function sendInactiveReminderEmail(
  to: string,
  name: string,
  lastVisit: string
): Promise<EmailResult> {
  return sendSystemEmail('inactive_reminder', to, {
    name,
    email: to,
    lastVisit,
  })
}

/**
 * Send course reminder email
 */
export async function sendCourseReminderEmail(
  to: string,
  name: string,
  courseName: string,
  progress: string,
  lastLesson: string,
  courseUrl: string
): Promise<EmailResult> {
  return sendSystemEmail('course_reminder', to, {
    name,
    email: to,
    courseName,
    progress,
    lastLesson,
    courseUrl,
  })
}
