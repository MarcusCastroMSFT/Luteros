import assert from 'node:assert/strict'
import test from 'node:test'
import * as schema from './db/schema'
import { createNeonHttpMock } from './neon-http-test-utils'
import { updateEventWithSpeakers } from './event-persistence'

const EVENT_ID = '660e8400-e29b-41d4-a716-446655440001'
const CHANGES = { title: 'Evento atualizado', slug: 'evento-atualizado', location: 'Online' }
const SPEAKERS = [
  { eventId: EVENT_ID, name: 'Ana', order: 1 },
  { eventId: EVENT_ID, name: 'Bruno', order: 2 },
]

function createMockDatabase(context: Parameters<typeof createNeonHttpMock>[0], fail = false) {
  return createNeonHttpMock(context, {
    fail,
    returning: { table: schema.events, values: { id: EVENT_ID, title: CHANGES.title, slug: CHANGES.slug } },
  })
}

test('updates the event and replaces speakers in one HTTP transaction', async (context) => {
  const { database, requests } = createMockDatabase(context)
  const [event] = await updateEventWithSpeakers(database, EVENT_ID, CHANGES, SPEAKERS)
  assert.equal(event.id, EVENT_ID)
  assert.equal(event.title, CHANGES.title)
  assert.equal(requests.length, 1)
  const [update, remove, insert] = requests[0]
  assert.match(update.query, /^update "events"/)
  assert.match(remove.query, /^delete from "event_speakers"/)
  assert.deepEqual(remove.params, [EVENT_ID])
  assert.match(insert.query, /^insert into "event_speakers"/)
  assert.ok(insert.params.includes('Ana') && insert.params.includes('Bruno'))
})

test('clears all speakers without inserting an empty row set', async (context) => {
  const { database, requests } = createMockDatabase(context)
  await updateEventWithSpeakers(database, EVENT_ID, CHANGES, [])
  assert.equal(requests.length, 1)
  assert.equal(requests[0].length, 2)
  assert.match(requests[0][1].query, /^delete from "event_speakers"/)
})

test('keeps speakers untouched when the request does not include them', async (context) => {
  const { database, requests } = createMockDatabase(context)
  await updateEventWithSpeakers(database, EVENT_ID, CHANGES, undefined)
  assert.equal(requests.length, 1)
  assert.equal(requests[0].length, 1)
  assert.match(requests[0][0].query, /^update "events"/)
})

test('propagates batch failures instead of reporting a successful event update', async (context) => {
  const { database, requests } = createMockDatabase(context, true)
  await assert.rejects(
    updateEventWithSpeakers(database, EVENT_ID, CHANGES, SPEAKERS),
    /Simulated constraint violation/,
  )
  assert.equal(requests.length, 1)
})
