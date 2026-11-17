import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AppRouterContext, type AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import { CourseContent } from '@/components/courses/courseContent';
import type { CourseSection } from '@/types/course';

const router: AppRouterInstance = {
  back: () => {}, forward: () => {}, refresh: () => {},
  push: () => {}, replace: () => {}, prefetch: () => {}, bfcacheId: 'test',
};
const sections: CourseSection[] = [{
  id: 'one', title: 'Lições', totalDuration: '',
  lessons: [{
    id: 'upcoming', title: 'Aula futura', description: '', type: 'video',
    duration: '', order: 0, isPreview: true, isComingSoon: true,
  }],
}];

function renderCourseContent(classroom: boolean) {
  return renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router },
    createElement(PathnameContext.Provider, { value: classroom ? '/courses/test/lessons' : '/courses/test' },
      createElement(CourseContent, {
        sections, showAllSections: true,
        ...(classroom ? { onLessonSelect: () => {} } : { courseSlug: 'test' }),
      }))));
}

test('upcoming lessons are announced in the public course and selectable in the classroom', () => {
  const publicHtml = renderCourseContent(false);
  const classroomHtml = renderCourseContent(true);
  for (const html of [publicHtml, classroomHtml]) {
    assert.match(html, /Aula futura/);
    assert.match(html, /Em breve/);
    assert.match(html, /preparada pelos nossos especialistas/);
    assert.doesNotMatch(html, /Prévia/);
  }
  assert.match(publicHtml, /<button[^>]*disabled[^>]*[^>]*>[^]*Aula futura/);
  assert.doesNotMatch(classroomHtml, /<button[^>]*disabled/);
});
