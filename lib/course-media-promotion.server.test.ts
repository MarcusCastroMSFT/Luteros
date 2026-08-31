import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  classifyImageUrl,
  promoteOwnedDraftImage,
  validateFinalImageUrl,
  selectReplacedAzureImages,
  type ImageUrlClassification,
} from './course-media-promotion.server';
import type { CourseMediaStorage, BlobInspection, PromoteResult } from './course-media-storage.server';

const BLOB_ENDPOINT = 'https://account.blob.core.windows.net';
const TEST_COURSE_ID = '12345678-1234-4abc-8abc-123456789abc';
const TEST_OWNER_FP = 'a1b2c3d4e5f678901234abcd';

describe('classifyImageUrl', () => {
  test('returns null for null/undefined/empty', () => {
    assert.equal(classifyImageUrl(null, BLOB_ENDPOINT), null);
    assert.equal(classifyImageUrl(undefined, BLOB_ENDPOINT), null);
    assert.equal(classifyImageUrl('', BLOB_ENDPOINT), null);
  });

  test('returns null for invalid URLs', () => {
    assert.equal(classifyImageUrl('not a url', BLOB_ENDPOINT), null);
    assert.equal(classifyImageUrl('://malformed', BLOB_ENDPOINT), null);
  });

  test('returns null for URLs with query strings or fragments', () => {
    const withQuery = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/img.jpg?sig=secret`;
    const withHash = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/img.jpg#anchor`;
    assert.equal(classifyImageUrl(withQuery, BLOB_ENDPOINT), null);
    assert.equal(classifyImageUrl(withHash, BLOB_ENDPOINT), null);
  });

  test('classifies external URLs', () => {
    const external1 = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    const external2 = 'https://vercel-blob.example.com/abc123.jpg';
    const result1 = classifyImageUrl(external1, BLOB_ENDPOINT);
    const result2 = classifyImageUrl(external2, BLOB_ENDPOINT);
    assert.deepEqual(result1, { type: 'external' });
    assert.deepEqual(result2, { type: 'external' });
  });

  test('preserves query strings and fragments on external URLs', () => {
    const transformed = 'https://res.cloudinary.com/demo/image.jpg?w=300#crop';
    assert.deepEqual(classifyImageUrl(transformed, BLOB_ENDPOINT), { type: 'external' });
  });

  test('accepts external URLs but rejects Azure URLs when endpoint is not configured', () => {
    const external = 'https://images.example.com/course.jpg?width=1200';
    const azure = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    assert.deepEqual(classifyImageUrl(external, ''), { type: 'external' });
    assert.equal(classifyImageUrl(azure, ''), null);
  });

  test('rejects Azure URLs outside the configured endpoint', () => {
    const otherAccount = `https://other.blob.core.windows.net/course-images/courses/${TEST_COURSE_ID}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const insecureConfiguredHost = `http://account.blob.core.windows.net/course-images/courses/${TEST_COURSE_ID}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    assert.equal(classifyImageUrl(otherAccount, BLOB_ENDPOINT), null);
    assert.equal(classifyImageUrl(insecureConfiguredHost, BLOB_ENDPOINT), null);
  });

  test('returns null for wrong container', () => {
    const wrongContainer = `${BLOB_ENDPOINT}/wrong-container/courses/${TEST_COURSE_ID}/thumbnail/img.jpg`;
    assert.equal(classifyImageUrl(wrongContainer, BLOB_ENDPOINT), null);
  });

  test('returns null for malformed blob paths', () => {
    const noBlob = `${BLOB_ENDPOINT}/course-images/`;
    const noPath = `${BLOB_ENDPOINT}/course-images`;
    assert.equal(classifyImageUrl(noBlob, BLOB_ENDPOINT), null);
    assert.equal(classifyImageUrl(noPath, BLOB_ENDPOINT), null);
  });

  test('classifies staging-draft URLs', () => {
    const draftUrl = `${BLOB_ENDPOINT}/course-images/staging/drafts/${TEST_OWNER_FP}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const result = classifyImageUrl(draftUrl, BLOB_ENDPOINT) as ImageUrlClassification;
    assert.equal(result?.type, 'azure-draft');
    if (result && result.type === 'azure-draft') {
      assert.equal(result.ref.scope, 'staging-draft');
      assert.equal(result.ref.ownerFingerprint, TEST_OWNER_FP);
      assert.equal(result.ref.kind, 'thumbnail');
    }
  });

  test('classifies final URLs', () => {
    const finalUrl = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/cover/12345678-1234-4abc-89ab-123456789abc.png`;
    const result = classifyImageUrl(finalUrl, BLOB_ENDPOINT) as ImageUrlClassification;
    assert.equal(result?.type, 'azure-final');
    if (result && result.type === 'azure-final') {
      assert.equal(result.ref.scope, 'final');
      assert.equal(result.ref.courseId, TEST_COURSE_ID);
      assert.equal(result.ref.kind, 'cover');
    }
  });

  test('returns null for staging-course (not valid for persistence)', () => {
    const stagingCourse = `${BLOB_ENDPOINT}/course-images/staging/courses/${TEST_COURSE_ID}/thumbnail/img.jpg`;
    assert.equal(classifyImageUrl(stagingCourse, BLOB_ENDPOINT), null);
  });
});

