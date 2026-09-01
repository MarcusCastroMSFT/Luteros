import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  createUploadToken,
  verifyUploadToken,
  type UploadTokenPayload,
  type TokenDependencies,
} from './course-media-upload-token.server';
import { createOwnerFingerprint } from './course-media-paths.server';

const FIXED_NOW = new Date('2026-01-01T00:00:00Z');
const VALID_SECRET = 'test-secret-key-for-hmac-signing'; // exactly 32 bytes

function makeDeps(overrides?: Partial<TokenDependencies>): TokenDependencies {
  return {
    getNow: () => FIXED_NOW,
    getSecret: () => VALID_SECRET,
    ...overrides,
  };
}

function makePayload(overrides?: Partial<UploadTokenPayload>): UploadTokenPayload {
  const ownerFingerprint = createOwnerFingerprint('user-1');
  return {
    v: 1,
    userId: 'user-1',
    declaration: { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 },
    stagingBlobName: `staging/drafts/${ownerFingerprint}/thumbnail/11111111-1111-4111-a111-111111111111.jpg`,
    container: 'course-images',
    blobUrl: `https://account.blob.core.windows.net/course-images/staging/drafts/${ownerFingerprint}/thumbnail/11111111-1111-4111-a111-111111111111.jpg`,
    expiresAt: new Date(FIXED_NOW.getTime() + 15 * 60 * 1000).toISOString(),
    ...overrides,
  };
}

test('rejects signed draft paths owned by another fingerprint', () => {
  const foreignFingerprint = createOwnerFingerprint('user-2');
  const payload = makePayload({
    stagingBlobName: `staging/drafts/${foreignFingerprint}/thumbnail/11111111-1111-4111-a111-111111111111.jpg`,
    blobUrl: `https://account.blob.core.windows.net/course-images/staging/drafts/${foreignFingerprint}/thumbnail/11111111-1111-4111-a111-111111111111.jpg`,
  });
  assert.equal(verifyUploadToken(createUploadToken(payload, makeDeps()), makeDeps()).ok, false);
});

test('rejects signed staging paths with extra segments', () => {
  const payload = makePayload();
  payload.stagingBlobName += '/extra';
  payload.blobUrl += '/extra';
  assert.equal(verifyUploadToken(createUploadToken(payload, makeDeps()), makeDeps()).ok, false);
});

// ─── Secret Validation ────────────────────────────────────────────────────────

describe('secret validation', () => {
  test('rejects empty secret on token creation', () => {
    const deps = makeDeps({ getSecret: () => '' });
    assert.throws(() => createUploadToken(makePayload(), deps), /secret.*32/i);
  });

  test('rejects short secret on token creation', () => {
    const deps = makeDeps({ getSecret: () => 'too-short' });
    assert.throws(() => createUploadToken(makePayload(), deps), /secret.*32/i);
  });

  test('rejects short secret on token verification', () => {
    const goodDeps = makeDeps();
    const token = createUploadToken(makePayload(), goodDeps);
    const badDeps = makeDeps({ getSecret: () => 'short' });
    const result = verifyUploadToken(token, badDeps);
    assert.equal(result.ok, false);
  });

  test('accepts exactly 32-byte secret', () => {
    const deps = makeDeps({ getSecret: () => 'a'.repeat(32) });
    const token = createUploadToken(makePayload(), deps);
    const result = verifyUploadToken(token, deps);
    assert.equal(result.ok, true);
  });
});

// ─── Token Format ─────────────────────────────────────────────────────────────

