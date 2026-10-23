import assert from 'node:assert/strict';
import test from 'node:test';
import { bioLines, buildSpecialistLinks, normalizeSocialUrl, slugify } from './specialist-profile';

test('slugify removes accents and punctuation', () => {
  assert.equal(slugify('Tetzi Oliveira Brandão'), 'tetzi-oliveira-brandao');
  assert.equal(slugify('  Lucia Alves da Silva Lara '), 'lucia-alves-da-silva-lara');
});

test('instagram accepts handles and fixes the domain', () => {
  assert.equal(normalizeSocialUrl('instagram', '@dra.tetzi'), 'https://www.instagram.com/dra.tetzi');
  assert.equal(normalizeSocialUrl('instagram', 'dra.tetzi'), 'https://www.instagram.com/dra.tetzi');
  assert.equal(normalizeSocialUrl('instagram', 'https://instagram.com.br/dra.tetzi'), 'https://www.instagram.com/dra.tetzi');
  assert.equal(normalizeSocialUrl('instagram', 'https://example.com/dra.tetzi'), null);
});

test('linkedin is upgraded to https and must point to linkedin', () => {
  assert.equal(
    normalizeSocialUrl('linkedin', 'http://linkedin.com/in/dra-tetzi-oliveira-brandão-2b558b57'),
    'https://linkedin.com/in/dra-tetzi-oliveira-brand%C3%A3o-2b558b57',
  );
  assert.equal(normalizeSocialUrl('linkedin', 'linkedin.com/in/maria'), 'https://linkedin.com/in/maria');
  assert.equal(normalizeSocialUrl('linkedin', 'https://evil.example/in/maria'), null);
});

test('unsafe or empty values are rejected', () => {
  assert.equal(normalizeSocialUrl('website', 'javascript:alert(1)'), null);
  assert.equal(normalizeSocialUrl('website', ''), null);
  assert.equal(normalizeSocialUrl('website', null), null);
  assert.equal(normalizeSocialUrl('website', 'meusite.com.br'), 'https://meusite.com.br/');
});

test('buildSpecialistLinks keeps only valid links in a stable order', () => {
  const links = buildSpecialistLinks({ linkedin: 'x', instagram: '@a', website: '', twitter: null });
  assert.deepEqual(links.map((l) => l.kind), ['instagram']);
});

test('bioLines splits one credential per line', () => {
  assert.deepEqual(bioLines('Médica\r\n\n Doutora  \nDocente'), ['Médica', 'Doutora', 'Docente']);
  assert.deepEqual(bioLines(null), []);
});
