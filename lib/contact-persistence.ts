import { eq, sql } from 'drizzle-orm'
import type { db } from './db'
import { contactMessages } from './db/schema'
import type { ContactSubmission } from './contact'

export async function saveContactMessage(database: typeof db, input: ContactSubmission): Promise<'created' | 'duplicate' | 'limited' | 'conflict'> {
  // The transaction lock makes the per-email quota consistent across server instances.
  const [, inserted] = await database.batch([
    database.execute(sql`select pg_advisory_xact_lock(hashtext(${input.email}))`),
    database.execute<{ id: string }>(sql`
      insert into ${contactMessages} ("id", "name", "email", "phone", "reason", "subject", "message")
      select ${input.submissionId}::uuid, ${input.name}, ${input.email},
        ${input.phone || null}, ${input.reason}, ${input.subject || null}, ${input.message}
      where (
        select count(*) from ${contactMessages}
        where "email" = ${input.email} and "createdAt" > now() - interval '1 hour'
      ) < 5
      on conflict ("id") do nothing
      returning "id"
    `),
  ])
  if (inserted.rows.length) return 'created'

  const [existing] = await database.select().from(contactMessages)
    .where(eq(contactMessages.id, input.submissionId)).limit(1)
  if (!existing) return 'limited'
  return existing.name === input.name && existing.email === input.email &&
    existing.phone === (input.phone || null) && existing.reason === input.reason &&
    existing.subject === (input.subject || null) && existing.message === input.message
    ? 'duplicate'
    : 'conflict'
}
