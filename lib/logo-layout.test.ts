import assert from 'node:assert/strict';
import test from 'node:test';
import { getLogoLayout } from './logo-layout';

test('keeps the large logo artwork width while bounding its hit area', () => {
  assert.deepEqual(getLogoLayout('lg'), {
    canvasSize: 160,
    viewportWidth: 160,
    viewportHeight: 32,
    offsetTop: -64,
  });
});

test('scales each bounded viewport consistently', () => {
  assert.deepEqual(getLogoLayout('sm'), {
    canvasSize: 80,
    viewportWidth: 80,
    viewportHeight: 16,
    offsetTop: -32,
  });
  assert.deepEqual(getLogoLayout('xl'), {
    canvasSize: 200,
    viewportWidth: 200,
    viewportHeight: 40,
    offsetTop: -80,
  });
});
