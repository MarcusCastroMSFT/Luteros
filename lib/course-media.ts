export type CourseMediaKind = 'thumbnail' | 'cover' | 'lesson-video';

export interface CourseMediaDeclaration {
  kind: CourseMediaKind;
  contentType: string;
  size: number;
}

export type MediaValidationResult =
  | { ok: true }
  | { ok: false; error: string };

const IMAGE_MAX_SIZE = 8 * 1024 ** 2;
const VIDEO_MAX_SIZE = 2 * 1024 ** 3;

const MEDIA_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
} as const;

export type CourseMediaExtension = (typeof MEDIA_EXTENSIONS)[keyof typeof MEDIA_EXTENSIONS];

const IMAGE_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const VIDEO_CONTENT_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

export function extensionForMediaType(contentType: string): CourseMediaExtension | null {
  return MEDIA_EXTENSIONS[contentType as keyof typeof MEDIA_EXTENSIONS] ?? null;
}

export function validateCourseMediaDeclaration(
  input: CourseMediaDeclaration,
): MediaValidationResult {
  if (!Number.isFinite(input.size) || input.size <= 0) {
    return { ok: false, error: 'Tamanho de arquivo inválido' };
  }

  const allowedTypes = input.kind === 'lesson-video' ? VIDEO_CONTENT_TYPES : IMAGE_CONTENT_TYPES;
  if (!allowedTypes.has(input.contentType)) {
    return {
      ok: false,
      error: `Tipo de arquivo não suportado: ${input.contentType}`,
    };
  }

  const maxSize = input.kind === 'lesson-video' ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE;
  if (input.size > maxSize) {
    return {
      ok: false,
      error: input.kind === 'lesson-video'
        ? 'Arquivo muito grande (máximo 2GB)'
        : 'Arquivo muito grande (máximo 8MB)',
    };
  }

  return { ok: true };
}