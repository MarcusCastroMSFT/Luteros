// Email Templates for Newsletter Campaigns
// Following email best practices: 600px max width, table-based layout, inline styles

export interface EmailTemplate {
  id: string
  name: string
  description: string
  category: 'articles' | 'courses' | 'products' | 'community' | 'events' | 'general'
  icon: string
  subject: string
  previewText: string
  content: string
  ctaText: string
  ctaUrl: string
}

// Shared styles and components
const brandColor = '#84cc16' // Lime-500
const brandColorDark = '#65a30d' // Lime-600
const textColor = '#18181b'
const mutedColor = '#71717a'
const _backgroundColor = '#f4f4f5'

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'new-articles',
    name: 'Novos Artigos',
    description: 'Anuncie novos artigos do blog para seus leitores',
    category: 'articles',
    icon: 'IconArticle',
    subject: '📝 Novos artigos para você na lutteros!',
    previewText: 'Confira as últimas publicações do nosso blog...',
    ctaText: 'Ver Todos os Artigos',
    ctaUrl: 'https://lutteros.com.br/articles',
    content: `<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá! 👋
</p>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Temos novidades fresquinhas para você! Confira os artigos mais recentes do nosso blog:
</p>

<!-- Article 1 -->
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
  <tr>
    <td style="padding: 20px; background-color: #fafafa; border-radius: 8px; border-left: 4px solid ${brandColor};">
      <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: ${textColor};">
        📌 Título do Artigo 1
      </h3>
      <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.5; color: ${mutedColor};">
        Uma breve descrição do artigo que vai chamar a atenção do leitor e fazer ele querer ler mais sobre o assunto.
      </p>
      <a href="#" style="font-size: 14px; color: ${brandColor}; text-decoration: none; font-weight: 500;">
        Ler artigo →
      </a>
    </td>
  </tr>
</table>

<!-- Article 2 -->
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
  <tr>
    <td style="padding: 20px; background-color: #fafafa; border-radius: 8px; border-left: 4px solid ${brandColor};">
      <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: ${textColor};">
        📌 Título do Artigo 2
      </h3>
      <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.5; color: ${mutedColor};">
        Outra descrição interessante que resume o conteúdo do artigo de forma atraente.
      </p>
      <a href="#" style="font-size: 14px; color: ${brandColor}; text-decoration: none; font-weight: 500;">
        Ler artigo →
      </a>
    </td>
  </tr>
</table>

<p style="margin: 24px 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Não perca nenhuma novidade! Visite nosso blog regularmente para mais conteúdos.
</p>`,
  },
  {
    id: 'new-courses',
    name: 'Novos Cursos',
    description: 'Divulgue novos cursos disponíveis na plataforma',
    category: 'courses',
    icon: 'IconSchool',
    subject: '🎓 Novos cursos disponíveis na lutteros!',
    previewText: 'Comece sua jornada de aprendizado hoje mesmo...',
    ctaText: 'Explorar Cursos',
    ctaUrl: 'https://lutteros.com.br/courses',
    content: `<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá! 👋
</p>

<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Acabamos de lançar novos cursos incríveis para você! Confira:
</p>

<!-- Course Card 1 -->
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
  <tr>
    <td style="background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%); border-radius: 12px; padding: 24px;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td>
            <span style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; color: white; font-weight: 500; margin-bottom: 12px;">
              🆕 NOVO
            </span>
            <h3 style="margin: 12px 0 8px; font-size: 20px; font-weight: 700; color: white;">
              Nome do Curso
            </h3>
            <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: rgba(255,255,255,0.9);">
              Descrição do curso com os principais tópicos que serão abordados e o que o aluno vai aprender.
            </p>
            <table role="presentation" style="border-collapse: collapse;">
              <tr>
                <td style="padding-right: 16px;">
                  <span style="font-size: 12px; color: rgba(255,255,255,0.8);">⏱️ 10 horas</span>
                </td>
                <td style="padding-right: 16px;">
                  <span style="font-size: 12px; color: rgba(255,255,255,0.8);">📚 20 aulas</span>
                </td>
                <td>
                  <span style="font-size: 12px; color: rgba(255,255,255,0.8);">🏆 Certificado</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Course Card 2 -->
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 24px 0;">
  <tr>
    <td style="border: 2px solid #e4e4e7; border-radius: 12px; padding: 24px;">
      <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 600; color: ${textColor};">
        Outro Curso Incrível
      </h3>
      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: ${mutedColor};">
        Descrição resumida do segundo curso disponível na plataforma.
      </p>
      <a href="#" style="display: inline-block; padding: 10px 20px; background-color: ${brandColor}; color: white; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
        Ver Curso
      </a>
    </td>
  </tr>
</table>

<p style="margin: 24px 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Aproveite para começar sua jornada de aprendizado hoje!
</p>`,
  },
  {
    id: 'single-course',
    name: 'Lançamento de Curso',
    description: 'Template focado em um único curso em destaque',
    category: 'courses',
    icon: 'IconCertificate',
    subject: '🚀 Novo curso: [Nome do Curso] - Vagas limitadas!',
    previewText: 'Aprenda [tema] com nosso novo curso exclusivo...',
    ctaText: 'Inscreva-se Agora',
    ctaUrl: 'https://lutteros.com.br/courses/slug-do-curso',
    content: `<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá! 👋
</p>

<p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Temos uma novidade especial para você! Acabamos de lançar um curso que vai transformar sua forma de ver o luterismo:
</p>

<!-- Hero Course Section -->
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
  <tr>
    <td style="background-color: #18181b; border-radius: 12px; overflow: hidden;">
      <!-- Course Image Placeholder -->
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="height: 200px; background: linear-gradient(135deg, ${brandColor} 0%, ${brandColorDark} 100%); text-align: center; vertical-align: middle;">
            <span style="font-size: 64px;">🎓</span>
          </td>
        </tr>
      </table>
      <!-- Course Info -->
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 24px;">
            <span style="display: inline-block; background-color: ${brandColor}; padding: 4px 12px; border-radius: 4px; font-size: 11px; color: white; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
              Novo Curso
            </span>
            <h2 style="margin: 16px 0 12px; font-size: 24px; font-weight: 700; color: white;">
              Nome do Curso em Destaque
            </h2>
            <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
              Uma descrição mais detalhada do curso, explicando os principais benefícios, o que o aluno vai aprender e por que esse curso é especial.
            </p>
            
            <!-- Course Stats -->
            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="width: 33%; text-align: center; padding: 12px; background-color: rgba(255,255,255,0.05); border-radius: 8px 0 0 8px;">
                  <div style="font-size: 24px; font-weight: 700; color: ${brandColor};">15</div>
                  <div style="font-size: 12px; color: #71717a;">Módulos</div>
                </td>
                <td style="width: 33%; text-align: center; padding: 12px; background-color: rgba(255,255,255,0.05);">
                  <div style="font-size: 24px; font-weight: 700; color: ${brandColor};">50+</div>
                  <div style="font-size: 12px; color: #71717a;">Aulas</div>
                </td>
                <td style="width: 33%; text-align: center; padding: 12px; background-color: rgba(255,255,255,0.05); border-radius: 0 8px 8px 0;">
                  <div style="font-size: 24px; font-weight: 700; color: ${brandColor};">20h</div>
                  <div style="font-size: 12px; color: #71717a;">Conteúdo</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- What You'll Learn -->
<h3 style="margin: 24px 0 16px; font-size: 18px; font-weight: 600; color: ${textColor};">
  O que você vai aprender:
</h3>

<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
  <tr>
    <td style="padding: 8px 0;">
      <span style="color: ${brandColor}; margin-right: 8px;">✓</span>
      <span style="color: ${textColor}; font-size: 15px;">Fundamentos completos do tema abordado</span>
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0;">
      <span style="color: ${brandColor}; margin-right: 8px;">✓</span>
      <span style="color: ${textColor}; font-size: 15px;">Aplicações práticas no dia a dia</span>
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0;">
      <span style="color: ${brandColor}; margin-right: 8px;">✓</span>
      <span style="color: ${textColor}; font-size: 15px;">Material de apoio exclusivo</span>
    </td>
  </tr>
  <tr>
    <td style="padding: 8px 0;">
      <span style="color: ${brandColor}; margin-right: 8px;">✓</span>
      <span style="color: ${textColor}; font-size: 15px;">Certificado de conclusão</span>
    </td>
  </tr>
</table>

<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: ${mutedColor}; text-align: center;">
  ⚡ Vagas limitadas - Garanta sua inscrição!
</p>`,
  },
  {
    id: 'new-products',
    name: 'Novos Produtos',
    description: 'Apresente novos produtos da loja aos seus clientes',
    category: 'products',
    icon: 'IconShoppingBag',
    subject: '🛍️ Novidades na loja lutteros!',
    previewText: 'Confira os produtos que acabaram de chegar...',
    ctaText: 'Ver Produtos',
    ctaUrl: 'https://lutteros.com.br/products',
    content: `<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá! 👋
</p>

<p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Temos novidades na nossa loja! Confira os produtos que acabaram de chegar:
</p>

<!-- Products Grid (2 columns simulation with tables) -->
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
  <tr>
    <td style="width: 48%; vertical-align: top; padding-right: 8px;">
      <!-- Product 1 -->
      <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
        <tr>
          <td style="height: 150px; background-color: #fafafa; text-align: center; vertical-align: middle;">
            <span style="font-size: 48px;">📖</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px;">
            <h4 style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: ${textColor};">
              Nome do Produto 1
            </h4>
            <p style="margin: 0 0 12px; font-size: 13px; color: ${mutedColor};">
              Breve descrição do produto
            </p>
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${brandColor};">
              R$ 49,90
            </p>
          </td>
        </tr>
      </table>
    </td>
    <td style="width: 48%; vertical-align: top; padding-left: 8px;">
      <!-- Product 2 -->
      <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden;">
        <tr>
          <td style="height: 150px; background-color: #fafafa; text-align: center; vertical-align: middle;">
            <span style="font-size: 48px;">✝️</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px;">
            <h4 style="margin: 0 0 8px; font-size: 15px; font-weight: 600; color: ${textColor};">
              Nome do Produto 2
            </h4>
            <p style="margin: 0 0 12px; font-size: 13px; color: ${mutedColor};">
              Breve descrição do produto
            </p>
            <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${brandColor};">
              R$ 79,90
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Highlight Product -->
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
  <tr>
    <td style="background-color: #fef3c7; border-radius: 12px; padding: 20px; text-align: center;">
      <span style="font-size: 14px; font-weight: 600; color: #92400e;">⭐ DESTAQUE DA SEMANA</span>
      <h3 style="margin: 12px 0 8px; font-size: 20px; font-weight: 700; color: ${textColor};">
        Produto em Destaque
      </h3>
      <p style="margin: 0 0 16px; font-size: 14px; color: ${mutedColor};">
        Descrição especial do produto em destaque com seus benefícios.
      </p>
      <span style="font-size: 24px; font-weight: 700; color: ${brandColorDark};">
        R$ 99,90
      </span>
    </td>
  </tr>
</table>

<p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${textColor}; text-align: center;">
  🚚 Frete grátis para compras acima de R$ 150,00
</p>`,
  },
  {
    id: 'community-update',
    name: 'Novidades da Comunidade',
    description: 'Compartilhe as últimas discussões e atividades da comunidade',
    category: 'community',
    icon: 'IconUsers',
    subject: '💬 O que está acontecendo na comunidade lutteros',
    previewText: 'Confira as discussões mais populares desta semana...',
    ctaText: 'Participar da Comunidade',
    ctaUrl: 'https://lutteros.com.br/community',
    content: `<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá! 👋
</p>

<p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Veja o que está acontecendo na nossa comunidade esta semana:
</p>

<!-- Stats Bar -->
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px; background-color: #f0fdf4; border-radius: 8px;">
  <tr>
    <td style="width: 33%; text-align: center; padding: 16px;">
      <div style="font-size: 28px; font-weight: 700; color: ${brandColor};">127</div>
      <div style="font-size: 12px; color: ${mutedColor};">Novos Posts</div>
    </td>
    <td style="width: 33%; text-align: center; padding: 16px; border-left: 1px solid #bbf7d0; border-right: 1px solid #bbf7d0;">
      <div style="font-size: 28px; font-weight: 700; color: ${brandColor};">45</div>
      <div style="font-size: 12px; color: ${mutedColor};">Membros Ativos</div>
    </td>
    <td style="width: 33%; text-align: center; padding: 16px;">
      <div style="font-size: 28px; font-weight: 700; color: ${brandColor};">312</div>
      <div style="font-size: 12px; color: ${mutedColor};">Respostas</div>
    </td>
  </tr>
</table>

<!-- Popular Discussions -->
<h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: ${textColor};">
  🔥 Discussões em Alta
</h3>

<!-- Discussion 1 -->
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 12px;">
  <tr>
    <td style="padding: 16px; background-color: #fafafa; border-radius: 8px;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 40px; vertical-align: top;">
            <div style="width: 36px; height: 36px; background-color: ${brandColor}; border-radius: 50%; text-align: center; line-height: 36px; color: white; font-weight: 600; font-size: 14px;">
              JD
            </div>
          </td>
          <td style="padding-left: 12px; vertical-align: top;">
            <h4 style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: ${textColor};">
              Título da discussão popular
            </h4>
            <p style="margin: 0 0 8px; font-size: 13px; color: ${mutedColor};">
              por <strong>João da Silva</strong> • 23 respostas
            </p>
            <span style="display: inline-block; background-color: #ecfccb; padding: 2px 8px; border-radius: 4px; font-size: 11px; color: ${brandColorDark};">
              Teologia
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Discussion 2 -->
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 12px;">
  <tr>
    <td style="padding: 16px; background-color: #fafafa; border-radius: 8px;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 40px; vertical-align: top;">
            <div style="width: 36px; height: 36px; background-color: #06b6d4; border-radius: 50%; text-align: center; line-height: 36px; color: white; font-weight: 600; font-size: 14px;">
              MA
            </div>
          </td>
          <td style="padding-left: 12px; vertical-align: top;">
            <h4 style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: ${textColor};">
              Outra discussão interessante
            </h4>
            <p style="margin: 0 0 8px; font-size: 13px; color: ${mutedColor};">
              por <strong>Maria Almeida</strong> • 18 respostas
            </p>
            <span style="display: inline-block; background-color: #cffafe; padding: 2px 8px; border-radius: 4px; font-size: 11px; color: #0891b2;">
              Vida Cristã
            </span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<p style="margin: 24px 0 0; font-size: 15px; line-height: 1.6; color: ${textColor}; text-align: center;">
  Junte-se à conversa e compartilhe suas experiências!
</p>`,
  },
  {
    id: 'upcoming-events',
    name: 'Próximos Eventos',
    description: 'Divulgue eventos, lives e encontros',
    category: 'events',
    icon: 'IconCalendarEvent',
    subject: '📅 Eventos imperdíveis na lutteros!',
    previewText: 'Confira os próximos eventos e reserve sua vaga...',
    ctaText: 'Ver Todos os Eventos',
    ctaUrl: 'https://lutteros.com.br/events',
    content: `<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Olá! 👋
</p>

<p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: ${textColor};">
  Temos eventos incríveis chegando! Confira a programação:
</p>

<!-- Featured Event -->
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 24px;">
  <tr>
    <td style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); border-radius: 12px; padding: 24px;">
      <span style="display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; color: white; font-weight: 500;">
        ⭐ EVENTO PRINCIPAL
      </span>
      <h2 style="margin: 16px 0 12px; font-size: 22px; font-weight: 700; color: white;">
        Nome do Evento Principal
      </h2>
      <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.5; color: rgba(255,255,255,0.9);">
        Descrição do evento com informações sobre o que vai acontecer e por que você não pode perder.
      </p>
      <table role="presentation" style="border-collapse: collapse;">
        <tr>
          <td style="padding-right: 24px;">
            <span style="font-size: 13px; color: rgba(255,255,255,0.8);">📅 25 de Janeiro, 2026</span>
          </td>
          <td>
            <span style="font-size: 13px; color: rgba(255,255,255,0.8);">⏰ 19:00 (Horário de Brasília)</span>
          </td>
        </tr>
      </table>
      <table role="presentation" style="border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td>
            <a href="#" style="display: inline-block; padding: 12px 24px; background-color: white; color: #7c3aed; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;">
              Inscrever-se Gratuitamente
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Other Events -->
<h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: ${textColor};">
  Outros Eventos
</h3>

<!-- Event 1 -->
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 12px;">
  <tr>
    <td style="width: 60px; vertical-align: top;">
      <div style="background-color: #fef2f2; border-radius: 8px; padding: 12px 8px; text-align: center;">
        <div style="font-size: 20px; font-weight: 700; color: #dc2626;">28</div>
        <div style="font-size: 11px; color: #dc2626; text-transform: uppercase;">Jan</div>
      </div>
    </td>
    <td style="padding-left: 16px; vertical-align: top;">
      <h4 style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: ${textColor};">
        Live: Estudo Bíblico
      </h4>
      <p style="margin: 0 0 8px; font-size: 13px; color: ${mutedColor};">
        Quinta-feira às 20:00 • Online
      </p>
      <a href="#" style="font-size: 13px; color: ${brandColor}; text-decoration: none; font-weight: 500;">
        Participar →
      </a>
    </td>
  </tr>
</table>

<!-- Event 2 -->
<table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 12px;">
  <tr>
    <td style="width: 60px; vertical-align: top;">
      <div style="background-color: #eff6ff; border-radius: 8px; padding: 12px 8px; text-align: center;">
        <div style="font-size: 20px; font-weight: 700; color: #2563eb;">02</div>
        <div style="font-size: 11px; color: #2563eb; text-transform: uppercase;">Fev</div>
      </div>
    </td>
    <td style="padding-left: 16px; vertical-align: top;">
      <h4 style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: ${textColor};">
        Workshop de Teologia
      </h4>
      <p style="margin: 0 0 8px; font-size: 13px; color: ${mutedColor};">
        Sábado às 14:00 • São Paulo, SP
      </p>
      <a href="#" style="font-size: 13px; color: ${brandColor}; text-decoration: none; font-weight: 500;">
        Ver detalhes →
      </a>
    </td>
  </tr>
</table>

<p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: ${mutedColor}; text-align: center;">
  🔔 Ative as notificações para não perder nenhum evento!
</p>`,
  },
]

// Helper function to get templates by category
export function getTemplatesByCategory(category: EmailTemplate['category']): EmailTemplate[] {
  return emailTemplates.filter(t => t.category === category)
}

// Helper function to get template by ID
export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find(t => t.id === id)
}
