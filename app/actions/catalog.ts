'use server';

import { z } from 'zod';
import { getArticles } from '@/lib/articles';
import { getCourses } from '@/lib/courses';
import { CATALOG_PAGE_SIZE, type CatalogKind, type CatalogPage } from '@/lib/catalog-pagination';

const requestSchema = z.object({
  kind: z.enum(['articles', 'courses']),
  page: z.number().int().min(1).max(100000),
  category: z.string().max(200),
});

export async function loadCatalogPage(kind: CatalogKind, page: number, category: string): Promise<CatalogPage> {
  const input = requestSchema.parse({ kind, page, category });
  const filter = input.category === 'Todos' ? undefined : input.category;
  if (input.kind === 'articles') {
    const result = await getArticles(input.page, CATALOG_PAGE_SIZE, filter);
    return { kind: 'articles', items: result.articles, pagination: result.pagination };
  }
  const result = await getCourses(input.page, CATALOG_PAGE_SIZE, filter);
  return { kind: 'courses', items: result.courses, pagination: result.pagination };
}
