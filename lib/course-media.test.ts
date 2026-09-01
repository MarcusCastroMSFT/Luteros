import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extensionForMediaType,
  validateCourseMediaDeclaration,
  type CourseMediaKind,
} from './course-media';

const MEBIBYTE = 1024 ** 2;
const GIBIBYTE = 1024 ** 3;

const allowedTypes: Array<[CourseMediaKind, string, string]> = [
  ['thumbnail', 'image/jpeg', 'jpg'],
  ['thumbnail', 'image/png', 'png'],
  ['cover', 'image/webp', 'webp'],
  ['cover', 'image/gif', 'gif'],
  ['lesson-video', 'video/mp4', 'mp4'],
  ['lesson-video', 'video/webm', 'webm'],
  ['lesson-video', 'video/quicktime', 'mov'],
  ['lesson-audio', 'audio/mpeg', 'mp3'],
  ['lesson-audio', 'audio/mp4', 'm4a'],
  ['lesson-audio', 'audio/x-m4a', 'm4a'],
  ['lesson-audio', 'audio/wav', 'wav'],
  ['lesson-audio', 'audio/x-wav', 'wav'],
  ['lesson-audio', 'audio/ogg', 'ogg'],
];

for (const [kind, contentType, extension] of allowedTypes) {
  test(`accepts ${contentType} for ${kind}`, () => {
    assert.deepEqual(validateCourseMediaDeclaration({ kind, contentType, size: 1 }), {
      ok: true,
    });
    assert.equal(extensionForMediaType(contentType), extension);
  });
}

test('rejects SVG and unknown media types', () => {
  assert.deepEqual(
    validateCourseMediaDeclaration({
      kind: 'thumbnail',
      contentType: 'image/svg+xml',
      size: 100,
    }),
    { ok: false, error: 'Tipo de arquivo não suportado: image/svg+xml' },
  );
  assert.deepEqual(
    validateCourseMediaDeclaration({
      kind: 'lesson-video',
      contentType: 'application/octet-stream',
      size: 100,
    }),
    { ok: false, error: 'Tipo de arquivo não suportado: application/octet-stream' },
  );
  assert.equal(extensionForMediaType('image/svg+xml'), null);
});

test('rejects an allowed MIME type used for the wrong media kind', () => {
  assert.deepEqual(
    validateCourseMediaDeclaration({
      kind: 'lesson-video',
      contentType: 'image/jpeg',
      size: 100,
    }),
    { ok: false, error: 'Tipo de arquivo não suportado: image/jpeg' },
  );
});

test('rejects non-positive and non-finite sizes', () => {
  for (const size of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.deepEqual(
      validateCourseMediaDeclaration({ kind: 'cover', contentType: 'image/png', size }),
      { ok: false, error: 'Tamanho de arquivo inválido' },
    );
  }
});

test('accepts the exact image limit and rejects one byte over it', () => {
  assert.deepEqual(
    validateCourseMediaDeclaration({
      kind: 'cover',
      contentType: 'image/png',
      size: 8 * MEBIBYTE,
    }),
    { ok: true },
  );
  assert.deepEqual(
    validateCourseMediaDeclaration({
      kind: 'cover',
      contentType: 'image/png',
      size: 8 * MEBIBYTE + 1,
    }),
    { ok: false, error: 'Arquivo muito grande (máximo 8MB)' },
  );
});

test('accepts the exact video limit and rejects one byte over it', () => {
  assert.deepEqual(
    validateCourseMediaDeclaration({
      kind: 'lesson-video',
      contentType: 'video/mp4',
      size: 2 * GIBIBYTE,
    }),
    { ok: true },
  );
  assert.deepEqual(
    validateCourseMediaDeclaration({
      kind: 'lesson-video',
      contentType: 'video/mp4',
      size: 2 * GIBIBYTE + 1,
    }),
    { ok: false, error: 'Arquivo muito grande (máximo 2GB)' },
  );
});

test('accepts the exact audio limit and rejects one byte over it', () => {
  assert.deepEqual(
    validateCourseMediaDeclaration({
      kind: 'lesson-audio',
      contentType: 'audio/mpeg',
      size: 500 * MEBIBYTE,
    }),
    { ok: true },
  );
  assert.deepEqual(
    validateCourseMediaDeclaration({
      kind: 'lesson-audio',
      contentType: 'audio/mpeg',
      size: 500 * MEBIBYTE + 1,
    }),
    { ok: false, error: 'Arquivo muito grande (máximo 500MB)' },
  );
});
