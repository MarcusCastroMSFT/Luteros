export function formatLessonCount(count: number): string {
  return `${count} ${count === 1 ? 'Aula' : 'Aulas'}`;
}