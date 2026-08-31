import assert from 'node:assert/strict';
import test from 'node:test';
import {
  collectCourseMediaReferences,
  deleteCourseMediaReferences,
} from './course-media-cleanup.server';
import { parseCourseMediaReference } from './course-media-paths.server';
import type { CourseMediaStorage } from './course-media-storage.server';

const COURSE_ID = '550e8400-e29b-41d4-a716-446655440000';
const FOREIGN_COURSE_ID = '770e8400-e29b-41d4-a716-446655440002';
const BLOB_ENDPOINT = 'https://lutterosmedia.blob.core.windows.net';
const THUMBNAIL = `courses/${COURSE_ID}/thumbnail/123e4567-e89b-42d3-a456-426614174000.webp`;
const COVER = `courses/${COURSE_ID}/cover/223e4567-e89b-42d3-a456-426614174000.jpg`;
const VIDEO = `courses/${COURSE_ID}/lesson-video/323e4567-e89b-42d3-a456-426614174000.mp4`;

function createStorage(onDelete: (container: string, blobName: string) => Promise<void>): CourseMediaStorage {
  return {
    createUploadGrant: async () => ({ blobUrl: '', sasUrl: '', expiresAt: new Date() }),
    inspect: async () => ({ contentLength: 0, contentType: '' }),
    promote: async () => ({ ok: true }),
    deleteIfOwned: async (container, ref) => onDelete(container, ref.blobName),
    createReadUrl: async () => '',
  };
}

test('collects deduplicated final media owned by the exact course', () => {
  const references = collectCourseMediaReferences({
    courseId: COURSE_ID,
    blobEndpoint: BLOB_ENDPOINT,
    thumbnail: `${BLOB_ENDPOINT}/course-images/${THUMBNAIL}`,
    coverImage: `${BLOB_ENDPOINT}/course-images/${COVER}`,
    lessons: [
      { videoProvider: 'azure', videoUrl: VIDEO },
      { videoProvider: 'azure', videoUrl: VIDEO },
    ],
  });

  assert.deepEqual(
    references.map(({ containerName, ref }) => [containerName, ref.blobName]),
    [
      ['course-images', THUMBNAIL],
      ['course-images', COVER],
      ['course-videos', VIDEO],
    ],
  );
});

test('ignores external, staging, non-Azure, and foreign-course media', () => {
  const references = collectCourseMediaReferences({
    courseId: COURSE_ID,
    blobEndpoint: BLOB_ENDPOINT,
    thumbnail: 'https://example.com/image.jpg',
    coverImage: `${BLOB_ENDPOINT}/course-images/staging/courses/${COURSE_ID}/cover/223e4567-e89b-42d3-a456-426614174000.jpg`,
    lessons: [
      { videoProvider: 'youtube', videoUrl: 'https://youtu.be/abcdef' },
      { videoProvider: 'azure', videoUrl: `courses/${FOREIGN_COURSE_ID}/lesson-video/323e4567-e89b-42d3-a456-426614174000.mp4` },
      { videoProvider: 'azure', videoUrl: `staging/courses/${COURSE_ID}/lesson-video/323e4567-e89b-42d3-a456-426614174000.mp4` },
    ],
  });

  assert.deepEqual(references, []);
});

test('runs the database mutation before initializing storage or deleting blobs', async () => {
  const references = collectCourseMediaReferences({
    courseId: COURSE_ID,
    blobEndpoint: BLOB_ENDPOINT,
    lessons: [{ videoProvider: 'azure', videoUrl: VIDEO }],
  });
  const events: string[] = [];

  const result = await deleteCourseMediaReferences({
    courseId: COURSE_ID,
    references,
    mutate: async () => {
      events.push('mutate');
      return 'updated';
    },
    getStorage: () => {
      events.push('storage');
      return createStorage(async () => { events.push('delete'); });
    },
  });

  assert.equal(result, 'updated');
  assert.deepEqual(events, ['mutate', 'storage', 'delete']);
});

test('does not initialize storage or delete when the database mutation fails', async () => {
  let storageCalls = 0;

  await assert.rejects(
    deleteCourseMediaReferences({
      courseId: COURSE_ID,
      references: collectCourseMediaReferences({
        courseId: COURSE_ID,
        blobEndpoint: BLOB_ENDPOINT,
        lessons: [{ videoProvider: 'azure', videoUrl: VIDEO }],
      }),
      mutate: async () => { throw new Error('database failed'); },
      getStorage: () => {
        storageCalls += 1;
        return createStorage(async () => {});
      },
    }),
    /database failed/,
  );

  assert.equal(storageCalls, 0);
});

test('revalidates ownership before deleting injected references', async () => {
  const foreignRef = parseCourseMediaReference(
    `courses/${FOREIGN_COURSE_ID}/lesson-video/323e4567-e89b-42d3-a456-426614174000.mp4`,
  );
  assert.ok(foreignRef && foreignRef.scope === 'final');
  let deleteCalls = 0;

  await deleteCourseMediaReferences({
    courseId: COURSE_ID,
    references: [{ containerName: 'course-videos', ref: { ...foreignRef, scope: 'final' } }],
    mutate: async () => undefined,
    getStorage: () => createStorage(async () => { deleteCalls += 1; }),
  });

  assert.equal(deleteCalls, 0);
});

test('keeps a successful mutation successful when cleanup fails and logs no SAS URL', async () => {
  const warnings: unknown[][] = [];
  const result = await deleteCourseMediaReferences({
    courseId: COURSE_ID,
    references: collectCourseMediaReferences({
      courseId: COURSE_ID,
      blobEndpoint: BLOB_ENDPOINT,
      lessons: [{ videoProvider: 'azure', videoUrl: VIDEO }],
    }),
    mutate: async () => ({ id: 'lesson-1' }),
    getStorage: () => createStorage(async () => {
      throw new Error('https://account.blob.core.windows.net/file?sig=secret');
    }),
    warn: (...args) => warnings.push(args),
  });

  assert.deepEqual(result, { id: 'lesson-1' });
  assert.equal(warnings.length, 1);
  assert.equal(JSON.stringify(warnings).includes('sig=secret'), false);
  assert.equal(JSON.stringify(warnings).includes(VIDEO), true);
});
