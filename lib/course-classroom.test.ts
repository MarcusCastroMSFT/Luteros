import assert from 'node:assert/strict';
import test from 'node:test';
import type { Lesson } from '@/types/course';
import { getCurrentCourseLesson, getLessonPlaybackKey, getLessonPlaybackUrl } from './course-classroom';
import { resolveVideoSource } from './video';

function lesson(id: string, overrides: Partial<Lesson> = {}): Lesson {
  return {
    id, title: id, description: '', type: 'article', duration: '1min',
    order: 0, content: '<p>Original</p>', ...overrides,
  };
}

test('selected lessons use the latest content, references and media rather than a saved object', () => {
  const original = lesson('selected');
  const updated = lesson('selected', {
    title: 'Updated', content: '<p>Updated</p>', references: '<p>New source</p>',
    type: 'video', videoUrl: 'https://youtu.be/new-video',
  });
  assert.equal(getCurrentCourseLesson([original], 'selected'), original);
  assert.equal(getCurrentCourseLesson([lesson('first'), updated], 'selected'), updated);
});

test('selection survives additions and reordering; deleted or unpublished lessons fall back', () => {
  const selected = lesson('selected');
  const added = lesson('added');
  assert.equal(getCurrentCourseLesson([added, selected], 'selected'), selected);
  assert.equal(getCurrentCourseLesson([selected, added], 'selected'), selected);
  assert.equal(getCurrentCourseLesson([added], 'selected'), added);
  assert.equal(getCurrentCourseLesson([added], 'unknown'), added);
  assert.equal(getCurrentCourseLesson([added]), added);
  assert.equal(getCurrentCourseLesson([], 'selected'), null);
});

test('Azure playback URLs stay compatible with the player and do not expose blob names', () => {
  const courseId = '550e8400-e29b-41d4-a716-446655440000';
  const azureLesson = {
    id: '660e8400-e29b-41d4-a716-446655440001',
    videoProvider: 'azure', videoUrl: 'courses/course/old video.mp4',
  };
  const url = getLessonPlaybackUrl(courseId, azureLesson);
  assert.equal(url, `/api/courses/${courseId}/lessons/${azureLesson.id}/media`);
  assert.deepEqual(resolveVideoSource(url), { kind: 'file', src: url });
  assert.equal(getLessonPlaybackUrl(courseId, { ...azureLesson, videoUrl: null }), undefined);
  assert.equal(getLessonPlaybackUrl('course', {
    ...azureLesson, videoProvider: 'youtube', videoUrl: 'https://youtu.be/example',
  }), 'https://youtu.be/example');
});

test('media changes reset the player, while text edits and reordering preserve playback', () => {
  const original = lesson('video', {
    type: 'video', videoUrl: '/api/courses/course/lessons/video/media', mediaVersion: 'old.mp4',
  });
  const key = getLessonPlaybackKey(original);
  assert.equal(getLessonPlaybackKey({ ...original, title: 'Edited', order: 10 }), key);
  assert.notEqual(getLessonPlaybackKey({ ...original, mediaVersion: 'new.mp4' }), key);
  assert.notEqual(getLessonPlaybackKey({ ...original, type: 'audio' }), key);
  assert.notEqual(getLessonPlaybackKey({ ...original, id: 'another' }), key);
  assert.notEqual(getLessonPlaybackKey(lesson('video', { videoUrl: 'new-url' })), key);
});
