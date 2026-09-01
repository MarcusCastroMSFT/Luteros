import { parseCourseMediaReference, type ParsedCourseMediaReference } from './course-media-paths.server';
import { classifyImageUrl } from './course-media-promotion.server';
import type { CourseMediaStorage } from './course-media-storage.server';

type FinalCourseMediaReference = ParsedCourseMediaReference & { scope: 'final' };

export interface CourseMediaReference {
  containerName: 'course-images' | 'course-videos';
  ref: FinalCourseMediaReference;
}

interface LessonMediaReference {
  type: 'video' | 'article' | 'audio';
  videoUrl: string | null | undefined;
  videoProvider: string | null | undefined;
}

interface CollectCourseMediaReferencesOptions {
  courseId: string;
  blobEndpoint: string;
  thumbnail?: string | null;
  coverImage?: string | null;
  lessons?: LessonMediaReference[];
}

interface DeleteCourseMediaReferencesOptions<T> {
  courseId: string;
  references: CourseMediaReference[];
  mutate: () => Promise<T>;
  getStorage: () => CourseMediaStorage;
  warn?: (...args: unknown[]) => void;
}

export class CourseMediaDeletionError extends Error {
  override name = 'CourseMediaDeletionError';
}

export function collectCourseMediaReferences(
  options: CollectCourseMediaReferencesOptions,
): CourseMediaReference[] {
  const references: CourseMediaReference[] = [];
  const seen = new Set<string>();

  const addReference = (
    containerName: CourseMediaReference['containerName'],
    ref: FinalCourseMediaReference,
  ) => {
    if (ref.courseId !== options.courseId) return;
    const key = `${containerName}:${ref.blobName}`;
    if (seen.has(key)) return;
    seen.add(key);
    references.push({ containerName, ref });
  };

  for (const imageUrl of [options.thumbnail, options.coverImage]) {
    const classification = classifyImageUrl(imageUrl, options.blobEndpoint);
    if (classification?.type === 'azure-final') {
      addReference('course-images', classification.ref);
    }
  }

  for (const lesson of options.lessons ?? []) {
    if (lesson.videoProvider !== 'azure' || !lesson.videoUrl) continue;
    const expectedKind = lesson.type === 'video'
      ? 'lesson-video'
      : lesson.type === 'audio'
        ? 'lesson-audio'
        : null;
    if (!expectedKind) continue;
    const ref = parseCourseMediaReference(lesson.videoUrl, {
      expectedCourseId: options.courseId,
      expectedKind,
    });
    if (ref?.scope === 'final') {
      addReference('course-videos', { ...ref, scope: 'final' });
    }
  }

  return references;
}

export async function deleteCourseMediaReferences<T>(
  options: DeleteCourseMediaReferencesOptions<T>,
): Promise<T> {
  const result = await options.mutate();
  if (options.references.length === 0) return result;

  const warn = options.warn ?? console.warn;
  let storage: CourseMediaStorage;
  try {
    storage = options.getStorage();
  } catch {
    warn('Course media cleanup unavailable', { courseId: options.courseId });
    return result;
  }

  for (const candidate of options.references) {
    const ref = parseCourseMediaReference(candidate.ref.blobName, {
      expectedCourseId: options.courseId,
      expectedKind: candidate.ref.kind,
    });
    const containerMatchesKind = candidate.containerName === 'course-videos'
      ? ref?.kind === 'lesson-video' || ref?.kind === 'lesson-audio'
      : ref?.kind === 'thumbnail' || ref?.kind === 'cover';

    if (ref?.scope !== 'final' || !containerMatchesKind) continue;

    try {
      await storage.deleteIfOwned(candidate.containerName, ref, options.courseId);
    } catch {
      warn('Course media cleanup failed', {
        courseId: options.courseId,
        containerName: candidate.containerName,
        blobName: ref.blobName,
      });
    }
  }

  return result;
}

export async function deleteCourseMediaReferencesStrict<T>(
  options: DeleteCourseMediaReferencesOptions<T>,
): Promise<T> {
  if (options.references.length === 0) return options.mutate();

  let storage: CourseMediaStorage;
  try {
    storage = options.getStorage();
  } catch {
    throw new CourseMediaDeletionError('Course media deletion unavailable');
  }

  for (const candidate of options.references) {
    const ref = parseCourseMediaReference(candidate.ref.blobName, {
      expectedCourseId: options.courseId,
      expectedKind: candidate.ref.kind,
    });
    const containerMatchesKind = candidate.containerName === 'course-videos'
      ? ref?.kind === 'lesson-video' || ref?.kind === 'lesson-audio'
      : ref?.kind === 'thumbnail' || ref?.kind === 'cover';

    if (ref?.scope !== 'final' || !containerMatchesKind) continue;

    try {
      await storage.deleteIfOwned(candidate.containerName, ref, options.courseId);
    } catch {
      throw new CourseMediaDeletionError('Course media deletion failed');
    }
  }

  return options.mutate();
}
