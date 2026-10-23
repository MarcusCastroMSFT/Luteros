import { Resend } from 'resend'
import {
  campaignUnsubscribeUrl,
  renderCampaignEmail,
  type CampaignEmailPayload,
} from '@/lib/email-campaign'
import {
  emailButton,
  emailEyebrow,
  emailHeading,
  emailList,
  emailNote,
  emailParagraph,
  emailTextFooter,
  renderEmailLayout,
} from '@/lib/email-layout'
import { LUTTEROS_ENTITY } from '@/lib/legal-entity'

// Lazily initialize the Resend client: the constructor throws when RESEND_API_KEY
// is missing, which would otherwise crash every route importing this module.
let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.FROM_EMAIL || process.env.EMAIL_FROM || 'lutteros <noreply@lutteros.com.br>',
  replyTo: process.env.EMAIL_REPLY_TO || process.env.TO_EMAIL || 'contato@lutteros.com.br',
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
    const { data, error } = await getResend().emails.send({
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
      const { data, error } = await getResend().batch.send(
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
 * Welcome email for a new (or returning) newsletter subscriber.
 */
export function renderWelcomeEmail(unsubscribeToken?: string): { subject: string; html: string; text: string } {
  const unsubscribeUrl = campaignUnsubscribeUrl(unsubscribeToken)
  const articlesUrl = `${LUTTEROS_ENTITY.siteUrl}/articles`
  const subject = 'Boas-vindas à newsletter da lutteros'

  const html = renderEmailLayout({
    title: subject,
    preheader: 'Artigos, cursos e eventos sobre saúde sexual, com base em evidências.',
    audience: 'newsletter',
    unsubscribeUrl,
    content: [
      emailEyebrow('Newsletter'),
      emailHeading('Que bom ter você por aqui'),
      emailParagraph(
        'A partir de agora, você recebe na sua caixa de entrada o que publicamos sobre saúde sexual, sempre com base em evidências e revisado por especialistas.',
      ),
      emailParagraph('O que chega até você:'),
      emailList([
        'Artigos novos sobre prática clínica e bem-estar sexual',
        'Aviso de novos cursos e eventos assim que as inscrições abrirem',
        'Materiais de apoio para usar no consultório',
      ]),
      emailButton('Ler os artigos mais recentes', articlesUrl),
      emailNote(
        'Você pode cancelar a inscrição quando quiser pelo link no fim de cada e-mail.',
      ),
    ].join('\n'),
  })

  const text = `Que bom ter você por aqui

A partir de agora, você recebe na sua caixa de entrada o que publicamos sobre saúde sexual, sempre com base em evidências e revisado por especialistas.

O que chega até você:
• Artigos novos sobre prática clínica e bem-estar sexual
• Aviso de novos cursos e eventos assim que as inscrições abrirem
• Materiais de apoio para usar no consultório

Ler os artigos mais recentes: ${articlesUrl}

Você pode cancelar a inscrição quando quiser pelo link no fim de cada e-mail.

${emailTextFooter({ audience: 'newsletter', unsubscribeUrl })}`

  return { subject, html, text }
}

export async function sendWelcomeEmail(email: string, unsubscribeToken?: string): Promise<EmailResult> {
  const { subject, html, text } = renderWelcomeEmail(unsubscribeToken)
  return sendEmail({
    to: email,
    subject,
    html,
    text,
    tags: [
      { name: 'type', value: 'welcome' },
      { name: 'category', value: 'newsletter' },
    ],
  })
}

export { renderCampaignEmail, type CampaignEmailPayload }

/**
 * Send campaign email to a single subscriber. Kept as a thin wrapper around
 * renderCampaignEmail + sendEmail so the test-send endpoint and other
 * one-off paths still work. For bulk sends use renderCampaignEmail + sendBatchEmails.
 */
export async function sendCampaignEmail(
  email: string,
  campaign: CampaignEmailPayload,
  unsubscribeToken?: string,
): Promise<EmailResult> {
  const rendered = renderCampaignEmail(email, campaign, unsubscribeToken)
  return sendEmail({
    to: rendered.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    tags: [
      { name: 'type', value: 'campaign' },
      { name: 'category', value: 'newsletter' },
    ],
  })
}
