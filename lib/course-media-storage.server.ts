import {
  type BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} from '@azure/storage-blob';
import { createUploadSasPolicy, createReadSasPolicy } from './course-media-sas';
import type { ParsedCourseMediaReference } from './course-media-paths.server';
import { getBlobServiceClient } from './azure-credential.server';

const COURSE_MEDIA_CONTAINERS = new Set(['course-images', 'course-videos']);

function requireCourseMediaContainer(containerName: string): void {
  if (!COURSE_MEDIA_CONTAINERS.has(containerName)) {
    throw new Error('Invalid course media container');
  }
}

interface UploadGrant {
  blobUrl: string;
  sasUrl: string;
  expiresAt: Date;
}

export interface BlobInspection {
  contentLength: number;
  contentType: string;
}

export interface PromoteOptions {
  expectedContentLength: number;
  expectedContentType: string;
  expectedOwnerFingerprint?: string;
}

export type PromoteResult =
  | { ok: true }
  | { ok: false; error: string };

export interface CourseMediaStorage {
  createUploadGrant(containerName: string, blobName: string): Promise<UploadGrant>;
  inspect(containerName: string, blobName: string): Promise<BlobInspection>;
  promote(
    containerName: string,
    staging: ParsedCourseMediaReference,
    final: ParsedCourseMediaReference,
    options: PromoteOptions,
  ): Promise<PromoteResult>;
  deleteIfOwned(
    containerName: string,
    ref: ParsedCourseMediaReference,
    expectedCourseId: string,
  ): Promise<void>;
  createReadUrl(containerName: string, blobName: string): Promise<string>;
}

