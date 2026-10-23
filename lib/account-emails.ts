import {
  emailButton,
  emailEyebrow,
  emailFallbackLink,
  emailGreeting,
  emailHeading,
  emailNote,
  emailParagraph,
  emailSignoff,
  emailTextFooter,
  escapeHtml,
  renderEmailLayout,
} from '@/lib/email-layout'

export function renderPasswordResetEmail({
  name,
  resetUrl,
}: {
  name?: string | null
  resetUrl: string
}): { subject: string; html: string; text: string } {
  const subject = 'Redefina sua senha da lutteros'
  const greeting = emailGreeting(name)

  const html = renderEmailLayout({
    title: subject,
    preheader: 'Use o link deste e-mail para criar uma nova senha. Ele vale por 1 hora.',
    content: [
      emailEyebrow('Acesso à conta'),
      emailHeading('Crie uma nova senha'),
      emailParagraph(`${escapeHtml(greeting)}.`),
      emailParagraph(
        'Recebemos um pedido para redefinir a senha da sua conta. Toque no botão abaixo para escolher uma nova. O link vale por <strong>1 hora</strong> e funciona uma única vez.',
      ),
      emailButton('Criar nova senha', resetUrl),
      emailFallbackLink(resetUrl),
      emailNote(
        'Não pediu essa alteração? Ignore este e-mail: sua senha atual continua valendo. Se você entra com o Google, a nova senha passa a funcionar junto com o login do Google.',
      ),
      emailSignoff(),
    ].join('\n'),
  })

  const text = `${greeting}.

Recebemos um pedido para redefinir a senha da sua conta lutteros. Acesse o link abaixo para escolher uma nova. Ele vale por 1 hora e funciona uma única vez.

${resetUrl}

Não pediu essa alteração? Ignore este e-mail: sua senha atual continua valendo. Se você entra com o Google, a nova senha passa a funcionar junto com o login do Google.

Com cuidado,
Equipe lutteros

${emailTextFooter()}`

  return { subject, html, text }
}

export function renderEmailVerificationEmail({
  name,
  verifyUrl,
}: {
  name?: string | null
  verifyUrl: string
}): { subject: string; html: string; text: string } {
  const subject = 'Confirme seu e-mail na lutteros'
  const greeting = emailGreeting(name)

  const html = renderEmailLayout({
    title: subject,
    preheader: 'Falta um passo: confirme seu e-mail para entrar na sua conta.',
    content: [
      emailEyebrow('Nova conta'),
      emailHeading('Confirme seu e-mail'),
      emailParagraph(`${escapeHtml(greeting)}. Que bom ter você na lutteros.`),
      emailParagraph(
        'Para ativar sua conta, confirme que este endereço é seu. O link vale por <strong>24 horas</strong>.',
      ),
      emailButton('Confirmar e-mail', verifyUrl),
      emailFallbackLink(verifyUrl),
      emailNote(
        'Não criou uma conta na lutteros? Ignore este e-mail: sem a confirmação, a conta não é ativada.',
      ),
      emailSignoff(),
    ].join('\n'),
  })

  const text = `${greeting}. Que bom ter você na lutteros.

Para ativar sua conta, confirme que este endereço é seu. O link vale por 24 horas:

${verifyUrl}

Não criou uma conta na lutteros? Ignore este e-mail: sem a confirmação, a conta não é ativada.

Com cuidado,
Equipe lutteros

${emailTextFooter()}`

  return { subject, html, text }
}
