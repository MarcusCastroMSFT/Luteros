import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BrandIcon } from '@/components/brand/brand-icon';
import { PageHeader } from '@/components/common/pageHeader';
import { HelpSearch } from '@/components/help/help-search';
import { Button } from '@/components/ui/button';
import { helpArticles, helpCategories, SUPPORT_EMAIL } from '@/data/help';
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-images';

const description = 'Guias para criar sua conta, acessar cursos, entender pagamentos e falar com a equipe da Lutteros.';

export const metadata: Metadata = {
  title: 'Central de ajuda',
  description,
  alternates: { canonical: '/help' },
  openGraph: { title: 'Central de ajuda | lutteros', description, type: 'website', images: [DEFAULT_SOCIAL_IMAGE] },
  twitter: { card: 'summary_large_image', title: 'Central de ajuda | lutteros', description, images: [DEFAULT_SOCIAL_IMAGE.url] },
};

export default function HelpPage() {
  const articles = Object.values(helpArticles);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        illustration="help"
        title="Central de ajuda"
        description="Guias para criar sua conta, acessar cursos e resolver dúvidas comuns."
        breadcrumbs={[{ label: 'Início', href: '/' }, { label: 'Central de ajuda' }]}
      />

      <div className="mx-auto max-w-[1480px] px-6 pb-20 pt-8 sm:px-10 lg:px-12">
        <HelpSearch articles={articles.map(({ slug, title, description, category }) => ({ slug, title, description, category }))} />

        <div className="grid gap-14 lg:grid-cols-3 lg:gap-12">
          {helpCategories.map((category) => (
            <section key={category.id} aria-labelledby={`help-${category.id}`}>
              <BrandIcon kind={category.icon} className="mb-5 size-24" />
              <h2 id={`help-${category.id}`} className="mb-3 font-[family-name:var(--font-cardo)] text-3xl leading-tight text-brand-900">
                {category.title}
              </h2>
              <p className="mb-6 text-base leading-[1.8] text-slate-600">{category.description}</p>
              <ul className="divide-y divide-brand-600/15 border-y border-brand-600/15">
                {category.articleSlugs.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/help/${slug}`}
                      className="group flex items-center justify-between gap-4 py-4 text-lg text-brand-900 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                    >
                      {helpArticles[slug].title}
                      <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-brand-600 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section aria-labelledby="help-contact" className="relative mt-20 overflow-hidden rounded-[12px_48px_12px_12px] bg-[#eee5ec] px-6 py-10 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <h2 id="help-contact" className="mb-4 font-[family-name:var(--font-cardo)] text-3xl text-brand-900 sm:text-4xl">Não encontrou o que procurava?</h2>
            <p className="text-base leading-[1.8] text-slate-600">
              Veja também as <Link href="/faq" className="font-medium text-brand-700 hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">perguntas frequentes</Link> ou
              escreva para a equipe. Respondemos em até 48 horas úteis.
            </p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-3 block break-words text-sm text-brand-700 hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">{SUPPORT_EMAIL}</a>
          </div>
          <Button asChild className="mt-6 h-auto min-h-14 whitespace-normal bg-[#630a79] px-7 text-base shadow-none hover:bg-[#4e0860] lg:mt-0">
            <Link href="/contact">Entre em contato</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
