import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type { AuthUser } from './auth-helpers';
import type { CourseMediaStorage } from './course-media-storage.server';
import {
  initiateCourseMediaUpload,
  completeCourseMediaUpload,
  parseInitiationBody,
  sanitizeUploadGrantError,
  type ServiceDependencies,
} from './course-media-upload-service.server';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function user(role: AuthUser['role'], id: string): AuthUser {
  return { id, role, email: null, name: null, image: null, displayName: null };
}

const admin = user('ADMIN', 'admin-user');
const instructor = user('INSTRUCTOR', 'instructor-user');
const student = user('USER', 'student-user');
const otherInstructor = user('INSTRUCTOR', 'other-instructor');

const MOCK_COURSE_ID = '12345678-1234-4234-9234-123456789000';
const MOCK_LESSON_ID = '12345678-1234-4234-9234-123456789001';
const DIFFERENT_COURSE_ID = '12345678-1234-4234-9234-999999999999';
const FIXED_NOW = new Date('2026-01-01T00:00:00Z');
const TEST_SECRET = 'test-secret-key-for-hmac-signing'; // 32 bytes
const BLOB_ENDPOINT = 'https://account.blob.core.windows.net';

function createMockStorage(): CourseMediaStorage {
  const uploads = new Map<string, { contentType: string; contentLength: number }>();
  return {
    async createUploadGrant(containerName: string, blobName: string) {
      const ext = blobName.split('.').pop() ?? '';
      const ct: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime' };
      uploads.set(blobName, { contentType: ct[ext] ?? 'application/octet-stream', contentLength: 1024 });
      return {
        blobUrl: `${BLOB_ENDPOINT}/${containerName}/${blobName}`,
        sasUrl: `${BLOB_ENDPOINT}/${containerName}/${blobName}?sv=2024&sig=xyz`,
        expiresAt: new Date(FIXED_NOW.getTime() + 15 * 60 * 1000),
      };
    },
    async inspect(_c: string, blobName: string) {
      const props = uploads.get(blobName);
      if (!props) throw new Error('Not found');
      return props;
    },
    async promote() { return { ok: true }; },
    async deleteIfOwned() {},
    async createReadUrl() { return 'https://account.blob.core.windows.net/read?sig=abc'; },
  };
}

function createDeps(overrides?: Partial<ServiceDependencies>): ServiceDependencies {
  return {
    storage: createMockStorage(),
    findCourse: async () => ({ id: MOCK_COURSE_ID, instructorId: instructor.id }),
    findLesson: async () => ({ id: MOCK_LESSON_ID, courseId: MOCK_COURSE_ID }),
    getNow: () => FIXED_NOW,
    getSecret: () => TEST_SECRET,
    getBlobEndpoint: () => BLOB_ENDPOINT,
    ...overrides,
  };
}

// ─── parseInitiationBody (strict parser) ──────────────────────────────────────

describe('parseInitiationBody', () => {
  test('accepts valid draft body', () => {
    const r = parseInitiationBody({ kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 }, 'draft');
    assert.equal(r.ok, true);
  });

  test('accepts valid existing-course body with lessonId', () => {
    const r = parseInitiationBody({ kind: 'lesson-video', contentType: 'video/mp4', size: 1024, lessonId: 'l1' }, 'existing-course');
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.parsed.lessonId, 'l1');
  });

  test('rejects extra fields', () => {
    const r = parseInitiationBody({ kind: 'thumbnail', contentType: 'image/jpeg', size: 1024, evil: true }, 'draft');
    assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.error, /unexpected/i);
  });

  test('rejects non-object', () => {
    assert.equal(parseInitiationBody(null, 'draft').ok, false);
    assert.equal(parseInitiationBody('str', 'draft').ok, false);
    assert.equal(parseInitiationBody([1], 'draft').ok, false);
  });

  test('rejects wrong runtime types', () => {
    assert.equal(parseInitiationBody({ kind: 123, contentType: 'image/jpeg', size: 1024 }, 'draft').ok, false);
    assert.equal(parseInitiationBody({ kind: 'thumbnail', contentType: 'image/jpeg', size: '1024' }, 'draft').ok, false);
  });

  test('rejects lesson-video in draft context', () => {
    const r = parseInitiationBody({ kind: 'lesson-video', contentType: 'video/mp4', size: 1024, lessonId: 'l1' }, 'draft');
    assert.equal(r.ok, false);
  });

  test('rejects lessonId for non-video kind', () => {
    const r = parseInitiationBody({ kind: 'thumbnail', contentType: 'image/jpeg', size: 1024, lessonId: 'l1' }, 'existing-course');
    assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.error, /lessonId/i);
  });

  test('rejects lesson-video without lessonId', () => {
    const r = parseInitiationBody({ kind: 'lesson-video', contentType: 'video/mp4', size: 1024 }, 'existing-course');
    assert.equal(r.ok, false);
  });

  test('rejects __proto__ as unexpected field', () => {
    const body = JSON.parse('{"kind":"thumbnail","contentType":"image/jpeg","size":1024,"__proto__":{"evil":true}}');
    const r = parseInitiationBody(body, 'draft');
    assert.equal(r.ok, false);
  });

  test('rejects required fields inherited from the prototype', () => {
    const body = Object.create({ kind: 'thumbnail' }) as Record<string, unknown>;
    body.contentType = 'image/jpeg';
    body.size = 1024;
    assert.equal(parseInitiationBody(body, 'draft').ok, false);
  });
});

