import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createFinalBlobName,
  createOwnerFingerprint,
  createStagingBlobName,
  getPublicCourseImageUrl,
  parseCourseMediaReference,
} from './course-media-paths.server';

const COURSE_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_COURSE_ID = '22222222-2222-4222-8222-222222222222';
const OWNER_ID = 'user_123';
const OWNER_FINGERPRINT = createOwnerFingerprint(OWNER_ID);

const UUID_PATTERN = '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';

test('creates a stable non-reversible owner fingerprint', () => {
  assert.equal(OWNER_FINGERPRINT, createOwnerFingerprint(OWNER_ID));
  assert.match(OWNER_FINGERPRINT, /^[0-9a-f]{24}$/);
  assert.doesNotMatch(OWNER_FINGERPRINT, /user/);
  assert.notEqual(OWNER_FINGERPRINT, createOwnerFingerprint('user_456'));
});

test('creates trusted course and draft staging names', () => {
  assert.match(
    createStagingBlobName({
      courseId: COURSE_ID,
      kind: 'cover',
      contentType: 'image/webp',
    }),
    new RegExp(`^staging/courses/${COURSE_ID}/cover/${UUID_PATTERN}\\.webp$`),
  );
  assert.match(
    createStagingBlobName({
      ownerFingerprint: OWNER_FINGERPRINT,
      kind: 'thumbnail',
      contentType: 'image/jpeg',
    }),
    new RegExp(`^staging/drafts/${OWNER_FINGERPRINT}/thumbnail/${UUID_PATTERN}\\.jpg$`),
  );
});

test('requires exactly one staging owner', () => {
  assert.throws(
    () =>
      createStagingBlobName({
        kind: 'cover',
        contentType: 'image/png',
      }),
    /courseId or ownerFingerprint/i,
  );
  assert.throws(
    () =>
      createStagingBlobName({
        courseId: COURSE_ID,
        ownerFingerprint: OWNER_FINGERPRINT,
        kind: 'cover',
        contentType: 'image/png',
      }),
    /courseId or ownerFingerprint/i,
  );
});

test('creates final names using only trusted segments and MIME-derived extensions', () => {
  assert.match(
    createFinalBlobName({
      courseId: COURSE_ID,
      kind: 'lesson-video',
      contentType: 'video/quicktime',
    }),
    new RegExp(`^courses/${COURSE_ID}/lesson-video/${UUID_PATTERN}\\.mov$`),
  );
  assert.throws(
    () =>
      createFinalBlobName({
        courseId: COURSE_ID,
        kind: 'cover',
        contentType: 'image/svg+xml',
      }),
    /unsupported media type/i,
  );
});

test('rejects MIME types that do not match the requested media kind', () => {
  assert.throws(
    () =>
      createFinalBlobName({
        courseId: COURSE_ID,
        kind: 'cover',
        contentType: 'video/mp4',
      }),
    /unsupported media type/i,
  );
  assert.throws(
    () =>
      createStagingBlobName({
        courseId: COURSE_ID,
        kind: 'lesson-video',
        contentType: 'image/png',
      }),
    /unsupported media type/i,
  );
});

test('parses an exact final reference belonging to the expected course and kind', () => {
  const blobName = `courses/${COURSE_ID}/lesson-video/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.mp4`;

  assert.deepEqual(
    parseCourseMediaReference(blobName, {
      expectedCourseId: COURSE_ID,
      expectedKind: 'lesson-video',
    }),
    {
      scope: 'final',
      blobName,
      courseId: COURSE_ID,
      kind: 'lesson-video',
      extension: 'mp4',
    },
  );
});

test('parses only a draft reference belonging to the expected owner fingerprint', () => {
  const blobName = `staging/drafts/${OWNER_FINGERPRINT}/cover/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png`;

  assert.deepEqual(
    parseCourseMediaReference(blobName, {
      expectedOwnerFingerprint: OWNER_FINGERPRINT,
      expectedKind: 'cover',
    }),
    {
      scope: 'staging-draft',
      blobName,
      ownerFingerprint: OWNER_FINGERPRINT,
      kind: 'cover',
      extension: 'png',
    },
  );
});

test('rejects traversal, URLs, query strings, backslashes, and malformed segments', () => {
  const invalidReferences = [
    `courses/${COURSE_ID}/cover/../secret.png`,
    `courses\\${COURSE_ID}\\cover\\aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png`,
    `courses/${COURSE_ID}/cover/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png?sig=secret`,
    `https://account.blob.core.windows.net/course-images/courses/${COURSE_ID}/cover/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png`,
    `/courses/${COURSE_ID}/cover/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png`,
    `courses/${COURSE_ID}/cover/not-a-uuid.png`,
  ];

  for (const reference of invalidReferences) {
    assert.equal(parseCourseMediaReference(reference), null, reference);
  }
});

test('rejects foreign course, owner, kind, and inconsistent extension references', () => {
  assert.equal(
    parseCourseMediaReference(
      `courses/${OTHER_COURSE_ID}/cover/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png`,
      { expectedCourseId: COURSE_ID },
    ),
    null,
  );
  assert.equal(
    parseCourseMediaReference(
      'staging/drafts/ffffffffffffffffffffffff/cover/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png',
      { expectedOwnerFingerprint: OWNER_FINGERPRINT },
    ),
    null,
  );
  assert.equal(
    parseCourseMediaReference(
      `courses/${COURSE_ID}/cover/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png`,
      { expectedKind: 'thumbnail' },
    ),
    null,
  );
  assert.equal(
    parseCourseMediaReference(
      `courses/${COURSE_ID}/lesson-video/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png`,
    ),
    null,
  );
  assert.equal(
    parseCourseMediaReference(
      `courses/${COURSE_ID}/cover/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.mp4`,
    ),
    null,
  );
});

test('builds public URLs only for final course images', () => {
  const imageName = `courses/${COURSE_ID}/cover/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp`;
  assert.equal(
    getPublicCourseImageUrl('https://media.blob.core.windows.net', imageName),
    `https://media.blob.core.windows.net/course-images/${imageName}`,
  );
  assert.equal(
    getPublicCourseImageUrl(
      'https://media.blob.core.windows.net',
      `courses/${COURSE_ID}/lesson-video/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.mp4`,
    ),
    null,
  );
  assert.equal(
    getPublicCourseImageUrl(
      'https://media.blob.core.windows.net',
      `staging/courses/${COURSE_ID}/cover/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.webp`,
    ),
    null,
  );
});
