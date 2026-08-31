import type { AuthUser } from './auth-helpers';
import {
  validateCourseMediaDeclaration,
  type CourseMediaKind,
  type CourseMediaDeclaration,
} from './course-media';
import {
  createOwnerFingerprint,
  createStagingBlobName,
  createFinalBlobName,
  parseCourseMediaReference,
  getPublicCourseImageUrl,
  type ParsedCourseMediaReference,
} from './course-media-paths.server';
import { canManageCourse } from './course-access';
import type { CourseMediaStorage } from './course-media-storage.server';
import {
  createUploadToken,
  verifyUploadToken,
  type UploadTokenPayload,
} from './course-media-upload-token.server';

// ─── Request/Response Types ───────────────────────────────────────────────────

export interface CourseUploadInitiationRequest {
  kind: CourseMediaKind;
  contentType: string;
  size: number;
  courseId?: string;
  lessonId?: string;
}

export interface CourseUploadInitiationResponse {
  uploadId: string;
  blobUrl: string;
  sasUrl: string;
  blockSize: number;
  concurrency: number;
  expiresAt: Date;
}

export interface CourseUploadCompletionRequest {
  uploadId: string;
  courseId?: string;
}

export type CourseMediaUploadResult =
  | { kind: 'thumbnail' | 'cover'; url: string }
  | { kind: 'lesson-video'; blobName: string; videoProvider: 'azure' };

export type InitiationResult =
  | { ok: true; response: CourseUploadInitiationResponse }
  | { ok: false; status: 400 | 401 | 403 | 404; error: string };

export type CompletionResult =
  | { ok: true; result: CourseMediaUploadResult }
  | { ok: false; status: 400 | 401 | 403 | 404; error: string };

// ─── Strict Body Parser ──────────────────────────────────────────────────────

export interface ParsedInitiationBody {
  kind: CourseMediaKind;
  contentType: string;
  size: number;
  lessonId?: string;
}

export function parseInitiationBody(
  body: unknown,
  context: 'draft' | 'existing-course',
): { ok: true; parsed: ParsedInitiationBody } | { ok: false; error: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid request body' };
  }

  const allowed = context === 'existing-course'
    ? new Set(['kind', 'contentType', 'size', 'lessonId'])
    : new Set(['kind', 'contentType', 'size']);

  const keys = Object.keys(body);
  for (const key of keys) {
    if (!allowed.has(key)) {
      return { ok: false, error: `Unexpected field: ${key}` };
    }
  }

  const obj = body as Record<string, unknown>;

  if (!Object.prototype.hasOwnProperty.call(obj, 'kind') || typeof obj.kind !== 'string') {
    return { ok: false, error: 'kind must be a string' };
  }
  if (!Object.prototype.hasOwnProperty.call(obj, 'contentType') || typeof obj.contentType !== 'string') {
    return { ok: false, error: 'contentType must be a string' };
  }
  if (!Object.prototype.hasOwnProperty.call(obj, 'size') || typeof obj.size !== 'number') {
    return { ok: false, error: 'size must be a number' };
  }

  const kind = obj.kind;
  if (kind !== 'thumbnail' && kind !== 'cover' && kind !== 'lesson-video') {
    return { ok: false, error: 'Invalid media kind' };
  }

  if (kind === 'lesson-video') {
    if (context !== 'existing-course') {
      return { ok: false, error: 'lesson-video requires course context' };
    }
    if (typeof obj.lessonId !== 'string' || !obj.lessonId) {
      return { ok: false, error: 'lessonId is required for lesson-video' };
    }
    return { ok: true, parsed: { kind, contentType: obj.contentType, size: obj.size, lessonId: obj.lessonId } };
  }

  if ('lessonId' in obj && obj.lessonId !== undefined) {
    return { ok: false, error: 'lessonId is only valid for lesson-video' };
  }

  return { ok: true, parsed: { kind, contentType: obj.contentType, size: obj.size } };
}

// ─── Dependencies ─────────────────────────────────────────────────────────────

interface Course {
  id: string;
  instructorId: string;
}

interface Lesson {
  id: string;
  courseId: string;
}

export interface ServiceDependencies {
  storage: CourseMediaStorage;
  findCourse: (courseId: string) => Promise<Course | undefined>;
  findLesson: (lessonId: string) => Promise<Lesson | undefined>;
  getNow: () => Date;
  getSecret: () => string;
  getBlobEndpoint: () => string;
}

// ─── Service Functions ────────────────────────────────────────────────────────

