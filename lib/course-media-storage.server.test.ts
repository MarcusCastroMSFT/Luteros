import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { createCourseMediaStorage } from './course-media-storage.server';
import type { ParsedCourseMediaReference } from './course-media-paths.server';

interface FakeBlobServiceClient {
  accountName: string;
  getUserDelegationKey: (start: Date, expiry: Date) => Promise<{ signedOid: string }>;
  getContainerClient: (name: string) => FakeContainerClient;
}

interface FakeBlockBlobClient {
  url: string;
  getProperties: () => Promise<{ contentLength?: number; contentType?: string }>;
  syncUploadFromURL?: (url: string, options?: { copySourceBlobProperties?: boolean }) => Promise<void>;
  beginCopyFromURL?: (url: string) => {
    pollUntilDone: () => Promise<{ copyStatus: string }>;
  };
  deleteIfExists: () => Promise<{ succeeded: boolean }>;
}

type FakeContainerClient = ContainerClient & {
  getBlockBlobClient: (name: string) => FakeBlockBlobClient;
};

describe('courseMediaStorage.createUploadGrant', () => {
  test('returns blob URL and SAS with injected now', async () => {
    const fakeClient = createFakeClient();
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
      () => new Date('2026-08-31T12:00:00Z'),
    );

    const result = await storage.createUploadGrant('course-images', 'staging/test.jpg');

    assert.ok(result.blobUrl.startsWith('https://test.blob.core.windows.net/course-images/staging/test.jpg'));
    assert.ok(result.sasUrl.includes('?'));
    assert.ok(result.expiresAt);
  });

  test('uses upload expiry policy (15 minutes)', async () => {
    const fakeClient = createFakeClient();
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
      () => new Date('2026-08-31T12:00:00Z'),
    );

    const result = await storage.createUploadGrant('course-images', 'staging/test.jpg');

    const expectedExpiry = new Date('2026-08-31T12:15:00Z');
    assert.equal(result.expiresAt.toISOString(), expectedExpiry.toISOString());
  });
});

describe('courseMediaStorage.inspect', () => {
  test('returns actual blob properties from Azure', async () => {
    const fakeClient = createFakeClient({
      blobProperties: {
        contentLength: 1024,
        contentType: 'image/jpeg',
      },
    });
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );

    const result = await storage.inspect('course-images', 'staging/test.jpg');

    assert.equal(result.contentLength, 1024);
    assert.equal(result.contentType, 'image/jpeg');
  });
});

