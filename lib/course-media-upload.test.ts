import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  uploadCourseMedia,
  type CourseBlockBlobClientFactory,
} from './course-media-upload';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function createFile(type = 'image/jpeg', name = 'cover.jpg'): File {
  return new File([new Uint8Array(12)], name, { type });
}

describe('uploadCourseMedia', () => {
  test('initiates, uploads with server options, then completes', async () => {
    const events: string[] = [];
    const progress: number[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      events.push(url.endsWith('/complete') ? 'complete' : 'initiate');
      if (!url.endsWith('/complete')) {
        assert.equal(init?.method, 'POST');
        assert.deepEqual(JSON.parse(String(init?.body)), {
          kind: 'cover',
          contentType: 'image/jpeg',
          size: 12,
        });
        return jsonResponse({
          uploadId: 'signed-upload-id',
          blobUrl: 'https://account.blob.core.windows.net/course-images/staging/file.jpg',
          sasUrl: 'https://account.blob.core.windows.net/course-images/staging/file.jpg?sig=secret',
          blockSize: 8,
          concurrency: 3,
          expiresAt: '2026-01-01T00:15:00.000Z',
        });
      }
      return jsonResponse({ kind: 'cover', url: 'https://account.blob.core.windows.net/course-images/courses/final.jpg' });
    };
    const clientFactory: CourseBlockBlobClientFactory = (sasUrl) => {
      assert.match(sasUrl, /sig=secret/);
      return {
        async uploadData(_file, options) {
          events.push('upload');
          assert.equal(options?.blockSize, 8);
          assert.equal(options?.concurrency, 3);
          assert.equal(options?.blobHTTPHeaders?.blobContentType, 'image/jpeg');
          options?.onProgress?.({ loadedBytes: 6 });
          return {} as never;
        },
      };
    };

    const result = await uploadCourseMedia(createFile(), {
      kind: 'cover',
      fetchImpl,
      clientFactory,
      onProgress: (loadedBytes) => progress.push(loadedBytes),
    });

    assert.deepEqual(events, ['initiate', 'upload', 'complete']);
    assert.deepEqual(progress, [0, 6, 12]);
    assert.deepEqual(result, {
      kind: 'cover',
      url: 'https://account.blob.core.windows.net/course-images/courses/final.jpg',
    });
  });

  test('uses the existing-course endpoint and forwards lessonId', async () => {
    const requests: string[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      requests.push(url);
      if (!url.endsWith('/complete')) {
        assert.deepEqual(JSON.parse(String(init?.body)), {
          kind: 'lesson-video',
          contentType: 'video/mp4',
          size: 12,
          lessonId: 'lesson-1',
        });
        return jsonResponse({
          uploadId: 'upload-id', blobUrl: 'https://blob/video', sasUrl: 'https://blob/video?sig=x',
          blockSize: 8, concurrency: 2, expiresAt: '2026-01-01T00:15:00.000Z',
        });
      }
      return jsonResponse({ kind: 'lesson-video', blobName: 'courses/course-1/lesson-video/video.mp4', videoProvider: 'azure' });
    };
    const clientFactory: CourseBlockBlobClientFactory = () => ({ async uploadData() { return {} as never; } });

    await uploadCourseMedia(createFile('video/mp4', 'lesson.mp4'), {
      kind: 'lesson-video', courseId: 'course-1', lessonId: 'lesson-1', fetchImpl, clientFactory,
    });

    assert.deepEqual(requests, [
      '/api/courses/course-1/media/uploads',
      '/api/courses/course-1/media/uploads/upload-id/complete',
    ]);
  });

  test('reports completed progress only once when Azure emits the total', async () => {
    const progress: number[] = [];
    const fetchImpl: typeof fetch = async (input) => {
      if (!String(input).endsWith('/complete')) {
        return jsonResponse({
          uploadId: 'upload-id', blobUrl: 'https://blob/file', sasUrl: 'https://blob/file?sig=x',
          blockSize: 8, concurrency: 2, expiresAt: '2026-01-01T00:15:00.000Z',
        });
      }
      return jsonResponse({ kind: 'thumbnail', url: 'https://blob/final.jpg' });
    };
    const clientFactory: CourseBlockBlobClientFactory = () => ({
      async uploadData(_file, options) {
        options?.onProgress?.({ loadedBytes: 12 });
        return {} as never;
      },
    });

    await uploadCourseMedia(createFile(), {
      kind: 'thumbnail', fetchImpl, clientFactory,
      onProgress: (loadedBytes) => progress.push(loadedBytes),
    });

    assert.deepEqual(progress, [0, 12]);
  });

  test('forwards the abort signal to Azure upload', async () => {
    const controller = new AbortController();
    const fetchImpl: typeof fetch = async () => jsonResponse({
      uploadId: 'upload-id', blobUrl: 'https://blob/file', sasUrl: 'https://blob/file?sig=x',
      blockSize: 8, concurrency: 2, expiresAt: '2026-01-01T00:15:00.000Z',
    });
    const clientFactory: CourseBlockBlobClientFactory = () => ({
      async uploadData(_file, options) {
        assert.equal(options?.abortSignal, controller.signal);
        throw new Error('cancelled');
      },
    });

    await assert.rejects(
      uploadCourseMedia(createFile(), { kind: 'thumbnail', signal: controller.signal, fetchImpl, clientFactory }),
      /cancelled/,
    );
  });

  test('does not complete when the Blob upload fails', async () => {
    let fetchCalls = 0;
    const fetchImpl: typeof fetch = async () => {
      fetchCalls += 1;
      return jsonResponse({
        uploadId: 'upload-id', blobUrl: 'https://blob/file', sasUrl: 'https://blob/file?sig=x',
        blockSize: 8, concurrency: 2, expiresAt: '2026-01-01T00:15:00.000Z',
      });
    };
    const clientFactory: CourseBlockBlobClientFactory = () => ({
      async uploadData() { throw new Error('Azure upload failed'); },
    });

    await assert.rejects(
      uploadCourseMedia(createFile(), { kind: 'thumbnail', fetchImpl, clientFactory }),
      /Azure upload failed/,
    );
    assert.equal(fetchCalls, 1);
  });
});