export async function initiateCourseMediaUpload(
  user: AuthUser | null,
  request: CourseUploadInitiationRequest,
  deps: ServiceDependencies,
): Promise<InitiationResult> {
  if (!user) return { ok: false, status: 401, error: 'Not authenticated' };
  if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
    return { ok: false, status: 403, error: 'Not allowed to upload course media' };
  }

  const validKinds: CourseMediaKind[] = ['thumbnail', 'cover', 'lesson-video'];
  if (!validKinds.includes(request.kind)) {
    return { ok: false, status: 400, error: `Invalid media kind: ${request.kind}` };
  }

  const declaration: CourseMediaDeclaration = {
    kind: request.kind,
    contentType: request.contentType,
    size: request.size,
  };
  const validation = validateCourseMediaDeclaration(declaration);
  if (!validation.ok) return { ok: false, status: 400, error: validation.error };

  const containerName = request.kind === 'lesson-video' ? 'course-videos' : 'course-images';

  if (request.courseId) {
    // ── EXISTING COURSE PATH ──────────────────────────────────────────────
    const course = await deps.findCourse(request.courseId);
    if (!course) return { ok: false, status: 404, error: 'Course not found' };
    if (!canManageCourse(user, course.instructorId)) {
      return { ok: false, status: 403, error: 'Cannot manage this course' };
    }

    if (request.kind === 'lesson-video') {
      if (!request.lessonId) {
        return { ok: false, status: 400, error: 'Lesson video requires lessonId' };
      }
      const lesson = await deps.findLesson(request.lessonId);
      if (!lesson) return { ok: false, status: 404, error: 'Lesson not found' };
      if (lesson.courseId !== request.courseId) {
        return { ok: false, status: 404, error: 'Lesson not found' };
      }
    }

    const stagingBlobName = createStagingBlobName({
      kind: request.kind,
      contentType: request.contentType,
      courseId: request.courseId,
    });

    let uploadGrant;
    try {
      uploadGrant = await deps.storage.createUploadGrant(containerName, stagingBlobName);
    } catch {
      return { ok: false, status: 400, error: 'Failed to create upload grant' };
    }

    const tokenPayload: UploadTokenPayload = {
      v: 1,
      userId: user.id,
      declaration,
      stagingBlobName,
      container: containerName,
      blobUrl: uploadGrant.blobUrl,
      courseId: request.courseId,
      ...(request.lessonId ? { lessonId: request.lessonId } : {}),
      expiresAt: uploadGrant.expiresAt.toISOString(),
    };
    const uploadId = createUploadToken(tokenPayload, deps);

    return {
      ok: true,
      response: {
        uploadId,
        blobUrl: uploadGrant.blobUrl,
        sasUrl: uploadGrant.sasUrl,
        blockSize: 8_388_608,
        concurrency: 4,
        expiresAt: uploadGrant.expiresAt,
      },
    };
  }

  // ── DRAFT PATH ────────────────────────────────────────────────────────
  if (request.kind === 'lesson-video') {
    return { ok: false, status: 400, error: 'Lesson video requires courseId and lessonId' };
  }

  const ownerFingerprint = createOwnerFingerprint(user.id);
  const stagingBlobName = createStagingBlobName({
    kind: request.kind,
    contentType: request.contentType,
    ownerFingerprint,
  });

  let uploadGrant;
  try {
    uploadGrant = await deps.storage.createUploadGrant(containerName, stagingBlobName);
  } catch {
    return { ok: false, status: 400, error: 'Failed to create upload grant' };
  }

  const tokenPayload: UploadTokenPayload = {
    v: 1,
    userId: user.id,
    declaration,
    stagingBlobName,
    container: containerName,
    blobUrl: uploadGrant.blobUrl,
    expiresAt: uploadGrant.expiresAt.toISOString(),
  };
  const uploadId = createUploadToken(tokenPayload, deps);

  return {
    ok: true,
    response: {
      uploadId,
      blobUrl: uploadGrant.blobUrl,
      sasUrl: uploadGrant.sasUrl,
      blockSize: 8_388_608,
      concurrency: 4,
      expiresAt: uploadGrant.expiresAt,
    },
  };
}

