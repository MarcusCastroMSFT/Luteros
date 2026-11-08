import assert from 'node:assert/strict'
import test from 'node:test'
import { countCoursesPerInstructor } from './instructor-courses'

test('counts the distinct courses of each instructor', () => {
  const counts = countCoursesPerInstructor([
    { instructorId: 'a', courseId: 'c1' },
    { instructorId: 'a', courseId: 'c2' },
    { instructorId: 'b', courseId: 'c1' },
  ])
  assert.equal(counts.get('a'), 2)
  assert.equal(counts.get('b'), 1)
})

test('does not double count a course listed twice for the same instructor', () => {
  const counts = countCoursesPerInstructor([
    { instructorId: 'a', courseId: 'c1' },
    { instructorId: 'a', courseId: 'c1' },
  ])
  assert.equal(counts.get('a'), 1)
})

test('instructors without courses are absent from the map', () => {
  assert.equal(countCoursesPerInstructor([]).get('a'), undefined)
})
