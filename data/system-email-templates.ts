// System Email Templates
// Default templates for transactional emails (signup, password reset, etc.)
// Following email best practices: 600px max width, table-based layout, inline styles

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

// Shared styles
const brandColor = '#84cc16' // Lime-500
const brandColorDark = '#65a30d' // Lime-600
const textColor = '#18181b'
const mutedColor = '#71717a'
const backgroundColor = '#f4f4f5'
const appUrl = '{{appUrl}}' // Will be replaced with actual URL

// Reusable email wrapper
const emailWrapper = (content: string, previewText?: string) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>lutteros</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 20px !important; }
      .content { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${backgroundColor}; -webkit-font-smoothing: antialiased;">
  ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>` : ''}
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" class="container" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);">
          <!-- Logo Header -->
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #e4e4e7;">
              <a href="${appUrl}" style="text-decoration: none;">
                <span style="font-size: 24px; font-weight: 700; color: ${textColor}; letter-spacing: -0.5px;">lutteros</span>
              </a>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td class="content" style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: ${backgroundColor}; border-radius: 0 0 12px 12px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 13px; color: ${mutedColor};">
                      © {{year}} lutteros. Todos os direitos reservados.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: ${mutedColor};">
                      Este é um email automático, por favor não responda.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

// Button component
const button = (text: string, url: string, primary = true) => `
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
  <tr>
    <td align="center">
      <a href="${url}" 
         style="display: inline-block; padding: 14px 32px; background-color: ${primary ? textColor : 'transparent'}; color: ${primary ? '#ffffff' : textColor}; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px; ${!primary ? `border: 2px solid ${textColor};` : ''} transition: opacity 0.2s;">
        ${text}
      </a>
    </td>
  </tr>
</table>
`

export const systemEmailTemplates: SystemEmailTemplate[] = [
  // ============================================
  // AUTHENTICATION EMAILS
  // ============================================
  {
    code: 'welcome',
    name: 'E-mail de Boas-vindas',
    description: 'Enviado quando um novo usuário se registra na plataforma',
    category: 'AUTHENTICATION',
    subject: '🎉 Bem-vindo à lutteros, {{name}}!',
    previewText: 'Sua conta foi criada com sucesso. Vamos começar sua jornada!',
    variables: ['name', 'email', 'appUrl', 'year'],
    textContent: `Bem-vindo à lutteros, {{name}}!

Sua conta foi criada com sucesso!

Estamos muito felizes em ter você conosco. A lutteros é uma plataforma dedicada à sua jornada de aprendizado e bem-estar.

O que você pode fazer agora:
- Explorar nossos cursos e conteúdos
- Participar da comunidade
- Acompanhar eventos e workshops
- Conectar-se com especialistas

Acesse sua conta: ${appUrl}/login

Se você tiver alguma dúvida, nossa equipe está sempre pronta para ajudar.

Até breve!
Equipe lutteros

---
© {{year}} lutteros. Todos os direitos reservados.
Este é um email automático, por favor não responda.`,
    htmlContent: emailWrapper(`
<h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: ${textColor}; line-height: 1.3;">
  Bem-vindo à lutteros, {{name}}! 🎉
</h1>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Sua conta foi criada com sucesso!
</p>

<p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${mutedColor};">
  Estamos muito felizes em ter você conosco. A lutteros é uma plataforma dedicada à sua jornada de aprendizado e bem-estar.
</p>

<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #fafafa; border-radius: 8px;">
  <tr>
    <td style="padding: 20px;">
      <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: ${textColor};">
        O que você pode fazer agora:
      </p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: ${mutedColor};">
        <li>Explorar nossos cursos e conteúdos</li>
        <li>Participar da comunidade</li>
        <li>Acompanhar eventos e workshops</li>
        <li>Conectar-se com especialistas</li>
      </ul>
    </td>
  </tr>
</table>

${button('Acessar Minha Conta', `${appUrl}/login`)}

<p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: ${mutedColor};">
  Se você tiver alguma dúvida, nossa equipe está sempre pronta para ajudar.
</p>
`, 'Sua conta foi criada com sucesso. Vamos começar sua jornada!'),
  },

  {
    code: 'email_verification',
    name: 'Verificação de E-mail',
    description: 'Enviado para verificar o endereço de e-mail do usuário',
    category: 'AUTHENTICATION',
    subject: 'Verifique seu e-mail - lutteros',
    previewText: 'Confirme seu endereço de e-mail para ativar sua conta.',
    variables: ['name', 'email', 'verificationLink', 'expiresIn', 'appUrl', 'year'],
    textContent: `Olá {{name}},

Confirme seu endereço de e-mail

Para concluir seu cadastro na lutteros, precisamos verificar seu e-mail.

Clique no link abaixo para confirmar:
{{verificationLink}}

Este link expira em {{expiresIn}}.

Se você não criou uma conta na lutteros, pode ignorar este e-mail.

---
© {{year}} lutteros. Todos os direitos reservados.
Este é um email automático, por favor não responda.`,
    htmlContent: emailWrapper(`
<h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: ${textColor}; line-height: 1.3;">
  Verifique seu e-mail
</h1>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá {{name}},
</p>

<p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${mutedColor};">
  Para concluir seu cadastro na lutteros, precisamos verificar seu e-mail. Clique no botão abaixo para confirmar:
</p>

${button('Verificar E-mail', '{{verificationLink}}')}

<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        ⏱️ Este link expira em <strong>{{expiresIn}}</strong>.
      </p>
    </td>
  </tr>
</table>

<p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${mutedColor};">
  Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
</p>
<p style="margin: 8px 0 0; font-size: 12px; color: ${brandColor}; word-break: break-all;">
  {{verificationLink}}
</p>

<p style="margin: 24px 0 0; font-size: 13px; line-height: 1.6; color: ${mutedColor};">
  Se você não criou uma conta na lutteros, pode ignorar este e-mail.
</p>
`, 'Confirme seu endereço de e-mail para ativar sua conta.'),
  },

  {
    code: 'password_reset',
    name: 'Recuperação de Senha',
    description: 'Enviado quando o usuário solicita redefinição de senha',
    category: 'AUTHENTICATION',
    subject: 'Redefinir sua senha - lutteros',
    previewText: 'Recebemos uma solicitação para redefinir sua senha.',
    variables: ['name', 'email', 'resetLink', 'expiresIn', 'appUrl', 'year'],
    textContent: `Olá {{name}},

Redefinição de senha

Recebemos uma solicitação para redefinir a senha da sua conta lutteros.

Clique no link abaixo para criar uma nova senha:
{{resetLink}}

Este link expira em {{expiresIn}}.

Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanecerá inalterada.

Por segurança, nunca compartilhe este link com ninguém.

---
© {{year}} lutteros. Todos os direitos reservados.
Este é um email automático, por favor não responda.`,
    htmlContent: emailWrapper(`
<h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: ${textColor}; line-height: 1.3;">
  Redefinir sua senha
</h1>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá {{name}},
</p>

<p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${mutedColor};">
  Recebemos uma solicitação para redefinir a senha da sua conta lutteros.
</p>

${button('Redefinir Senha', '{{resetLink}}')}

<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        ⏱️ Este link expira em <strong>{{expiresIn}}</strong>.
      </p>
    </td>
  </tr>
</table>

<p style="margin: 0; font-size: 14px; line-height: 1.6; color: ${mutedColor};">
  Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
</p>
<p style="margin: 8px 0 0; font-size: 12px; color: ${brandColor}; word-break: break-all;">
  {{resetLink}}
</p>

<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0; font-size: 14px; color: #991b1b;">
        🔒 <strong>Dica de segurança:</strong> Nunca compartilhe este link com ninguém.
      </p>
    </td>
  </tr>
</table>

<p style="margin: 0; font-size: 13px; line-height: 1.6; color: ${mutedColor};">
  Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanecerá inalterada.
</p>
`, 'Recebemos uma solicitação para redefinir sua senha.'),
  },

  {
    code: 'password_changed',
    name: 'Senha Alterada',
    description: 'Enviado quando a senha do usuário é alterada com sucesso',
    category: 'AUTHENTICATION',
    subject: '🔐 Sua senha foi alterada - lutteros',
    previewText: 'Sua senha foi alterada com sucesso.',
    variables: ['name', 'email', 'changedAt', 'appUrl', 'year'],
    textContent: `Olá {{name}},

Sua senha foi alterada com sucesso!

Estamos escrevendo para confirmar que a senha da sua conta lutteros foi alterada em {{changedAt}}.

Se você fez essa alteração, pode ignorar este e-mail.

Se você NÃO alterou sua senha, sua conta pode ter sido comprometida. Entre em contato conosco imediatamente.

---
© {{year}} lutteros. Todos os direitos reservados.
Este é um email automático, por favor não responda.`,
    htmlContent: emailWrapper(`
<h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: ${textColor}; line-height: 1.3;">
  Senha alterada com sucesso 🔐
</h1>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá {{name}},
</p>

<p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${mutedColor};">
  Estamos escrevendo para confirmar que a senha da sua conta lutteros foi alterada em <strong>{{changedAt}}</strong>.
</p>

<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0; font-size: 14px; color: #065f46;">
        ✅ Se você fez essa alteração, pode ignorar este e-mail.
      </p>
    </td>
  </tr>
</table>

<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #991b1b;">
        ⚠️ Não foi você?
      </p>
      <p style="margin: 0; font-size: 14px; color: #991b1b;">
        Se você NÃO alterou sua senha, sua conta pode ter sido comprometida. Entre em contato conosco imediatamente.
      </p>
    </td>
  </tr>
</table>

${button('Entrar em Contato', `${appUrl}/help`, false)}
`, 'Sua senha foi alterada com sucesso.'),
  },

  // ============================================
  // ACCOUNT EMAILS
  // ============================================
  {
    code: 'profile_updated',
    name: 'Perfil Atualizado',
    description: 'Enviado quando o usuário atualiza informações do perfil',
    category: 'ACCOUNT',
    subject: 'Perfil atualizado - lutteros',
    previewText: 'As informações do seu perfil foram atualizadas.',
    variables: ['name', 'email', 'updatedAt', 'appUrl', 'year'],
    textContent: `Olá {{name}},

Perfil atualizado

As informações do seu perfil na lutteros foram atualizadas em {{updatedAt}}.

Se você fez essa alteração, não precisa fazer mais nada.

Se você não reconhece essa atividade, entre em contato conosco imediatamente.

---
© {{year}} lutteros. Todos os direitos reservados.
Este é um email automático, por favor não responda.`,
    htmlContent: emailWrapper(`
<h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: ${textColor}; line-height: 1.3;">
  Perfil atualizado
</h1>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá {{name}},
</p>

<p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${mutedColor};">
  As informações do seu perfil na lutteros foram atualizadas em <strong>{{updatedAt}}</strong>.
</p>

<p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: ${mutedColor};">
  Se você fez essa alteração, não precisa fazer mais nada. Se você não reconhece essa atividade, entre em contato conosco imediatamente.
</p>

${button('Ver Meu Perfil', `${appUrl}/dashboard/settings`)}
`, 'As informações do seu perfil foram atualizadas.'),
  },

  {
    code: 'email_changed',
    name: 'E-mail Alterado',
    description: 'Enviado para o e-mail antigo quando o usuário altera seu e-mail',
    category: 'ACCOUNT',
    subject: '⚠️ E-mail da sua conta foi alterado - lutteros',
    previewText: 'O e-mail associado à sua conta foi alterado.',
    variables: ['name', 'oldEmail', 'newEmail', 'changedAt', 'appUrl', 'year'],
    textContent: `Olá {{name}},

O e-mail da sua conta foi alterado

O e-mail associado à sua conta lutteros foi alterado de {{oldEmail}} para {{newEmail}} em {{changedAt}}.

Se você fez essa alteração, não precisa fazer mais nada.

Se você NÃO fez essa alteração, sua conta pode ter sido comprometida. Entre em contato conosco imediatamente.

---
© {{year}} lutteros. Todos os direitos reservados.
Este é um email automático, por favor não responda.`,
    htmlContent: emailWrapper(`
<h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: ${textColor}; line-height: 1.3;">
  E-mail da conta alterado ⚠️
</h1>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá {{name}},
</p>

<p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${mutedColor};">
  O e-mail associado à sua conta lutteros foi alterado em <strong>{{changedAt}}</strong>.
</p>

<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #fafafa; border-radius: 8px;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0 0 8px; font-size: 14px; color: ${mutedColor};">
        <strong>E-mail anterior:</strong> {{oldEmail}}
      </p>
      <p style="margin: 0; font-size: 14px; color: ${mutedColor};">
        <strong>Novo e-mail:</strong> {{newEmail}}
      </p>
    </td>
  </tr>
</table>

<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
  <tr>
    <td style="padding: 16px;">
      <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #991b1b;">
        ⚠️ Não foi você?
      </p>
      <p style="margin: 0; font-size: 14px; color: #991b1b;">
        Se você NÃO alterou seu e-mail, sua conta pode ter sido comprometida. Entre em contato conosco imediatamente.
      </p>
    </td>
  </tr>
</table>

${button('Entrar em Contato', `${appUrl}/help`, false)}
`, 'O e-mail associado à sua conta foi alterado.'),
  },

  // ============================================
  // NOTIFICATION EMAILS
  // ============================================
  {
    code: 'course_enrollment',
    name: 'Matrícula em Curso',
    description: 'Enviado quando o usuário se matricula em um curso',
    category: 'NOTIFICATION',
    subject: '🎓 Matrícula confirmada: {{courseName}}',
    previewText: 'Sua matrícula foi confirmada! Comece a aprender agora.',
    variables: ['name', 'email', 'courseName', 'courseUrl', 'instructorName', 'appUrl', 'year'],
    textContent: `Olá {{name}},

Matrícula confirmada!

Sua matrícula no curso "{{courseName}}" foi confirmada com sucesso.

Instrutor: {{instructorName}}

Você já pode começar a assistir às aulas acessando:
{{courseUrl}}

Bons estudos!

---
© {{year}} lutteros. Todos os direitos reservados.
Este é um email automático, por favor não responda.`,
    htmlContent: emailWrapper(`
<h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: ${textColor}; line-height: 1.3;">
  Matrícula confirmada! 🎓
</h1>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá {{name}},
</p>

<p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${mutedColor};">
  Sua matrícula no curso foi confirmada com sucesso!
</p>

<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #fafafa; border-radius: 8px; overflow: hidden;">
  <tr>
    <td style="padding: 24px;">
      <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: ${textColor};">
        {{courseName}}
      </h2>
      <p style="margin: 0; font-size: 14px; color: ${mutedColor};">
        👨‍🏫 Instrutor: <strong>{{instructorName}}</strong>
      </p>
    </td>
  </tr>
</table>

${button('Começar a Estudar', '{{courseUrl}}')}

<p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: ${mutedColor};">
  Bons estudos! Se tiver alguma dúvida, nossa equipe está pronta para ajudar.
</p>
`, 'Sua matrícula foi confirmada! Comece a aprender agora.'),
  },

  {
    code: 'event_registration',
    name: 'Inscrição em Evento',
    description: 'Enviado quando o usuário se inscreve em um evento',
    category: 'NOTIFICATION',
    subject: '📅 Inscrição confirmada: {{eventName}}',
    previewText: 'Sua inscrição no evento foi confirmada!',
    variables: ['name', 'email', 'eventName', 'eventDate', 'eventLocation', 'eventUrl', 'appUrl', 'year'],
    textContent: `Olá {{name}},

Inscrição confirmada!

Sua inscrição no evento "{{eventName}}" foi confirmada.

Data: {{eventDate}}
Local: {{eventLocation}}

Mais detalhes em: {{eventUrl}}

Até lá!

---
© {{year}} lutteros. Todos os direitos reservados.
Este é um email automático, por favor não responda.`,
    htmlContent: emailWrapper(`
<h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: ${textColor}; line-height: 1.3;">
  Inscrição confirmada! 📅
</h1>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá {{name}},
</p>

<p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${mutedColor};">
  Sua inscrição no evento foi confirmada!
</p>

<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #fafafa; border-radius: 8px; overflow: hidden;">
  <tr>
    <td style="padding: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: ${textColor};">
        {{eventName}}
      </h2>
      <table role="presentation" style="border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: ${mutedColor};">
            📅 <strong>Data:</strong> {{eventDate}}
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: ${mutedColor};">
            📍 <strong>Local:</strong> {{eventLocation}}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

${button('Ver Detalhes do Evento', '{{eventUrl}}')}

<p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: ${mutedColor};">
  Até lá! Adicione este evento ao seu calendário para não esquecer.
</p>
`, 'Sua inscrição no evento foi confirmada!'),
  },

  {
    code: 'certificate_issued',
    name: 'Certificado Emitido',
    description: 'Enviado quando um certificado de conclusão é emitido',
    category: 'NOTIFICATION',
    subject: '🏆 Parabéns! Seu certificado está pronto',
    previewText: 'Você concluiu o curso e seu certificado está disponível!',
    variables: ['name', 'email', 'courseName', 'certificateUrl', 'completedAt', 'appUrl', 'year'],
    textContent: `Parabéns, {{name}}! 🎉

Você concluiu o curso "{{courseName}}" em {{completedAt}}.

Seu certificado de conclusão está pronto e pode ser baixado a qualquer momento:
{{certificateUrl}}

Continue aprendendo e evoluindo!

---
© {{year}} lutteros. Todos os direitos reservados.
Este é um email automático, por favor não responda.`,
    htmlContent: emailWrapper(`
<div style="text-align: center; margin-bottom: 24px;">
  <span style="font-size: 64px;">🏆</span>
</div>

<h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: ${textColor}; line-height: 1.3; text-align: center;">
  Parabéns, {{name}}!
</h1>

<p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${mutedColor}; text-align: center;">
  Você concluiu o curso com sucesso!
</p>

<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background: linear-gradient(135deg, #fefce8 0%, #ecfdf5 100%); border-radius: 12px; overflow: hidden;">
  <tr>
    <td style="padding: 32px; text-align: center;">
      <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: ${mutedColor};">
        Certificado de Conclusão
      </p>
      <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: ${textColor};">
        {{courseName}}
      </h2>
      <p style="margin: 0; font-size: 14px; color: ${mutedColor};">
        Concluído em {{completedAt}}
      </p>
    </td>
  </tr>
</table>

${button('Baixar Certificado', '{{certificateUrl}}')}

<p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: ${mutedColor}; text-align: center;">
  Continue aprendendo e evoluindo! Explore nossos outros cursos.
</p>
`, 'Você concluiu o curso e seu certificado está disponível!'),
  },

  // ============================================
  // TRANSACTION EMAILS
  // ============================================
  {
    code: 'purchase_confirmation',
    name: 'Confirmação de Compra',
    description: 'Enviado após uma compra ser processada com sucesso',
    category: 'TRANSACTION',
    subject: '✅ Compra confirmada - Pedido #{{orderNumber}}',
    previewText: 'Sua compra foi processada com sucesso!',
    variables: ['name', 'email', 'orderNumber', 'orderDate', 'items', 'total', 'paymentMethod', 'appUrl', 'year'],
    textContent: `Olá {{name}},

Compra confirmada!

Seu pedido #{{orderNumber}} foi processado com sucesso em {{orderDate}}.

Itens: {{items}}
Total: {{total}}
Forma de pagamento: {{paymentMethod}}

Você pode acessar seus produtos na sua conta.

Obrigado pela compra!

---
© {{year}} lutteros. Todos os direitos reservados.
Este é um email automático, por favor não responda.`,
    htmlContent: emailWrapper(`
<h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: ${textColor}; line-height: 1.3;">
  Compra confirmada! ✅
</h1>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá {{name}},
</p>

<p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${mutedColor};">
  Seu pedido foi processado com sucesso!
</p>

<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #fafafa; border-radius: 8px; overflow: hidden;">
  <tr>
    <td style="padding: 20px; border-bottom: 1px solid #e4e4e7;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="font-size: 14px; color: ${mutedColor};">Pedido</td>
          <td style="font-size: 14px; font-weight: 600; color: ${textColor}; text-align: right;">#{{orderNumber}}</td>
        </tr>
        <tr>
          <td style="font-size: 14px; color: ${mutedColor}; padding-top: 8px;">Data</td>
          <td style="font-size: 14px; color: ${textColor}; text-align: right; padding-top: 8px;">{{orderDate}}</td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; border-bottom: 1px solid #e4e4e7;">
      <p style="margin: 0 0 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: ${mutedColor};">
        Itens
      </p>
      <div style="font-size: 14px; color: ${textColor};">
        {{items}}
      </div>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="font-size: 14px; color: ${mutedColor};">Pagamento</td>
          <td style="font-size: 14px; color: ${textColor}; text-align: right;">{{paymentMethod}}</td>
        </tr>
        <tr>
          <td style="font-size: 16px; font-weight: 600; color: ${textColor}; padding-top: 12px;">Total</td>
          <td style="font-size: 16px; font-weight: 600; color: ${brandColor}; text-align: right; padding-top: 12px;">{{total}}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

${button('Acessar Meus Produtos', `${appUrl}/dashboard`)}

<p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: ${mutedColor};">
  Obrigado pela compra! Se tiver alguma dúvida, estamos aqui para ajudar.
</p>
`, 'Sua compra foi processada com sucesso!'),
  },

  // ============================================
  // ENGAGEMENT EMAILS
  // ============================================
  {
    code: 'inactive_reminder',
    name: 'Lembrete de Inatividade',
    description: 'Enviado para usuários inativos há algum tempo',
    category: 'ENGAGEMENT',
    subject: '👋 Sentimos sua falta na lutteros!',
    previewText: 'Faz tempo que você não nos visita. Temos novidades para você!',
    variables: ['name', 'email', 'lastVisit', 'appUrl', 'year'],
    textContent: `Olá {{name}},

Sentimos sua falta!

Notamos que faz um tempo desde sua última visita ({{lastVisit}}).

Enquanto isso, adicionamos novos cursos, eventos e conteúdos que podem ser do seu interesse.

Que tal dar uma passada e ver as novidades?

Acesse: ${appUrl}

Esperamos você de volta!

---
© {{year}} lutteros. Todos os direitos reservados.
Este é um email automático, por favor não responda.`,
    htmlContent: emailWrapper(`
<h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: ${textColor}; line-height: 1.3;">
  Sentimos sua falta! 👋
</h1>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá {{name}},
</p>

<p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${mutedColor};">
  Notamos que faz um tempo desde sua última visita <em>({{lastVisit}})</em>.
</p>

<p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${mutedColor};">
  Enquanto isso, adicionamos novos cursos, eventos e conteúdos que podem ser do seu interesse.
</p>

<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
  <tr>
    <td style="padding: 16px; background-color: #fafafa; border-radius: 8px; text-align: center;">
      <p style="margin: 0; font-size: 14px; color: ${mutedColor};">
        🆕 Novos cursos · 📅 Eventos · 📝 Artigos
      </p>
    </td>
  </tr>
</table>

${button('Ver Novidades', appUrl)}

<p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: ${mutedColor};">
  Esperamos você de volta! Sua jornada de aprendizado continua.
</p>
`, 'Faz tempo que você não nos visita. Temos novidades para você!'),
  },

  {
    code: 'course_reminder',
    name: 'Lembrete de Curso',
    description: 'Enviado para lembrar o usuário de continuar um curso em andamento',
    category: 'ENGAGEMENT',
    subject: '📚 Continue de onde parou: {{courseName}}',
    previewText: 'Você está a {{progress}}% de concluir seu curso!',
    variables: ['name', 'email', 'courseName', 'progress', 'lastLesson', 'courseUrl', 'appUrl', 'year'],
    textContent: `Olá {{name}},

Continue sua jornada!

Você está a {{progress}}% de concluir o curso "{{courseName}}".

Última aula assistida: {{lastLesson}}

Continue de onde parou: {{courseUrl}}

Cada passo conta. Continue evoluindo!

---
© {{year}} lutteros. Todos os direitos reservados.
Este é um email automático, por favor não responda.`,
    htmlContent: emailWrapper(`
<h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 700; color: ${textColor}; line-height: 1.3;">
  Continue sua jornada! 📚
</h1>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá {{name}},
</p>

<p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${mutedColor};">
  Você está quase lá! Continue de onde parou no seu curso.
</p>

<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #fafafa; border-radius: 8px; overflow: hidden;">
  <tr>
    <td style="padding: 24px;">
      <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: ${textColor};">
        {{courseName}}
      </h2>
      
      <!-- Progress Bar -->
      <div style="margin: 0 0 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 12px; color: ${mutedColor};">Progresso</span>
          <span style="font-size: 12px; font-weight: 600; color: ${brandColor};">{{progress}}%</span>
        </div>
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="background-color: #e4e4e7; border-radius: 4px; height: 8px; padding: 0;">
              <div style="width: {{progress}}%; background-color: ${brandColor}; border-radius: 4px; height: 8px;"></div>
            </td>
          </tr>
        </table>
      </div>
      
      <p style="margin: 0; font-size: 14px; color: ${mutedColor};">
        📖 Última aula: <strong>{{lastLesson}}</strong>
      </p>
    </td>
  </tr>
</table>

${button('Continuar Estudando', '{{courseUrl}}')}

<p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: ${mutedColor}; text-align: center;">
  Cada passo conta. Continue evoluindo! 💪
</p>
`, 'Você está a {{progress}}% de concluir seu curso!'),
  },
]

// Helper function to get template by code
export function getSystemEmailTemplateByCode(code: string): SystemEmailTemplate | undefined {
  return systemEmailTemplates.find(t => t.code === code)
}

// Helper function to get templates by category
export function getSystemEmailTemplatesByCategory(category: SystemEmailCategory): SystemEmailTemplate[] {
  return systemEmailTemplates.filter(t => t.category === category)
}

// Helper to replace variables in template
export function renderEmailTemplate(
  template: { htmlContent: string; textContent: string; subject: string },
  variables: Record<string, string>
): { html: string; text: string; subject: string } {
  let html = template.htmlContent
  let text = template.textContent
  let subject = template.subject

  // Add default variables
  const allVariables = {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://lutteros.com',
    year: new Date().getFullYear().toString(),
    ...variables,
  }

  // Replace all {{variable}} placeholders
  for (const [key, value] of Object.entries(allVariables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    html = html.replace(regex, value)
    text = text.replace(regex, value)
    subject = subject.replace(regex, value)
  }

  return { html, text, subject }
}