export function createCourseMediaStorage(
  client: BlobServiceClient,
  blobEndpoint: string,
  getNow: () => Date = () => new Date(),
): CourseMediaStorage {
  async function generateSasUrl(
    containerName: string,
    blobName: string,
    permissions: 'cw' | 'r',
    now: Date,
  ): Promise<{ sasUrl: string; expiresAt: Date }> {
    requireCourseMediaContainer(containerName);
    const policy = permissions === 'cw'
      ? createUploadSasPolicy(containerName, blobName, now)
      : createReadSasPolicy(containerName, blobName, now);

    const userDelegationKey = await client.getUserDelegationKey(
      policy.startsOn,
      policy.expiresOn,
    );

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: policy.containerName,
        blobName: policy.blobName,
        permissions: BlobSASPermissions.parse(policy.permissions),
        protocol: SASProtocol.Https,
        startsOn: policy.startsOn,
        expiresOn: policy.expiresOn,
      },
      userDelegationKey,
      client.accountName,
    ).toString();

    const endpoint = new URL(blobEndpoint);
    endpoint.pathname = `/${containerName}/${blobName}`;
    endpoint.search = sasToken;

    return {
      sasUrl: endpoint.toString(),
      expiresAt: policy.expiresOn,
    };
  }

  return {
    async createUploadGrant(containerName: string, blobName: string): Promise<UploadGrant> {
      const now = getNow();
      const endpoint = new URL(blobEndpoint);
      endpoint.pathname = `/${containerName}/${blobName}`;
      const blobUrl = endpoint.toString();

      const { sasUrl, expiresAt } = await generateSasUrl(containerName, blobName, 'cw', now);

      return { blobUrl, sasUrl, expiresAt };
    },

    async inspect(containerName: string, blobName: string): Promise<BlobInspection> {
      requireCourseMediaContainer(containerName);
      const containerClient = client.getContainerClient(containerName);
      const blobClient = containerClient.getBlockBlobClient(blobName);
      const properties = await blobClient.getProperties();

      return {
        contentLength: properties.contentLength ?? 0,
        contentType: properties.contentType ?? '',
      };
    },

    async promote(
      containerName: string,
      staging: ParsedCourseMediaReference,
      final: ParsedCourseMediaReference,
      options: PromoteOptions,
    ): Promise<PromoteResult> {
      requireCourseMediaContainer(containerName);
      
      if (final.scope !== 'final') {
        throw new Error('Invalid final scope');
      }

      // Validate staging scope and ownership
      if (staging.scope === 'staging-course') {
        // Existing staging-course path
        if (staging.courseId !== final.courseId) {
          throw new Error('Promotion course mismatch');
        }
      } else if (staging.scope === 'staging-draft') {
        // New staging-draft path (requires owner fingerprint)
        if (!options.expectedOwnerFingerprint) {
          throw new Error('expectedOwnerFingerprint required for draft promotion');
        }
        if (staging.ownerFingerprint !== options.expectedOwnerFingerprint) {
          throw new Error('Draft owner fingerprint mismatch');
        }
      } else {
        throw new Error('Invalid promotion scope');
      }

      if (staging.kind !== final.kind) {
        throw new Error('Promotion kind mismatch');
      }

      const containerClient = client.getContainerClient(containerName);
      const stagingClient = containerClient.getBlockBlobClient(staging.blobName);
      const finalClient = containerClient.getBlockBlobClient(final.blobName);

      const properties = await stagingClient.getProperties();

      if (properties.contentLength !== options.expectedContentLength) {
        await stagingClient.deleteIfExists();
        return {
          ok: false,
          error: 'Propriedades do blob não correspondem: tamanho incorreto',
        };
      }

      if (properties.contentType !== options.expectedContentType) {
        await stagingClient.deleteIfExists();
        return {
          ok: false,
          error: 'Propriedades do blob não correspondem: tipo incorreto',
        };
      }

      const { sasUrl: sourceUrl } = await generateSasUrl(
        containerName,
        staging.blobName,
        'r',
        getNow(),
      );
      try {
        if ('syncUploadFromURL' in finalClient && typeof finalClient.syncUploadFromURL === 'function') {
          await finalClient.syncUploadFromURL(sourceUrl, {
            copySourceBlobProperties: false,
          });
        } else {
          const poller = await finalClient.beginCopyFromURL(sourceUrl);
          await poller.pollUntilDone();
        }
      } catch {
        throw new Error('Azure blob promotion failed');
      }

      try {
        await stagingClient.deleteIfExists();
      } catch {
        // The final blob is already valid; lifecycle cleanup can remove the staging copy.
      }

      return { ok: true };
    },

    async deleteIfOwned(
      containerName: string,
      ref: ParsedCourseMediaReference,
      expectedCourseId: string,
    ): Promise<void> {
      requireCourseMediaContainer(containerName);
      if (ref.scope === 'staging-draft') {
        throw new Error('Cannot delete draft blob by course ownership');
      }

      if (ref.courseId !== expectedCourseId) {
        throw new Error('Blob ownership mismatch: course ID does not match');
      }

      const containerClient = client.getContainerClient(containerName);
      const blobClient = containerClient.getBlockBlobClient(ref.blobName);
      await blobClient.deleteIfExists();
    },

    async createReadUrl(containerName: string, blobName: string): Promise<string> {
      const now = getNow();
      const { sasUrl } = await generateSasUrl(containerName, blobName, 'r', now);
      return sasUrl;
    },
  };
}

// ─── Lazy Singleton ───────────────────────────────────────────────────────────

let _cachedStorage: CourseMediaStorage | null = null;

function getConfiguredStorage(): CourseMediaStorage {
  if (_cachedStorage) return _cachedStorage;
  const endpoint = process.env.AZURE_STORAGE_BLOB_ENDPOINT;
  if (!endpoint) throw new Error('AZURE_STORAGE_BLOB_ENDPOINT is required');
  _cachedStorage = createCourseMediaStorage(getBlobServiceClient(), endpoint);
  return _cachedStorage;
}

export const courseMediaStorage: CourseMediaStorage = {
  createUploadGrant(...args) { return getConfiguredStorage().createUploadGrant(...args); },
  inspect(...args) { return getConfiguredStorage().inspect(...args); },
  promote(...args) { return getConfiguredStorage().promote(...args); },
  deleteIfOwned(...args) { return getConfiguredStorage().deleteIfOwned(...args); },
  createReadUrl(...args) { return getConfiguredStorage().createReadUrl(...args); },
};

export function getCourseMediaStorage(): CourseMediaStorage {
  return courseMediaStorage;
}
