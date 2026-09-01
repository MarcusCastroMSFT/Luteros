import assert from 'node:assert/strict';
import test from 'node:test';
import { readAudioFileDuration, type AudioMetadataElement } from './audio-duration';

test('reads and rounds local audio metadata duration to whole seconds', async () => {
  let revokedUrl = '';
  const audio: AudioMetadataElement = {
    duration: 124.6,
    preload: '',
    src: '',
    onloadedmetadata: null,
    onerror: null,
    load() {
      queueMicrotask(() => this.onloadedmetadata?.(new Event('loadedmetadata')));
    },
  };

  const duration = await readAudioFileDuration({} as File, {
    createObjectURL: () => 'blob:test-audio',
    revokeObjectURL: (url) => {
      revokedUrl = url;
    },
    createAudioElement: () => audio,
  });

  assert.equal(duration, 125);
  assert.equal(audio.preload, 'metadata');
  assert.equal(revokedUrl, 'blob:test-audio');
});

test('rejects invalid audio duration and revokes the object URL', async () => {
  let revoked = false;
  const audio: AudioMetadataElement = {
    duration: Number.NaN,
    preload: '',
    src: '',
    onloadedmetadata: null,
    onerror: null,
    load() {
      queueMicrotask(() => this.onloadedmetadata?.(new Event('loadedmetadata')));
    },
  };

  await assert.rejects(
    readAudioFileDuration({} as File, {
      createObjectURL: () => 'blob:invalid-audio',
      revokeObjectURL: () => {
        revoked = true;
      },
      createAudioElement: () => audio,
    }),
    /duração do áudio/,
  );
  assert.equal(revoked, true);
});