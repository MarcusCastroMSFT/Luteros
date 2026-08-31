import assert from 'node:assert/strict';
import test from 'node:test';
import { createCourseMediaPlaybackService } from './course-media-playback.server';
import type { AuthUser } from './auth-helpers';
import type { CourseMediaStorage } from './course-media-storage.server';

function createMockUser(overrides?: Partial<AuthUser>): AuthUser {
  return {
    id: 'user-123',
    email: 'user@example.com',
    name: 'Test User',
    image: null,
    role: 'USER',
    displayName: 'Test User',
    ...overrides,
  };
}

function createMockStorage(): CourseMediaStorage {
  return {
    createUploadGrant: async () => ({ blobUrl: '', sasUrl: '', expiresAt: new Date() }),
    inspect: async () => ({ contentLength: 0, contentType: '' }),
    promote: async () => ({ ok: true }),
    deleteIfOwned: async () => {},
    createReadUrl: async (containerName, blobName) => `https://storage.example.com/${containerName}/${blobName}?sasToken`,
  };
}

test('returns 401 when no session exists', async () => {
  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => null,
    queryEnrollment: async () => null,
    storage: createMockStorage(),
  });

  const result = await service.authorizePlayback('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001');
  assert.equal(result.status, 401);
  assert.equal(result.error, 'Unauthorized');
});

test('rejects malformed IDs before database or storage access', async () => {
  let queryCalls = 0;
  let readUrlCalls = 0;
  const storage = createMockStorage();
  storage.createReadUrl = async () => {
    readUrlCalls += 1;
    return '';
  };
  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => createMockUser(),
    queryEnrollment: async () => {
      queryCalls += 1;
      return null;
    },
    storage,
  });

  const result = await service.authorizePlayback('not-a-uuid', '../lesson');
  assert.equal(result.status, 404);
  assert.equal(queryCalls, 0);
  assert.equal(readUrlCalls, 0);
});

test('returns 403 when no enrollment exists', async () => {
  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => createMockUser(),
    queryEnrollment: async () => ({
      courseId: '550e8400-e29b-41d4-a716-446655440000',
      lessonId: '660e8400-e29b-41d4-a716-446655440001',
      videoUrl: null,
      videoProvider: null,
      enrollmentId: null,
      expiresAt: null,
    }),
    storage: createMockStorage(),
  });

  const result = await service.authorizePlayback('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001');
  assert.equal(result.status, 403);
  assert.equal(result.error, 'Not enrolled in course');
});

test('returns 404 when lesson does not exist', async () => {
  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => createMockUser(),
    queryEnrollment: async () => null,
    storage: createMockStorage(),
  });

  const result = await service.authorizePlayback('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001');
  assert.equal(result.status, 404);
});

test('returns 403 when enrollment is expired (expiresAt < now)', async () => {
  const pastDate = new Date('2025-01-01T00:00:00Z');
  const now = new Date('2025-01-02T00:00:00Z');

  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => createMockUser(),
    queryEnrollment: async () => ({
      courseId: '550e8400-e29b-41d4-a716-446655440000',
      lessonId: '660e8400-e29b-41d4-a716-446655440001',
      videoUrl: 'courses/550e8400-e29b-41d4-a716-446655440000/lesson-video/123e4567-e89b-42d3-a456-426614174000.mp4',
      videoProvider: 'azure',
      expiresAt: pastDate,
    }),
    storage: createMockStorage(),
    getNow: () => now,
  });

  const result = await service.authorizePlayback('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001');
  assert.equal(result.status, 403);
  assert.equal(result.error, 'Enrollment expired');
});

test('authorizes when enrollment expiresAt equals now (active)', async () => {
  const exactTime = new Date('2025-01-01T12:00:00Z');

  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => createMockUser(),
    queryEnrollment: async () => ({
      courseId: '550e8400-e29b-41d4-a716-446655440000',
      lessonId: '660e8400-e29b-41d4-a716-446655440001',
      videoUrl: 'courses/550e8400-e29b-41d4-a716-446655440000/lesson-video/123e4567-e89b-42d3-a456-426614174000.mp4',
      videoProvider: 'azure',
      expiresAt: exactTime,
    }),
    storage: createMockStorage(),
    getNow: () => exactTime,
  });

  const result = await service.authorizePlayback('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001');
  assert.equal(result.status, 200);
  assert.ok('redirectUrl' in result);
});

test('returns 404 when lesson does not belong to course', async () => {
  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => createMockUser(),
    queryEnrollment: async () => ({
      courseId: '770e8400-e29b-41d4-a716-446655440002', // Different course
      lessonId: '660e8400-e29b-41d4-a716-446655440001',
      videoUrl: 'courses/770e8400-e29b-41d4-a716-446655440002/lesson-video/123e4567-e89b-42d3-a456-426614174000.mp4',
      videoProvider: 'azure',
      expiresAt: null,
    }),
    storage: createMockStorage(),
  });

  const result = await service.authorizePlayback('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001');
  assert.equal(result.status, 404);
  assert.equal(result.error, 'Lesson not found');
});

test('returns 404 when video provider is not azure', async () => {
  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => createMockUser(),
    queryEnrollment: async () => ({
      courseId: '550e8400-e29b-41d4-a716-446655440000',
      lessonId: '660e8400-e29b-41d4-a716-446655440001',
      videoUrl: 'https://youtube.com/watch?v=abc123',
      videoProvider: 'youtube',
      expiresAt: null,
    }),
    storage: createMockStorage(),
  });

  const result = await service.authorizePlayback('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001');
  assert.equal(result.status, 404);
  assert.equal(result.error, 'Media not found');
});

