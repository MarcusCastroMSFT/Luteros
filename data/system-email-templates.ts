// Default system email templates (account, notification, transaction and
// engagement emails). Admins can override them in Admin → E-mails do sistema;
// the database copy wins when present.
//
// Templates are stored as full HTML with `{{placeholders}}`, built from the
// shared brand blocks in lib/email-layout.ts.

import {
  emailButton,
  emailDetails,
  emailEyebrow,
  emailFeature,
  emailFeatureMeta,
  emailGreeting,
  emailHeading,
  emailList,
  emailNote,
  emailParagraph,
  emailProgress,
  emailSignoff,
  emailTextFooter,
  escapeHtml,
  renderEmailLayout,
} from '@/lib/email-layout'

export type SystemEmailCategory =
  | 'AUTHENTICATION'
  | 'ACCOUNT'
  | 'NOTIFICATION'
  | 'TRANSACTION'
  | 'ENGAGEMENT'

export interface SystemEmailTemplate {
  code: string
  name: string
  description: string
  category: SystemEmailCategory
  subject: string
  previewText: string
  htmlContent: string
  textContent: string
  variables: string[]
}

const appUrl = '{{appUrl}}'
const linkStyle = 'color:#198189;text-decoration:underline;'
const contactLink = `<a href="mailto:contato@lutteros.com.br" class="lt-link" style="${linkStyle}">contato@lutteros.com.br</a>`

function link(label: string, href: string): string {
  return `<a href="${href}" class="lt-link" style="${linkStyle}">${label}</a>`
}

function layout(title: string, preheader: string, blocks: string[]): string {
  return renderEmailLayout({ title, preheader, content: blocks.join('\n'), year: '{{year}}' })
}

function textEmail(body: string, options: { signoff?: boolean } = {}): string {
  const signoff = options.signoff === false ? '' : '\n\nCom cuidado,\nEquipe lutteros'
  return `${body.trim()}${signoff}\n\n${emailTextFooter({ year: '{{year}}' })}`
}

