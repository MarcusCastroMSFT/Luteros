import {
  emailButton,
  emailTextFooter,
  renderEmailLayout,
} from '@/lib/email-layout'
import { LUTTEROS_ENTITY } from '@/lib/legal-entity'

export interface CampaignEmailPayload {
  subject: string
  previewText?: string
  /** Trusted HTML written by admins in the campaign editor. */
  content: string
  ctaText?: string
  ctaUrl?: string
}

export function campaignUnsubscribeUrl(unsubscribeToken?: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || LUTTEROS_ENTITY.siteUrl
  return unsubscribeToken
    ? `${appUrl}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
    : `${appUrl}/unsubscribe`
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h[1-6]|li|blockquote|div)>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Renders a newsletter campaign for one recipient. Used by the bulk send, the
 * test send and the admin preview, so all three show the same email.
 */
export function renderCampaignEmail(
  email: string,
  campaign: CampaignEmailPayload,
  unsubscribeToken?: string,
): { to: string; subject: string; html: string; text: string } {
  const unsubscribeUrl = campaignUnsubscribeUrl(unsubscribeToken)
  const cta =
    campaign.ctaText && campaign.ctaUrl ? emailButton(campaign.ctaText, campaign.ctaUrl) : ''

  const html = renderEmailLayout({
    title: campaign.subject,
    preheader: campaign.previewText,
    audience: 'newsletter',
    unsubscribeUrl,
    content: `<div class="lt-prose lt-body" style="font-family:'DM Sans','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:26px;color:#2c4346;">${campaign.content}</div>${cta}`,
  })

  const ctaText = campaign.ctaText && campaign.ctaUrl ? `\n\n${campaign.ctaText}: ${campaign.ctaUrl}` : ''
  const text = `${htmlToPlainText(campaign.content)}${ctaText}\n\n${emailTextFooter({ audience: 'newsletter', unsubscribeUrl })}`

  return { to: email, subject: campaign.subject, html, text }
}
