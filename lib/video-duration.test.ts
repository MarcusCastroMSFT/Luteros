import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getYouTubeVideoId,
  parseYouTubeDuration,
  readVideoFileDuration,
  type VideoMetadataElement,
} from './video-duration';
import { requestYouTubeVideoDuration } from './video-duration.client';
import { fetchYouTubeVideoDuration } from './youtube-video.server';

test('extracts YouTube IDs only from supported YouTube URLs', () => {
  assert.equal(
    getYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    'dQw4w9WgXcQ',
  );
  assert.equal(getYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ?t=30'), 'dQw4w9WgXcQ');
  assert.equal(getYouTubeVideoId('https://example.com/watch?v=dQw4w9WgXcQ'), null);
  assert.equal(getYouTubeVideoId('https://youtube.com/watch?v=invalid'), null);
});

test('converts YouTube ISO 8601 durations to whole seconds', () => {
  assert.equal(parseYouTubeDuration('PT10M1S'), 601);
  assert.equal(parseYouTubeDuration('PT1H2M3S'), 3723);
  assert.equal(parseYouTubeDuration('not-a-duration'), null);
});

test('reads and rounds up local video metadata duration', async () => {
  let revokedUrl = '';
  const video: VideoMetadataElement = {
    duration: 600.2,
    preload: '',
    src: '',
    onloadedmetadata: null,
    onerror: null,
    load() {
      queueMicrotask(() => this.onloadedmetadata?.(new Event('loadedmetadata')));
    },
  };

  const duration = await readVideoFileDuration({} as File, {
    createObjectURL: () => 'blob:test-video',
    revokeObjectURL: (url) => {
      revokedUrl = url;
    },
    createVideoElement: () => video,
  });

  assert.equal(duration, 601);
  assert.equal(video.preload, 'metadata');
  assert.equal(revokedUrl, 'blob:test-video');
});

test('fetches duration from the fixed YouTube Data API endpoint', async () => {
  let requestedUrl = '';
  const duration = await fetchYouTubeVideoDuration(
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    {
      apiKey: 'server-only-key',
      fetchImpl: async (input) => {
        requestedUrl = input.toString();
        return new Response(JSON.stringify({
          items: [{ contentDetails: { duration: 'PT10M1S' } }],
        }), { status: 200 });
      },
    },
  );

  const url = new URL(requestedUrl);
  assert.equal(url.origin, 'https://www.googleapis.com');
  assert.equal(url.pathname, '/youtube/v3/videos');
  assert.equal(url.searchParams.get('id'), 'dQw4w9WgXcQ');
  assert.equal(url.searchParams.get('key'), 'server-only-key');
  assert.equal(duration, 601);
});

test('rejects malformed URLs before contacting YouTube', async () => {
  let fetchCalled = false;

  await assert.rejects(
    fetchYouTubeVideoDuration('https://example.com/video', {
      apiKey: 'server-only-key',
      fetchImpl: async () => {
        fetchCalled = true;
        return new Response();
      },
    }),
    /URL do YouTube inválida/,
  );

  assert.equal(fetchCalled, false);
});

test('requests YouTube duration through the internal authenticated endpoint', async () => {
  let requestBody = '';
  const duration = await requestYouTubeVideoDuration(
    'https://youtu.be/dQw4w9WgXcQ',
    {
      fetchImpl: async (input, init) => {
        assert.equal(input, '/api/courses/video-duration/youtube');
        assert.equal(init?.method, 'POST');
        requestBody = init?.body?.toString() || '';
        return new Response(JSON.stringify({ success: true, duration: 601 }), { status: 200 });
      },
    },
  );

  assert.deepEqual(JSON.parse(requestBody), { url: 'https://youtu.be/dQw4w9WgXcQ' });
  assert.equal(duration, 601);
});