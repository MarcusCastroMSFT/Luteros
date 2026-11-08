import {
  emailButton,
  emailDetails,
  emailEyebrow,
  emailFallbackLink,
  emailGreeting,
  emailHeading,
  emailList,
  emailNote,
  emailParagraph,
  emailSignoff,
  emailTextFooter,
  escapeHtml,
  renderEmailLayout,
} from '@/lib/email-layout'
import { LUTTEROS_ENTITY } from '@/lib/legal-entity'

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

export function formatBrl(amount: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'America/Sao_Paulo' }).format(date)
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(date)
}

function multiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, '<br>')
}

export function renderAccountWelcomeEmail({
  name,
  coursesUrl,
  articlesUrl,
  myCoursesUrl,
}: {
  name?: string | null
  coursesUrl: string
  articlesUrl: string
  myCoursesUrl: string
}): RenderedEmail {
  const subject = 'Bem-vindo(a) à lutteros'
  const greeting = emailGreeting(name)
  const contact = LUTTEROS_ENTITY.contactEmail

  const html = renderEmailLayout({
    title: subject,
    preheader: 'Sua conta está pronta. Veja por onde começar.',
    content: [
      emailEyebrow('Sua conta está pronta'),
      emailHeading('Que bom ter você na lutteros'),
      emailParagraph(`${escapeHtml(greeting)}. A lutteros reúne cursos e artigos de saúde sexual com base científica, em linguagem clara e sem tabu.`),
      emailParagraph('Para começar:'),
      emailList([
        `<strong>Cursos</strong>: aprenda no seu ritmo, com especialistas. Os cursos que você compra ficam em <a href="${escapeHtml(myCoursesUrl)}" style="color:inherit;">Meus cursos</a>.`,
        '<strong>Artigos</strong>: leituras confiáveis para estudar e consultar quando precisar.',
      ]),
      emailButton('Explorar os cursos', coursesUrl),
      emailParagraph(`Prefere ler primeiro? <a href="${escapeHtml(articlesUrl)}" style="color:inherit;">Veja os artigos mais recentes</a>.`, { muted: true }),
      emailNote(`Dúvidas? Responda este e-mail ou escreva para <a href="mailto:${contact}" style="color:inherit;">${contact}</a>.`),
      emailSignoff(),
    ].join('\n'),
  })

  const text = `${greeting}. A lutteros reúne cursos e artigos de saúde sexual com base científica, em linguagem clara e sem tabu.

Para começar:
- Cursos: aprenda no seu ritmo, com especialistas. Os cursos que você compra ficam em Meus cursos (${myCoursesUrl}).
- Artigos: leituras confiáveis para estudar e consultar quando precisar (${articlesUrl}).

Explorar os cursos: ${coursesUrl}

Dúvidas? Responda este e-mail ou escreva para ${contact}.

Com cuidado,
Equipe lutteros

${emailTextFooter()}`

  return { subject, html, text }
}

export function renderCourseEnrollmentEmail({
  name,
  courseTitle,
  courseUrl,
  myCoursesUrl,
}: {
  name?: string | null
  courseTitle: string
  courseUrl: string
  myCoursesUrl: string
}): RenderedEmail {
  const subject = `Matrícula confirmada: ${courseTitle}`
  const greeting = emailGreeting(name)

  const html = renderEmailLayout({
    title: subject,
    preheader: `Seu acesso a ${courseTitle} já está liberado.`,
    content: [
      emailEyebrow('Matrícula confirmada'),
      emailHeading('Seu curso já está liberado'),
      emailParagraph(`${escapeHtml(greeting)}. Sua matrícula em <strong>${escapeHtml(courseTitle)}</strong> está confirmada e você já pode assistir às aulas.`),
      emailButton('Começar o curso', courseUrl),
      emailFallbackLink(courseUrl),
      emailNote(
        `O curso fica em <a href="${escapeHtml(myCoursesUrl)}" style="color:inherit;">Meus cursos</a> sempre que você entrar com este e-mail. O acesso é pessoal: as aulas e os materiais são exclusivos para a sua conta.`,
      ),
      emailSignoff(),
    ].join('\n'),
  })

  const text = `${greeting}. Sua matrícula em "${courseTitle}" está confirmada e você já pode assistir às aulas.

Começar o curso: ${courseUrl}

O curso fica em Meus cursos (${myCoursesUrl}) sempre que você entrar com este e-mail. O acesso é pessoal: as aulas e os materiais são exclusivos para a sua conta.

Com cuidado,
Equipe lutteros

${emailTextFooter()}`

  return { subject, html, text }
}

