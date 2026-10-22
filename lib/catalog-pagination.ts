import type { Article } from '@/types/blog';
import type { Course } from '@/lib/courses';

export const CATALOG_PAGE_SIZE = 9;
export type CatalogKind = 'articles' | 'courses';

interface CatalogPagination {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
}

export type CatalogPage =
  | { kind: 'articles'; items: Article[]; pagination: CatalogPagination }
  | { kind: 'courses'; items: Course[]; pagination: CatalogPagination };

function uniqueItems<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(({ id }) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function appendCatalogPage(current: CatalogPage, next: CatalogPage): CatalogPage {
  if (next.pagination.currentPage !== current.pagination.currentPage + 1) {
    throw new Error('Unexpected catalog page sequence');
  }
  const pagination = {
    ...next.pagination,
    hasNextPage: next.pagination.hasNextPage && next.items.length > 0,
  };
  if (current.kind === 'articles' && next.kind === 'articles') {
    return { kind: 'articles', items: uniqueItems([...current.items, ...next.items]), pagination };
  }
  if (current.kind === 'courses' && next.kind === 'courses') {
    return { kind: 'courses', items: uniqueItems([...current.items, ...next.items]), pagination };
  }
  throw new Error('Cannot combine different catalogs');
}