// ─── Initiation: auth/authorization ───────────────────────────────────────────

describe('initiation auth', () => {
  test('rejects unauthenticated → status 401', async () => {
    const r = await initiateCourseMediaUpload(null, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 }, createDeps());
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 401);
  });

  test('rejects students → status 403', async () => {
    const r = await initiateCourseMediaUpload(student, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 }, createDeps());
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 403);
  });

  test('no storage call before auth succeeds', async () => {
    let storageCalled = false;
    const deps = createDeps({
      storage: { ...createMockStorage(), async createUploadGrant() { storageCalled = true; throw new Error('nope'); } },
    });
    await initiateCourseMediaUpload(student, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 }, deps);
    assert.equal(storageCalled, false);
  });
});

describe('upload grant diagnostics', () => {
  test('categorizes Azure authorization failures without retaining sensitive text', () => {
    const error = Object.assign(
      new Error('Authorization failed https://blob.example/video?sig=secret assertion=jwt-secret'),
      {
        name: 'RestError',
        code: 'AuthorizationPermissionMismatch',
        statusCode: 403,
      },
    );

    const details = sanitizeUploadGrantError(error);

    assert.deepEqual(details, {
      category: 'azure_authorization_failed',
      name: 'RestError',
      code: 'AuthorizationPermissionMismatch',
      statusCode: 403,
    });
    assert.doesNotMatch(JSON.stringify(details), /secret|sig=|assertion|https:/i);
  });

  test('categorizes Vercel token exchange failures without retaining their message', () => {
    const details = sanitizeUploadGrantError(
      Object.assign(new Error('Failed to exchange token: private-value'), {
        name: 'VercelOidcTokenError',
      }),
    );

    assert.deepEqual(details, {
      category: 'vercel_oidc_failed',
      name: 'VercelOidcTokenError',
    });
    assert.doesNotMatch(JSON.stringify(details), /private-value|exchange token/i);
  });
});

// ─── Initiation: validation ───────────────────────────────────────────────────

describe('initiation validation', () => {
  test('rejects unknown kind → status 400', async () => {
    const r = await initiateCourseMediaUpload(instructor, { kind: 'unknown' as 'thumbnail', contentType: 'image/jpeg', size: 1024 }, createDeps());
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 400);
  });

  test('rejects invalid MIME', async () => {
    const r = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'application/pdf', size: 1024 }, createDeps());
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 400);
  });

  test('rejects oversized image', async () => {
    const r = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 9 * 1024 ** 2 }, createDeps());
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 400);
  });
});

// ─── Initiation: existing-course images use course staging ────────────────────

describe('existing-course image initiation', () => {
  test('thumbnail with courseId → staging/courses/{courseId}', async () => {
    let capturedBlobName = '';
    const deps = createDeps({
      storage: { ...createMockStorage(), async createUploadGrant(_c, blobName) {
        capturedBlobName = blobName;
        return { blobUrl: `${BLOB_ENDPOINT}/course-images/${blobName}`, sasUrl: `${BLOB_ENDPOINT}/course-images/${blobName}?sig=x`, expiresAt: new Date(FIXED_NOW.getTime() + 15 * 60 * 1000) };
      }},
    });
    const r = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024, courseId: MOCK_COURSE_ID }, deps);
    assert.equal(r.ok, true);
    assert.match(capturedBlobName, new RegExp(`^staging/courses/${MOCK_COURSE_ID}/thumbnail/`));
  });

  test('cover with courseId → finds and authorizes course', async () => {
    const deps = createDeps({
      findCourse: async () => ({ id: MOCK_COURSE_ID, instructorId: 'someone-else' }),
    });
    const r = await initiateCourseMediaUpload(instructor, { kind: 'cover', contentType: 'image/png', size: 1024, courseId: MOCK_COURSE_ID }, deps);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 403);
  });

  test('course not found → status 404', async () => {
    const deps = createDeps({ findCourse: async () => undefined });
    const r = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024, courseId: MOCK_COURSE_ID }, deps);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 404);
  });
});

