import { Resend } from 'resend'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'lutteros <noreply@lutteros.com.br>',
  replyTo: process.env.EMAIL_REPLY_TO || 'contato@lutteros.com.br',
}

// Types
export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: { name: string; value: string }[]
}

export interface SendBatchEmailOptions {
  emails: Array<{
    to: string
    subject: string
    html: string
    text?: string
  }>
}

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
  skipped?: boolean
  message?: string
}

export interface BatchEmailResult {
  success: boolean
  sent: number
  failed: number
  errors: string[]
}

/**
 * Send a single email
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || EMAIL_CONFIG.replyTo,
      tags: options.tags,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email send exception:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Send batch emails (max 100 per batch with Resend)
 */
export async function sendBatchEmails(options: SendBatchEmailOptions): Promise<BatchEmailResult> {
  const results: BatchEmailResult = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [],
  }

  // Resend batch API allows up to 100 emails per request
  const BATCH_SIZE = 100
  const batches = []
  
  for (let i = 0; i < options.emails.length; i += BATCH_SIZE) {
    batches.push(options.emails.slice(i, i + BATCH_SIZE))
  }

  for (const batch of batches) {
    try {
      const { data, error } = await resend.batch.send(
        batch.map(email => ({
          from: EMAIL_CONFIG.from,
          to: email.to,
          subject: email.subject,
          html: email.html,
          text: email.text,
          replyTo: EMAIL_CONFIG.replyTo,
        }))
      )

      if (error) {
        results.failed += batch.length
        results.errors.push(error.message)
      } else {
        results.sent += data?.data?.length || batch.length
      }
    } catch (error) {
      results.failed += batch.length
      results.errors.push(error instanceof Error ? error.message : 'Batch send failed')
    }
  }

  results.success = results.failed === 0

  return results
}

/**
 * Send welcome email to new newsletter subscriber
 */
export async function sendWelcomeEmail(email: string): Promise<EmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo à Newsletter lutteros</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #18181b;">
                🎉 Bem-vindo à lutteros!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
                Olá! Obrigado por se inscrever na nossa newsletter.
              </p>
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
                A partir de agora, você receberá em primeira mão:
              </p>
              <ul style="margin: 0 0 16px; padding-left: 24px; font-size: 16px; line-height: 1.8; color: #3f3f46;">
                <li>Novos cursos e conteúdos exclusivos</li>
                <li>Dicas e materiais sobre saúde e bem-estar</li>
                <li>Eventos e workshops especiais</li>
                <li>Ofertas e promoções exclusivas para assinantes</li>
              </ul>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #3f3f46;">
                Fique de olho na sua caixa de entrada!
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://lutteros.com.br'}" 
                       style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Explorar Cursos
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f4f4f5; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #71717a; text-align: center;">
                Você está recebendo este email porque se inscreveu na newsletter da lutteros.
                <br>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://lutteros.com.br'}/unsubscribe?email=${encodeURIComponent(email)}" 
                   style="color: #71717a; text-decoration: underline;">
                  Cancelar inscrição
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  const text = `
Bem-vindo à Newsletter lutteros!

Olá! Obrigado por se inscrever na nossa newsletter.

A partir de agora, você receberá em primeira mão:
- Novos cursos e conteúdos exclusivos
- Dicas e materiais sobre saúde e bem-estar
- Eventos e workshops especiais
- Ofertas e promoções exclusivas para assinantes

Fique de olho na sua caixa de entrada!

---
Você está recebendo este email porque se inscreveu na newsletter da lutteros.
  `

  return sendEmail({
    to: email,
    subject: '🎉 Bem-vindo à Newsletter lutteros!',
    html,
    text,
    tags: [
      { name: 'type', value: 'welcome' },
      { name: 'category', value: 'newsletter' },
    ],
  })
}

/**
 * Send campaign email to a subscriber
 */
export async function sendCampaignEmail(
  email: string,
  campaign: {
    subject: string
    previewText?: string
    content: string
    ctaText?: string
    ctaUrl?: string
  },
  unsubscribeToken?: string
): Promise<EmailResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lutteros.com.br'
  const unsubscribeUrl = unsubscribeToken 
    ? `${appUrl}/unsubscribe?token=${unsubscribeToken}`
    : `${appUrl}/unsubscribe`
    
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${campaign.subject}</title>
  ${campaign.previewText ? `<meta name="x-apple-disable-message-reformatting"><meta name="description" content="${campaign.previewText}">` : ''}
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  ${campaign.previewText ? `<div style="display: none; max-height: 0; overflow: hidden;">${campaign.previewText}</div>` : ''}
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #18181b;">
                lutteros
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <div style="font-size: 16px; line-height: 1.7; color: #3f3f46;">
                ${campaign.content}
              </div>
            </td>
          </tr>
          
          ${campaign.ctaText && campaign.ctaUrl ? `
          <!-- CTA Button -->
          <tr>
            <td style="padding: 20px 40px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${campaign.ctaUrl}" 
                       style="display: inline-block; padding: 14px 32px; background-color: #18181b; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      ${campaign.ctaText}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f4f4f5; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #71717a; text-align: center;">
                Você está recebendo este email porque se inscreveu na newsletter da lutteros.
                <br>
                <a href="${unsubscribeUrl}" 
                   style="color: #71717a; text-decoration: underline;">
                  Cancelar inscrição
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  // Strip HTML for plain text version
  const text = campaign.content
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim()

  return sendEmail({
    to: email,
    subject: campaign.subject,
    html,
    text,
    tags: [
      { name: 'type', value: 'campaign' },
      { name: 'category', value: 'newsletter' },
    ],
  })
}
