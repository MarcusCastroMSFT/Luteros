import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import * as schema from './db/schema'
import { saveContactMessage } from './contact-persistence'
import type { ContactSubmission } from './contact'

const connectionString = process.env.CONTACT_TEST_DATABASE_URL

test('persists contacts, deduplicates retries, and enforces a concurrent per-email quota', {
  skip: !connectionString,
}, async () => {
  const database = drizzle(neon(connectionString!), { schema })
  const email = `contact-integration-${randomUUID()}@example.org`
  const input: ContactSubmission = {
    submissionId: randomUUID(),
    name: 'Teste de persistência',
    email,
    phone: '16999998888',
    reason: 'support',
    subject: 'Teste isolado',
    message: 'Mensagem de teste com acentos.\nSegunda linha.',
    website: '',
  }
  try {
    assert.equal(await saveContactMessage(database, input), 'created')
    const [stored] = await database.select().from(schema.contactMessages).where(eq(schema.contactMessages.id, input.submissionId))
    assert.equal(stored.message, input.message)
    assert.equal(stored.phone, input.phone)
    assert.equal(await saveContactMessage(database, input), 'duplicate')
    assert.equal(await saveContactMessage(database, { ...input, message: 'Mensagem diferente para a mesma chave.' }), 'conflict')
    const results = await Promise.all(Array.from({ length: 6 }, () =>
      saveContactMessage(database, { ...input, submissionId: randomUUID(), phone: '', subject: '' }),
    ))
    assert.equal(results.filter(result => result === 'created').length, 4)
    assert.equal(results.filter(result => result === 'limited').length, 2)
    assert.equal(await saveContactMessage(database, input), 'duplicate')
    const records = await database.select().from(schema.contactMessages).where(eq(schema.contactMessages.email, email))
    assert.equal(records.length, 5)
    assert.ok(records.some(record => record.phone === null && record.subject === null))
  } finally {
    await database.delete(schema.contactMessages).where(eq(schema.contactMessages.email, email))
  }
})
