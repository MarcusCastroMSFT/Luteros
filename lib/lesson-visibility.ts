export type LessonVisibility = {
  isPublished: boolean;
  isComingSoon: boolean;
};

export function resolveLessonVisibility(
  input: { isPublished?: unknown; isComingSoon?: unknown },
  current: LessonVisibility = { isPublished: false, isComingSoon: false },
): LessonVisibility | null {
  const { isPublished, isComingSoon } = input;
  if ((isPublished !== undefined && typeof isPublished !== 'boolean')
    || (isComingSoon !== undefined && typeof isComingSoon !== 'boolean')
    || (isPublished === true && isComingSoon === true)) return null;

  if (typeof isPublished === 'boolean' && typeof isComingSoon === 'boolean') {
    return { isPublished, isComingSoon };
  }
  if (typeof isPublished === 'boolean') return { isPublished, isComingSoon: false };
  if (typeof isComingSoon === 'boolean') {
    return { isPublished: isComingSoon ? false : current.isPublished, isComingSoon };
  }
  return current;
}

export function hideComingSoonContent<T extends {
  isComingSoon: boolean;
  description: string | null;
  duration: number | null;
  isFree: boolean;
  content: string | null;
  references?: string | null;
  videoUrl: string | null;
  videoProvider: string | null;
}>(lesson: T): T {
  if (!lesson.isComingSoon) return lesson;
  return {
    ...lesson,
    description: null,
    duration: null,
    isFree: false,
    content: null,
    references: null,
    videoUrl: null,
    videoProvider: null,
  };
}
