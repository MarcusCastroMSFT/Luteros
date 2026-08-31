import assert from 'node:assert/strict';
import test from 'node:test';
import type { AuthUser } from './auth-helpers';
import { canManageCourse, requireCourseManager } from './course-access';

function user(role: AuthUser['role'], id: string): AuthUser {
  return {
    id,
    role,
    email: null,
    name: null,
    image: null,
    displayName: null,
  };
}

const admin = user('ADMIN', 'admin-user');
const instructor = user('INSTRUCTOR', 'instructor-user');
const student = user('USER', 'student-user');
const professional = user('PROFESSIONAL', 'professional-user');

test('allows administrators to manage any course', () => {
  assert.equal(canManageCourse(admin, 'other-user'), true);
  assert.equal(requireCourseManager(admin, 'other-user'), null);
});

test('allows an instructor to manage only their own course', () => {
  assert.equal(canManageCourse(instructor, instructor.id), true);
  assert.equal(canManageCourse(instructor, 'other-user'), false);
  assert.equal(requireCourseManager(instructor, instructor.id), null);
});

test('denies students and professionals even when their ID matches', async () => {
  for (const deniedUser of [student, professional]) {
    assert.equal(canManageCourse(deniedUser, deniedUser.id), false);
    const response = requireCourseManager(deniedUser, deniedUser.id);
    assert.equal(response?.status, 403);
    assert.deepEqual(await response?.json(), {
      success: false,
      error: 'Forbidden: You cannot manage this course',
    });
  }
});

test('returns a forbidden response for an instructor who does not own the course', async () => {
  const response = requireCourseManager(instructor, 'other-user');
  assert.equal(response?.status, 403);
  assert.deepEqual(await response?.json(), {
    success: false,
    error: 'Forbidden: You cannot manage this course',
  });
});
