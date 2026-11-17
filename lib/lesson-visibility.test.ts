import assert from 'node:assert/strict';
import test from 'node:test';
import { hideComingSoonContent, resolveLessonVisibility } from './lesson-visibility';

test('lesson visibility supports draft, coming soon and published transitions', () => {
  const draft = { isPublished: false, isComingSoon: false };
  const soon = { isPublished: false, isComingSoon: true };
  const published = { isPublished: true, isComingSoon: false };

  assert.deepEqual(resolveLessonVisibility({}), draft);
  assert.deepEqual(resolveLessonVisibility({ isComingSoon: true }, draft), soon);
  assert.deepEqual(resolveLessonVisibility({ isPublished: true }, soon), published);
  assert.deepEqual(resolveLessonVisibility({ isComingSoon: true }, published), soon);
  assert.deepEqual(resolveLessonVisibility({ isPublished: false }, soon), draft);
  assert.deepEqual(resolveLessonVisibility({}, soon), soon);
  assert.deepEqual(resolveLessonVisibility({ isPublished: false, isComingSoon: true }), soon);
  assert.equal(resolveLessonVisibility({ isPublished: true, isComingSoon: true }), null);
  assert.equal(resolveLessonVisibility({ isComingSoon: 'true' }), null);
  assert.equal(resolveLessonVisibility({ isPublished: null }), null);
});

test('coming-soon lessons retain their title but not their private content or preview', () => {
  const lesson = {
    title: 'Próxima aula', isComingSoon: true, description: 'private description',
    content: 'private content', references: 'private references', duration: 123,
    isFree: true, videoUrl: 'private video', videoProvider: 'youtube',
  };
  assert.deepEqual(hideComingSoonContent(lesson), {
    ...lesson, description: null, content: null, references: null, duration: null,
    isFree: false, videoUrl: null, videoProvider: null,
  });
  const published = { ...lesson, isComingSoon: false };
  assert.equal(hideComingSoonContent(published), published);
});
