export type CourseContentSummaryItem = {
  type: 'video' | 'article' | 'audio' | 'section';
  label: string;
};

interface CourseContentLesson {
  type: 'video' | 'article' | 'audio';
  duration: number | null;
  sectionTitle: string | null;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [
    hours > 0 ? `${hours}h` : '',
    minutes > 0 ? `${minutes}min` : '',
    remainingSeconds > 0 ? `${remainingSeconds}s` : '',
  ].filter(Boolean).join(' ');
}

function lessonTypeItem(
  lessons: CourseContentLesson[],
  type: 'video' | 'article' | 'audio'
): CourseContentSummaryItem | null {
  const matchingLessons = lessons.filter((lesson) => lesson.type === type);
  if (matchingLessons.length === 0) return null;

  if (type === 'article') {
    return {
      type,
      label: `${matchingLessons.length} ${matchingLessons.length === 1 ? 'artigo' : 'artigos'}`,
    };
  }

  const medium = type === 'video' ? 'vídeo' : 'áudio';
  const lessonLabel = matchingLessons.length === 1 ? 'aula' : 'aulas';
  const duration = matchingLessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);

  return {
    type,
    label: `${matchingLessons.length} ${lessonLabel} em ${medium}${duration > 0 ? ` · ${formatDuration(duration)}` : ''}`,
  };
}

export function summarizeCourseContent(
  lessons: CourseContentLesson[]
): CourseContentSummaryItem[] {
  const items = [
    lessonTypeItem(lessons, 'video'),
    lessonTypeItem(lessons, 'article'),
    lessonTypeItem(lessons, 'audio'),
  ].filter((item): item is CourseContentSummaryItem => item !== null);
  const sectionCount = new Set(
    lessons.map((lesson) => lesson.sectionTitle?.trim()).filter(Boolean)
  ).size;

  if (sectionCount > 0) {
    items.push({
      type: 'section',
      label: `${sectionCount} ${sectionCount === 1 ? 'seção' : 'seções'}`,
    });
  }

  return items;
}