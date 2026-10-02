import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeCourseInstructorIds,
  resolveCourseInstructorIdsForActor,
} from './course-instructors';

test('normalizes instructor IDs while preserving selection order', () => {
  assert.deepEqual(
    normalizeCourseInstructorIds(
      [' primary-instructor ', 'co-instructor', 'primary-instructor', '', null],
      'fallback-instructor',
    ),
    ['primary-instructor', 'co-instructor'],
  );
});

test('uses the fallback instructor when the selection is empty', () => {
  assert.deepEqual(
    normalizeCourseInstructorIds([], 'fallback-instructor'),
    ['fallback-instructor'],
  );
});

test('limits instructor assignments to the actor when assignment is not allowed', () => {
  assert.deepEqual(
    resolveCourseInstructorIdsForActor(
      ['other-instructor', 'another-instructor'],
      'current-instructor',
      false,
    ),
    ['current-instructor'],
  );
});