'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { loadCatalogPage } from '@/app/actions/catalog';
import { appendCatalogPage, type CatalogPage } from '@/lib/catalog-pagination';
import { useIsMobile } from '@/hooks/use-mobile';
import ArticleCard from '@/components/blog/articleCard';
import { CourseCard } from '@/components/courses/courseCard';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';

interface CatalogListProps {
  initialPage: CatalogPage;
  category: string;
}

export function CatalogList({ initialPage, category }: CatalogListProps) {
  const isMobile = useIsMobile();
  const [mobilePage, setMobilePage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const inFlight = useRef(false);
  const active = useRef(true);
  const sentinel = useRef<HTMLDivElement>(null);
  const kind = initialPage.kind;
  const label = kind === 'articles' ? 'artigos' : 'cursos';
  const basePath = `/${kind}`;
  const queryParams = { category: category === 'Todos' ? undefined : category };
  const startUrl = queryParams.category
    ? `${basePath}?category=${encodeURIComponent(queryParams.category)}`
    : basePath;

  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);

  const loadMore = useCallback(async () => {
    if (inFlight.current || !mobilePage.pagination.hasNextPage) return;
    inFlight.current = true;
    setLoading(true);
    setError(false);
    try {
      const next = await loadCatalogPage(kind, mobilePage.pagination.currentPage + 1, category);
      if (active.current) setMobilePage(appendCatalogPage(mobilePage, next));
    } catch (error) {
      console.error('Failed to load the next catalog page:', error);
      if (active.current) setError(true);
    } finally {
      inFlight.current = false;
      if (active.current) setLoading(false);
    }
  }, [category, kind, mobilePage]);

  useEffect(() => {
    if (!isMobile || loading || error || autoPaused || !mobilePage.pagination.hasNextPage || !sentinel.current) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void loadMore();
    }, { rootMargin: '0px 0px 240px 0px' });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [autoPaused, error, isMobile, loadMore, loading, mobilePage.pagination.hasNextPage]);

  const visiblePage = isMobile ? mobilePage : initialPage;

  return (
    <>
      {isMobile && initialPage.pagination.currentPage > 1 && (
        <Link href={startUrl} className="mb-6 inline-flex rounded text-sm text-primary hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-4">
          Ver desde o início da lista
        </Link>
      )}
      <div role="list" aria-label={`Lista de ${label}`} aria-busy={loading} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
        {visiblePage.kind === 'articles'
          ? visiblePage.items.map((article, i) => (
            <div role="listitem" key={article.id}>
              <ArticleCard article={article} priority={i < 3} />
            </div>
          ))
          : visiblePage.items.map((course, i) => (
            <div role="listitem" key={course.id}>
              <CourseCard course={{ ...course, originalPrice: course.originalPrice ?? undefined }} priority={i < 3} />
            </div>
          ))}
      </div>

      {isMobile ? (
        <div ref={sentinel} className="mt-8 flex flex-col items-center gap-3 pb-2 text-center">
          <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
            {mobilePage.pagination.hasNextPage
              ? `${mobilePage.items.length} ${label} exibidos`
              : `Você chegou ao fim dos ${label}.`}
          </p>
          {error && <p role="alert" className="text-sm text-destructive">Não foi possível carregar mais {label}. Tente novamente.</p>}
          {mobilePage.pagination.hasNextPage && (
            <Button variant="outline" disabled={loading} onClick={() => { setAutoPaused(false); void loadMore(); }} className="min-h-11 min-w-48 gap-2">
              {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {loading ? 'Carregando...' : error ? 'Tentar novamente' : 'Carregar mais'}
            </Button>
          )}
          <a href="#site-footer" onClick={() => setAutoPaused(true)} className="rounded px-3 py-2 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2">
            Ir para o rodapé
          </a>
        </div>
      ) : initialPage.pagination.totalPages > 1 && (
        <nav aria-label={`Paginação de ${label}`} className="mt-12">
          <Pagination
            currentPage={initialPage.pagination.currentPage}
            totalPages={initialPage.pagination.totalPages}
            basePath={basePath}
            queryParams={queryParams}
          />
        </nav>
      )}
    </>
  );
}
