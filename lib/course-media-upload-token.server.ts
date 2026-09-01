import { createHmac, timingSafeEqual } from 'node:crypto';
import { validateCourseMediaDeclaration } from './course-media';
import type { CourseMediaKind } from './course-media';
import {
  createOwnerFingerprint,
  parseCourseMediaReference,
} from './course-media-paths.server';

const TOKEN_MAX_LENGTH = 4096;
const SECRET_MIN_BYTES = 32;
const MAX_EXPIRY_AHEAD_MS = 16 * 60 * 1000; // 15 min + 1 min clock tolerance
const BASE64URL_RE = /^[A-Za-z0-9_-]+$/;

export interface UploadTokenPayload {
  v: 1;
  userId: string;
  declaration: {
    kind: CourseMediaKind;
    contentType: string;
    size: number;
  };
  stagingBlobName: string;
  container: 'course-images' | 'course-videos';
  blobUrl: string;
  courseId?: string;
  lessonId?: string;
  expiresAt: string;
}

export interface TokenDependencies {
  getNow: () => Date;
  getSecret: () => string;
}

function requireSecret(deps: TokenDependencies): string {
  const secret = deps.getSecret();
  if (Buffer.byteLength(secret, 'utf8') < SECRET_MIN_BYTES) {
    throw new Error('Upload token secret must be at least 32 bytes');
  }
  return secret;
}

export function createUploadToken(
  payload: UploadTokenPayload,
  deps: TokenDependencies,
): string {
  const secret = requireSecret(deps);
  const payloadBase64 = Buffer.from(canonicalStringify(payload), 'utf8').toString('base64url');
  const signature = createHmac('sha256', secret).update(payloadBase64).digest('base64url');
  return `${payloadBase64}.${signature}`;
}

function canonicalStringify(obj: unknown): string {
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalStringify).join(',') + ']';
  }
  const sorted = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = sorted.map((key) => {
    const value = (obj as Record<string, unknown>)[key];
    return JSON.stringify(key) + ':' + canonicalStringify(value);
  });
  return '{' + pairs.join(',') + '}';
}

type VerifyResult =
  | { ok: true; payload: UploadTokenPayload }
  | { ok: false; error: string };

export function verifyUploadToken(
  token: string,
  deps: TokenDependencies,
): VerifyResult {
  if (typeof token !== 'string' || token.length === 0 || token.length > TOKEN_MAX_LENGTH) {
    return { ok: false, error: 'Invalid upload token' };
  }

  const dotIndex = token.indexOf('.');
  if (dotIndex < 1 || token.indexOf('.', dotIndex + 1) !== -1) {
    return { ok: false, error: 'Invalid upload token' };
  }
  const payloadBase64 = token.slice(0, dotIndex);
  const receivedSignature = token.slice(dotIndex + 1);

  if (!receivedSignature || !BASE64URL_RE.test(payloadBase64) || !BASE64URL_RE.test(receivedSignature)) {
    return { ok: false, error: 'Invalid upload token' };
  }

  let secret: string;
  try {
    secret = requireSecret(deps);
  } catch {
    return { ok: false, error: 'Invalid upload token' };
  }

  const expectedSignature = createHmac('sha256', secret).update(payloadBase64).digest('base64url');
  const receivedBuffer = Buffer.from(receivedSignature, 'base64url');
  const expectedBuffer = Buffer.from(expectedSignature, 'base64url');

  if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) {
    return { ok: false, error: 'Invalid upload token' };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
  } catch {
    return { ok: false, error: 'Invalid upload token' };
  }

  if (!isValidPayload(raw, deps)) {
    return { ok: false, error: 'Invalid upload token' };
  }

  if (deps.getNow() >= new Date(raw.expiresAt)) {
    return { ok: false, error: 'Upload token expired' };
  }

  return { ok: true, payload: raw };
}

// ─── Strict Payload Validation ────────────────────────────────────────────────

