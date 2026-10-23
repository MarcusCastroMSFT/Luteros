// Branded building blocks for every email lutteros sends (account, transactional
// and newsletter). Pure string helpers with no server-only imports so the admin
// previews can render exactly what recipients receive.
//
// Email-client constraints drive the markup: table layout, inline styles, PNG
// assets with absolute URLs, web fonts only as progressive enhancement
// (Apple Mail / iOS), and a <style> block used only for mobile + dark mode.

import { LUTTEROS_ENTITY } from '@/lib/legal-entity'

export const EMAIL_COLORS = {
  canvas: '#faf9f6',
  card: '#ffffff',
  ink: '#052628',
  body: '#2c4346',
  muted: '#5b6f71',
  teal: '#198189',
  tealDeep: '#0f5459',
  mint: '#e4eeeb',
  hairline: '#e1e8e5',
  plum: '#630a79',
} as const

const FONT_DISPLAY = "'Cardo', Georgia, 'Times New Roman', serif"
const FONT_BODY = "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"

export const EMAIL_INSTAGRAM = {
  handle: '@lutteros',
  url: 'https://www.instagram.com/lutteros',
} as const

export const EMAIL_TAGLINE = 'Ciência que fundamenta a prática clínica.'

const C = EMAIL_COLORS

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** First-name greeting; falls back to a plain "Olá" when no name is known. */
export function emailGreeting(name?: string | null): string {
  const firstName = name?.trim().split(/\s+/)[0]
  return firstName ? `Olá, ${firstName}` : 'Olá'
}

export function emailAssetBaseUrl(): string {
  const base = process.env.EMAIL_ASSET_URL || LUTTEROS_ENTITY.siteUrl
  return base.replace(/\/+$/, '')
}

// ---------------------------------------------------------------------------
// Content blocks. Arguments named `html` are trusted markup; everything else is
// escaped. `{{placeholders}}` pass through escaping unchanged.
// ---------------------------------------------------------------------------

export function emailEyebrow(text: string): string {
  return `<p class="lt-eyebrow" style="margin:0 0 14px;font-family:${FONT_BODY};font-size:12px;line-height:16px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${C.plum};">${escapeHtml(text)}</p>`
}

export function emailHeading(text: string): string {
  return `<h1 class="lt-ink lt-h1" style="margin:0 0 20px;font-family:${FONT_DISPLAY};font-size:32px;line-height:38px;font-weight:400;letter-spacing:-0.01em;color:${C.ink};">${escapeHtml(text)}</h1>`
}

export function emailParagraph(html: string, options: { muted?: boolean } = {}): string {
  const color = options.muted ? C.muted : C.body
  const cls = options.muted ? 'lt-muted' : 'lt-body'
  return `<p class="${cls}" style="margin:0 0 16px;font-family:${FONT_BODY};font-size:16px;line-height:26px;color:${color};">${html}</p>`
}

export function emailButton(label: string, href: string): string {
  const safeHref = escapeHtml(href)
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" class="lt-btn-wrap" style="margin:28px 0 8px;">
<tr><td align="center" bgcolor="${C.teal}" class="lt-btn-cell" style="border-radius:999px;background-color:${C.teal};">
<a href="${safeHref}" target="_blank" class="lt-btn" style="display:inline-block;padding:15px 32px;font-family:${FONT_BODY};font-size:16px;line-height:20px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:999px;"><!--[if mso]><i style="mso-font-width:200%;mso-text-raise:30px" hidden>&emsp;</i><![endif]--><span style="mso-text-raise:15px;">${escapeHtml(label)}</span><!--[if mso]><i style="mso-font-width:200%" hidden>&emsp;&#8203;</i><![endif]--></a>
</td></tr>
</table>`
}

/** Plain URL under a button, for clients that block buttons or strip links. */
export function emailFallbackLink(href: string): string {
  const safeHref = escapeHtml(href)
  return `<p class="lt-muted" style="margin:16px 0 0;font-family:${FONT_BODY};font-size:13px;line-height:20px;color:${C.muted};">Se o botão não abrir, copie e cole este endereço no navegador:<br><a href="${safeHref}" target="_blank" class="lt-link" style="color:${C.teal};text-decoration:underline;word-break:break-all;">${safeHref}</a></p>`
}

/** Mint panel with a serif title, e.g. a course or event card. */
export function emailFeature(title: string, html = ''): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;">
<tr><td class="lt-panel" style="background-color:${C.mint};border-radius:16px;padding:22px 24px;">
<p class="lt-ink" style="margin:0;font-family:${FONT_DISPLAY};font-size:21px;line-height:28px;color:${C.ink};">${escapeHtml(title)}</p>${html}
</td></tr>
</table>`
}

