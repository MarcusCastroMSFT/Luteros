'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { BrandIcon } from '@/components/brand/brand-icon';
import { CategoryFilter } from '@/components/blog/categoryFilter';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/pageHeader';
import { JsonLd } from '@/components/seo/json-ld';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  link?: { href: string; label: string };
}

const faqData: FAQItem[] = [
  {
    id: 'platform',
    category: 'A plataforma',
    question: 'O que é a Lutteros?',
    answer: 'A Lutteros é uma plataforma de saúde sexual baseada em conhecimento científico. Conecta ciência e prática clínica com conteúdos fundamentados em evidências, elaborados e revisados por especialistas.',
    link: { href: '/about', label: 'Conheça a Lutteros' },
  },
  {
    id: 'audience',
    category: 'A plataforma',
    question: 'Para quem são os conteúdos?',
    answer: 'Para profissionais que desejam aprofundar seus conhecimentos e qualificar sua prática em saúde sexual, com respeito à individualidade e à diversidade. Consulte a descrição de cada curso para conhecer seu público e conteúdo.',
  },
  {
    id: 'clinical-care',
    category: 'A plataforma',
    question: 'O conteúdo substitui uma avaliação de saúde?',
    answer: 'Não. Os conteúdos têm finalidade educacional e não substituem avaliação individual, diagnóstico ou tratamento por um profissional habilitado. Em caso de emergência médica, procure atendimento presencial ou ligue 192.',
  },
  {
    id: 'account',
    category: 'Conta e acesso',
    question: 'Como criar minha conta?',
    answer: 'Acesse a página de cadastro e siga as instruções para criar sua conta. Se já tiver uma conta, utilize a opção de entrar com seus dados de acesso.',
    link: { href: '/register', label: 'Criar conta' },
  },
  {
    id: 'my-courses',
    category: 'Conta e acesso',
    question: 'Onde encontro meus cursos?',
    answer: 'Entre na mesma conta utilizada na inscrição ou compra e acesse Meus cursos. Se um curso pago não aparecer após a confirmação do pagamento, entre em contato com a equipe informando o nome do curso.',
    link: { href: '/courses/my-courses', label: 'Acessar meus cursos' },
  },
  {
    id: 'course-details',
    category: 'Cursos e artigos',
    question: 'Como saber o que está incluído em um curso?',
    answer: 'Na página de cada curso, consulte a descrição, as aulas e as condições de acesso apresentadas antes de se inscrever ou comprar. O formato e os materiais disponíveis podem variar entre os cursos.',
    link: { href: '/courses', label: 'Explorar cursos' },
  },
  {
    id: 'articles',
    category: 'Cursos e artigos',
    question: 'Onde posso ler os artigos?',
    answer: 'Acesse a página de artigos e escolha o conteúdo que deseja ler. Você pode filtrar por categoria e usar a busca para encontrar temas de seu interesse. As condições de acesso são indicadas na página do conteúdo.',
    link: { href: '/articles', label: 'Ler artigos' },
  },
  {
    id: 'payment-methods',
    category: 'Pagamentos',
    question: 'Quais formas de pagamento estão disponíveis?',
    answer: 'As opções disponíveis são apresentadas na etapa de pagamento do curso. Confira o valor e as condições exibidas antes de concluir a compra.',
  },
  {
    id: 'payment-access',
    category: 'Pagamentos',
    question: 'Quando o acesso ao curso pago é liberado?',
    answer: 'O acesso é liberado após a confirmação do pagamento. O tempo de confirmação pode variar conforme a forma de pagamento escolhida. Acompanhe o status na página de pagamento e acesse o curso com a conta utilizada na compra.',
  },
  {
    id: 'refunds',
    category: 'Pagamentos',
    question: 'Como solicitar cancelamento ou reembolso?',
    answer: 'Consulte os Termos de Uso e entre em contato com a equipe para solicitar orientações sobre sua compra. Informe o curso e o e-mail da conta, sem enviar senhas ou dados de cartão.',
    link: { href: '/terms', label: 'Consultar os Termos de Uso' },
  },
  {
    id: 'privacy',
    category: 'Privacidade',
    question: 'Onde encontro informações sobre o uso dos meus dados?',
    answer: 'A Política de Privacidade apresenta informações sobre o tratamento de dados pessoais e os canais para exercer seus direitos. Para dúvidas ou solicitações sobre seus dados, entre em contato com a equipe.',
    link: { href: '/privacy', label: 'Ler a Política de Privacidade' },
  },
  {
    id: 'contact',
    category: 'Suporte',
    question: 'Como falar com a equipe?',
    answer: 'Envie sua mensagem pelo formulário de contato ou para contato@lutteros.com.br. O prazo de resposta é de até 48 horas úteis.',
    link: { href: '/contact', label: 'Enviar uma mensagem' },
  },
  {
    id: 'mobile',
    category: 'Suporte',
    question: 'Posso acessar pelo celular?',
    answer: 'Sim. Você pode acessar o site pelo navegador do celular, tablet ou computador, sem instalar um aplicativo.',
  },
  {
    id: 'technical',
    category: 'Suporte',
    question: 'O que fazer se uma página ou aula não carregar?',
    answer: 'Verifique sua conexão e atualize a página. Se o problema continuar, envie uma mensagem informando a página ou o curso, o dispositivo utilizado e a mensagem de erro exibida. Não inclua senhas ou dados de pagamento.',
    link: { href: '/contact', label: 'Relatar um problema' },
  },
];