export async function completeCourseMediaUpload(
  user: AuthUser | null,
  request: CourseUploadCompletionRequest,
  deps: ServiceDependencies,
): Promise<CompletionResult> {
  if (!user) return { ok: false, status: 401, error: 'Not authenticated' };
  if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
    return { ok: false, status: 403, error: 'Not allowed to complete course media upload' };
  }

  const verificationResult = verifyUploadToken(request.uploadId, deps);
  if (!verificationResult.ok) {
    return { ok: false, status: 400, error: verificationResult.error };
  }
  const token = verificationResult.payload;

  // Ownership: must be the same user or an admin
  if (user.role !== 'ADMIN' && token.userId !== user.id) {
    return { ok: false, status: 403, error: 'Not your upload' };
  }

  // Route context: course route requires matching courseId, draft route rejects courseId
  if (request.courseId) {
    if (!token.courseId) {
      return { ok: false, status: 400, error: 'Token was not issued for a course upload' };
    }
    if (token.courseId !== request.courseId) {
      return { ok: false, status: 400, error: 'Course context mismatch' };
    }
  } else {
    if (token.courseId) {
      return { ok: false, status: 400, error: 'Use the course completion route for this upload' };
    }
  }

  // Re-authorize the current resource before contacting storage.
  if (request.courseId) {
    const course = await deps.findCourse(request.courseId);
    if (!course) return { ok: false, status: 404, error: 'Course not found' };
    if (!canManageCourse(user, course.instructorId)) {
      return { ok: false, status: 403, error: 'Cannot manage this course' };
    }

    if (token.declaration.kind === 'lesson-video') {
      if (!token.lessonId) {
        return { ok: false, status: 400, error: 'Invalid lesson video upload token' };
      }
      const lesson = await deps.findLesson(token.lessonId);
      if (!lesson) return { ok: false, status: 404, error: 'Lesson not found' };
      if (lesson.courseId !== request.courseId) {
        return { ok: false, status: 404, error: 'Lesson not found' };
      }
    }
  }

  let expectedUrl: string;
  try {
    expectedUrl = buildExpectedBlobUrl(deps.getBlobEndpoint(), token.container, token.stagingBlobName);
  } catch {
    return { ok: false, status: 400, error: 'Storage configuration is invalid' };
  }
  if (token.blobUrl !== expectedUrl) {
    return { ok: false, status: 400, error: 'Token blob URL does not match storage configuration' };
  }

  // Verify blob in storage
  let inspection;
  try {
    inspection = await deps.storage.inspect(token.container, token.stagingBlobName);
  } catch {
    return { ok: false, status: 400, error: 'Upload not found or expired' };
  }

  if (inspection.contentLength !== token.declaration.size) {
    return { ok: false, status: 400, error: 'Upload size mismatch' };
  }
  if (inspection.contentType !== token.declaration.contentType) {
    return { ok: false, status: 400, error: 'Upload content type mismatch' };
  }

  if (request.courseId) {
    // ── COURSE COMPLETION: promote and return ────────────────────────────
    const stagingRef = parseCourseMediaReference(token.stagingBlobName);
    if (!stagingRef || stagingRef.scope !== 'staging-course') {
      return { ok: false, status: 400, error: 'Invalid staging reference' };
    }

    const finalBlobName = createFinalBlobName({
      courseId: request.courseId,
      kind: token.declaration.kind,
      contentType: token.declaration.contentType,
    });
    const finalRef = parseCourseMediaReference(finalBlobName);
    if (!finalRef || finalRef.scope !== 'final') {
      return { ok: false, status: 400, error: 'Failed to create final reference' };
    }

    let promoteResult;
    try {
      promoteResult = await deps.storage.promote(
        token.container,
        stagingRef as ParsedCourseMediaReference & { scope: 'staging-course' },
        finalRef as ParsedCourseMediaReference & { scope: 'final' },
        { expectedContentLength: token.declaration.size, expectedContentType: token.declaration.contentType },
      );
    } catch {
      return { ok: false, status: 400, error: 'Storage operation failed' };
    }
    if (!promoteResult.ok) {
      return { ok: false, status: 400, error: 'Upload promotion failed' };
    }

    if (token.declaration.kind === 'lesson-video') {
      return { ok: true, result: { kind: 'lesson-video', blobName: finalBlobName, videoProvider: 'azure' } };
    }

    const blobEndpoint = deps.getBlobEndpoint();
    const publicUrl = getPublicCourseImageUrl(blobEndpoint, finalBlobName);
    if (!publicUrl) {
      return { ok: false, status: 400, error: 'Failed to generate image URL' };
    }
    return { ok: true, result: { kind: token.declaration.kind as 'thumbnail' | 'cover', url: publicUrl } };
  }

  // ── DRAFT COMPLETION: verify blobUrl, return without promotion ─────────
  return { ok: true, result: { kind: token.declaration.kind as 'thumbnail' | 'cover', url: token.blobUrl } };
}

function buildExpectedBlobUrl(blobEndpoint: string, container: string, blobName: string): string {
  const url = new URL(blobEndpoint);
  url.pathname = `/${container}/${blobName}`;
  url.search = '';
  url.hash = '';
  return url.toString();
}