describe('courseMediaStorage.promote', () => {
  test('validates actual blob properties match declaration', async () => {
    const fakeClient = createFakeClient({
      blobProperties: {
        contentLength: 2048,
        contentType: 'image/png',
      },
    });
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );

    const staging: ParsedCourseMediaReference = {
      scope: 'staging-course',
      blobName: 'staging/courses/123/thumbnail/abc.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };
    const final: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/123/thumbnail/xyz.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };

    const result = await storage.promote('course-images', staging, final, {
      expectedContentLength: 2048,
      expectedContentType: 'image/png',
    });

    assert.equal(result.ok, true);
  });

  test('rejects mismatched content length and deletes staging blob', async () => {
    const deleteCalls: string[] = [];
    const fakeClient = createFakeClient({
      blobProperties: {
        contentLength: 999,
        contentType: 'image/png',
      },
      onDelete: (name) => deleteCalls.push(name),
    });
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );

    const staging: ParsedCourseMediaReference = {
      scope: 'staging-course',
      blobName: 'staging/courses/123/thumbnail/abc.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };
    const final: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/123/thumbnail/xyz.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };

    const result = await storage.promote('course-images', staging, final, {
      expectedContentLength: 2048,
      expectedContentType: 'image/png',
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.error.includes('tamanho'));
    }
    assert.deepEqual(deleteCalls, ['staging/courses/123/thumbnail/abc.png']);
  });

  test('rejects mismatched content type and deletes staging blob', async () => {
    const deleteCalls: string[] = [];
    const fakeClient = createFakeClient({
      blobProperties: {
        contentLength: 2048,
        contentType: 'application/octet-stream',
      },
      onDelete: (name) => deleteCalls.push(name),
    });
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );

    const staging: ParsedCourseMediaReference = {
      scope: 'staging-course',
      blobName: 'staging/courses/123/thumbnail/abc.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };
    const final: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/123/thumbnail/xyz.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };

    const result = await storage.promote('course-images', staging, final, {
      expectedContentLength: 2048,
      expectedContentType: 'image/png',
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.ok(result.error.includes('tipo'));
    }
    assert.deepEqual(deleteCalls, ['staging/courses/123/thumbnail/abc.png']);
  });

  test('uses syncUploadFromURL for server-side copy when available', async () => {
    const copyCalls: Array<{ from: string; to: string }> = [];
    const deleteCalls: string[] = [];
    const fakeClient = createFakeClient({
      blobProperties: {
        contentLength: 2048,
        contentType: 'image/png',
      },
      onCopy: (from, to) => copyCalls.push({ from, to }),
      onDelete: (name) => deleteCalls.push(name),
      supportsSyncUpload: true,
    });
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );

    const staging: ParsedCourseMediaReference = {
      scope: 'staging-course',
      blobName: 'staging/courses/123/thumbnail/abc.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };
    const final: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/123/thumbnail/xyz.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };

    const result = await storage.promote('course-images', staging, final, {
      expectedContentLength: 2048,
      expectedContentType: 'image/png',
    });

    assert.equal(result.ok, true);
    assert.equal(copyCalls.length, 1);
    assert.ok(copyCalls[0].from.includes('staging/courses/123/thumbnail/abc.png'));
    assert.equal(new URL(copyCalls[0].from).searchParams.get('sp'), 'r');
    assert.equal(copyCalls[0].to, 'courses/123/thumbnail/xyz.png');
    assert.deepEqual(deleteCalls, ['staging/courses/123/thumbnail/abc.png']);
  });

  test('uses beginCopyFromURL with polling when syncUploadFromURL unavailable', async () => {
    const copyCalls: Array<{ from: string; to: string }> = [];
    const deleteCalls: string[] = [];
    const fakeClient = createFakeClient({
      blobProperties: {
        contentLength: 2048,
        contentType: 'image/png',
      },
      onCopy: (from, to) => copyCalls.push({ from, to }),
      onDelete: (name) => deleteCalls.push(name),
      supportsSyncUpload: false,
    });
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );

    const staging: ParsedCourseMediaReference = {
      scope: 'staging-course',
      blobName: 'staging/courses/123/thumbnail/abc.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };
    const final: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/123/thumbnail/xyz.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };

    const result = await storage.promote('course-images', staging, final, {
      expectedContentLength: 2048,
      expectedContentType: 'image/png',
    });

    assert.equal(result.ok, true);
    assert.equal(copyCalls.length, 1);
    assert.deepEqual(deleteCalls, ['staging/courses/123/thumbnail/abc.png']);
  });

  test('deletes staging blob only after successful promotion', async () => {
    const operations: string[] = [];
    const fakeClient = createFakeClient({
      blobProperties: {
        contentLength: 2048,
        contentType: 'image/png',
      },
      onCopy: () => operations.push('copy'),
      onDelete: () => operations.push('delete'),
    });
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );

    const staging: ParsedCourseMediaReference = {
      scope: 'staging-course',
      blobName: 'staging/courses/123/thumbnail/abc.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };
    const final: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/123/thumbnail/xyz.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };

    await storage.promote('course-images', staging, final, {
      expectedContentLength: 2048,
      expectedContentType: 'image/png',
    });

    assert.deepEqual(operations, ['copy', 'delete']);
  });

  test('preserves staging blob when server-side copy fails', async () => {
    const deleteCalls: string[] = [];
    const fakeClient = createFakeClient({
      blobProperties: {
        contentLength: 2048,
        contentType: 'image/png',
      },
      copyError: new Error('copy failed'),
      onDelete: (name) => deleteCalls.push(name),
    });
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );

    const staging: ParsedCourseMediaReference = {
      scope: 'staging-course',
      blobName: 'staging/courses/123/thumbnail/abc.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };
    const final: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/123/thumbnail/xyz.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };

    await assert.rejects(
      storage.promote('course-images', staging, final, {
        expectedContentLength: 2048,
        expectedContentType: 'image/png',
      }),
      /Azure blob promotion failed/,
    );
    assert.deepEqual(deleteCalls, []);
  });

  test('rejects cross-course, cross-kind, and invalid-scope promotion', async () => {
    const storage = createCourseMediaStorage(
      createFakeClient() as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );
    const staging: ParsedCourseMediaReference = {
      scope: 'staging-course',
      blobName: 'staging/courses/123/thumbnail/abc.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };
    const final: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/123/thumbnail/xyz.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };
    const options = { expectedContentLength: 1, expectedContentType: 'image/png' };

    await assert.rejects(
      storage.promote('course-images', staging, { ...final, courseId: '456' }, options),
      /course/i,
    );
    await assert.rejects(
      storage.promote('course-images', staging, { ...final, kind: 'cover' }, options),
      /kind/i,
    );
    await assert.rejects(
      storage.promote('course-images', { ...staging, scope: 'final' }, final, options),
      /scope/i,
    );
  });

  test('does not expose a private source SAS when copy fails', async () => {
    const fakeClient = createFakeClient({
      blobProperties: { contentLength: 1, contentType: 'image/png' },
      copyError: new Error('copy failed for https://example.test/blob?sig=secret'),
    });
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );
    const staging: ParsedCourseMediaReference = {
      scope: 'staging-course',
      blobName: 'staging/courses/123/thumbnail/abc.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };
    const final: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/123/thumbnail/xyz.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };

    await assert.rejects(
      storage.promote('course-images', staging, final, {
        expectedContentLength: 1,
        expectedContentType: 'image/png',
      }),
      (error: unknown) => error instanceof Error
        && error.message === 'Azure blob promotion failed',
    );
  });

  test('returns success when staging cleanup fails after a successful copy', async () => {
    const fakeClient = createFakeClient({
      blobProperties: { contentLength: 1, contentType: 'image/png' },
      deleteError: new Error('cleanup failed'),
    });
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );
    const staging: ParsedCourseMediaReference = {
      scope: 'staging-course',
      blobName: 'staging/courses/123/thumbnail/abc.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };
    const final: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/123/thumbnail/xyz.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };

    assert.deepEqual(
      await storage.promote('course-images', staging, final, {
        expectedContentLength: 1,
        expectedContentType: 'image/png',
      }),
      { ok: true },
    );
  });

  test('successfully promotes staging-draft with valid owner fingerprint', async () => {
    const copyCalls: Array<{ from: string; to: string }> = [];
    const deleteCalls: string[] = [];
    const fakeClient = createFakeClient({
      blobProperties: {
        contentLength: 1024,
        contentType: 'image/jpeg',
      },
      onCopy: (from, to) => copyCalls.push({ from, to }),
      onDelete: (name) => deleteCalls.push(name),
    });
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );

    const staging: ParsedCourseMediaReference = {
      scope: 'staging-draft',
      blobName: 'staging/drafts/abc123456789012345678901/thumbnail/def.jpg',
      ownerFingerprint: 'abc123456789012345678901',
      kind: 'thumbnail',
      extension: 'jpg',
    };
    const final: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/456/thumbnail/xyz.jpg',
      courseId: '456',
      kind: 'thumbnail',
      extension: 'jpg',
    };

    const result = await storage.promote('course-images', staging, final, {
      expectedContentLength: 1024,
      expectedContentType: 'image/jpeg',
      expectedOwnerFingerprint: 'abc123456789012345678901',
    });

    assert.equal(result.ok, true);
    assert.equal(copyCalls.length, 1);
    assert.equal(deleteCalls.length, 1);
  });

  test('rejects staging-draft when expectedOwnerFingerprint not provided', async () => {
    const storage = createCourseMediaStorage(
      createFakeClient() as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );

    const staging: ParsedCourseMediaReference = {
      scope: 'staging-draft',
      blobName: 'staging/drafts/abc123456789012345678901/thumbnail/def.jpg',
      ownerFingerprint: 'abc123456789012345678901',
      kind: 'thumbnail',
      extension: 'jpg',
    };
    const final: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/456/thumbnail/xyz.jpg',
      courseId: '456',
      kind: 'thumbnail',
      extension: 'jpg',
    };

    await assert.rejects(
      storage.promote('course-images', staging, final, {
        expectedContentLength: 1024,
        expectedContentType: 'image/jpeg',
      }),
      /expectedOwnerFingerprint required/i,
    );
  });

  test('rejects staging-draft with mismatched owner fingerprint', async () => {
    const storage = createCourseMediaStorage(
      createFakeClient() as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );

    const staging: ParsedCourseMediaReference = {
      scope: 'staging-draft',
      blobName: 'staging/drafts/abc123456789012345678901/thumbnail/def.jpg',
      ownerFingerprint: 'abc123456789012345678901',
      kind: 'thumbnail',
      extension: 'jpg',
    };
    const final: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/456/thumbnail/xyz.jpg',
      courseId: '456',
      kind: 'thumbnail',
      extension: 'jpg',
    };

    await assert.rejects(
      storage.promote('course-images', staging, final, {
        expectedContentLength: 1024,
        expectedContentType: 'image/jpeg',
        expectedOwnerFingerprint: 'different000000000000000',
      }),
      /fingerprint mismatch/i,
    );
  });
});

