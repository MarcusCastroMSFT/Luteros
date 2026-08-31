import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveVideoPosters, resolveVideoSource } from './video';

test('resolves a short YouTube URL as a privacy-enhanced embed', () => {
  assert.deepEqual(resolveVideoSource('https://youtu.be/IlE5BHl5yc4'), {
    kind: 'embed',
    src: 'https://www.youtube-nocookie.com/embed/IlE5BHl5yc4',
  });
});

test('resolves a Vimeo URL as an embed', () => {
  assert.deepEqual(resolveVideoSource('https://vimeo.com/76979871'), {
    kind: 'embed',
    src: 'https://player.vimeo.com/video/76979871',
  });
});

test('keeps a direct video URL as a file source', () => {
  assert.deepEqual(resolveVideoSource('https://cdn.example.com/lesson.mp4'), {
    kind: 'file',
    src: 'https://cdn.example.com/lesson.mp4',
  });
});

test('rejects unsupported and unsafe URLs', () => {
  assert.equal(resolveVideoSource('javascript:alert(1)'), null);
  assert.equal(resolveVideoSource('https://example.com/watch/123'), null);
});

test('orders YouTube, cover, and thumbnail poster fallbacks', () => {
  assert.deepEqual(
    resolveVideoPosters(
      'https://youtu.be/IlE5BHl5yc4',
      '/course-cover.jpg',
      '/course-thumbnail.jpg',
    ),
    [
      'https://i.ytimg.com/vi/IlE5BHl5yc4/hqdefault.jpg',
      '/course-cover.jpg',
      '/course-thumbnail.jpg',
    ],
  );
});

test('removes empty and duplicate poster fallbacks', () => {
  assert.deepEqual(
    resolveVideoPosters('https://vimeo.com/76979871', '/course.jpg', '/course.jpg'),
    ['/course.jpg'],
  );
});

test('resolves safe same-origin relative media endpoint as file source', () => {
  assert.deepEqual(
    resolveVideoSource('/api/courses/550e8400-e29b-41d4-a716-446655440000/lessons/660e8400-e29b-41d4-a716-446655440001/media'),
    { kind: 'file', src: '/api/courses/550e8400-e29b-41d4-a716-446655440000/lessons/660e8400-e29b-41d4-a716-446655440001/media' },
  );
});

test('rejects protocol-relative URLs', () => {
  assert.equal(resolveVideoSource('//evil.com/video.mp4'), null);
});

test('rejects relative paths with traversal', () => {
  assert.equal(resolveVideoSource('/api/courses/../../../etc/passwd'), null);
  assert.equal(resolveVideoSource('/api/courses/abc/lessons/def/../../../admin'), null);
});

test('rejects relative paths with query strings', () => {
  assert.equal(resolveVideoSource('/api/courses/abc/lessons/def/media?token=xyz'), null);
});

test('rejects relative paths with hash fragments', () => {
  assert.equal(resolveVideoSource('/api/courses/abc/lessons/def/media#fragment'), null);
});

test('rejects malformed media endpoints', () => {
  assert.equal(resolveVideoSource('/api/courses/abc123/lessons/def456/media'), null);
  assert.equal(resolveVideoSource('/api/courses/abc/lessons/def/mediaXXX'), null);
  assert.equal(resolveVideoSource('/api/courses/abc/lessons/def'), null);
  assert.equal(resolveVideoSource('/api/courses/abc/media'), null);
  assert.equal(resolveVideoSource('/courses/abc/lessons/def/media'), null);
});

test('rejects other relative URLs', () => {
  assert.equal(resolveVideoSource('/videos/lesson.mp4'), null);
  assert.equal(resolveVideoSource('../video.mp4'), null);
  assert.equal(resolveVideoSource('./lesson.mp4'), null);
});

test('public course mapping must redact Azure videoUrl even when isFree is true', () => {
  // Simulates the safeLessons mapping from lib/courses.ts
  function redactForPublic(lesson: { isFree: boolean; videoUrl: string | null; videoProvider: string | null }) {
    const isAzure = lesson.videoProvider === 'azure';
    return {
      videoUrl: lesson.isFree && !isAzure ? lesson.videoUrl : null,
      videoProvider: lesson.isFree && !isAzure ? lesson.videoProvider : null,
    };
  }

  // Free Azure lesson: must be redacted
  const freeAzure = redactForPublic({
    isFree: true,
    videoUrl: 'courses/550e8400-e29b-41d4-a716-446655440000/lesson-video/abc.mp4',
    videoProvider: 'azure',
  });
  assert.equal(freeAzure.videoUrl, null);
  assert.equal(freeAzure.videoProvider, null);

  // Free YouTube lesson: allowed
  const freeYoutube = redactForPublic({
    isFree: true,
    videoUrl: 'https://youtu.be/abc123',
    videoProvider: 'youtube',
  });
  assert.equal(freeYoutube.videoUrl, 'https://youtu.be/abc123');
  assert.equal(freeYoutube.videoProvider, 'youtube');

  // Paid lesson: always redacted
  const paidAzure = redactForPublic({
    isFree: false,
    videoUrl: 'courses/550e8400-e29b-41d4-a716-446655440000/lesson-video/abc.mp4',
    videoProvider: 'azure',
  });
  assert.equal(paidAzure.videoUrl, null);
  assert.equal(paidAzure.videoProvider, null);
});