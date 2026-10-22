import assert from 'node:assert/strict';
import test from 'node:test';
import { appendCatalogPage, CATALOG_PAGE_SIZE, type CatalogPage } from './catalog-pagination';
import type { Article } from '@/types/blog';
import type { Course } from './courses';

const article = (id: string): Article => ({
  id, slug: id, title: id, excerpt: '', image: '', category: 'Teste',
  author: 'Teste', authorSlug: '', date: '', readTime: '1 min',
});

const course = (id: string): Course => ({
  id, slug: id, title: id, description: '', shortDescription: '', image: '',
  coverImage: '', previewVideo: '', price: 0, originalPrice: null, isFree: true,
  lessonsCount: 0, articlesCount: 0, sectionsCount: 0, duration: '0h', rating: 0,
  reviewsCount: 0, studentsCount: 0, level: 'Iniciante', category: 'Teste',
  status: 'Ativo', isBestSeller: false, tags: [], language: 'pt', lastUpdated: '',
  publishedAt: null, instructors: [],
  instructor: {
    id: 'author', name: 'Teste', slug: 'author', title: '', bio: '', image: '',
    rating: 0, reviewsCount: 0, studentsCount: 0, coursesCount: 0,
  },
});

function page(kind: 'articles' | 'courses', ids: string[], currentPage = 1, hasNextPage = true): CatalogPage {
  const pagination = { currentPage, totalPages: 3, hasNextPage };
  return kind === 'articles'
    ? { kind, items: ids.map(article), pagination }
    : { kind, items: ids.map(course), pagination };
}

test('both public catalogs use batches of nine', () => {
  assert.equal(CATALOG_PAGE_SIZE, 9);
});

for (const kind of ['articles', 'courses'] as const) {
  test(`${kind} append in order without duplicating IDs from shifting pages`, () => {
    const current = page(kind, ['a', 'b']);
    const next = page(kind, ['b', 'c', 'c'], 2);
    const merged = appendCatalogPage(current, next);
    assert.deepEqual(merged.items.map(item => item.id), ['a', 'b', 'c']);
    assert.equal(merged.pagination.currentPage, 2);
    assert.equal(merged.pagination.hasNextPage, true);
    assert.deepEqual(current.items.map(item => item.id), ['a', 'b']);
  });

  test(`${kind} stop at the last page or an empty response`, () => {
    assert.equal(appendCatalogPage(page(kind, ['a']), page(kind, ['b'], 2, false)).pagination.hasNextPage, false);
    assert.equal(appendCatalogPage(page(kind, ['a']), page(kind, [], 2)).pagination.hasNextPage, false);
  });
}

test('out-of-sequence pages and mixed catalogs are rejected', () => {
  assert.throws(() => appendCatalogPage(page('articles', ['a']), page('articles', ['b'], 1)), /sequence/);
  assert.throws(() => appendCatalogPage(page('articles', ['a']), page('articles', ['b'], 3)), /sequence/);
  assert.throws(() => appendCatalogPage(page('articles', ['a']), page('courses', ['b'], 2)), /different catalogs/);
});