/** Small muted line inside a feature panel. */
export function emailFeatureMeta(html: string): string {
  return `<p class="lt-muted" style="margin:6px 0 0;font-family:${FONT_BODY};font-size:14px;line-height:22px;color:${C.muted};">${html}</p>`
}

export interface EmailDetailRow {
  label: string
  /** Trusted HTML or a `{{placeholder}}`. */
  value: string
  emphasize?: boolean
}

/** Label/value list on a mint panel (order summary, event details). */
export function emailDetails(rows: EmailDetailRow[]): string {
  const body = rows
    .map((row, index) => {
      const border = index === 0 ? '' : `border-top:1px solid #cfdeda;`
      const size = row.emphasize ? '17px' : '15px'
      const weight = row.emphasize ? 700 : 500
      return `<tr>
<td class="lt-muted lt-rule" valign="top" style="${border}padding:12px 12px 12px 0;font-family:${FONT_BODY};font-size:14px;line-height:22px;color:${C.muted};">${escapeHtml(row.label)}</td>
<td class="lt-ink lt-rule" align="right" valign="top" style="${border}padding:12px 0;font-family:${FONT_BODY};font-size:${size};line-height:22px;font-weight:${weight};color:${C.ink};">${row.value}</td>
</tr>`
    })
    .join('\n')

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;">
<tr><td class="lt-panel" style="background-color:${C.mint};border-radius:16px;padding:8px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${body}
</table>
</td></tr>
</table>`
}

/** Bulleted list with brand-colored markers. Items are trusted HTML. */
export function emailList(items: string[]): string {
  const rows = items
    .map(
      (item) => `<tr>
<td valign="top" width="22" style="padding:9px 0 0;"><div style="width:7px;height:7px;border-radius:50%;background-color:${C.teal};font-size:0;line-height:0;">&nbsp;</div></td>
<td class="lt-body" style="padding:0 0 10px;font-family:${FONT_BODY};font-size:16px;line-height:26px;color:${C.body};">${item}</td>
</tr>`,
    )
    .join('\n')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 12px;">
${rows}
</table>`
}

/**
 * Progress bar. `percent` may be a number or a `{{placeholder}}` resolved at
 * send time, so the filled cell width is expressed as a percentage.
 */
export function emailProgress(percent: string | number, label: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 10px;">
<tr><td style="padding:0 0 8px;font-family:${FONT_BODY};font-size:13px;line-height:18px;font-weight:600;color:${C.tealDeep};" class="lt-link">${escapeHtml(label)}</td></tr>
<tr><td style="padding:0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#c9dcd6;border-radius:999px;">
<tr><td width="${percent}%" height="8" style="width:${percent}%;height:8px;background-color:${C.teal};border-radius:999px;font-size:0;line-height:0;">&nbsp;</td><td height="8" style="height:8px;font-size:0;line-height:0;">&nbsp;</td></tr>
</table>
</td></tr>
</table>`
}

/** Secondary information separated from the main message by a hairline. */
export function emailNote(html: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 0;">
<tr><td class="lt-rule lt-muted" style="border-top:1px solid ${C.hairline};padding:24px 0 0;font-family:${FONT_BODY};font-size:14px;line-height:22px;color:${C.muted};">${html}</td></tr>
</table>`
}

export function emailSignoff(): string {
  return `<p class="lt-body" style="margin:28px 0 0;font-family:${FONT_BODY};font-size:16px;line-height:26px;color:${C.body};">Com cuidado,<br><span class="lt-ink" style="font-family:${FONT_DISPLAY};font-size:19px;font-style:italic;color:${C.ink};">Equipe lutteros</span></p>`
}

export function emailLink(label: string, href: string): string {
  return `<a href="${escapeHtml(href)}" target="_blank" class="lt-link" style="color:${C.teal};text-decoration:underline;">${escapeHtml(label)}</a>`
}

// ---------------------------------------------------------------------------
// Document shell
// ---------------------------------------------------------------------------

export type EmailAudience = 'account' | 'newsletter'

export interface EmailLayoutOptions {
  /** Document title (shown by some clients and screen readers). */
  title: string
  /** Inbox preview line. */
  preheader?: string
  /** Trusted body HTML built from the blocks above. */
  content: string
  audience?: EmailAudience
  /** Required for newsletter emails. */
  unsubscribeUrl?: string
  /** Defaults to the current year; stored templates pass `{{year}}`. */
  year?: string
  assetBaseUrl?: string
}

