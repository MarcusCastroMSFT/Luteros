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