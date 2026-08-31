import assert from 'node:assert/strict';
import { test } from 'node:test';
import { saveLessonWithDeferredVideo } from './lesson-save-flow';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('creates an unpublished lesson before uploading and then persists the Azure video', async () => {
  const events: string[] = [];
  const video = new File([new Uint8Array(12)], 'lesson.mp4', { type: 'video/mp4' });
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    const body = JSON.parse(String(init?.body));

    if (init?.method === 'POST') {
      events.push('create');
      assert.equal(url, '/api/courses/course-1/lessons');
      assert.equal(body.isPublished, false);
      assert.equal(body.videoUrl, null);
      return jsonResponse({ success: true, data: { id: 'lesson-1' } }, 201);
    }

    events.push('update');
    assert.equal(url, '/api/courses/course-1/lessons/lesson-1');
    assert.equal(body.isPublished, true);
    assert.equal(body.videoUrl, 'courses/course-1/lesson-video/video.mp4');
    assert.equal(body.videoProvider, 'azure');
    return jsonResponse({ success: true, data: { id: 'lesson-1' } });
  };

  const result = await saveLessonWithDeferredVideo({
    courseId: 'course-1',
    payload: {
      title: 'Lesson',
      type: 'video',
      description: null,
      content: null,
      videoUrl: null,
      videoProvider: 'azure',
      duration: null,
      sectionTitle: null,
      isPublished: true,
      isFree: false,
    },
    videoFile: video,
    fetchImpl,
    uploadImpl: async (_file, options) => {
      events.push('upload');
      assert.equal(options.courseId, 'course-1');
      assert.equal(options.lessonId, 'lesson-1');
      return {
        kind: 'lesson-video',
        blobName: 'courses/course-1/lesson-video/video.mp4',
        videoProvider: 'azure',
      };
    },
  });

  assert.deepEqual(events, ['create', 'upload', 'update']);
  assert.equal(result.lessonId, 'lesson-1');
  assert.equal(result.videoUploaded, true);
});

test('reports the created lesson when its deferred video upload fails', async () => {
  const fetchImpl: typeof fetch = async () => jsonResponse({
    success: true,
    data: { id: 'lesson-created' },
  }, 201);

  await assert.rejects(
    saveLessonWithDeferredVideo({
      courseId: 'course-1',
      payload: {
        title: 'Lesson',
        type: 'video',
        description: null,
        content: null,
        videoUrl: null,
        videoProvider: 'azure',
        duration: null,
        sectionTitle: null,
        isPublished: false,
        isFree: false,
      },
      videoFile: new File([new Uint8Array(12)], 'lesson.mp4', { type: 'video/mp4' }),
      fetchImpl,
      uploadImpl: async () => {
        throw new Error('Failed to create upload grant');
      },
    }),
    (error: unknown) => {
      assert.equal(error instanceof Error, true);
      assert.equal((error as { lessonId?: string }).lessonId, 'lesson-created');
      assert.match((error as Error).message, /Failed to create upload grant/);
      return true;
    },
  );
});

test('does not upload a pending video file for a non-video lesson', async () => {
  let uploadCalled = false;
  const fetchImpl: typeof fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body));
    assert.equal(body.type, 'article');
    return jsonResponse({ success: true, data: { id: 'article-1' } }, 201);
  };

  const result = await saveLessonWithDeferredVideo({
    courseId: 'course-1',
    payload: {
      title: 'Article',
      type: 'article',
      description: null,
      content: '<p>Content</p>',
      videoUrl: null,
      videoProvider: null,
      duration: null,
      sectionTitle: null,
      isPublished: true,
      isFree: false,
    },
    videoFile: new File([new Uint8Array(12)], 'stale.mp4', { type: 'video/mp4' }),
    fetchImpl,
    uploadImpl: async () => {
      uploadCalled = true;
      throw new Error('must not upload');
    },
  });

  assert.equal(uploadCalled, false);
  assert.equal(result.videoUploaded, false);
});

test('updates an existing lesson with one PUT and no deferred upload', async () => {
  let requestCount = 0;
  const fetchImpl: typeof fetch = async (input, init) => {
    requestCount += 1;
    assert.equal(String(input), '/api/courses/course-1/lessons/lesson-existing');
    assert.equal(init?.method, 'PUT');
    return jsonResponse({ success: true, data: { id: 'lesson-existing' } });
  };

  const result = await saveLessonWithDeferredVideo({
    courseId: 'course-1',
    lessonId: 'lesson-existing',
    payload: {
      title: 'Existing', type: 'video', description: null, content: null,
      videoUrl: 'existing.mp4', videoProvider: 'azure', duration: null,
      sectionTitle: null, isPublished: true, isFree: false,
    },
    fetchImpl,
  });

  assert.equal(requestCount, 1);
  assert.deepEqual(result, { lessonId: 'lesson-existing', videoUploaded: false });
});

test('reports the created lesson when persisting the uploaded blob fails', async () => {
  let mutationCount = 0;
  const fetchImpl: typeof fetch = async () => {
    mutationCount += 1;
    if (mutationCount === 1) {
      return jsonResponse({ success: true, data: { id: 'lesson-created' } }, 201);
    }
    return jsonResponse({ success: false, error: 'Update failed' }, 500);
  };

  await assert.rejects(
    saveLessonWithDeferredVideo({
      courseId: 'course-1',
      payload: {
        title: 'Lesson', type: 'video', description: null, content: null,
        videoUrl: null, videoProvider: 'azure', duration: null,
        sectionTitle: null, isPublished: false, isFree: false,
      },
      videoFile: new File([new Uint8Array(12)], 'lesson.mp4', { type: 'video/mp4' }),
      fetchImpl,
      uploadImpl: async () => ({
        kind: 'lesson-video', blobName: 'uploaded.mp4', videoProvider: 'azure',
      }),
    }),
    (error: unknown) => {
      assert.equal((error as { lessonId?: string }).lessonId, 'lesson-created');
      assert.match((error as Error).message, /Update failed/);
      return true;
    },
  );
});