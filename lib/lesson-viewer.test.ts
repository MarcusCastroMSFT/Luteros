import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LessonViewer } from '@/components/lessons/lessonViewer';
import type { Lesson } from '@/types/course';

test('upcoming videos, articles and audio show a notice instead of content or completion', () => {
  for (const type of ['video', 'article', 'audio'] as const) {
    const lesson: Lesson = {
      id: type, title: 'Próxima aula', description: 'PRIVATE_DESCRIPTION',
      type, duration: '5:00', order: 0, isComingSoon: true,
      content: 'PRIVATE_CONTENT', references: 'PRIVATE_REFERENCES',
      videoUrl: 'https://example.com/private-media',
    };
    const html = renderToStaticMarkup(createElement(LessonViewer, {
      lesson, isCompleted: true, onMarkComplete: () => {}, onMarkIncomplete: () => {},
      onNavigate: () => {}, canNavigatePrevious: true, canNavigateNext: true,
    }));
    assert.match(html, /Em breve/);
    assert.match(html, /preparada pelos nossos especialistas/);
    assert.doesNotMatch(html, /PRIVATE_|private-media|Marcar Concluída|Concluída|5:00/);
    assert.match(html, /Próxima Aula/);
  }
});
