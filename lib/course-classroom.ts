import type { Lesson } from '@/types/course';

export function getCurrentCourseLesson(lessons: Lesson[], selectedLessonId?: string): Lesson | null {
  return lessons.find(lesson => lesson.id === selectedLessonId) ?? lessons[0] ?? null;
}

export function getLessonPlaybackUrl(
  courseId: string,
  lesson: { id: string; videoProvider: string | null; videoUrl: string | null },
): string | undefined {
  if (!lesson.videoUrl) return undefined;
  if (lesson.videoProvider !== 'azure') return lesson.videoUrl;

  return `/api/courses/${courseId}/lessons/${lesson.id}/media`;
}

export function getLessonPlaybackKey(lesson: Lesson): string {
  return `${lesson.id}:${lesson.type}:${lesson.mediaVersion ?? lesson.videoUrl ?? ''}`;
}
