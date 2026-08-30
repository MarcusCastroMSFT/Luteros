export function getCoursePath(slug: string): string {
  return `/courses/${encodeURIComponent(slug)}`;
}