const categories = ['Todas', ...new Set(faqData.map((item) => item.category))];
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqData.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR').trim();
}

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const query = normalizeSearch(searchTerm);
  const filteredFAQs = faqData.filter((item) => (
    (selectedCategory === 'Todas' || item.category === selectedCategory)
    && normalizeSearch(`${item.question} ${item.answer}`).includes(query)
  ));

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={faqJsonLd} />
      <PageHeader
        illustration="help"
        title="Perguntas frequentes"
        description="Encontre orientações sobre conteúdos, acesso e pagamentos."
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'FAQ' }]}
      />

      <div className="mx-auto max-w-[1480px] px-6 pb-20 pt-8 sm:px-10 lg:px-12">
        <div className="mb-10 space-y-5">
          <div className="relative max-w-2xl">
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-4 size-5 text-brand-600" />
            <Input
              type="search"
              aria-label="Buscar nas perguntas frequentes"
              placeholder="Qual é a sua dúvida?"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-14 border-brand-600/25 bg-white/60 pl-12 text-base md:text-base"
            />
          </div>
          <CategoryFilter categories={categories} activeCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        </div>

        <div data-reveal="" suppressHydrationWarning className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] lg:gap-14">
          <section aria-labelledby="faq-results" className="min-w-0">
            <h2 id="faq-results" className="mb-2 font-[family-name:var(--font-cardo)] text-3xl text-brand-900">
              {selectedCategory === 'Todas' ? 'Como podemos ajudar?' : selectedCategory}
            </h2>
            <p role="status" className="mb-6 text-sm text-slate-500">
              {filteredFAQs.length} {filteredFAQs.length === 1 ? 'pergunta encontrada' : 'perguntas encontradas'}
            </p>
            {filteredFAQs.length > 0 ? (
              <Accordion type="multiple" className="border-t border-brand-600/20">
                {filteredFAQs.map((item) => (
                  <AccordionItem key={item.id} value={item.id} className="border-brand-600/20">
                    <AccordionTrigger className="cursor-pointer gap-5 rounded-sm px-1 py-6 text-left text-lg text-brand-900 hover:text-brand-700 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 motion-reduce:transition-none motion-reduce:[&>svg]:transition-none">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pb-7 text-base leading-[1.85] text-slate-600">
                      <p>{item.answer}</p>
                      {item.link && (
                        <Link href={item.link.href} className="mt-4 inline-block font-medium text-brand-700 hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600">
                          {item.link.label} <span aria-hidden="true">→</span>
                        </Link>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <EmptyState
                variant="search"
                title="Nenhuma pergunta encontrada"
                description="Tente buscar com outras palavras ou remova os filtros para ver todas as perguntas."
                action={{ label: 'Limpar busca e filtros', onClick: () => { setSearchTerm(''); setSelectedCategory('Todas'); } }}
              />
            )}
          </section>

          <aside aria-label="Contato e informações úteis" className="space-y-6 lg:sticky lg:top-28">
            <div className="rounded-[12px_40px_12px_12px] bg-[#e4eeeb]/70 p-6 sm:p-8">
              <BrandIcon kind="contact" className="mb-5 size-24" />
              <h2 className="mb-4 font-[family-name:var(--font-cardo)] text-3xl leading-tight text-brand-900">Sua dúvida não está aqui?</h2>
              <p className="mb-6 text-base leading-[1.8] text-slate-600">Fale com a equipe. Respondemos em até 48 horas úteis.</p>
              <Button asChild className="h-auto min-h-12 w-full whitespace-normal bg-brand-600 px-5 text-base shadow-none hover:bg-brand-700">
                <Link href="/contact">Entre em contato</Link>
              </Button>
              <a href="mailto:contato@lutteros.com.br" className="mt-5 block break-words text-center text-sm text-brand-700 hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600">contato@lutteros.com.br</a>
            </div>
            <div className="rounded-xl border border-[#630a79]/15 p-6 sm:p-8">
              <h3 className="mb-3 font-medium text-brand-900">Precisa de atendimento de saúde?</h3>
              <p className="text-sm leading-[1.8] text-slate-600">A Lutteros é uma plataforma educacional. Em caso de emergência médica, procure atendimento presencial ou ligue <a href="tel:192" className="font-semibold text-[#630a79] focus-visible:outline-2 focus-visible:outline-offset-2">192</a>.</p>
            </div>
            <nav aria-label="Políticas da plataforma" className="flex flex-wrap gap-x-6 gap-y-4 px-1 text-sm text-brand-700">
              <Link href="/privacy" className="hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-4">Política de privacidade</Link>
              <Link href="/terms" className="hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-4">Termos de uso</Link>
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
}
