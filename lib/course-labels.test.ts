import assert from 'node:assert/strict';
import test from 'node:test';
import { formatCourseItemCount, formatLessonCount } from './course-labels';

test('uses the singular lesson label for one lesson', () => {
  assert.equal(formatLessonCount(1), '1 Aula');
});

test('uses the plural lesson label for other lesson counts', () => {
  assert.equal(formatLessonCount(0), '0 Aulas');
  assert.equal(formatLessonCount(2), '2 Aulas');
});

test('splits lessons and articles in the course item count', () => {
  const items = [{ type: 'video' }, { type: 'audio' }, { type: 'article' }, { type: 'article' }];
  assert.equal(formatCourseItemCount(items), '2 Aulas e 2 Artigos');
});

test('uses singular labels in the course item count', () => {
  assert.equal(formatCourseItemCount([{ type: 'video' }, { type: 'article' }]), '1 Aula e 1 Artigo');
});

test('omits the article part when there are no articles', () => {
  assert.equal(formatCourseItemCount([{ type: 'video' }, { type: 'video' }]), '2 Aulas');
});

test('omits the lesson part when there are only articles', () => {
  assert.equal(formatCourseItemCount([{ type: 'article' }]), '1 Artigo');
});

test('shows zero lessons for an empty course', () => {
  assert.equal(formatCourseItemCount([]), '0 Aulas');
});