test('returns 404 when blob reference has foreign prefix', async () => {
  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => createMockUser(),
    queryEnrollment: async () => ({
      courseId: '550e8400-e29b-41d4-a716-446655440000',
      lessonId: '660e8400-e29b-41d4-a716-446655440001',
      videoUrl: 'courses/770e8400-e29b-41d4-a716-446655440002/lesson-video/123e4567-e89b-42d3-a456-426614174000.mp4',
      videoProvider: 'azure',
      expiresAt: null,
    }),
    storage: createMockStorage(),
  });

  const result = await service.authorizePlayback('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001');
  assert.equal(result.status, 404);
  assert.equal(result.error, 'Invalid media reference');
});

test('returns 404 when blob reference is invalid', async () => {
  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => createMockUser(),
    queryEnrollment: async () => ({
      courseId: '550e8400-e29b-41d4-a716-446655440000',
      lessonId: '660e8400-e29b-41d4-a716-446655440001',
      videoUrl: '../../../etc/passwd',
      videoProvider: 'azure',
      expiresAt: null,
    }),
    storage: createMockStorage(),
  });

  const result = await service.authorizePlayback('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001');
  assert.equal(result.status, 404);
  assert.equal(result.error, 'Invalid media reference');
});

test('returns 404 when blob reference is staging (non-final)', async () => {
  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => createMockUser(),
    queryEnrollment: async () => ({
      courseId: '550e8400-e29b-41d4-a716-446655440000',
      lessonId: '660e8400-e29b-41d4-a716-446655440001',
      videoUrl: 'staging/courses/550e8400-e29b-41d4-a716-446655440000/lesson-video/123e4567-e89b-42d3-a456-426614174000.mp4',
      videoProvider: 'azure',
      expiresAt: null,
    }),
    storage: createMockStorage(),
  });

  const result = await service.authorizePlayback('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001');
  assert.equal(result.status, 404);
  assert.equal(result.error, 'Invalid media reference');
});

test('returns 404 when videoUrl is null', async () => {
  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => createMockUser(),
    queryEnrollment: async () => ({
      courseId: '550e8400-e29b-41d4-a716-446655440000',
      lessonId: '660e8400-e29b-41d4-a716-446655440001',
      videoUrl: null,
      videoProvider: 'azure',
      expiresAt: null,
    }),
    storage: createMockStorage(),
  });

  const result = await service.authorizePlayback('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001');
  assert.equal(result.status, 404);
  assert.equal(result.error, 'Invalid media reference');
});

test('returns redirect URL with 5-minute SAS for authorized request', async () => {
  const mockStorage = createMockStorage();
  const createReadUrlCalls: Array<{ container: string; blob: string }> = [];
  mockStorage.createReadUrl = async (container, blob) => {
    createReadUrlCalls.push({ container, blob });
    return 'https://storage.example.com/course-videos/courses/550e8400-e29b-41d4-a716-446655440000/lesson-video/123e4567-e89b-42d3-a456-426614174000.mp4?sasToken';
  };

  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => createMockUser(),
    queryEnrollment: async () => ({
      courseId: '550e8400-e29b-41d4-a716-446655440000',
      lessonId: '660e8400-e29b-41d4-a716-446655440001',
      videoUrl: 'courses/550e8400-e29b-41d4-a716-446655440000/lesson-video/123e4567-e89b-42d3-a456-426614174000.mp4',
      videoProvider: 'azure',
      expiresAt: null,
    }),
    storage: mockStorage,
  });

  const result = await service.authorizePlayback('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001');
  assert.equal(result.status, 200);
  assert.ok('redirectUrl' in result);
  assert.equal(result.redirectUrl, 'https://storage.example.com/course-videos/courses/550e8400-e29b-41d4-a716-446655440000/lesson-video/123e4567-e89b-42d3-a456-426614174000.mp4?sasToken');
  assert.equal(createReadUrlCalls.length, 1);
  assert.equal(createReadUrlCalls[0]!.container, 'course-videos');
  assert.equal(createReadUrlCalls[0]!.blob, 'courses/550e8400-e29b-41d4-a716-446655440000/lesson-video/123e4567-e89b-42d3-a456-426614174000.mp4');
});

test('never logs SAS URL on success', async () => {
  const logs: string[] = [];
  const originalLog = console.log;
  const originalError = console.error;
  console.log = (...args: unknown[]) => logs.push(args.join(' '));
  console.error = (...args: unknown[]) => logs.push(args.join(' '));

  const service = createCourseMediaPlaybackService({
    getAuthUser: async () => createMockUser(),
    queryEnrollment: async () => ({
      courseId: '550e8400-e29b-41d4-a716-446655440000',
      lessonId: '660e8400-e29b-41d4-a716-446655440001',
      videoUrl: 'courses/550e8400-e29b-41d4-a716-446655440000/lesson-video/123e4567-e89b-42d3-a456-426614174000.mp4',
      videoProvider: 'azure',
      expiresAt: null,
    }),
    storage: createMockStorage(),
  });

  await service.authorizePlayback('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001');

  console.log = originalLog;
  console.error = originalError;

  assert.ok(!logs.some(log => log.includes('sasToken')));
  assert.ok(!logs.some(log => log.includes('storage.example.com')));
});
