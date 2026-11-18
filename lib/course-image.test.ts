import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
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

test('catalog images use the detail preview proportions without cropping or hover zoom', () => {
  const card = readFileSync(new URL('../components/courses/courseCard.tsx', import.meta.url), 'utf8');

  assert.match(card, /aspect-\[25\/12\]/);
  assert.match(card, /width=\{400\}\s+height=\{192\}/);
  assert.match(card, /className="h-full w-full object-contain"/);
  assert.doesNotMatch(card, /object-cover|h-48|group-hover:scale/);
});

test('course social metadata uses the thumbnail or cover without assuming image dimensions', () => {
  const courses = readFileSync(new URL('./courses.ts', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../app/(public-pages)/courses/[slug]/page.tsx', import.meta.url), 'utf8');
  const metadataQuery = courses.slice(courses.indexOf('async function fetchCourseMetadata'));
  const metadata = page.slice(page.indexOf('export async function generateMetadata'), page.indexOf('// Server component'));

  assert.match(metadataQuery, /coverImage: courses\.coverImage/);
  assert.match(metadataQuery, /image: resolveCourseImage\(row\.thumbnail, row\.coverImage\)/);
  assert.match(metadata, /metadata\.image\?\.trim\(\) \|\| COURSE_SOCIAL_IMAGE\.url/);
  assert.match(metadata, /images: \[\{\s*url: imageUrl,\s*alt: metadata\.title,/);
  assert.doesNotMatch(metadata, /width: 1200|height: 630/);
});