export function renderCourseRefundEmail({
  name,
  courseTitle,
  amount,
  coursesUrl,
}: {
  name?: string | null
  courseTitle: string
  amount: number
  coursesUrl: string
}): RenderedEmail {
  const subject = `Reembolso confirmado: ${courseTitle}`
  const greeting = emailGreeting(name)
  const total = formatBrl(amount)
  const contact = LUTTEROS_ENTITY.contactEmail

  const html = renderEmailLayout({
    title: subject,
    preheader: `O pagamento de ${courseTitle} foi reembolsado.`,
    content: [
      emailEyebrow('Reembolso'),
      emailHeading('Seu reembolso foi registrado'),
      emailParagraph(`${escapeHtml(greeting)}. O pagamento do curso abaixo foi reembolsado e o acesso a ele foi encerrado.`),
      emailDetails([
        { label: 'Curso', value: escapeHtml(courseTitle) },
        { label: 'Valor reembolsado', value: escapeHtml(total), emphasize: true },
      ]),
      emailParagraph(
        'O prazo para o valor aparecer no seu cartão, na fatura ou na conta depende da forma de pagamento e da instituição financeira.',
        { muted: true },
      ),
      emailButton('Ver outros cursos', coursesUrl),
      emailNote(`Não reconhece este reembolso? Escreva para <a href="mailto:${contact}" style="color:inherit;">${contact}</a>.`),
      emailSignoff(),
    ].join('\n'),
  })

  const text = `${greeting}. O pagamento do curso abaixo foi reembolsado e o acesso a ele foi encerrado.

Curso: ${courseTitle}
Valor reembolsado: ${total}

O prazo para o valor aparecer no seu cartão, na fatura ou na conta depende da forma de pagamento e da instituição financeira.

Ver outros cursos: ${coursesUrl}

Não reconhece este reembolso? Escreva para ${contact}.

Com cuidado,
Equipe lutteros

${emailTextFooter()}`

  return { subject, html, text }
}

export function renderWaitlistConfirmationEmail({ articlesUrl }: { articlesUrl: string }): RenderedEmail {
  const subject = 'Você está na lista de espera da lutteros'

  const html = renderEmailLayout({
    title: subject,
    preheader: 'Avisaremos por e-mail quando a assinatura estiver disponível.',
    audience: 'waitlist',
    content: [
      emailEyebrow('Lista de espera'),
      emailHeading('Seu lugar está reservado'),
      emailParagraph('Recebemos o seu interesse na assinatura da lutteros. Assim que ela estiver disponível, você será avisado neste endereço de e-mail.'),
      emailParagraph('Enquanto isso, os artigos da lutteros estão abertos para leitura.', { muted: true }),
      emailButton('Ler os artigos', articlesUrl),
      emailSignoff(),
    ].join('\n'),
  })

  const text = `Recebemos o seu interesse na assinatura da lutteros. Assim que ela estiver disponível, você será avisado neste endereço de e-mail.

Enquanto isso, os artigos da lutteros estão abertos para leitura: ${articlesUrl}

Com cuidado,
Equipe lutteros

${emailTextFooter({ audience: 'waitlist' })}`

  return { subject, html, text }
}

export function renderAdminSaleEmail({
  buyerName,
  buyerEmail,
  courseTitle,
  amount,
  paidAt,
  enrollmentId,
}: {
  buyerName?: string | null
  buyerEmail: string
  courseTitle: string
  amount: number
  paidAt: Date
  enrollmentId: string
}): RenderedEmail {
  const total = formatBrl(amount)
  const subject = `Nova venda: ${courseTitle} (${total})`
  const buyer = buyerName?.trim() || buyerEmail

  const html = renderEmailLayout({
    title: subject,
    preheader: `${buyer} comprou ${courseTitle}.`,
    audience: 'internal',
    content: [
      emailEyebrow('Nova venda'),
      emailHeading('Um curso foi vendido'),
      emailDetails([
        { label: 'Curso', value: escapeHtml(courseTitle) },
        { label: 'Aluno', value: escapeHtml(buyer) },
        { label: 'E-mail', value: escapeHtml(buyerEmail) },
        { label: 'Pago em', value: escapeHtml(formatDateTime(paidAt)) },
        { label: 'Valor', value: escapeHtml(total), emphasize: true },
        { label: 'Matrícula', value: escapeHtml(enrollmentId) },
      ]),
    ].join('\n'),
  })

  const text = `Um curso foi vendido.

Curso: ${courseTitle}
Aluno: ${buyer} <${buyerEmail}>
Pago em: ${formatDateTime(paidAt)}
Valor: ${total}
Matrícula: ${enrollmentId}

${emailTextFooter({ audience: 'internal' })}`

  return { subject, html, text }
}

export function renderAdminContactEmail({
  name,
  email,
  phone,
  reasonLabel,
  subject: contactSubject,
  message,
  adminUrl,
}: {
  name: string
  email: string
  phone: string
  reasonLabel: string
  subject: string | null
  message: string
  adminUrl: string
}): RenderedEmail {
  const subject = `Novo contato: ${contactSubject?.trim() || reasonLabel} — ${name}`

  const html = renderEmailLayout({
    title: subject,
    preheader: message.slice(0, 120),
    audience: 'internal',
    content: [
      emailEyebrow('Formulário de contato'),
      emailHeading('Nova mensagem recebida'),
      emailDetails([
        { label: 'Nome', value: escapeHtml(name) },
        { label: 'E-mail', value: escapeHtml(email) },
        { label: 'Telefone', value: escapeHtml(phone) },
        { label: 'Motivo', value: escapeHtml(reasonLabel) },
        ...(contactSubject?.trim() ? [{ label: 'Assunto', value: escapeHtml(contactSubject.trim()) }] : []),
      ]),
      emailParagraph(multiline(message)),
      emailNote('Responder a este e-mail envia a resposta direto para quem escreveu.'),
      emailButton('Abrir no painel', adminUrl),
    ].join('\n'),
  })

  const text = `Nova mensagem pelo formulário de contato.

Nome: ${name}
E-mail: ${email}
Telefone: ${phone}
Motivo: ${reasonLabel}${contactSubject?.trim() ? `\nAssunto: ${contactSubject.trim()}` : ''}

${message}

Responder a este e-mail envia a resposta direto para quem escreveu.
Painel: ${adminUrl}

${emailTextFooter({ audience: 'internal' })}`

  return { subject, html, text }
}
