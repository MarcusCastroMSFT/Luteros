import assert from 'node:assert/strict';
import test from 'node:test';
import { applyStoredSessionImage, refreshStoredProfile } from './auth-session';

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

test('uses an explicit empty payload to trigger a database-backed session update', async () => {
  let receivedPayload: unknown;

  await refreshStoredProfile(async (payload) => {
    receivedPayload = payload;
    return { user: { image: 'new.jpg' } };
  });

  assert.deepEqual(receivedPayload, {});
});

test('reports when NextAuth does not return an updated session', async () => {
  await assert.rejects(
    refreshStoredProfile(async () => null),
    /Sessão não atualizada/
  );
});
