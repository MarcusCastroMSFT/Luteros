import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import test from 'node:test';
import { InstructorCard } from '../components/instructors/instructorCard';
import type { Instructor } from '../types/course';

test('instructor card stacks on mobile and retains the desktop layout and details', () => {
  const instructor: Instructor = {
    id: '1',
    name: 'Tetzi Oliveira Brandão',
    slug: 'tetzi-oliveira-brandao',
    title: 'Médica',
    bio: 'Biografia da instrutora',
    image: '/images/instructor.jpg',
    rating: 0,
    reviewsCount: 0,
    studentsCount: 0,
    coursesCount: 2,
    socialLinks: { instagram: 'https://instagram.com/example' },
  };
  const html = renderToStaticMarkup(createElement(InstructorCard, { instructor }));

  assert.match(html, /flex flex-col items-start gap-6 sm:flex-row/);
  assert.match(html, /h-40 w-40.*sm:h-58 sm:w-58/);
  assert.match(html, /sizes="\(max-width: 639px\) 160px, 232px"/);
  assert.match(html, /min-w-0 w-full flex-1/);
  assert.match(html, /Tetzi Oliveira Brandão/);
  assert.match(html, /Biografia da instrutora/);
  assert.match(html, /2 Cursos/);
  assert.match(html, /https:\/\/instagram\.com\/example/);
});
