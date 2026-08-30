import assert from 'node:assert/strict';
import test from 'node:test';
import { formatLessonCount } from './course-labels';

test('uses the singular lesson label for one lesson', () => {
  assert.equal(formatLessonCount(1), '1 Aula');
});

test('uses the plural lesson label for other lesson counts', () => {
  assert.equal(formatLessonCount(0), '0 Aulas');
  assert.equal(formatLessonCount(2), '2 Aulas');
});