describe('token format', () => {
  test('token is payload.signature with base64url segments', () => {
    const deps = makeDeps();
    const token = createUploadToken(makePayload(), deps);
    assert.match(token, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  test('rejects token longer than 4096 chars', () => {
    const deps = makeDeps();
    const result = verifyUploadToken('A'.repeat(4097), deps);
    assert.equal(result.ok, false);
  });

  test('rejects empty string', () => {
    assert.equal(verifyUploadToken('', makeDeps()).ok, false);
  });

  test('rejects token with no dot', () => {
    assert.equal(verifyUploadToken('nodothere', makeDeps()).ok, false);
  });

  test('rejects token with multiple dots', () => {
    assert.equal(verifyUploadToken('a.b.c', makeDeps()).ok, false);
  });

  test('rejects non-base64url characters in segments', () => {
    assert.equal(verifyUploadToken('pay+load.sig', makeDeps()).ok, false);
  });
});

// ─── Signature Verification ───────────────────────────────────────────────────

describe('signature verification', () => {
  test('rejects tampered payload', () => {
    const deps = makeDeps();
    const token = createUploadToken(makePayload(), deps);
    const tampered = 'AAAA' + token.slice(4);
    assert.equal(verifyUploadToken(tampered, deps).ok, false);
  });

  test('rejects tampered signature', () => {
    const deps = makeDeps();
    const token = createUploadToken(makePayload(), deps);
    const tampered = token.slice(0, -5) + 'XXXXX';
    assert.equal(verifyUploadToken(tampered, deps).ok, false);
  });

  test('rejects token signed with different secret', () => {
    const deps1 = makeDeps({ getSecret: () => 'a]'.repeat(16) });
    const deps2 = makeDeps({ getSecret: () => 'b]'.repeat(16) });
    const token = createUploadToken(makePayload(), deps1);
    assert.equal(verifyUploadToken(token, deps2).ok, false);
  });

  test('roundtrip: create then verify returns original payload', () => {
    const deps = makeDeps();
    const payload = makePayload();
    const token = createUploadToken(payload, deps);
    const result = verifyUploadToken(token, deps);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.payload.userId, payload.userId);
      assert.deepEqual(result.payload.declaration, payload.declaration);
    }
  });
});

// ─── Expiry ───────────────────────────────────────────────────────────────────

describe('expiry', () => {
  test('rejects expired token', () => {
    const deps = makeDeps();
    const payload = makePayload({ expiresAt: new Date(FIXED_NOW.getTime() - 1000).toISOString() });
    const token = createUploadToken(payload, deps);
    const result = verifyUploadToken(token, deps);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /expired/i);
  });

  test('rejects expiresAt more than 16 minutes ahead', () => {
    const deps = makeDeps();
    const payload = makePayload({ expiresAt: new Date(FIXED_NOW.getTime() + 17 * 60 * 1000).toISOString() });
    const token = createUploadToken(payload, deps);
    const result = verifyUploadToken(token, deps);
    assert.equal(result.ok, false);
  });
});

// ─── Payload Structure ────────────────────────────────────────────────────────

describe('payload structure', () => {
  test('rejects extra keys in payload', () => {
    const deps = makeDeps();
    const payload = { ...makePayload(), extraKey: 'evil' } as unknown as UploadTokenPayload;
    const token = createUploadToken(payload, deps);
    assert.equal(verifyUploadToken(token, deps).ok, false);
  });

  test('rejects extra keys in declaration', () => {
    const deps = makeDeps();
    const payload = makePayload();
    (payload.declaration as Record<string, unknown>).extra = true;
    const token = createUploadToken(payload, deps);
    assert.equal(verifyUploadToken(token, deps).ok, false);
  });

  test('rejects invalid container/kind combination', () => {
    const deps = makeDeps();
    // lesson-video should use course-videos, not course-images
    const payload = makePayload({
      declaration: { kind: 'lesson-video', contentType: 'video/mp4', size: 1024 },
      container: 'course-images',
      stagingBlobName: 'staging/drafts/abcdef123456abcdef123456/lesson-video/11111111-1111-4111-a111-111111111111.mp4',
    });
    const token = createUploadToken(payload, deps);
    assert.equal(verifyUploadToken(token, deps).ok, false);
  });

  test('rejects lesson-video token without lessonId', () => {
    const deps = makeDeps();
    const courseId = '12345678-1234-4234-9234-123456789000';
    const blobName = `staging/courses/${courseId}/lesson-video/11111111-1111-4111-a111-111111111111.mp4`;
    const payload = makePayload({
      declaration: { kind: 'lesson-video', contentType: 'video/mp4', size: 1024 },
      container: 'course-videos',
      courseId,
      stagingBlobName: blobName,
      blobUrl: `https://account.blob.core.windows.net/course-videos/${blobName}`,
    });
    const token = createUploadToken(payload, deps);
    assert.equal(verifyUploadToken(token, deps).ok, false);
  });

  test('accepts a lesson-audio token for the private media container', () => {
    const deps = makeDeps();
    const courseId = '12345678-1234-4234-9234-123456789000';
    const blobName = `staging/courses/${courseId}/lesson-audio/11111111-1111-4111-a111-111111111111.mp3`;
    const payload = makePayload({
      declaration: { kind: 'lesson-audio', contentType: 'audio/mpeg', size: 1024 },
      container: 'course-videos',
      courseId,
      lessonId: 'lesson-1',
      stagingBlobName: blobName,
      blobUrl: `https://account.blob.core.windows.net/course-videos/${blobName}`,
    });
    const token = createUploadToken(payload, deps);

    assert.equal(verifyUploadToken(token, deps).ok, true);
  });

  test('rejects a lesson-audio token for the public image container', () => {
    const deps = makeDeps();
    const courseId = '12345678-1234-4234-9234-123456789000';
    const blobName = `staging/courses/${courseId}/lesson-audio/11111111-1111-4111-a111-111111111111.mp3`;
    const payload = makePayload({
      declaration: { kind: 'lesson-audio', contentType: 'audio/mpeg', size: 1024 },
      container: 'course-images',
      courseId,
      lessonId: 'lesson-1',
      stagingBlobName: blobName,
      blobUrl: `https://account.blob.core.windows.net/course-images/${blobName}`,
    });
    const token = createUploadToken(payload, deps);

    assert.equal(verifyUploadToken(token, deps).ok, false);
  });

  test('validates declaration through validateCourseMediaDeclaration', () => {
    const deps = makeDeps();
    // image/jpeg is not valid for lesson-video
    const payload = makePayload({
      declaration: { kind: 'lesson-video', contentType: 'image/jpeg', size: 1024 },
      container: 'course-videos',
      stagingBlobName: 'staging/drafts/abcdef123456abcdef123456/lesson-video/11111111-1111-4111-a111-111111111111.mp4',
    });
    const token = createUploadToken(payload, deps);
    assert.equal(verifyUploadToken(token, deps).ok, false);
  });
});