const PAYLOAD_REQUIRED = new Set(['v', 'userId', 'declaration', 'stagingBlobName', 'container', 'blobUrl', 'expiresAt']);
const PAYLOAD_OPTIONAL = new Set(['courseId', 'lessonId']);
const DECLARATION_KEYS = new Set(['kind', 'contentType', 'size']);

function isValidPayload(value: unknown, deps: TokenDependencies): value is UploadTokenPayload {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;

  // Exact own-key set
  const keys = Object.keys(obj);
  for (const k of keys) {
    if (!PAYLOAD_REQUIRED.has(k) && !PAYLOAD_OPTIONAL.has(k)) return false;
  }
  for (const k of PAYLOAD_REQUIRED) {
    if (!Object.prototype.hasOwnProperty.call(obj, k)) return false;
  }

  if (obj.v !== 1) return false;
  if (typeof obj.userId !== 'string' || !obj.userId) return false;
  if (typeof obj.stagingBlobName !== 'string' || !obj.stagingBlobName) return false;
  if (typeof obj.blobUrl !== 'string' || !obj.blobUrl) return false;
  if (typeof obj.expiresAt !== 'string' || !obj.expiresAt) return false;
  if (obj.container !== 'course-images' && obj.container !== 'course-videos') return false;

  // Declaration: exact keys, validated through validateCourseMediaDeclaration
  if (!obj.declaration || typeof obj.declaration !== 'object' || Array.isArray(obj.declaration)) return false;
  const decl = obj.declaration as Record<string, unknown>;
  const declKeys = Object.keys(decl);
  if (declKeys.length !== DECLARATION_KEYS.size || !declKeys.every(k => DECLARATION_KEYS.has(k))) return false;
  if (typeof decl.kind !== 'string' || typeof decl.contentType !== 'string' || typeof decl.size !== 'number') return false;

  const validation = validateCourseMediaDeclaration({
    kind: decl.kind as CourseMediaKind,
    contentType: decl.contentType,
    size: decl.size,
  });
  if (!validation.ok) return false;

  // Container ↔ kind consistency
  const isLessonMedia = decl.kind === 'lesson-video' || decl.kind === 'lesson-audio';
  if (isLessonMedia && obj.container !== 'course-videos') return false;
  if (!isLessonMedia && obj.container !== 'course-images') return false;

  // Optional string fields
  if ('courseId' in obj && (typeof obj.courseId !== 'string' || !obj.courseId)) return false;
  if ('lessonId' in obj && (typeof obj.lessonId !== 'string' || !obj.lessonId)) return false;
  if (isLessonMedia && (!obj.courseId || !obj.lessonId)) return false;
  if (!isLessonMedia && obj.lessonId) return false;

  // expiresAt: valid date, finite, max ~15 min ahead
  const expiresAt = new Date(obj.expiresAt);
  if (!Number.isFinite(expiresAt.getTime())) return false;
  if (expiresAt.getTime() > deps.getNow().getTime() + MAX_EXPIRY_AHEAD_MS) return false;

  // blobUrl: HTTPS, no query/hash
  try {
    const url = new URL(obj.blobUrl);
    if (url.protocol !== 'https:') return false;
    if (url.search) return false;
    if (url.hash) return false;
  } catch {
    return false;
  }

  // Staging path ↔ token fields consistency
  if (obj.courseId) {
    const reference = parseCourseMediaReference(obj.stagingBlobName as string, {
      expectedCourseId: obj.courseId as string,
      expectedKind: decl.kind as UploadTokenPayload['declaration']['kind'],
    });
    if (!reference || reference.scope !== 'staging-course') return false;
  } else {
    const reference = parseCourseMediaReference(obj.stagingBlobName as string, {
      expectedOwnerFingerprint: createOwnerFingerprint(obj.userId as string),
      expectedKind: decl.kind as UploadTokenPayload['declaration']['kind'],
    });
    if (!reference || reference.scope !== 'staging-draft') return false;
  }

  return true;
}
