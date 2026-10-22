'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchableArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR').trim();
}

export function HelpSearch({ articles }: { articles: SearchableArticle[] }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = normalize(query);
  const results = normalizedQuery
    ? articles.filter((article) => normalize(`${article.title} ${article.description} ${article.category}`).includes(normalizedQuery))
    : [];

  return (
    <div className="mb-14 max-w-3xl">
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-4 size-5 text-brand-600" />
        <Input
          type="search"
          aria-label="Buscar na Central de ajuda"
          placeholder="Buscar um guia, como “reembolso” ou “senha”"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-14 border-brand-600/25 bg-white/60 pl-12 text-base md:text-base"
        />
      </div>

      {normalizedQuery && (
        <div className="mt-6">
          <p role="status" className="mb-4 text-sm text-slate-500">
            {results.length} {results.length === 1 ? 'guia encontrado' : 'guias encontrados'}
          </p>
          {results.length > 0 ? (
            <ul className="divide-y divide-brand-600/15 border-y border-brand-600/15">
              {results.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/help/${article.slug}`}
                    className="group flex items-center justify-between gap-4 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm text-brand-700">{article.category}</span>
                      <span className="block font-[family-name:var(--font-cardo)] text-2xl leading-snug text-brand-900">{article.title}</span>
                      <span className="mt-1 block text-base text-slate-600">{article.description}</span>
                    </span>
                    <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-brand-600 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base leading-[1.8] text-slate-600">
              Não encontramos um guia para essa busca. Tente outras palavras ou{' '}
              <Link href="/contact" className="font-medium text-brand-700 hover:text-brand-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
                fale com a equipe
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}
