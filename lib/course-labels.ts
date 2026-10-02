export function formatLessonCount(count: number): string {
  return `${count} ${count === 1 ? 'Aula' : 'Aulas'}`;
}

function formatArticleCount(count: number): string {
  return `${count} ${count === 1 ? 'Artigo' : 'Artigos'}`;
}

// Articles are counted apart from lessons (video/audio).
export function formatCourseItemCount(items: ReadonlyArray<{ type: string }>): string {
  const articles = items.filter((item) => item.type === 'article').length;
  const lessons = items.length - articles;

  if (articles === 0) return formatLessonCount(lessons);
  if (lessons === 0) return formatArticleCount(articles);
  return `${formatLessonCount(lessons)} e ${formatArticleCount(articles)}`;
}