test('rejects containers outside the course media allowlist', async () => {
  const storage = createCourseMediaStorage(
    createFakeClient() as unknown as BlobServiceClient,
    'https://test.blob.core.windows.net',
  );

  await assert.rejects(
    storage.createUploadGrant('$web', 'staging/test.png'),
    /container/i,
  );
  await assert.rejects(
    storage.createReadUrl('$logs', 'courses/123/lesson-video/test.mp4'),
    /container/i,
  );
});

describe('courseMediaStorage.deleteIfOwned', () => {
  test('deletes blob with matching course ID', async () => {
    const deleteCalls: string[] = [];
    const fakeClient = createFakeClient({
      onDelete: (name) => deleteCalls.push(name),
    });
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );

    const ref: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/123/thumbnail/xyz.png',
      courseId: '123',
      kind: 'thumbnail',
      extension: 'png',
    };

    await storage.deleteIfOwned('course-images', ref, '123');

    assert.deepEqual(deleteCalls, ['courses/123/thumbnail/xyz.png']);
  });

  test('refuses to delete blob with foreign course ID', async () => {
    const deleteCalls: string[] = [];
    const fakeClient = createFakeClient({
      onDelete: (name) => deleteCalls.push(name),
    });
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
    );

    const ref: ParsedCourseMediaReference = {
      scope: 'final',
      blobName: 'courses/456/thumbnail/xyz.png',
      courseId: '456',
      kind: 'thumbnail',
      extension: 'png',
    };

    await assert.rejects(
      async () => storage.deleteIfOwned('course-images', ref, '123'),
      /ownership/i,
    );

    assert.deepEqual(deleteCalls, []);
  });
});