// ─── Staging Path Consistency ─────────────────────────────────────────────────

describe('staging path consistency', () => {
  test('rejects staging path that does not start with staging/', () => {
    const deps = makeDeps();
    const payload = makePayload({ stagingBlobName: 'courses/123/thumbnail/abc.jpg' });
    const token = createUploadToken(payload, deps);
    assert.equal(verifyUploadToken(token, deps).ok, false);
  });

  test('rejects course token where staging path has wrong courseId', () => {
    const deps = makeDeps();
    const courseId = '12345678-1234-4234-9234-123456789000';
    const payload = makePayload({
      courseId,
      stagingBlobName: 'staging/courses/99999999-9999-4999-9999-999999999999/thumbnail/11111111-1111-4111-a111-111111111111.jpg',
    });
    const token = createUploadToken(payload, deps);
    assert.equal(verifyUploadToken(token, deps).ok, false);
  });

  test('rejects staging path with wrong kind segment', () => {
    const deps = makeDeps();
    const payload = makePayload({
      stagingBlobName: 'staging/drafts/abcdef123456abcdef123456/cover/11111111-1111-4111-a111-111111111111.jpg',
      declaration: { kind: 'thumbnail', contentType: 'image/jpeg', size: 1024 },
    });
    const token = createUploadToken(payload, deps);
    assert.equal(verifyUploadToken(token, deps).ok, false);
  });
});

// ─── blobUrl Validation ───────────────────────────────────────────────────────

describe('blobUrl validation', () => {
  test('rejects non-HTTPS blobUrl', () => {
    const deps = makeDeps();
    const payload = makePayload({ blobUrl: 'http://account.blob.core.windows.net/course-images/staging/test.jpg' });
    const token = createUploadToken(payload, deps);
    assert.equal(verifyUploadToken(token, deps).ok, false);
  });

  test('rejects blobUrl with query string', () => {
    const deps = makeDeps();
    const payload = makePayload({
      blobUrl: 'https://account.blob.core.windows.net/course-images/staging/test.jpg?sig=evil',
    });
    const token = createUploadToken(payload, deps);
    assert.equal(verifyUploadToken(token, deps).ok, false);
  });

  test('rejects blobUrl with hash', () => {
    const deps = makeDeps();
    const payload = makePayload({
      blobUrl: 'https://account.blob.core.windows.net/course-images/staging/test.jpg#frag',
    });
    const token = createUploadToken(payload, deps);
    assert.equal(verifyUploadToken(token, deps).ok, false);
  });
});

// ─── Generic Error Messages ───────────────────────────────────────────────────

describe('error messages are generic', () => {
  test('tampered token does not reveal internals', () => {
    const result = verifyUploadToken('bad.token', makeDeps());
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, 'Invalid upload token');
    }
  });
});
