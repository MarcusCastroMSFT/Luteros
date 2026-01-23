'use client';

import { PageHeader } from '@/components/common/pageHeader';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  question: string;
  answer: string | React.ReactNode;
  category: string;
}

const faqData: FAQItem[] = [
  // Sobre a Plataforma
  {
    id: 'platform-1',
    category: 'Sobre a Plataforma',
    question: 'O que é a lutteros?',
    answer: 'A lutteros é uma plataforma educacional dedicada à saúde sexual e reprodutiva. Oferecemos conteúdo científico, consultas com especialistas credenciados, cursos educativos e uma comunidade segura para discussões sobre temas relacionados à sexualidade e bem-estar.'
  },
  {
    id: 'platform-2',
    category: 'Sobre a Plataforma',
    question: 'A plataforma é confiável e segura?',
    answer: (
      <div className="space-y-2">
        <p>Sim, a lutteros segue os mais altos padrões de segurança e privacidade:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Todos os especialistas são credenciados e verificados</li>
          <li>Conteúdo revisado por profissionais de saúde</li>
          <li>Criptografia de dados e proteção LGPD</li>
          <li>Ambiente moderado 24/7 para garantir respeito e segurança</li>
        </ul>
      </div>
    )
  },
  {
    id: 'platform-3',
    category: 'Sobre a Plataforma',
    question: 'Qual a diferença entre a lutteros e outras plataformas de saúde?',
    answer: 'A lutteros se especializa exclusivamente em saúde sexual e reprodutiva, oferecendo um ambiente seguro e livre de julgamentos. Nossa abordagem combina educação científica com suporte emocional, sempre respeitando a diversidade e individualidade de cada pessoa.'
  },

  // Conta e Acesso
  {
    id: 'account-1',
    category: 'Conta e Acesso',
    question: 'Como criar uma conta na lutteros?',
    answer: 'Para criar sua conta, clique em "Registrar" no menu superior, preencha seus dados básicos (nome, email, idade) e confirme seu email. O processo é rápido e seus dados ficam protegidos por nossa política de privacidade.'
  },
  {
    id: 'account-2',
    category: 'Conta e Acesso',
    question: 'Preciso ter mais de 18 anos para usar a plataforma?',
    answer: (
      <div className="space-y-2">
        <p>Nossa política de idade é flexível mas responsável:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>18+ anos:</strong> Acesso completo a todos os recursos</li>
          <li><strong>Menores de 18 anos:</strong> Acesso não permitido</li>
        </ul>
      </div>
    )
  },
  {
    id: 'account-3',
    category: 'Conta e Acesso',
    question: 'Posso usar um nome fictício ou permanecer anônimo?',
    answer: 'Sim! Respeitamos sua privacidade. Você pode usar um nome social ou apelido na plataforma. Para consultas individuais, pedimos dados reais apenas para garantir a segurança do atendimento, mas isso fica entre você e o especialista.'
  },

  // Consultas e Especialistas
  {
    id: 'consultations-1',
    category: 'Consultas e Especialistas',
    question: 'Como funciona uma consulta online?',
    answer: (
      <div className="space-y-2">
        <p>As consultas na lutteros são educacionais e informativas:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Agende através da plataforma com especialistas disponíveis</li>
          <li>Sessões por videochamada, chat ou telefone</li>
          <li>Duração típica de 30-60 minutos</li>
          <li>Foco em educação, esclarecimento de dúvidas e orientação</li>
          <li>Não substituem consultas médicas presenciais quando necessárias</li>
        </ul>
      </div>
    )
  },
  {
    id: 'consultations-2',
    category: 'Consultas e Especialistas',
    question: 'Quem são os especialistas da lutteros?',
    answer: 'Nossa equipe inclui ginecologistas, urologistas, psicólogos especializados em sexualidade, terapeutas sexuais, educadores sexuais e outros profissionais de saúde devidamente credenciados. Todos passam por verificação rigorosa de credenciais e formação contínua.'
  },
  {
    id: 'consultations-3',
    category: 'Consultas e Especialistas',
    question: 'As consultas podem diagnosticar problemas médicos?',
    answer: 'Não. Nossas consultas são de natureza educacional e informativa. Para diagnósticos, prescrições ou tratamentos médicos específicos, sempre recomendamos consulta presencial com profissional médico habilitado.'
  },
  {
    id: 'consultations-4',
    category: 'Consultas e Especialistas',
    question: 'Quanto custam as consultas?',
    answer: 'Os preços variam conforme o especialista e tipo de consulta (30min, 60min, follow-up). Consulte nossa página de preços para valores atualizados. Oferecemos também consultas gratuitas em campanhas especiais e para casos de vulnerabilidade social.'
  },

  // Privacidade e Segurança
  {
    id: 'privacy-1',
    category: 'Privacidade e Segurança',
    question: 'Minhas informações ficam realmente seguras?',
    answer: (
      <div className="space-y-2">
        <p>Sim! Implementamos múltiplas camadas de proteção:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Criptografia end-to-end em todas as comunicações</li>
          <li>Servidores seguros com backups criptografados</li>
          <li>Acesso restrito apenas a pessoal autorizado</li>
          <li>Conformidade total com a LGPD</li>
          <li>Nunca compartilhamos dados para fins comerciais</li>
        </ul>
      </div>
    )
  },
  {
    id: 'privacy-2',
    category: 'Privacidade e Segurança',
    question: 'Quem pode ver minhas perguntas na comunidade?',
    answer: 'Você controla totalmente sua privacidade na comunidade. Pode participar anonimamente, usar apenas o primeiro nome, ou revelar sua identidade conforme se sentir confortável. Moderamos todo o conteúdo para garantir um ambiente respeitoso.'
  },
  {
    id: 'privacy-3',
    category: 'Privacidade e Segurança',
    question: 'Posso excluir minha conta e dados a qualquer momento?',
    answer: 'Sim! Você tem total controle sobre seus dados. Pode solicitar a exclusão completa da conta e dados através das configurações ou entrando em contato conosco. O processo é imediato e irreversível.'
  },

  // Conteúdo e Comunidade
  {
    id: 'content-1',
    category: 'Conteúdo e Comunidade',
    question: 'O conteúdo é baseado em ciência?',
    answer: 'Absolutamente! Todo nosso conteúdo é revisado por especialistas, baseado em evidências científicas atuais e segue diretrizes de organizações médicas reconhecidas. Citamos fontes e atualizamos informações regularmente.'
  },
  {
    id: 'content-2',
    category: 'Conteúdo e Comunidade',
    question: 'Como a comunidade é moderada?',
    answer: (
      <div className="space-y-2">
        <p>Temos moderação ativa e inteligente:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Moderadores treinados em saúde sexual disponíveis 24/7</li>
          <li>Filtros automáticos para conteúdo inadequado</li>
          <li>Sistema de denúncias rápido e eficiente</li>
          <li>Diretrizes claras de comportamento respeitoso</li>
          <li>Tolerância zero para assédio ou discriminação</li>
        </ul>
      </div>
    )
  },
  {
    id: 'content-3',
    category: 'Conteúdo e Comunidade',
    question: 'Posso compartilhar minha experiência pessoal?',
    answer: 'Sim, compartilhar experiências pode ajudar outras pessoas! Incentivamos relatos respeitosos e construtivos. Nossos moderadores garantem que o ambiente permaneça seguro e acolhedor para todos.'
  },

  // Pagamentos e Planos
  {
    id: 'payment-1',
    category: 'Pagamentos e Planos',
    question: 'Quais são os planos disponíveis?',
    answer: (
      <div className="space-y-2">
        <p>Oferecemos opções para diferentes necessidades:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Gratuito:</strong> Acesso a artigos básicos e comunidade</li>
          <li><strong>Premium:</strong> Cursos completos, webinars e conteúdo exclusivo</li>
          <li><strong>Consultas:</strong> Sessões individuais (pagamento por consulta)</li>
          <li><strong>Empresarial:</strong> Programas de bem-estar para empresas</li>
        </ul>
      </div>
    )
  },
  {
    id: 'payment-2',
    category: 'Pagamentos e Planos',
    question: 'Como funciona o cancelamento e reembolso?',
    answer: 'Você pode cancelar assinaturas a qualquer momento. Para reembolsos: consultas podem ser canceladas até 24h antes (100% reembolso), cursos têm garantia de 7 dias se menos de 20% foi acessado. Assinaturas não têm reembolso proporcional.'
  },
  {
    id: 'payment-3',
    category: 'Pagamentos e Planos',
    question: 'Aceita quais formas de pagamento?',
    answer: 'Aceitamos cartões de crédito/débito (Visa, Mastercard, Elo), PIX, boleto bancário e carteiras digitais. Todos os pagamentos são processados com segurança através de parceiros certificados.'
  },

  // Suporte Técnico
  {
    id: 'support-1',
    category: 'Suporte Técnico',
    question: 'Como entrar em contato com o suporte?',
    answer: (
      <div className="space-y-2">
        <p>Oferecemos várias formas de suporte:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Chat online:</strong> Disponível 24/7 na plataforma</li>
          <li><strong>Email:</strong> suporte@lutteros.com.br (resposta em até 24h)</li>
          <li><strong>WhatsApp:</strong> (11) 9999-9999 (horário comercial)</li>
          <li><strong>Central de Ajuda:</strong> Base de conhecimento completa</li>
        </ul>
      </div>
    )
  },
  {
    id: 'support-2',
    category: 'Suporte Técnico',
    question: 'A plataforma funciona no celular?',
    answer: 'Sim! Nossa plataforma é totalmente responsiva e funciona perfeitamente em smartphones, tablets e computadores. Também estamos desenvolvendo um aplicativo mobile que será lançado em breve.'
  },
  {
    id: 'support-3',
    category: 'Suporte Técnico',
    question: 'Estou com problemas técnicos, o que fazer?',
    answer: 'Primeiro, tente atualizar a página ou fazer logout/login. Se persistir, entre em contato com nosso suporte técnico detalhando o problema. Temos uma equipe especializada que resolve a maioria dos casos rapidamente.'
  }
];

