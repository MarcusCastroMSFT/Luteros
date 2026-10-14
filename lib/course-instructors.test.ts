import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeCourseInstructorIds,
  replaceCoursePrimaryInstructor,
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

test('selects a primary instructor without losing special participants', () => {
  assert.deepEqual(
    replaceCoursePrimaryInstructor(['primary', 'guest-a', 'guest-b'], 'new-primary'),
    ['new-primary', 'guest-a', 'guest-b'],
  );
});

test('promotes a special participant without duplicating them', () => {
  assert.deepEqual(
    replaceCoursePrimaryInstructor(['primary', 'guest-a', 'guest-b'], 'guest-b'),
    ['guest-b', 'guest-a'],
  );
});

test('preserves participants when the primary instructor is unchanged', () => {
  assert.deepEqual(
    replaceCoursePrimaryInstructor(['primary', 'guest'], 'primary'),
    ['primary', 'guest'],
  );
});

test('selects a primary instructor for a new course', () => {
  assert.deepEqual(replaceCoursePrimaryInstructor([], 'primary'), ['primary']);
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