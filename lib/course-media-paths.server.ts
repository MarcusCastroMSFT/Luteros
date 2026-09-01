import { createHash, randomUUID } from 'node:crypto';
import {
  extensionForMediaType,
  type CourseMediaExtension,
  type CourseMediaKind,
} from './course-media';

const COURSE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OWNER_FINGERPRINT_PATTERN = /^[0-9a-f]{24}$/;
const ASSET_PATTERN = /^([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\.([a-z0-9]+)$/i;

const IMAGE_EXTENSIONS = new Set<CourseMediaExtension>(['jpg', 'png', 'webp', 'gif']);
const VIDEO_EXTENSIONS = new Set<CourseMediaExtension>(['mp4', 'webm', 'mov']);
const AUDIO_EXTENSIONS = new Set<CourseMediaExtension>(['mp3', 'm4a', 'wav', 'ogg']);
const MEDIA_KINDS = new Set<CourseMediaKind>(['thumbnail', 'cover', 'lesson-video', 'lesson-audio']);

interface BlobNameInput {
  kind: CourseMediaKind;
  contentType: string;
}

type StagingBlobNameInput = BlobNameInput & {
  courseId?: string;
  ownerFingerprint?: string;
};

interface FinalBlobNameInput extends BlobNameInput {
  courseId: string;
}

export interface ParseCourseMediaReferenceOptions {
  expectedCourseId?: string;
  expectedOwnerFingerprint?: string;
  expectedKind?: CourseMediaKind;
}

export type ParsedCourseMediaReference =
  | {
      scope: 'final' | 'staging-course';
      blobName: string;
      courseId: string;
      kind: CourseMediaKind;
      extension: CourseMediaExtension;
    }
  | {
      scope: 'staging-draft';
      blobName: string;
      ownerFingerprint: string;
      kind: CourseMediaKind;
      extension: CourseMediaExtension;
    };

export function createOwnerFingerprint(userId: string): string {
  return createHash('sha256').update(userId).digest('hex').slice(0, 24);
}

function requireCourseId(courseId: string): void {
  if (!COURSE_ID_PATTERN.test(courseId)) {
    throw new Error('Invalid courseId');
  }
}

function requireOwnerFingerprint(ownerFingerprint: string): void {
  if (!OWNER_FINGERPRINT_PATTERN.test(ownerFingerprint)) {
    throw new Error('Invalid ownerFingerprint');
  }
}

function requireExtension(
  contentType: string,
  kind: CourseMediaKind,
): CourseMediaExtension {
  const extension = extensionForMediaType(contentType);
  if (!extension || !extensionMatchesKind(kind, extension)) {
    throw new Error('Unsupported media type');
  }
  return extension;
}

export function createStagingBlobName(input: StagingBlobNameInput): string {
  if (Boolean(input.courseId) === Boolean(input.ownerFingerprint)) {
    throw new Error('Provide exactly one courseId or ownerFingerprint');
  }

  const extension = requireExtension(input.contentType, input.kind);
  if (input.courseId) {
    requireCourseId(input.courseId);
    return `staging/courses/${input.courseId}/${input.kind}/${randomUUID()}.${extension}`;
  }

  requireOwnerFingerprint(input.ownerFingerprint!);
  return `staging/drafts/${input.ownerFingerprint}/${input.kind}/${randomUUID()}.${extension}`;
}

export function createFinalBlobName(input: FinalBlobNameInput): string {
  requireCourseId(input.courseId);
  const extension = requireExtension(input.contentType, input.kind);
  return `courses/${input.courseId}/${input.kind}/${randomUUID()}.${extension}`;
}

function extensionMatchesKind(
  kind: CourseMediaKind,
  extension: string,
): extension is CourseMediaExtension {
  if (kind === 'lesson-video') {
    return VIDEO_EXTENSIONS.has(extension as CourseMediaExtension);
  }
  if (kind === 'lesson-audio') {
    return AUDIO_EXTENSIONS.has(extension as CourseMediaExtension);
  }
  return IMAGE_EXTENSIONS.has(extension as CourseMediaExtension);
}

export function parseCourseMediaReference(
  blobName: string,
  options: ParseCourseMediaReferenceOptions = {},
): ParsedCourseMediaReference | null {
  if (!blobName || blobName.includes('\\') || blobName.includes('?') || blobName.includes('#')) {
    return null;
  }

  const segments = blobName.split('/');
  let scope: ParsedCourseMediaReference['scope'];
  let owner: string;
  let kindValue: string;
  let assetValue: string;

  if (segments.length === 4 && segments[0] === 'courses') {
    [owner, kindValue, assetValue] = segments.slice(1);
    scope = 'final';
  } else if (
    segments.length === 5
    && segments[0] === 'staging'
    && segments[1] === 'courses'
  ) {
    [owner, kindValue, assetValue] = segments.slice(2);
    scope = 'staging-course';
  } else if (
    segments.length === 5
    && segments[0] === 'staging'
    && segments[1] === 'drafts'
  ) {
    [owner, kindValue, assetValue] = segments.slice(2);
    scope = 'staging-draft';
  } else {
    return null;
  }

  if (!MEDIA_KINDS.has(kindValue as CourseMediaKind)) {
    return null;
  }
  const kind = kindValue as CourseMediaKind;
  const assetMatch = ASSET_PATTERN.exec(assetValue);
  const extension = assetMatch?.[2]?.toLowerCase();
  if (!extension || !extensionMatchesKind(kind, extension)) {
    return null;
  }
  if (options.expectedKind && options.expectedKind !== kind) {
    return null;
  }

  if (scope === 'staging-draft') {
    if (!OWNER_FINGERPRINT_PATTERN.test(owner)) {
      return null;
    }
    if (options.expectedCourseId || (
      options.expectedOwnerFingerprint
      && options.expectedOwnerFingerprint !== owner
    )) {
      return null;
    }
    return { scope, blobName, ownerFingerprint: owner, kind, extension };
  }

  if (!COURSE_ID_PATTERN.test(owner)) {
    return null;
  }
  if (options.expectedOwnerFingerprint || (
    options.expectedCourseId
    && options.expectedCourseId !== owner
  )) {
    return null;
  }
  return { scope, blobName, courseId: owner, kind, extension };
}

export function getPublicCourseImageUrl(blobEndpoint: string, blobName: string): string | null {
  const parsed = parseCourseMediaReference(blobName);
  if (
    !parsed
    || parsed.scope !== 'final'
    || parsed.kind === 'lesson-video'
    || parsed.kind === 'lesson-audio'
  ) {
    return null;
  }

  const endpoint = new URL(blobEndpoint);
  if (endpoint.protocol !== 'https:') {
    throw new Error('Blob endpoint must use HTTPS');
  }
  endpoint.pathname = `/course-images/${parsed.blobName}`;
  endpoint.search = '';
  endpoint.hash = '';
  return endpoint.toString();
}