describe('promoteOwnedDraftImage', () => {
  function createMockStorage(overrides?: Partial<CourseMediaStorage>): CourseMediaStorage {
    return {
      async createUploadGrant() { throw new Error('Not implemented'); },
      async inspect(): Promise<BlobInspection> {
        return { contentLength: 1024, contentType: 'image/jpeg' };
      },
      async promote(): Promise<PromoteResult> {
        return { ok: true };
      },
      async deleteIfOwned() {},
      async createReadUrl() { return 'https://example.com/read'; },
      ...overrides,
    };
  }

  test('rejects invalid URL', async () => {
    const storage = createMockStorage();
    const result = await promoteOwnedDraftImage(
      {
        url: 'not a url',
        courseId: TEST_COURSE_ID,
        kind: 'thumbnail',
        expectedOwnerFingerprint: TEST_OWNER_FP,
        containerName: 'course-images',
        blobEndpoint: BLOB_ENDPOINT,
      },
      storage,
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, 'URL inválida');
    }
  });

  test('preserves external URLs without contacting storage', async () => {
    let inspectCalls = 0;
    const storage = createMockStorage();
    storage.inspect = async () => {
      inspectCalls += 1;
      return { contentLength: 1, contentType: 'image/jpeg' };
    };
    const externalUrl = 'https://cloudinary.com/image.jpg';
    const result = await promoteOwnedDraftImage(
      {
        url: externalUrl,
        courseId: TEST_COURSE_ID,
        kind: 'thumbnail',
        expectedOwnerFingerprint: TEST_OWNER_FP,
        containerName: 'course-images',
        blobEndpoint: BLOB_ENDPOINT,
      },
      storage,
    );
    assert.deepEqual(result, { ok: true, finalUrl: externalUrl });
    assert.equal(inspectCalls, 0);
  });

  test('rejects draft with wrong owner fingerprint', async () => {
    const storage = createMockStorage();
    const wrongOwnerFp = '000000000000000000000000';
    const draftUrl = `${BLOB_ENDPOINT}/course-images/staging/drafts/${wrongOwnerFp}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const result = await promoteOwnedDraftImage(
      {
        url: draftUrl,
        courseId: TEST_COURSE_ID,
        kind: 'thumbnail',
        expectedOwnerFingerprint: TEST_OWNER_FP,
        containerName: 'course-images',
        blobEndpoint: BLOB_ENDPOINT,
      },
      storage,
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, 'Rascunho não pertence ao usuário autenticado');
    }
  });

  test('rejects draft with wrong kind', async () => {
    const storage = createMockStorage();
    const draftUrl = `${BLOB_ENDPOINT}/course-images/staging/drafts/${TEST_OWNER_FP}/cover/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const result = await promoteOwnedDraftImage(
      {
        url: draftUrl,
        courseId: TEST_COURSE_ID,
        kind: 'thumbnail',
        expectedOwnerFingerprint: TEST_OWNER_FP,
        containerName: 'course-images',
        blobEndpoint: BLOB_ENDPOINT,
      },
      storage,
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, 'Tipo de mídia não corresponde');
    }
  });

  test('rejects when blob is not found', async () => {
    const storage = createMockStorage({
      async inspect() {
        throw new Error('BlobNotFound');
      },
    });
    const draftUrl = `${BLOB_ENDPOINT}/course-images/staging/drafts/${TEST_OWNER_FP}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const result = await promoteOwnedDraftImage(
      {
        url: draftUrl,
        courseId: TEST_COURSE_ID,
        kind: 'thumbnail',
        expectedOwnerFingerprint: TEST_OWNER_FP,
        containerName: 'course-images',
        blobEndpoint: BLOB_ENDPOINT,
      },
      storage,
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, 'Blob não encontrado ou inacessível');
    }
  });

  test('rejects Blob properties that violate the media policy', async () => {
    const storage = createMockStorage({
      async inspect() {
        return { contentLength: 1024, contentType: 'text/html' };
      },
    });
    const draftUrl = `${BLOB_ENDPOINT}/course-images/staging/drafts/${TEST_OWNER_FP}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const result = await promoteOwnedDraftImage(
      {
        url: draftUrl,
        courseId: TEST_COURSE_ID,
        kind: 'thumbnail',
        expectedOwnerFingerprint: TEST_OWNER_FP,
        containerName: 'course-images',
        blobEndpoint: BLOB_ENDPOINT,
      },
      storage,
    );
    assert.equal(result.ok, false);
  });

  test('rejects when promotion fails', async () => {
    const storage = createMockStorage({
      async promote() {
        return { ok: false, error: 'Promotion failed' };
      },
    });
    const draftUrl = `${BLOB_ENDPOINT}/course-images/staging/drafts/${TEST_OWNER_FP}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const result = await promoteOwnedDraftImage(
      {
        url: draftUrl,
        courseId: TEST_COURSE_ID,
        kind: 'thumbnail',
        expectedOwnerFingerprint: TEST_OWNER_FP,
        containerName: 'course-images',
        blobEndpoint: BLOB_ENDPOINT,
      },
      storage,
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, 'Promotion failed');
    }
  });

  test('returns a controlled failure when storage promotion throws', async () => {
    const storage = createMockStorage({
      async promote() {
        throw new Error('Azure details');
      },
    });
    const draftUrl = `${BLOB_ENDPOINT}/course-images/staging/drafts/${TEST_OWNER_FP}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const result = await promoteOwnedDraftImage(
      {
        url: draftUrl,
        courseId: TEST_COURSE_ID,
        kind: 'thumbnail',
        expectedOwnerFingerprint: TEST_OWNER_FP,
        containerName: 'course-images',
        blobEndpoint: BLOB_ENDPOINT,
      },
      storage,
    );
    assert.deepEqual(result, { ok: false, error: 'Falha ao promover imagem' });
  });

  test('successfully promotes owned draft and returns final URL', async () => {
    let receivedOwnerFingerprint: string | undefined;
    const storage = createMockStorage({
      async promote(_containerName, _staging, _final, options) {
        receivedOwnerFingerprint = options.expectedOwnerFingerprint;
        return { ok: true };
      },
    });
    const draftUrl = `${BLOB_ENDPOINT}/course-images/staging/drafts/${TEST_OWNER_FP}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const result = await promoteOwnedDraftImage(
      {
        url: draftUrl,
        courseId: TEST_COURSE_ID,
        kind: 'thumbnail',
        expectedOwnerFingerprint: TEST_OWNER_FP,
        containerName: 'course-images',
        blobEndpoint: BLOB_ENDPOINT,
      },
      storage,
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.match(result.finalUrl, new RegExp(`^${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/`));
      assert.match(result.finalUrl, /\.jpg$/);
    }
    assert.equal(receivedOwnerFingerprint, TEST_OWNER_FP);
  });
});

describe('validateFinalImageUrl', () => {
  test('accepts null/undefined', () => {
    const result1 = validateFinalImageUrl(null, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    const result2 = validateFinalImageUrl(undefined, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result1.ok, true);
    assert.equal(result2.ok, true);
  });

  test('rejects invalid URLs', () => {
    const result = validateFinalImageUrl('not a url', TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, 'URL inválida');
    }
  });

  test('accepts external URLs', () => {
    const externalUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    const result = validateFinalImageUrl(externalUrl, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.ok, true);
  });

  test('rejects draft URLs', () => {
    const draftUrl = `${BLOB_ENDPOINT}/course-images/staging/drafts/${TEST_OWNER_FP}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const result = validateFinalImageUrl(draftUrl, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, 'Não é permitido persistir URLs de rascunho');
    }
  });

  test('rejects final URL from wrong course', () => {
    const wrongCourseId = '99999999-9999-4999-8999-999999999999';
    const finalUrl = `${BLOB_ENDPOINT}/course-images/courses/${wrongCourseId}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const result = validateFinalImageUrl(finalUrl, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, 'Imagem não pertence a este curso');
    }
  });

  test('rejects final URL with wrong kind', () => {
    const finalUrl = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/cover/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const result = validateFinalImageUrl(finalUrl, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, 'Tipo de mídia não corresponde');
    }
  });

  test('accepts valid final URL bound to course and kind', () => {
    const finalUrl = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const result = validateFinalImageUrl(finalUrl, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.ok, true);
  });
});

describe('selectReplacedAzureImages', () => {
  test('returns empty when old and new URLs are the same', () => {
    const url = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/img.jpg`;
    const result = selectReplacedAzureImages(url, url, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.blobsToDelete.length, 0);
  });

  test('returns empty when old URL is null', () => {
    const newUrl = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/new.jpg`;
    const result = selectReplacedAzureImages(null, newUrl, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.blobsToDelete.length, 0);
  });

  test('returns empty when old URL is external', () => {
    const oldUrl = 'https://cloudinary.com/old.jpg';
    const newUrl = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/new.jpg`;
    const result = selectReplacedAzureImages(oldUrl, newUrl, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.blobsToDelete.length, 0);
  });

  test('returns empty when old URL is a draft', () => {
    const oldUrl = `${BLOB_ENDPOINT}/course-images/staging/drafts/${TEST_OWNER_FP}/thumbnail/old.jpg`;
    const newUrl = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/new.jpg`;
    const result = selectReplacedAzureImages(oldUrl, newUrl, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.blobsToDelete.length, 0);
  });

  test('returns empty when old URL belongs to different course', () => {
    const wrongCourseId = '99999999-9999-4999-8999-999999999999';
    const oldUrl = `${BLOB_ENDPOINT}/course-images/courses/${wrongCourseId}/thumbnail/old.jpg`;
    const newUrl = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/new.jpg`;
    const result = selectReplacedAzureImages(oldUrl, newUrl, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.blobsToDelete.length, 0);
  });

  test('returns empty when old URL has wrong kind', () => {
    const oldUrl = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/cover/old.jpg`;
    const newUrl = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/new.jpg`;
    const result = selectReplacedAzureImages(oldUrl, newUrl, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.blobsToDelete.length, 0);
  });

  test('selects old Azure final blob for deletion when replaced', () => {
    const oldUrl = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const newUrl = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/87654321-4321-4cba-89ab-ba9876543210.jpg`;
    const result = selectReplacedAzureImages(oldUrl, newUrl, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.blobsToDelete.length, 1);
    assert.equal(result.blobsToDelete[0].containerName, 'course-images');
    assert.match(result.blobsToDelete[0].ref.blobName, /^courses\/.*\/thumbnail\/.*\.jpg$/);
  });

  test('selects old Azure final blob when new URL is null (removal)', () => {
    const oldUrl = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const result = selectReplacedAzureImages(oldUrl, null, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.blobsToDelete.length, 1);
    assert.equal(result.blobsToDelete[0].containerName, 'course-images');
  });

  test('selects old Azure final blob when new URL is external (replacement with external)', () => {
    const oldUrl = `${BLOB_ENDPOINT}/course-images/courses/${TEST_COURSE_ID}/thumbnail/12345678-1234-4abc-89ab-123456789abc.jpg`;
    const newUrl = 'https://cloudinary.com/new.jpg';
    const result = selectReplacedAzureImages(oldUrl, newUrl, TEST_COURSE_ID, 'thumbnail', BLOB_ENDPOINT);
    assert.equal(result.blobsToDelete.length, 1);
  });
});
