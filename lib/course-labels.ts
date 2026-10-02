export function formatLessonCount(count: number): string {
  return `${count} ${count === 1 ? 'Aula' : 'Aulas'}`;
}

function formatArticleCount(count: number): string {
  return `${count} ${count === 1 ? 'Artigo' : 'Artigos'}`;
}

// Articles are counted apart from lessons (video/audio).
export function formatCourseCounts(lessons: number, articles: number): string {
  if (articles === 0) return formatLessonCount(lessons);
  if (lessons === 0) return formatArticleCount(articles);
  return `${formatLessonCount(lessons)} e ${formatArticleCount(articles)}`;
}

export function formatCourseItemCount(items: ReadonlyArray<{ type: string }>): string {
  const articles = items.filter((item) => item.type === 'article').length;
  return formatCourseCounts(items.length - articles, articles);
}