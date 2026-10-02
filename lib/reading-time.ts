const WORDS_PER_MINUTE = 200;

export function estimateReadingSeconds(html: string | null | undefined): number {
  if (!html) return 0;

  const text = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    // Entities count as one letter so "caf&eacute;" stays a single word.
    .replace(/&[a-z0-9#]+;/gi, 'a');
  const words = text.split(/\s+/).filter(Boolean).length;

  return Math.ceil((words * 60) / WORDS_PER_MINUTE);
}

export function formatReadingTime(seconds: number): string {
  return `${Math.max(1, Math.ceil(seconds / 60))} min`;
}

interface DurationLesson {
  type: 'video' | 'article' | 'audio';
  duration: number | null;
  content?: string | null;
}

// Articles derive their duration from the text so it never goes stale after an edit.
export function resolveLessonDuration(lesson: DurationLesson): number {
  if (lesson.type === 'article') {
    const estimated = estimateReadingSeconds(lesson.content);
    if (estimated > 0) return estimated;
  }
  return lesson.duration || 0;
}

function formatClock(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function formatLessonDuration(type: DurationLesson['type'], seconds: number): string {
  if (type === 'article') return seconds > 0 ? formatReadingTime(seconds) : '';
  return formatClock(seconds);
}

export function formatSectionDuration(
  items: ReadonlyArray<Pick<DurationLesson, 'type' | 'duration'>>
): string {
  const total = items.reduce((sum, item) => sum + (item.duration || 0), 0);
  const onlyArticles = items.length > 0 && items.every((item) => item.type === 'article');
  return onlyArticles ? formatLessonDuration('article', total) : formatClock(total);
}
