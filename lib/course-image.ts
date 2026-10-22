export const COURSE_PLACEHOLDER_IMAGE = '/images/course-placeholder-v2.svg';

export function resolveCourseImage(
  thumbnail: string | null | undefined,
  coverImage: string | null | undefined
): string {
  return thumbnail?.trim() || coverImage?.trim() || '';
}
