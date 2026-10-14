import assert from 'node:assert/strict'
import test, { type TestContext } from 'node:test'
import { neon, neonConfig } from '@neondatabase/serverless'
import { getTableColumns } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './db/schema'
import { createCourseWithInstructors, updateCourseWithInstructors } from './course-persistence'

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

type HttpQuery = { query: string; params: unknown[] }

function createMockDatabase(context: TestContext, fail = false) {
  const requests: HttpQuery[][] = []
  const originalFetch = neonConfig.fetchFunction
  context.after(() => { neonConfig.fetchFunction = originalFetch })
  const mockFetch: typeof fetch = async (_input, init) => {
    const payload = JSON.parse(String(init?.body))
    assert.ok(Array.isArray(payload.queries), 'Writes must use a single transactional batch')
    requests.push(payload.queries)
    if (fail) {
      return new Response(JSON.stringify({ message: 'Instructor foreign key violation', code: '23503' }), { status: 400 })
    }
    const columns = Object.values(getTableColumns(schema.courses))
    return new Response(JSON.stringify({
      results: payload.queries.map((query: HttpQuery) => ({
        command: query.query.split(' ')[0].toUpperCase(),
        rowCount: 1,
        fields: query.query.includes('returning')
          ? columns.map((column) => ({ name: column.name, dataTypeID: 25 }))
          : [],
        rows: query.query.includes('returning')
          ? [columns.map((column) => column.name === 'id' ? COURSE_ID : column.name === 'title' ? COURSE.title : null)]
          : [],
      })),
    }), { status: 200 })
  }
  neonConfig.fetchFunction = mockFetch

  const database = drizzle(neon('postgresql://test:test@database.invalid/test'), { schema })
  return { database, requests }
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
    /Instructor foreign key violation/,
  )
  assert.equal(requests.length, 1)
  assert.equal(requests[0].length, 3)
})