export const systemEmailTemplates: SystemEmailTemplate[] = [
  // Authentication emails (password reset) live in lib/account-emails.ts.

  // ACCOUNT
  {
    code: 'profile_updated',
    name: 'Perfil Atualizado',
    description: 'Enviado quando o usuário atualiza informações do perfil',
    category: 'ACCOUNT',
    subject: 'Seu perfil na lutteros foi atualizado',
    previewText: 'As informações do seu perfil foram alteradas em {{updatedAt}}.',
    variables: ['name', 'greeting', 'email', 'updatedAt', 'appUrl', 'year'],
    textContent: textEmail(
      `
{{greeting}}.

As informações do seu perfil na lutteros foram alteradas em {{updatedAt}}.

Ver meu perfil: ${appUrl}/profile

Foi você? Então está tudo certo. Se não reconhece essa alteração, redefina sua senha em ${appUrl}/forgot-password e escreva para contato@lutteros.com.br.`,
      { signoff: false },
    ),
    htmlContent: layout('Seu perfil foi atualizado', 'As informações do seu perfil foram alteradas em {{updatedAt}}.', [
      emailEyebrow('Sua conta'),
      emailHeading('Seu perfil foi atualizado'),
      emailParagraph('{{greeting}}.'),
      emailParagraph('As informações do seu perfil na lutteros foram alteradas em <strong>{{updatedAt}}</strong>.'),
      emailButton('Ver meu perfil', `${appUrl}/profile`),
      emailNote(
        `Foi você? Então está tudo certo. Se não reconhece essa alteração, ${link('redefina sua senha', `${appUrl}/forgot-password`)} e escreva para ${contactLink}.`,
      ),
    ]),
  },

  // NOTIFICATION
  {
    code: 'course_enrollment',
    name: 'Matrícula em Curso',
    description: 'Enviado quando o usuário se matricula em um curso',
    category: 'NOTIFICATION',
    subject: 'Matrícula confirmada: {{courseName}}',
    previewText: 'Seu acesso a {{courseName}} já está liberado.',
    variables: ['name', 'greeting', 'email', 'courseName', 'courseUrl', 'instructorName', 'appUrl', 'year'],
    textContent: textEmail(`
{{greeting}}.

Sua matrícula em "{{courseName}}" está confirmada e o acesso já está liberado.
Com {{instructorName}}

Começar o curso: {{courseUrl}}

O curso fica em Meus cursos (${appUrl}/courses/my-courses) sempre que você entrar com este e-mail. O acesso é pessoal: as aulas e os materiais são exclusivos para a sua conta.`),
    htmlContent: layout('Matrícula confirmada', 'Seu acesso a {{courseName}} já está liberado.', [
      emailEyebrow('Matrícula confirmada'),
      emailHeading('Seu curso já está liberado'),
      emailParagraph('{{greeting}}. Sua matrícula está confirmada e você já pode assistir às aulas.'),
      emailFeature('{{courseName}}', emailFeatureMeta('Com {{instructorName}}')),
      emailButton('Começar o curso', '{{courseUrl}}'),
      emailNote(
        `O curso fica em ${link('Meus cursos', `${appUrl}/courses/my-courses`)} sempre que você entrar com este e-mail. O acesso é pessoal: as aulas e os materiais são exclusivos para a sua conta.`,
      ),
      emailSignoff(),
    ]),
  },

  {
    code: 'event_registration',
    name: 'Inscrição em Evento',
    description: 'Enviado quando o usuário se inscreve em um evento',
    category: 'NOTIFICATION',
    subject: 'Inscrição confirmada: {{eventName}}',
    previewText: '{{eventDate}} · {{eventLocation}}',
    variables: ['name', 'greeting', 'email', 'eventName', 'eventDate', 'eventLocation', 'eventUrl', 'appUrl', 'year'],
    textContent: textEmail(`
{{greeting}}.

Sua inscrição em "{{eventName}}" está confirmada.

Data: {{eventDate}}
Local: {{eventLocation}}

Detalhes do evento: {{eventUrl}}

Guarde este e-mail: ele é o seu comprovante de inscrição. Todas as suas inscrições ficam em ${appUrl}/events/my-events.`),
    htmlContent: layout('Inscrição confirmada', '{{eventDate}} · {{eventLocation}}', [
      emailEyebrow('Inscrição confirmada'),
      emailHeading('Sua vaga está garantida'),
      emailParagraph('{{greeting}}. Sua inscrição em <strong>{{eventName}}</strong> está confirmada.'),
      emailDetails([
        { label: 'Data', value: '{{eventDate}}' },
        { label: 'Local', value: '{{eventLocation}}' },
      ]),
      emailButton('Ver detalhes do evento', '{{eventUrl}}'),
      emailNote(
        `Guarde este e-mail: ele é o seu comprovante de inscrição. Todas as suas inscrições ficam em ${link('Meus eventos', `${appUrl}/events/my-events`)}.`,
      ),
      emailSignoff(),
    ]),
  },

  {
    code: 'certificate_issued',
    name: 'Certificado Emitido',
    description: 'Enviado quando um certificado de conclusão é emitido',
    category: 'NOTIFICATION',
    subject: 'Seu certificado de {{courseName}} está pronto',
    previewText: 'Você concluiu o curso em {{completedAt}}. Parabéns!',
    variables: ['name', 'greeting', 'email', 'courseName', 'certificateUrl', 'completedAt', 'appUrl', 'year'],
    textContent: textEmail(`
{{greeting}}.

Parabéns! Você concluiu "{{courseName}}" em {{completedAt}}.

Seu certificado de conclusão está pronto:
{{certificateUrl}}

Ele fica disponível na sua conta e pode ser baixado novamente a qualquer momento.`),
    htmlContent: layout('Seu certificado está pronto', 'Você concluiu o curso em {{completedAt}}. Parabéns!', [
      emailEyebrow('Curso concluído'),
      emailHeading('Parabéns, seu certificado está pronto'),
      emailParagraph('{{greeting}}. Concluir um curso exige constância, e você chegou lá.'),
      emailFeature('{{courseName}}', emailFeatureMeta('Concluído em {{completedAt}}')),
      emailButton('Baixar certificado', '{{certificateUrl}}'),
      emailNote('O certificado fica disponível na sua conta e pode ser baixado novamente a qualquer momento.'),
      emailSignoff(),
    ]),
  },

  // TRANSACTION
  {
    code: 'purchase_confirmation',
    name: 'Confirmação de Compra',
    description: 'Enviado após uma compra ser processada com sucesso',
    category: 'TRANSACTION',
    subject: 'Pagamento confirmado · Pedido {{orderNumber}}',
    previewText: 'Recebemos seu pagamento de {{total}}. Seu acesso já está liberado.',
    variables: ['name', 'greeting', 'email', 'orderNumber', 'orderDate', 'items', 'total', 'paymentMethod', 'appUrl', 'year'],
    textContent: textEmail(
      `
{{greeting}}.

Recebemos seu pagamento e o acesso já está liberado.

Pedido: {{orderNumber}}
Data: {{orderDate}}
Itens: {{items}}
Pagamento: {{paymentMethod}}
Total: {{total}}

Acessar meus cursos: ${appUrl}/courses/my-courses

Dúvidas sobre o pedido? Responda este e-mail informando o número do pedido. Pedidos de reembolso seguem os Termos de uso: ${appUrl}/terms`,
      { signoff: false },
    ),
    htmlContent: layout('Pagamento confirmado', 'Recebemos seu pagamento de {{total}}. Seu acesso já está liberado.', [
      emailEyebrow('Pagamento confirmado'),
      emailHeading('Obrigado pela sua compra'),
      emailParagraph('{{greeting}}. Recebemos seu pagamento e o acesso já está liberado.'),
      emailDetails([
        { label: 'Pedido', value: '{{orderNumber}}' },
        { label: 'Data', value: '{{orderDate}}' },
        { label: 'Itens', value: '{{items}}' },
        { label: 'Pagamento', value: '{{paymentMethod}}' },
        { label: 'Total', value: '{{total}}', emphasize: true },
      ]),
      emailButton('Acessar meus cursos', `${appUrl}/courses/my-courses`),
      emailNote(
        `Dúvidas sobre o pedido? Responda este e-mail informando o número do pedido ou escreva para ${contactLink}. Pedidos de reembolso seguem os ${link('Termos de uso', `${appUrl}/terms`)}.`,
      ),
    ]),
  },

  // ENGAGEMENT
  {
    code: 'inactive_reminder',
    name: 'Lembrete de Inatividade',
    description: 'Enviado para usuários inativos há algum tempo',
    category: 'ENGAGEMENT',
    subject: 'Tem conteúdo novo esperando por você na lutteros',
    previewText: 'Artigos, cursos e eventos publicados desde a sua última visita.',
    variables: ['name', 'greeting', 'email', 'lastVisit', 'appUrl', 'year'],
    textContent: textEmail(`
{{greeting}}.

Sua última visita foi em {{lastVisit}}. Desde então, publicamos:

• Artigos revisados por especialistas: ${appUrl}/articles
• Cursos com certificado: ${appUrl}/courses
• Eventos e encontros ao vivo: ${appUrl}/events

Ver as novidades: ${appUrl}`),
    htmlContent: layout('Novidades na lutteros', 'Artigos, cursos e eventos publicados desde a sua última visita.', [
      emailEyebrow('Novidades'),
      emailHeading('Tem conteúdo novo esperando por você'),
      emailParagraph('{{greeting}}. Sua última visita foi em {{lastVisit}}. Desde então, publicamos:'),
      emailList([
        `${link('Artigos', `${appUrl}/articles`)} revisados por especialistas`,
        `${link('Cursos', `${appUrl}/courses`)} com certificado`,
        `${link('Eventos', `${appUrl}/events`)} e encontros ao vivo`,
      ]),
      emailButton('Ver as novidades', appUrl),
      emailSignoff(),
    ]),
  },

  {
    code: 'course_reminder',
    name: 'Lembrete de Curso',
    description: 'Enviado para lembrar o usuário de continuar um curso em andamento',
    category: 'ENGAGEMENT',
    subject: 'Continue de onde parou: {{courseName}}',
    previewText: 'Você já concluiu {{progress}}% do curso.',
    variables: ['name', 'greeting', 'email', 'courseName', 'progress', 'lastLesson', 'courseUrl', 'appUrl', 'year'],
    textContent: textEmail(`
{{greeting}}.

Você já concluiu {{progress}}% de "{{courseName}}". Seu progresso está salvo.

Última aula assistida: {{lastLesson}}

Continuar o curso: {{courseUrl}}`),
    htmlContent: layout('Continue de onde parou', 'Você já concluiu {{progress}}% do curso.', [
      emailEyebrow('Seu curso'),
      emailHeading('Continue de onde parou'),
      emailParagraph('{{greeting}}. Seu progresso está salvo: é só abrir e seguir para a próxima aula.'),
      emailFeature(
        '{{courseName}}',
        emailProgress('{{progress}}', '{{progress}}% concluído') +
          emailFeatureMeta('Última aula: <strong>{{lastLesson}}</strong>'),
      ),
      emailButton('Continuar o curso', '{{courseUrl}}'),
      emailSignoff(),
    ]),
  },
]

export function getSystemEmailTemplateByCode(code: string): SystemEmailTemplate | undefined {
  return systemEmailTemplates.find((t) => t.code === code)
}

export function getSystemEmailTemplatesByCategory(category: SystemEmailCategory): SystemEmailTemplate[] {
  return systemEmailTemplates.filter((t) => t.category === category)
}

/**
 * Fills `{{placeholders}}`. Values are HTML-escaped in the HTML body (names and
 * course titles are user-controlled) and inserted as-is in subject and text.
 */
export function renderEmailTemplate(
  template: { htmlContent: string; textContent: string; subject: string },
  variables: Record<string, string>,
): { html: string; text: string; subject: string } {
  const allVariables: Record<string, string> = {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://www.lutteros.com.br',
    year: new Date().getFullYear().toString(),
    greeting: emailGreeting(variables.name),
    ...variables,
  }

  const fill = (source: string, escape: boolean) =>
    source.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
      const value = allVariables[key]
      if (value === undefined) return match
      return escape ? escapeHtml(value) : value
    })

  return {
    html: fill(template.htmlContent, true),
    text: fill(template.textContent, false),
    subject: fill(template.subject, false),
  }
}
