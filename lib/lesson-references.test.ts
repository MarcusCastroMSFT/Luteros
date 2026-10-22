import assert from 'node:assert/strict';
import test from 'node:test';
import { lessonReferencesSchema, resolveLessonReferences } from './lesson-references';
import { sanitizeArticleContent } from './article-content.server';
import { saveLessonWithDeferredMedia } from './lesson-save-flow';

test('references accept text, null and omission, but reject non-text values', () => {
  for (const value of ['<p>Fonte</p>', '', null, undefined]) {
    assert.equal(lessonReferencesSchema.safeParse(value).success, true);
  }
  for (const value of [123, true, [], { html: 'Fonte' }]) {
    assert.equal(lessonReferencesSchema.safeParse(value).success, false);
  }
});

test('article references can be created, edited, preserved or cleared', () => {
  assert.equal(resolveLessonReferences('article', ' <p>Fonte</p> '), '<p>Fonte</p>');
  assert.equal(resolveLessonReferences('article', undefined, 'Fonte anterior'), 'Fonte anterior');
  assert.equal(resolveLessonReferences('article', '<p>Nova fonte</p>', 'Anterior'), '<p>Nova fonte</p>');
  assert.equal(resolveLessonReferences('article', '', 'Anterior'), null);
  assert.equal(resolveLessonReferences('article', '  ', 'Anterior'), null);
  assert.equal(resolveLessonReferences('article', null, 'Anterior'), null);
  assert.equal(resolveLessonReferences('article', undefined), null);
});

test('switching away from article removes references', () => {
  for (const type of ['video', 'audio']) {
    assert.equal(resolveLessonReferences(type, undefined, 'Anterior'), null);
    assert.equal(resolveLessonReferences(type, 'Nova fonte', 'Anterior'), null);
  }
});

test('reader sanitization preserves reference links without executable HTML', () => {
  const html = sanitizeArticleContent(
    '<p>Fonte</p><script>alert(1)</script><a href="javascript:alert(1)">Ruim</a>'
    + '<a href="https://example.org" target="_blank" onclick="alert(1)">Publicação</a>',
  );
  assert.match(html, /<p>Fonte<\/p>/);
  assert.match(html, /href="https:\/\/example.org"/);
  assert.match(html, /rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /script|onclick|alert/);
});

test('lesson save sends references on create and edit, including explicit clearing', async () => {
  for (const lessonId of [undefined, 'lesson-1']) {
    for (const references of ['<p>Referência citada</p>', '']) {
      let calls = 0;
      await saveLessonWithDeferredMedia({
        courseId: 'course-1',
        lessonId,
        payload: {
          title: 'Artigo', type: 'article', content: '<p>Conteúdo</p>', references,
          description: null, videoUrl: null, videoProvider: null, duration: null,
          sectionTitle: null, isPublished: true, isFree: false,
        },
        fetchImpl: async (_input, init) => {
          calls++;
          assert.equal(init?.method, lessonId ? 'PUT' : 'POST');
          assert.equal(JSON.parse(String(init?.body)).references, references);
          return new Response(JSON.stringify({ success: true, data: { id: 'lesson-1' } }), {
            status: lessonId ? 200 : 201, headers: { 'Content-Type': 'application/json' },
          });
        },
      });
      assert.equal(calls, 1);
    }
  }
});
