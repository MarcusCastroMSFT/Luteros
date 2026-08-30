import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeCourseContent } from './course-content-summary';

test('summarizes lesson counts and durations by real content type', () => {
  const summary = summarizeCourseContent([
    { type: 'video', duration: 600, sectionTitle: 'Introdução' },
    { type: 'video', duration: 90, sectionTitle: 'Prática' },
    { type: 'article', duration: null, sectionTitle: 'Introdução' },
    { type: 'audio', duration: 65, sectionTitle: 'Prática' },
  ]);

  assert.deepEqual(summary, [
    { type: 'video', label: '2 aulas em vídeo · 11min 30s' },
    { type: 'article', label: '1 artigo' },
    { type: 'audio', label: '1 aula em áudio · 1min 5s' },
    { type: 'section', label: '2 seções' },
  ]);
});

test('omits content types and sections that have no real data', () => {
  assert.deepEqual(
    summarizeCourseContent([{ type: 'article', duration: null, sectionTitle: null }]),
    [{ type: 'article', label: '1 artigo' }]
  );
});

test('omits duration when lessons have no configured duration', () => {
  assert.deepEqual(
    summarizeCourseContent([{ type: 'video', duration: null, sectionTitle: 'Única' }]),
    [
      { type: 'video', label: '1 aula em vídeo' },
      { type: 'section', label: '1 seção' },
    ]
  );
});