describe('courseMediaStorage.createReadUrl', () => {
  test('returns blob URL with read SAS using injected now', async () => {
    const fakeClient = createFakeClient();
    const storage = createCourseMediaStorage(
      fakeClient as unknown as BlobServiceClient,
      'https://test.blob.core.windows.net',
      () => new Date('2026-08-31T12:00:00Z'),
    );

    const url = await storage.createReadUrl('course-videos', 'courses/123/lesson-video/xyz.mp4');

    assert.ok(url.startsWith('https://test.blob.core.windows.net/course-videos/courses/123/lesson-video/xyz.mp4'));
    assert.ok(url.includes('?'));
  });
});

function createFakeClient(options: {
  blobProperties?: { contentLength?: number; contentType?: string };
  onCopy?: (from: string, to: string) => void;
  onDelete?: (name: string) => void;
  supportsSyncUpload?: boolean;
  copyError?: Error;
  deleteError?: Error;
} = {}): FakeBlobServiceClient {
  const {
    blobProperties = {},
    onCopy = () => {},
    onDelete = () => {},
    supportsSyncUpload = true,
    copyError,
    deleteError,
  } = options;

  return {
    accountName: 'fakestorage',
    getUserDelegationKey: async () => ({
      signedOid: 'fake-oid',
      signedTid: 'fake-tid',
      signedStart: new Date(),
      signedExpiry: new Date(),
      signedService: 'b',
      signedVersion: '2020-12-06',
      value: 'fake-key-value',
    }),
    getContainerClient: (containerName: string) => ({
      getBlockBlobClient: (blobName: string) => {
        const fakeBlob: FakeBlockBlobClient = {
          url: `https://test.blob.core.windows.net/${containerName}/${blobName}`,
          getProperties: async () => blobProperties,
          deleteIfExists: async () => {
            if (deleteError) throw deleteError;
            onDelete(blobName);
            return { succeeded: true };
          },
        };

        if (supportsSyncUpload) {
          fakeBlob.syncUploadFromURL = async (sourceUrl: string) => {
            if (copyError) throw copyError;
            onCopy(sourceUrl, blobName);
          };
        } else {
          fakeBlob.beginCopyFromURL = (sourceUrl: string) => ({
            pollUntilDone: async () => {
              if (copyError) throw copyError;
              onCopy(sourceUrl, blobName);
              return { copyStatus: 'success' };
            },
          });
        }

        return fakeBlob as unknown as FakeBlockBlobClient;
      },
    }) as FakeContainerClient,
  };
}