const categories = [
  'Sobre a Plataforma',
  'Conta e Acesso', 
  'Consultas e Especialistas',
  'Privacidade e Segurança',
  'Conteúdo e Comunidade',
  'Pagamentos e Planos',
  'Suporte Técnico'
];

function FAQAccordion({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors rounded-lg cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900 pr-4">
          {item.question}
        </span>
        {isOpen ? (
          <ChevronUp className="text-brand-600 flex-shrink-0" size={20} />
        ) : (
          <ChevronDown className="text-brand-600 flex-shrink-0" size={20} />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <div className="text-gray-700 leading-relaxed">
            {typeof item.answer === 'string' ? (
              <p>{item.answer}</p>
            ) : (
              item.answer
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFAQs = faqData.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof item.answer === 'string' && item.answer.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Perguntas Frequentes"
        description="Encontre respostas para suas dúvidas sobre a lutteros"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'FAQ' }
        ]}
      />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Buscar nas perguntas frequentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-cta-highlight focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                !selectedCategory
                  ? 'bg-cta-highlight text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-cta-highlight text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar with Quick Links */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acesso Rápido
              </h3>
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-brand-50 to-brand-100 border-l-4 border-brand-500 p-4 rounded-lg">
                  <h4 className="font-medium text-brand-800 mb-2">
                    Precisa de Ajuda Imediata?
                  </h4>
                  <p className="text-sm text-brand-700 mb-3">
                    Nossa equipe está sempre disponível para ajudar você.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-brand-800">
                      <strong>Chat:</strong> Disponível 24/7
                    </p>
                    <p className="text-brand-800">
                      <strong>Email:</strong> suporte@lutteros.com.br
                    </p>
                    <p className="text-brand-800">
                      <strong>WhatsApp:</strong> (11) 9999-9999
                    </p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Emergência Médica?
                  </h4>
                  <p className="text-sm text-blue-700">
                    Em caso de emergência médica, procure imediatamente atendimento presencial ou ligue 192.
                  </p>
                </div>

                <div className="space-y-2">
                  <Link href="/privacy" className="block hover:text-cta-highlight text-sm transition-colors">
                    → Política de Privacidade
                  </Link>
                  <Link href="/terms" className="block hover:text-cta-highlight text-sm transition-colors">
                    → Termos de Uso
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main FAQ Content */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {filteredFAQs.length > 0 ? (
                <>
                  {selectedCategory && (
                    <div className="mb-6">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                        {selectedCategory}
                      </h2>
                      <p className="text-gray-600">
                        {filteredFAQs.length} pergunta{filteredFAQs.length !== 1 ? 's' : ''} encontrada{filteredFAQs.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  
                  {filteredFAQs.map(item => (
                    <FAQAccordion key={item.id} item={item} />
                  ))}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Nenhuma pergunta encontrada para &ldquo;{searchTerm}&rdquo;
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Tente buscar com outras palavras ou entre em contato conosco.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-brand-50 to-brand-100 border border-brand-200 rounded-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Não encontrou sua resposta?
            </h3>
            <p className="text-gray-700 mb-6">
              Nossa equipe de suporte está pronta para ajudar você com qualquer dúvida específica.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="bg-cta-highlight hover:bg-cta-highlight/90 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center">
                Entrar em Contato
              </Link>
              <Link href="/specialists" className="border border-cta-highlight text-cta-highlight hover:bg-cta-highlight/10 px-6 py-3 rounded-lg font-medium transition-colors text-center">
                Agendar Consulta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
