import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import test from 'node:test';
import { AppRouterContext, type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { CourseDetailClient } from '../app/(public-pages)/courses/[slug]/course-detail-client';
import type { Course, CourseInstructor } from './courses';

const router: AppRouterInstance = {
  back: () => {}, forward: () => {}, refresh: () => {},
  push: () => {}, replace: () => {}, prefetch: () => {}, bfcacheId: 'test',
};

const instructor: CourseInstructor = {
  id: '1', name: 'Instrutora', slug: 'instrutora', title: '', bio: '',
  image: '/images/course-placeholder.png',
  rating: 0, reviewsCount: 0, studentsCount: 0, coursesCount: 1,
};

function renderCourse(instructors: CourseInstructor[]) {
  const course: Course = {
    id: 'course', slug: 'course', title: 'Curso', description: '', shortDescription: '',
    image: '', coverImage: '', previewVideo: '', instructor, instructors,
    price: 0, originalPrice: null, isFree: true, lessonsCount: 0, articlesCount: 0,
    sectionsCount: 0, duration: '0min', rating: 0, reviewsCount: 0, studentsCount: 0,
    level: 'Iniciante', category: '', status: 'Ativo', isBestSeller: false, tags: [],
    language: 'Português', lastUpdated: '', publishedAt: null,
  };
  return renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router },
    createElement(CourseDetailClient, { course, lessons: [], slug: course.slug })));
}

test('uses the singular heading for one instructor', () => {
  const html = renderCourse([instructor]);
  assert.match(html, />Instrutor<\/h2>/);
  assert.doesNotMatch(html, />Instrutores<\/h2>|>Participação especial<\/h2>/);
});

test('uses the plural heading when there are special participants', () => {
  const html = renderCourse([instructor, { ...instructor, id: '2', name: 'Participante' }]);
  assert.match(html, />Instrutores<\/h2>/);
  assert.match(html, />Participação especial<\/h2>/);
  assert.doesNotMatch(html, />Instrutor<\/h2>/);
});
