import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { BrandIcon } from '@/components/brand/brand-icon';
import { Button } from '@/components/ui/button';
import { helpArticles } from '@/data/help';
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-images';

interface HelpArticlePageProps {
  params: Promise<{ slug: string }>;
}

const textLink = 'font-medium text-brand-700 hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600';

export function generateStaticParams() {
  return Object.keys(helpArticles).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: HelpArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = helpArticles[slug];
  if (!article) return { title: 'Guia não encontrado', robots: { index: false, follow: false } };

  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/help/${slug}` },
    openGraph: { title: `${article.title} | lutteros`, description: article.description, type: 'article', images: [DEFAULT_SOCIAL_IMAGE] },
    twitter: { card: 'summary_large_image', title: `${article.title} | lutteros`, description: article.description, images: [DEFAULT_SOCIAL_IMAGE.url] },
  };
}

export default async function HelpArticlePage({ params }: HelpArticlePageProps) {
  const { slug } = await params;
  const article = helpArticles[slug];
  if (!article) notFound();

  const related = article.related.map((relatedSlug) => helpArticles[relatedSlug]).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <header className="relative isolate overflow-hidden py-8 md:py-10 lg:py-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/brand/paper-grain.svg')]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-48 -top-64 hidden size-[640px] rounded-[42%_58%_38%_62%] bg-[#e4eeeb] md:block" />
        <div className="relative mx-auto grid max-w-[1480px] items-center gap-10 px-6 sm:px-10 md:grid-cols-[1.7fr_1fr] lg:px-12">
          <div>
            <Link href="/help" className={`mb-6 inline-flex min-h-11 items-center gap-2 text-base ${textLink}`}>
              <ArrowLeft aria-hidden="true" className="size-4" />
              Central de ajuda
            </Link>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-brand-700">{article.category}</p>
            <h1 className="max-w-3xl text-balance font-[family-name:var(--font-cardo)] text-4xl leading-[1.1] tracking-[-0.03em] text-brand-900 sm:text-5xl lg:text-6xl">
              {article.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-[1.8] text-slate-600 sm:text-lg">{article.description}</p>
          </div>
          <div aria-hidden="true" className="mx-auto hidden w-52 justify-center md:flex lg:w-60">
            <BrandIcon kind={article.icon} className="size-44 lg:size-52" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1480px] px-6 pb-16 pt-6 sm:px-10 lg:px-12 lg:pb-20">
       <div className="max-w-3xl">
        <article className="space-y-12">
          {article.sections.map((section, index) => (
            <section key={section.heading ?? index}>
              {section.heading && (
                <h2 className="mb-5 font-[family-name:var(--font-cardo)] text-3xl leading-tight text-brand-900">{section.heading}</h2>
              )}
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mb-4 text-lg leading-[1.85] text-slate-600 last:mb-0">{paragraph}</p>
              ))}
              {section.steps && (
                <ol className="space-y-5">
                  {section.steps.map((step, stepIndex) => (
                    <li key={step} className="flex gap-4">
                      <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-[42%_58%_52%_38%] bg-[#e4eeeb] font-medium text-brand-700">
                        {stepIndex + 1}
                      </span>
                      <span className="pt-1 text-lg leading-[1.7] text-slate-600">{step}</span>
                    </li>
                  ))}
                </ol>
              )}
              {section.bullets && (
                <ul className="space-y-4">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-4 text-lg leading-[1.7] text-slate-600">
                      <span aria-hidden="true" className="mt-3 size-2 shrink-0 rounded-full bg-[#956486]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.links && (
                <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                  {section.links.map((link) => (
                    <Link key={link.href} href={link.href} className={`inline-flex min-h-11 items-center gap-2 text-base ${textLink}`}>
                      {link.label}
                      <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          ))}
        </article>

        {related.length > 0 && (
          <nav aria-labelledby="help-related" className="mt-16 border-t border-brand-600/15 pt-10">
            <h2 id="help-related" className="mb-6 font-[family-name:var(--font-cardo)] text-3xl text-brand-900">Guias relacionados</h2>
            <ul className="divide-y divide-brand-600/15 border-y border-brand-600/15">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link href={`/help/${item.slug}`} className="group flex items-center justify-between gap-4 py-4 text-lg text-brand-900 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
                    {item.title}
                    <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-brand-600 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <section aria-labelledby="help-still" className="mt-16 rounded-[12px_40px_12px_12px] bg-[#eee5ec] p-6 sm:p-10">
          <h2 id="help-still" className="mb-3 font-[family-name:var(--font-cardo)] text-3xl text-brand-900">Ainda precisa de ajuda?</h2>
          <p className="mb-6 text-base leading-[1.8] text-slate-600">Escreva para a equipe. Respondemos em até 48 horas úteis.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-auto min-h-12 whitespace-normal bg-[#630a79] px-6 text-base shadow-none hover:bg-[#4e0860]">
              <Link href="/contact">Entre em contato</Link>
            </Button>
            <Button asChild variant="outline" className="h-auto min-h-12 whitespace-normal border-[#630a79]/30 bg-transparent px-6 text-base text-[#630a79] shadow-none hover:bg-[#eadfe9]">
              <Link href="/help">Ver todos os guias</Link>
            </Button>
          </div>
        </section>
       </div>
      </div>
    </div>
  );
}
