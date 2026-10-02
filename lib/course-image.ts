export function resolveCourseImage(
  thumbnail: string | null | undefined,
  coverImage: string | null | undefined
): string {
  return thumbnail?.trim() || coverImage?.trim() || '';
}
