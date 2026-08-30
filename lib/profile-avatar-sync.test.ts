import assert from 'node:assert/strict';
import test from 'node:test';
import { synchronizeProfileAvatar } from './profile-avatar-sync';

test('waits for the session refresh before closing the avatar dialog', async () => {
  const events: string[] = [];

  await synchronizeProfileAvatar({
    avatar: 'new-avatar.jpg',
    updateLocalAvatar: (avatar) => events.push(`local:${avatar}`),
    refreshProfile: async () => {
      events.push('refresh:start');
      await Promise.resolve();
      events.push('refresh:end');
    },
    closeDialog: () => events.push('close'),
  });

  assert.deepEqual(events, [
    'local:new-avatar.jpg',
    'refresh:start',
    'refresh:end',
    'close',
  ]);
});

test('keeps the avatar dialog open when the session refresh fails', async () => {
  let closed = false;

  await assert.rejects(
    synchronizeProfileAvatar({
      avatar: 'new-avatar.jpg',
      updateLocalAvatar: () => undefined,
      refreshProfile: async () => {
        throw new Error('session refresh failed');
      },
      closeDialog: () => {
        closed = true;
      },
    }),
    /session refresh failed/
  );

  assert.equal(closed, false);
});