import assert from 'node:assert/strict'
import test from 'node:test'
import { contactFormSchema, contactListQuerySchema, contactSubmissionSchema } from './contact'

const form = {
  name: '  Pessoa de Teste  ',
  email: '  TESTE@EXAMPLE.ORG ',
  phone: '(16) 99999-8888',
  reason: 'courses',
  subject: ' Dúvida sobre o curso ',
  message: 'Gostaria de saber mais sobre o curso.\nObrigado!',
}

test('normalizes contact data without losing accents or message line breaks', () => {
  const result = contactFormSchema.parse(form)
  assert.equal(result.name, 'Pessoa de Teste')
  assert.equal(result.email, 'teste@example.org')
  assert.equal(result.phone, '16999998888')
  assert.equal(result.subject, 'Dúvida sobre o curso')
  assert.equal(result.message, form.message)
})

test('allows optional phone and subject, but rejects incomplete or oversized messages', () => {
  assert.ok(contactFormSchema.safeParse({ ...form, phone: '', subject: '' }).success)
  for (const changes of [
    { name: ' ' }, { email: 'invalid' }, { phone: '(16) 9' }, { phone: 'invalid' },
    { reason: 'unknown' }, { message: 'short' },
    { subject: 'x'.repeat(201) }, { message: 'x'.repeat(2001) },
  ]) {
    assert.equal(contactFormSchema.safeParse({ ...form, ...changes }).success, false)
  }
})

test('requires a valid idempotency key and rejects a filled honeypot', () => {
  const input = { ...form, submissionId: '1d8405a4-ec0f-42dd-a2bd-f4c562d83eac' }
  assert.ok(contactSubmissionSchema.safeParse(input).success)
  assert.equal(contactSubmissionSchema.safeParse(form).success, false)
  assert.equal(contactSubmissionSchema.safeParse({ ...input, submissionId: 'invalid' }).success, false)
  assert.equal(contactSubmissionSchema.safeParse({ ...input, website: 'spam' }).success, false)
})

test('bounds admin pagination and search inputs', () => {
  assert.deepEqual(contactListQuerySchema.parse({}), { page: 0, pageSize: 10, search: '' })
  assert.equal(contactListQuerySchema.parse({ page: '2', pageSize: '20' }).page, 2)
  for (const query of [{ page: '-1' }, { page: 'abc' }, { pageSize: '0' }, { pageSize: '101' }, { search: 'x'.repeat(201) }]) {
    assert.equal(contactListQuerySchema.safeParse(query).success, false)
  }
})
