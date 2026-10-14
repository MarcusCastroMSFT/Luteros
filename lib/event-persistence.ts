import { eq } from 'drizzle-orm'
import type { db } from './db'
import { eventSpeakers, events } from './db/schema'

type EventDatabase = typeof db
type EventChanges = Partial<typeof events.$inferInsert>
type NewEventSpeaker = typeof eventSpeakers.$inferInsert

// Pass `speakers` as undefined to leave the current speakers untouched.
export async function updateEventWithSpeakers(
  database: EventDatabase,
  eventId: string,
  changes: EventChanges,
  speakers: NewEventSpeaker[] | undefined,
) {
  const update = database.update(events).set(changes).where(eq(events.id, eventId)).returning()
  // Neon HTTP batches run atomically; interactive transaction callbacks are unsupported.
  if (speakers === undefined) {
    const [updatedEvents] = await database.batch([update])
    return updatedEvents
  }

  const removeSpeakers = database.delete(eventSpeakers).where(eq(eventSpeakers.eventId, eventId))
  const [updatedEvents] = speakers.length > 0
    ? await database.batch([update, removeSpeakers, database.insert(eventSpeakers).values(speakers)])
    : await database.batch([update, removeSpeakers])
  return updatedEvents
}
