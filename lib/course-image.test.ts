import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveCourseImage } from './course-image';

test('prefers the thumbnail', () => {
  assert.equal(resolveCourseImage('https://x/t.jpg', 'https://x/c.jpg'), 'https://x/t.jpg');
});

test('falls back to the cover image when there is no thumbnail', () => {
  assert.equal(resolveCourseImage(null, 'https://x/c.jpg'), 'https://x/c.jpg');
  assert.equal(resolveCourseImage('  ', 'https://x/c.jpg'), 'https://x/c.jpg');
});

test('returns an empty string when the course has no image', () => {
  assert.equal(resolveCourseImage(null, null), '');
  assert.equal(resolveCourseImage(undefined, undefined), '');
});
