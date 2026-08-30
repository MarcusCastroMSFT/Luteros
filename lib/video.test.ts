import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveVideoPoster, resolveVideoSource } from './video';

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

test('uses the YouTube thumbnail as the video poster', () => {
  assert.equal(
    resolveVideoPoster('https://youtu.be/IlE5BHl5yc4', '/course-cover.jpg'),
    'https://i.ytimg.com/vi/IlE5BHl5yc4/hqdefault.jpg',
  );
});

test('keeps the configured image when the provider has no derived poster', () => {
  assert.equal(
    resolveVideoPoster('https://vimeo.com/76979871', '/course-cover.jpg'),
    '/course-cover.jpg',
  );
});