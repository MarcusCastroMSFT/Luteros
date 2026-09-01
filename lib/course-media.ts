export type CourseMediaKind = 'thumbnail' | 'cover' | 'lesson-video' | 'lesson-audio';

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
const AUDIO_MAX_SIZE = 500 * 1024 ** 2;

const MEDIA_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/ogg': 'ogg',
} as const;

export type CourseMediaExtension = (typeof MEDIA_EXTENSIONS)[keyof typeof MEDIA_EXTENSIONS];

const IMAGE_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const VIDEO_CONTENT_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const AUDIO_CONTENT_TYPES = new Set([
  'audio/mpeg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
]);

export function extensionForMediaType(contentType: string): CourseMediaExtension | null {
  return MEDIA_EXTENSIONS[contentType as keyof typeof MEDIA_EXTENSIONS] ?? null;
}

export function validateCourseMediaDeclaration(
  input: CourseMediaDeclaration,
): MediaValidationResult {
  if (!Number.isFinite(input.size) || input.size <= 0) {
    return { ok: false, error: 'Tamanho de arquivo inválido' };
  }

  const allowedTypes = input.kind === 'lesson-video'
    ? VIDEO_CONTENT_TYPES
    : input.kind === 'lesson-audio'
      ? AUDIO_CONTENT_TYPES
      : IMAGE_CONTENT_TYPES;
  if (!allowedTypes.has(input.contentType)) {
    return {
      ok: false,
      error: `Tipo de arquivo não suportado: ${input.contentType}`,
    };
  }

  const maxSize = input.kind === 'lesson-video'
    ? VIDEO_MAX_SIZE
    : input.kind === 'lesson-audio'
      ? AUDIO_MAX_SIZE
      : IMAGE_MAX_SIZE;
  if (input.size > maxSize) {
    return {
      ok: false,
      error: input.kind === 'lesson-video'
        ? 'Arquivo muito grande (máximo 2GB)'
        : input.kind === 'lesson-audio'
          ? 'Arquivo muito grande (máximo 500MB)'
          : 'Arquivo muito grande (máximo 8MB)',
    };
  }

  return { ok: true };
}