// ─── Initiation: lesson-video ─────────────────────────────────────────────────

describe('lesson-video initiation', () => {
  test('requires courseId', async () => {
    const r = await initiateCourseMediaUpload(instructor, { kind: 'lesson-video', contentType: 'video/mp4', size: 1024 }, createDeps());
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 400);
  });

  test('requires lessonId', async () => {
    const r = await initiateCourseMediaUpload(instructor, { kind: 'lesson-video', contentType: 'video/mp4', size: 1024, courseId: MOCK_COURSE_ID }, createDeps());
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 400);
  });

  test('lesson not found → 404', async () => {
    const deps = createDeps({ findLesson: async () => undefined });
    const r = await initiateCourseMediaUpload(instructor, { kind: 'lesson-video', contentType: 'video/mp4', size: 1024, courseId: MOCK_COURSE_ID, lessonId: MOCK_LESSON_ID }, deps);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 404);
  });

  test('lesson belongs to different course → 404', async () => {
    const deps = createDeps({ findLesson: async () => ({ id: MOCK_LESSON_ID, courseId: DIFFERENT_COURSE_ID }) });
    const r = await initiateCourseMediaUpload(instructor, { kind: 'lesson-video', contentType: 'video/mp4', size: 1024, courseId: MOCK_COURSE_ID, lessonId: MOCK_LESSON_ID }, deps);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 404);
  });

  test('valid lesson-video → upload grant', async () => {
    const r = await initiateCourseMediaUpload(instructor, { kind: 'lesson-video', contentType: 'video/mp4', size: 1024, courseId: MOCK_COURSE_ID, lessonId: MOCK_LESSON_ID }, createDeps());
    assert.equal(r.ok, true);
    if (r.ok) assert.match(r.response.uploadId, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  test('admin can upload for any course', async () => {
    const r = await initiateCourseMediaUpload(admin, { kind: 'lesson-video', contentType: 'video/mp4', size: 1024, courseId: MOCK_COURSE_ID, lessonId: MOCK_LESSON_ID }, createDeps());
    assert.equal(r.ok, true);
  });
});

// ─── Draft initiation ─────────────────────────────────────────────────────────

describe('draft initiation', () => {
  test('valid draft thumbnail → upload grant with staging/drafts path', async () => {
    const r = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 }, createDeps());
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.match(r.response.blobUrl, /staging\/drafts\//);
      assert.equal(r.response.blockSize, 8_388_608);
    }
  });
});

// ─── Completion: stateless cross-instance ─────────────────────────────────────

describe('stateless completion', () => {
  test('token from instance 1 completes on instance 2', async () => {
    const sharedStorage = createMockStorage();
    const deps1 = createDeps({ storage: sharedStorage });
    const deps2 = createDeps({ storage: sharedStorage });

    const init = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 }, deps1);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    const result = await completeCourseMediaUpload(instructor, { uploadId: init.response.uploadId }, deps2);
    assert.equal(result.ok, true, 'stateless completion must work across instances');
  });
});

// ─── Completion: token tamper/expiry/foreign user ─────────────────────────────

