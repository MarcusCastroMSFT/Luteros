import assert from 'node:assert/strict';
import test from 'node:test';
import { validateAvatarFile } from './avatar-upload';

test('accepts a cropped JPEG avatar within the size limit', async () => {
  const jpeg = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], { type: 'image/jpeg' });

  assert.equal(await validateAvatarFile(jpeg), null);
});

test('rejects avatar files that are not JPEG images', async () => {
  assert.equal(
    await validateAvatarFile(new Blob(['avatar'], { type: 'image/svg+xml' })),
    'Envie uma imagem JPG válida.'
  );
});

test('rejects forged JPEG content', async () => {
  const forgedJpeg = new Blob(['not an image'], { type: 'image/jpeg' });

  assert.equal(await validateAvatarFile(forgedJpeg), 'Envie uma imagem JPG válida.');
});

test('rejects avatars larger than five megabytes', async () => {
  const file = new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: 'image/jpeg' });

  assert.equal(await validateAvatarFile(file), 'Imagem muito grande (máximo 5MB).');
});