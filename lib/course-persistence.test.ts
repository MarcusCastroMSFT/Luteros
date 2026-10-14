import assert from 'node:assert/strict'
import test from 'node:test'
import * as schema from './db/schema'
import { createNeonHttpMock } from './neon-http-test-utils'
import {
  createCourseWithInstructors,
  reorderCourseLessons,
  updateCourseWithInstructors,
} from './course-persistence'

const COURSE_ID = '550e8400-e29b-41d4-a716-446655440000'
const COURSE = {
  id: COURSE_ID,
  title: 'Curso atualizado',
  slug: 'curso-atualizado',
  description: 'Descrição do curso',
  level: 'BEGINNER' as const,
  category: 'Educação Sexual',
  instructorId: 'primary',
}

function createMockDatabase(context: Parameters<typeof createNeonHttpMock>[0], fail = false) {
  return createNeonHttpMock(context, {
    fail,
    returning: { table: schema.courses, values: { id: COURSE_ID, title: COURSE.title } },
  })
}

test('reproduces the unsupported interactive transaction error without database access', async (context) => {
  const { database, requests } = createMockDatabase(context)
  await assert.rejects(database.transaction(async () => []), /No transactions support in neon-http driver/)
  assert.equal(requests.length, 0)
})

test('updates the course and replaces ordered participants in one HTTP transaction', async (context) => {
  const { database, requests } = createMockDatabase(context)
  const [course] = await updateCourseWithInstructors(database, COURSE_ID, COURSE, ['primary', 'guest-a', 'guest-b'])
  assert.equal(course.id, COURSE_ID)
  assert.equal(course.title, COURSE.title)
  assert.equal(requests.length, 1)
  const [update, remove, insert] = requests[0]
  assert.match(update.query, /^update "courses"/)
  assert.match(remove.query, /^delete from "course_instructors"/)
  assert.deepEqual(remove.params, [COURSE_ID])
  assert.match(insert.query, /^insert into "course_instructors"/)
  assert.deepEqual(insert.params, [COURSE_ID, 'primary', '0', COURSE_ID, 'guest-a', '1', COURSE_ID, 'guest-b', '2'])
})

test('removes special participants while retaining the primary instructor', async (context) => {
  const { database, requests } = createMockDatabase(context)
  await updateCourseWithInstructors(database, COURSE_ID, COURSE, ['primary'])
  assert.deepEqual(requests[0][2].params, [COURSE_ID, 'primary', '0'])
})

test('leaves instructor assignments untouched when the actor cannot change them', async (context) => {
  const { database, requests } = createMockDatabase(context)
  await updateCourseWithInstructors(database, COURSE_ID, COURSE, null)
  assert.equal(requests.length, 1)
  assert.equal(requests[0].length, 1)
  assert.match(requests[0][0].query, /^update "courses"/)
})

test('creates a course and its participants in one HTTP transaction', async (context) => {
  const { database, requests } = createMockDatabase(context)
  const [course] = await createCourseWithInstructors(database, COURSE, ['primary', 'guest-a'])
  assert.equal(course.id, COURSE_ID)
  assert.equal(requests.length, 1)
  assert.equal(requests[0].length, 2)
  assert.match(requests[0][0].query, /^insert into "courses"/)
  assert.match(requests[0][1].query, /^insert into "course_instructors"/)
  assert.deepEqual(requests[0][1].params, [COURSE_ID, 'primary', '0', COURSE_ID, 'guest-a', '1'])
})

test('propagates batch failures instead of reporting a successful course update', async (context) => {
  const { database, requests } = createMockDatabase(context, true)
  await assert.rejects(
    updateCourseWithInstructors(database, COURSE_ID, COURSE, ['primary', 'invalid-guest']),
    /Simulated constraint violation/,
  )
  assert.equal(requests.length, 1)
  assert.equal(requests[0].length, 3)
})

test('reorders lessons with temporary then final positions in one HTTP transaction', async (context) => {
  const lessonIds = [
    '770e8400-e29b-41d4-a716-446655440001',
    '770e8400-e29b-41d4-a716-446655440002',
  ]
  const { database, requests } = createMockDatabase(context)
  await reorderCourseLessons(database, lessonIds)
  assert.equal(requests.length, 1)
  const [temporary, final] = requests[0]
  assert.match(temporary.query, /^update "lessons"/)
  assert.deepEqual(temporary.params.filter((param) => typeof param === 'number' || /^-?\d+$/.test(String(param))), ['-1', '-2'])
  assert.deepEqual(final.params.filter((param) => /^\d+$/.test(String(param))), ['0', '1'])
  assert.ok(lessonIds.every((id) => temporary.params.includes(id) && final.params.includes(id)))
})

test('propagates lesson reorder failures instead of reporting success', async (context) => {
  const { database } = createMockDatabase(context, true)
  await assert.rejects(reorderCourseLessons(database, ['770e8400-e29b-41d4-a716-446655440001']), /Simulated constraint violation/)
})