describe('completion token security', () => {
  test('tampered token → rejected', async () => {
    const deps = createDeps();
    const init = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 }, deps);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    const tampered = init.response.uploadId.slice(0, -5) + 'AAAAA';
    const r = await completeCourseMediaUpload(instructor, { uploadId: tampered }, deps);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 400);
  });

  test('expired token → rejected', async () => {
    const deps = createDeps();
    const init = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 }, deps);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    const laterDeps = createDeps({ getNow: () => new Date(FIXED_NOW.getTime() + 20 * 60 * 1000) });
    const r = await completeCourseMediaUpload(instructor, { uploadId: init.response.uploadId }, laterDeps);
    assert.equal(r.ok, false);
    if (!r.ok) assert.match(r.error, /expired/i);
  });

  test('foreign user (non-admin) → status 403', async () => {
    const deps = createDeps();
    const init = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 }, deps);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    const r = await completeCourseMediaUpload(otherInstructor, { uploadId: init.response.uploadId }, deps);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 403);
  });

  test('rejects a token for another Blob endpoint before inspection', async () => {
    const storage = createMockStorage();
    let inspectCalls = 0;
    const alteredStorage: CourseMediaStorage = {
      ...storage,
      async createUploadGrant(containerName, blobName) {
        const grant = await storage.createUploadGrant(containerName, blobName);
        return {
          ...grant,
          blobUrl: grant.blobUrl.replace('account.blob.core.windows.net', 'other.blob.core.windows.net'),
        };
      },
      async inspect(...args) {
        inspectCalls += 1;
        return storage.inspect(...args);
      },
    };
    const deps = createDeps({ storage: alteredStorage });
    const init = await initiateCourseMediaUpload(
      instructor,
      { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 },
      deps,
    );
    assert.equal(init.ok, true);
    if (!init.ok) return;

    const result = await completeCourseMediaUpload(instructor, { uploadId: init.response.uploadId }, deps);
    assert.equal(result.ok, false);
    assert.equal(inspectCalls, 0);
  });
});

// ─── Completion: route context mismatch ───────────────────────────────────────

describe('completion route context', () => {
  test('draft route rejects token with courseId', async () => {
    const deps = createDeps();
    const init = await initiateCourseMediaUpload(instructor, { kind: 'lesson-video', contentType: 'video/mp4', size: 1024, courseId: MOCK_COURSE_ID, lessonId: MOCK_LESSON_ID }, deps);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    // Complete without courseId (draft route)
    const r = await completeCourseMediaUpload(instructor, { uploadId: init.response.uploadId }, deps);
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.status, 400);
      assert.match(r.error, /course.*route/i);
    }
  });

  test('course route rejects token without courseId', async () => {
    const deps = createDeps();
    const init = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 }, deps);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    const r = await completeCourseMediaUpload(instructor, { uploadId: init.response.uploadId, courseId: MOCK_COURSE_ID }, deps);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 400);
  });

  test('course route rejects mismatched courseId', async () => {
    const deps = createDeps();
    const init = await initiateCourseMediaUpload(instructor, { kind: 'lesson-video', contentType: 'video/mp4', size: 1024, courseId: MOCK_COURSE_ID, lessonId: MOCK_LESSON_ID }, deps);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    const r = await completeCourseMediaUpload(instructor, { uploadId: init.response.uploadId, courseId: DIFFERENT_COURSE_ID }, deps);
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.status, 400);
      assert.match(r.error, /mismatch/i);
    }
  });
});

// ─── Completion: re-authorize on course ───────────────────────────────────────

describe('completion re-authorization', () => {
  test('course deleted between init and complete → 404', async () => {
    const sharedStorage = createMockStorage();
    const deps = createDeps({ storage: sharedStorage });
    const init = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024, courseId: MOCK_COURSE_ID }, deps);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    const laterDeps = createDeps({ storage: sharedStorage, findCourse: async () => undefined });
    const r = await completeCourseMediaUpload(instructor, { uploadId: init.response.uploadId, courseId: MOCK_COURSE_ID }, laterDeps);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 404);
  });

  test('ownership transferred between init and complete → 403', async () => {
    const sharedStorage = createMockStorage();
    const deps = createDeps({ storage: sharedStorage });
    const init = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024, courseId: MOCK_COURSE_ID }, deps);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    let inspectCalls = 0;
    const laterDeps = createDeps({
      storage: {
        ...sharedStorage,
        async inspect(...args) {
          inspectCalls += 1;
          return sharedStorage.inspect(...args);
        },
      },
      findCourse: async () => ({ id: MOCK_COURSE_ID, instructorId: 'new-owner' }),
    });
    const r = await completeCourseMediaUpload(instructor, { uploadId: init.response.uploadId, courseId: MOCK_COURSE_ID }, laterDeps);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 403);
    assert.equal(inspectCalls, 0);
  });

  test('lesson deleted between init and video complete → 404', async () => {
    const sharedStorage = createMockStorage();
    const deps = createDeps({ storage: sharedStorage });
    const init = await initiateCourseMediaUpload(instructor, { kind: 'lesson-video', contentType: 'video/mp4', size: 1024, courseId: MOCK_COURSE_ID, lessonId: MOCK_LESSON_ID }, deps);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    const laterDeps = createDeps({ storage: sharedStorage, findLesson: async () => undefined });
    const r = await completeCourseMediaUpload(instructor, { uploadId: init.response.uploadId, courseId: MOCK_COURSE_ID }, laterDeps);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 404);
  });

  test('lesson moved to another course between init and complete → 404', async () => {
    const sharedStorage = createMockStorage();
    const deps = createDeps({ storage: sharedStorage });
    const init = await initiateCourseMediaUpload(instructor, { kind: 'lesson-video', contentType: 'video/mp4', size: 1024, courseId: MOCK_COURSE_ID, lessonId: MOCK_LESSON_ID }, deps);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    const laterDeps = createDeps({
      storage: sharedStorage,
      findLesson: async () => ({ id: MOCK_LESSON_ID, courseId: DIFFERENT_COURSE_ID }),
    });
    const r = await completeCourseMediaUpload(instructor, { uploadId: init.response.uploadId, courseId: MOCK_COURSE_ID }, laterDeps);
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 404);
  });
});