const HEAD_STYLES = `
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
  a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
  .lt-btn:hover, .lt-btn-cell:hover { background-color: ${C.tealDeep} !important; }
  .lt-prose p { margin: 0 0 16px; }
  .lt-prose h2 { margin: 28px 0 12px; font-family: ${FONT_DISPLAY}; font-size: 24px; line-height: 30px; font-weight: 400; color: ${C.ink}; }
  .lt-prose h3 { margin: 24px 0 8px; font-family: ${FONT_DISPLAY}; font-size: 20px; line-height: 26px; font-weight: 400; color: ${C.ink}; }
  .lt-prose a { color: ${C.teal}; text-decoration: underline; }
  .lt-prose ul, .lt-prose ol { margin: 0 0 16px; padding-left: 22px; }
  .lt-prose li { margin: 0 0 6px; }
  .lt-prose img { max-width: 100%; height: auto; border-radius: 12px; }
  .lt-prose blockquote { margin: 20px 0; padding: 4px 0 4px 18px; border-left: 3px solid ${C.teal}; font-family: ${FONT_DISPLAY}; font-size: 19px; line-height: 28px; color: ${C.ink}; }
  @media only screen and (max-width: 620px) {
    .lt-shell { width: 100% !important; }
    .lt-card-pad { padding: 36px 24px !important; }
    .lt-h1 { font-size: 28px !important; line-height: 34px !important; }
    .lt-btn-wrap { width: 100% !important; }
    .lt-btn { display: block !important; text-align: center !important; }
  }
  @media (prefers-color-scheme: dark) {
    .lt-canvas { background-color: #061b1d !important; }
    .lt-card { background-color: #0b2629 !important; border-color: #1b4044 !important; }
    .lt-panel { background-color: #12373a !important; }
    .lt-ink, .lt-prose h2, .lt-prose h3, .lt-prose blockquote { color: #eef5f3 !important; }
    .lt-body, .lt-prose { color: #cddbd8 !important; }
    .lt-muted { color: #a2b7b4 !important; }
    .lt-link, .lt-prose a { color: #86d3d6 !important; }
    .lt-eyebrow { color: #dcaee8 !important; }
    .lt-tagline { color: #a9d9d4 !important; }
    .lt-rule { border-color: #1f4448 !important; }
    .lt-light-img { display: none !important; }
    .lt-dark-img { display: block !important; width: auto !important; max-height: none !important; overflow: visible !important; }
    img.lt-dark-img[width="150"] { width: 150px !important; }
    img.lt-dark-img[width="80"] { width: 80px !important; height: auto !important; }
    img.lt-dark-img[width="20"] { width: 20px !important; height: 20px !important; }
  }
`

