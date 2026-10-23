import assert from 'node:assert/strict'
import test from 'node:test'
import { renderEmailVerificationEmail, renderPasswordResetEmail } from './account-emails'
import { htmlToPlainText, renderCampaignEmail } from './email-campaign'
import { EMAIL_INSTAGRAM, emailGreeting, escapeHtml, renderEmailLayout } from './email-layout'
import { renderEmailTemplate, systemEmailTemplates } from '../data/system-email-templates'

const sampleValues: Record<string, string> = {
  name: 'Marina Costa',
  email: 'marina@exemplo.com',
  updatedAt: '23/10/2026',
  courseName: 'Anamnese em Sexologia',
  courseUrl: 'https://www.lutteros.com.br/courses/anamnese',
  instructorName: 'Dra. Lucia',
  progress: '40',
  lastLesson: 'Módulo 2',
  eventName: 'Encontro clínico',
  eventDate: '14/11/2026',
  eventLocation: 'Online',
  eventUrl: 'https://www.lutteros.com.br/events/encontro',
  certificateUrl: 'https://www.lutteros.com.br/certificates/1',
  completedAt: '20/10/2026',
  orderNumber: 'LT-1',
  orderDate: '23/10/2026',
  items: 'Curso',
  total: 'R$ 10,00',
  paymentMethod: 'Pix',
  lastVisit: '01/09/2026',
}

test('escapes HTML special characters', () => {
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;')
})

test('greets by first name and falls back to a plain greeting', () => {
  assert.equal(emailGreeting('  Marina Costa Alves '), 'Olá, Marina')
  assert.equal(emailGreeting(''), 'Olá')
  assert.equal(emailGreeting(null), 'Olá')
})

test('layout carries the brand footer with Instagram, legal entity and reply guidance', () => {
  const html = renderEmailLayout({ title: 'T', preheader: 'Prévia <b>', content: '<p>x</p>', assetBaseUrl: 'https://cdn.test' })
  assert.match(html, /<html lang="pt-BR"/)
  assert.match(html, /https:\/\/cdn\.test\/email\/lutteros-logo\.png/)
  assert.ok(html.includes(EMAIL_INSTAGRAM.url))
  assert.match(html, /CNPJ 68\.635\.950\/0001-26/)
  assert.match(html, /mailto:contato@lutteros\.com\.br/)
  assert.ok(html.includes('Prévia &lt;b&gt;'))
  assert.doesNotMatch(html, /Cancelar inscrição/)
})

test('newsletter layout links to the unsubscribe page', () => {
  const html = renderEmailLayout({
    title: 'T',
    content: '',
    audience: 'newsletter',
    unsubscribeUrl: 'https://www.lutteros.com.br/unsubscribe?token=a&b',
  })
  assert.ok(html.includes('href="https://www.lutteros.com.br/unsubscribe?token=a&amp;b"'))
  assert.match(html, /Cancelar inscrição/)
})

test('system templates resolve every placeholder they declare', () => {
  for (const template of systemEmailTemplates) {
    const rendered = renderEmailTemplate(template, sampleValues)
    for (const part of [rendered.html, rendered.text, rendered.subject]) {
      assert.doesNotMatch(part, /\{\{\w+\}\}/, `${template.code} left a placeholder unresolved`)
    }
    const used = new Set(
      [template.htmlContent, template.textContent, template.subject].flatMap((source) =>
        [...source.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1]),
      ),
    )
    for (const key of used) {
      assert.ok(template.variables.includes(key), `${template.code} uses {{${key}}} without declaring it`)
    }
  }
})

test('system templates escape variables in HTML but keep plain text readable', () => {
  const template = systemEmailTemplates.find((t) => t.code === 'course_enrollment')!
  const rendered = renderEmailTemplate(template, { ...sampleValues, courseName: 'Sexo & <script>' })
  assert.ok(rendered.html.includes('Sexo &amp; &lt;script&gt;'))
  assert.ok(!rendered.html.includes('<script>'))
  assert.ok(rendered.text.includes('Sexo & <script>'))
  assert.equal(rendered.subject, 'Matrícula confirmada: Sexo & <script>')
})

test('password reset email shows the link in the button, fallback and text part', () => {
  const resetUrl = 'https://www.lutteros.com.br/reset-password?token=abc&email=a%40b.com'
  const email = renderPasswordResetEmail({ name: 'Ana<i> Souza', resetUrl })
  assert.equal(email.subject, 'Redefina sua senha da lutteros')
  assert.equal(email.html.split('reset-password?token=abc&amp;email=a%40b.com').length - 1, 3)
  assert.ok(email.html.includes('Olá, Ana&lt;i&gt;.'))
  assert.ok(email.text.includes(resetUrl))
})

test('campaign email wraps admin content and carries the subscriber unsubscribe token', () => {
  const email = renderCampaignEmail('a@b.com', {
    subject: 'Novo artigo',
    previewText: 'Prévia',
    content: '<h2>Título</h2><p>Leia <a href="https://x.test">aqui</a>.</p>',
    ctaText: 'Ler',
    ctaUrl: 'https://x.test/artigo',
  }, 'token-123')
  assert.ok(email.html.includes('<h2>Título</h2>'))
  assert.ok(email.html.includes('/unsubscribe?token=token-123'))
  assert.match(email.text, /Leia aqui \(https:\/\/x\.test\)\./)
  assert.match(email.text, /Cancelar inscrição: .*token-123/)
})

test('converts campaign HTML to readable plain text', () => {
  assert.equal(
    htmlToPlainText('<p>Um &amp; dois</p><ul><li>A</li><li>B</li></ul>'),
    'Um & dois\n\n• A\n\n• B',
  )
})

test('verification email links to the confirmation endpoint in the button, fallback and text part', () => {
  const verifyUrl = 'https://www.lutteros.com.br/api/auth/verify-email?token=abc&email=a%40b.com'
  const email = renderEmailVerificationEmail({ name: 'Ana Souza', verifyUrl })
  assert.equal(email.subject, 'Confirme seu e-mail na lutteros')
  assert.equal(email.html.split('verify-email?token=abc&amp;email=a%40b.com').length - 1, 3)
  assert.match(email.html, /24 horas/)
  assert.ok(email.text.includes(verifyUrl))
})