// ─── Completion: exact result shapes ──────────────────────────────────────────

describe('completion result shapes', () => {
  test('existing-course thumbnail → {kind:"thumbnail", url}', async () => {
    const deps = createDeps();
    const init = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024, courseId: MOCK_COURSE_ID }, deps);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    const r = await completeCourseMediaUpload(instructor, { uploadId: init.response.uploadId, courseId: MOCK_COURSE_ID }, deps);
    assert.equal(r.ok, true);
    if (r.ok) {
      const result = r.result as { kind: string; url: string };
      assert.equal(result.kind, 'thumbnail');
      assert.ok(result.url.startsWith('https://'));
      assert.match(result.url, /\/course-images\/courses\//);
      assert.ok(!('blobName' in r.result));
      assert.ok(!('type' in r.result));
    }
  });

  test('draft thumbnail → {kind:"thumbnail", url} (not promoted)', async () => {
    const deps = createDeps();
    const init = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 }, deps);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    const r = await completeCourseMediaUpload(instructor, { uploadId: init.response.uploadId }, deps);
    assert.equal(r.ok, true);
    if (r.ok) {
      const result = r.result as { kind: string; url: string };
      assert.equal(result.kind, 'thumbnail');
      assert.ok(result.url.startsWith('https://'));
      assert.match(result.url, /staging\/drafts\//);
    }
  });

  test('lesson-video → {kind:"lesson-video", blobName, videoProvider:"azure"}', async () => {
    const deps = createDeps();
    const init = await initiateCourseMediaUpload(instructor, { kind: 'lesson-video', contentType: 'video/mp4', size: 1024, courseId: MOCK_COURSE_ID, lessonId: MOCK_LESSON_ID }, deps);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    const r = await completeCourseMediaUpload(instructor, { uploadId: init.response.uploadId, courseId: MOCK_COURSE_ID }, deps);
    assert.equal(r.ok, true);
    if (r.ok) {
      const result = r.result as { kind: string; blobName: string; videoProvider: string };
      assert.equal(result.kind, 'lesson-video');
      assert.match(result.blobName, /^courses\//);
      assert.equal(result.videoProvider, 'azure');
      assert.ok(!('url' in r.result));
    }
  });
});

// ─── Completion: blob property mismatch ───────────────────────────────────────

describe('completion blob mismatch', () => {
  test('size mismatch → status 400', async () => {
    const storage = createMockStorage();
    const originalInspect = storage.inspect;
    storage.inspect = async (c, b) => {
      const r = await originalInspect.call(storage, c, b);
      return { ...r, contentLength: 9999 };
    };
    const deps = createDeps({ storage });
    const init = await initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 }, deps);
    assert.equal(init.ok, true);
    if (!init.ok) return;

    const r = await completeCourseMediaUpload(instructor, { uploadId: init.response.uploadId }, deps);
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.status, 400);
      assert.match(r.error, /mismatch/i);
    }
  });
});

// ─── Short Secret Rejection ──────────────────────────────────────────────────

describe('short secret rejection', () => {
  test('initiation with empty secret throws', async () => {
    const deps = createDeps({ getSecret: () => '' });
    await assert.rejects(
      initiateCourseMediaUpload(instructor, { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 }, deps),
      /secret.*32/i,
    );
  });
});