export function renderEmailLayout(options: EmailLayoutOptions): string {
  const {
    title,
    preheader = '',
    content,
    audience = 'account',
    unsubscribeUrl,
    year = String(new Date().getFullYear()),
    assetBaseUrl = emailAssetBaseUrl(),
  } = options

  const site = LUTTEROS_ENTITY.siteUrl
  const siteLabel = site.replace(/^https?:\/\/(www\.)?/, '')
  const contact = LUTTEROS_ENTITY.contactEmail
  const safeTitle = escapeHtml(title)
  const footerLink = `color:${C.tealDeep};text-decoration:none;font-weight:600;`

  const reason =
    audience === 'newsletter'
      ? `Você recebeu este e-mail porque assinou a newsletter da lutteros.${
          unsubscribeUrl
            ? ` <a href="${escapeHtml(unsubscribeUrl)}" target="_blank" class="lt-link" style="color:${C.muted};text-decoration:underline;">Cancelar inscrição</a>`
            : ''
        }`
      : `Você recebeu este e-mail por causa de uma atividade na sua conta lutteros. Dúvidas? Responda esta mensagem ou escreva para <a href="mailto:${contact}" class="lt-link" style="color:${C.muted};text-decoration:underline;">${contact}</a>.`

  // Padding after the preheader keeps inbox previews from pulling in body text.
  const preheaderBlock = preheader
    ? `<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${C.canvas};">${escapeHtml(preheader)}${'&#8199;&#65279;&#847; '.repeat(60)}</div>`
    : ''

  return `<!DOCTYPE html>
<html lang="pt-BR" dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${safeTitle}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<style>h1, .lt-display { font-family: Georgia, serif !important; } td, p, a, span { font-family: Arial, sans-serif; }</style>
<![endif]-->
<!--[if !mso]><!-->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<!--<![endif]-->
<style>${HEAD_STYLES}</style>
</head>
<body class="lt-canvas" style="margin:0;padding:0;background-color:${C.canvas};">
${preheaderBlock}
<div role="article" aria-roledescription="email" aria-label="${safeTitle}" lang="pt-BR" dir="ltr" class="lt-canvas" style="background-color:${C.canvas};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="lt-canvas" style="background-color:${C.canvas};">
<tr><td align="center" style="padding:40px 12px 48px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="lt-shell" style="width:100%;max-width:600px;border-collapse:separate;border-spacing:0;">
<tr><td align="center" style="padding:0 0 28px;">
<a href="${site}" target="_blank" style="display:inline-block;text-decoration:none;"><img src="${assetBaseUrl}/email/lutteros-logo.png" width="150" alt="lutteros" class="lt-light-img" style="display:block;width:150px;max-width:150px;height:auto;border:0;"><!--[if !mso]><!--><img src="${assetBaseUrl}/email/lutteros-logo-dark.png" width="150" alt="lutteros" class="lt-dark-img" style="display:none;width:0;max-height:0;overflow:hidden;border:0;"><!--<![endif]--></a>
</td></tr>
<tr><td class="lt-card lt-card-pad" style="background-color:${C.card};border:1px solid ${C.hairline};border-radius:20px;padding:44px 48px;">
${content}
</td></tr>
<tr><td align="center" style="padding:40px 20px 0;">
<img src="${assetBaseUrl}/email/sprout.png" width="80" alt="" class="lt-light-img" style="display:block;width:80px;height:auto;margin:0 auto 12px;border:0;"><!--[if !mso]><!--><img src="${assetBaseUrl}/email/sprout-dark.png" width="80" alt="" class="lt-dark-img" style="display:none;width:0;max-height:0;overflow:hidden;margin:0 auto 12px;border:0;"><!--<![endif]-->
<p class="lt-tagline lt-display" style="margin:0 0 20px;font-family:${FONT_DISPLAY};font-size:18px;line-height:26px;font-style:italic;color:${C.tealDeep};">${EMAIL_TAGLINE}</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 20px;">
<tr>
<td valign="middle" style="padding:0 8px 0 0;"><a href="${EMAIL_INSTAGRAM.url}" target="_blank" style="text-decoration:none;"><img src="${assetBaseUrl}/email/instagram.png" width="20" height="20" alt="Instagram" class="lt-light-img" style="display:block;width:20px;height:20px;border:0;"><!--[if !mso]><!--><img src="${assetBaseUrl}/email/instagram-dark.png" width="20" height="20" alt="Instagram" class="lt-dark-img" style="display:none;width:0;max-height:0;overflow:hidden;border:0;"><!--<![endif]--></a></td>
<td valign="middle" style="padding:0 14px 0 0;font-family:${FONT_BODY};font-size:14px;line-height:20px;"><a href="${EMAIL_INSTAGRAM.url}" target="_blank" class="lt-link" style="${footerLink}">${EMAIL_INSTAGRAM.handle}</a></td>
<td valign="middle" class="lt-muted" style="padding:0 14px 0 0;font-family:${FONT_BODY};font-size:14px;line-height:20px;color:#a4b4b2;">&middot;</td>
<td valign="middle" style="font-family:${FONT_BODY};font-size:14px;line-height:20px;"><a href="${site}" target="_blank" class="lt-link" style="${footerLink}">${siteLabel}</a></td>
</tr>
</table>
<p class="lt-muted" style="margin:0 auto 12px;max-width:460px;font-family:${FONT_BODY};font-size:12px;line-height:19px;color:${C.muted};">${reason}</p>
<p class="lt-muted" style="margin:0;font-family:${FONT_BODY};font-size:12px;line-height:19px;color:${C.muted};">© ${escapeHtml(year)} ${LUTTEROS_ENTITY.legalName}<br>CNPJ ${LUTTEROS_ENTITY.cnpj} &middot; ${LUTTEROS_ENTITY.forumCity}</p>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</div>
</body>
</html>`
}

/** Plain-text footer matching the HTML footer, for the text/plain part. */
export function emailTextFooter(
  options: { audience?: EmailAudience; unsubscribeUrl?: string; year?: string } = {},
): string {
  const { audience = 'account', unsubscribeUrl, year = String(new Date().getFullYear()) } = options
  const reason =
    audience === 'newsletter'
      ? `Você recebeu este e-mail porque assinou a newsletter da lutteros.${unsubscribeUrl ? `\nCancelar inscrição: ${unsubscribeUrl}` : ''}`
      : `Você recebeu este e-mail por causa de uma atividade na sua conta lutteros.\nDúvidas? Responda esta mensagem ou escreva para ${LUTTEROS_ENTITY.contactEmail}.`

  return `---
lutteros · ${EMAIL_TAGLINE}
Instagram: ${EMAIL_INSTAGRAM.url}
Site: ${LUTTEROS_ENTITY.siteUrl}

${reason}

© ${year} ${LUTTEROS_ENTITY.legalName} · CNPJ ${LUTTEROS_ENTITY.cnpj} · ${LUTTEROS_ENTITY.forumCity}`
}
