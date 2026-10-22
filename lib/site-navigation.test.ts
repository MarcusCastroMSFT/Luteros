import assert from 'node:assert/strict';
import test from 'node:test';
import { footerColumns, moreNav, primaryNav } from '../data/menu';

test('desktop and mobile navigation share the four main destinations', () => {
  assert.deepEqual(primaryNav.map(({ href }) => href), [
    '/courses',
    '/articles',
    '/events',
    '/products',
  ]);
});

test('specialists and community are absent from all public menus', () => {
  const links = [
    ...primaryNav,
    ...moreNav,
    ...footerColumns.flatMap(({ links }) => links),
  ];

  for (const { href } of links) {
    assert.ok(!['/specialists', '/community'].includes(href), href);
  }
});

test('the mega menu retains institutional and support destinations', () => {
  assert.deepEqual(moreNav.map(({ href }) => href), [
    '/about',
    '/contact',
    '/faq',
    '/help',
  ]);
});
