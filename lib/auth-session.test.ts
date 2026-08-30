import assert from 'node:assert/strict';
import test from 'node:test';
import { applyStoredSessionImage } from './auth-session';

test('updates only the session image from its persisted value', () => {
  const token = { image: 'old.jpg', role: 'USER' };

  assert.deepEqual(applyStoredSessionImage(token, 'new.jpg'), {
    image: 'new.jpg',
    role: 'USER',
  });
});

test('keeps the session unchanged when no persisted image is found', () => {
  const token = { image: 'old.jpg', role: 'USER' };

  assert.deepEqual(applyStoredSessionImage(token, undefined), token);
});