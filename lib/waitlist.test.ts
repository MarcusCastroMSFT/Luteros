import assert from 'node:assert/strict'
import test from 'node:test'
import { waitlistAudienceLabel, waitlistListQuerySchema, waitlistToCsv } from './waitlist'

test('labels the audience chosen on the waitlist form', () => {
  assert.equal(waitlistAudienceLabel('doctors'), 'Profissional de saúde')
  assert.equal(waitlistAudienceLabel('general'), 'Outro interesse')
  assert.equal(waitlistAudienceLabel(null), 'Não informado')
  assert.equal(waitlistAudienceLabel('anything'), 'Não informado')
})

test('list query defaults to the first page and rejects oversized pages', () => {
  assert.deepEqual(waitlistListQuerySchema.parse({}), { page: 0, pageSize: 10, search: '' })
  assert.equal(waitlistListQuerySchema.safeParse({ pageSize: 500 }).success, false)
})

test('csv export keeps accents, escapes quotes and neutralizes spreadsheet formulas', () => {
  const csv = waitlistToCsv([
    { email: 'ana@exemplo.com', audience: 'doctors', source: 'waitlist-page', createdAt: new Date('2026-10-23T15:00:00Z') },
    { email: '=cmd|x@exemplo.com', audience: null, source: 'say "hi"', createdAt: new Date('2026-10-23T15:00:00Z') },
  ])
  assert.ok(csv.startsWith('\uFEFF"E-mail";"Perfil"'))
  assert.match(csv, /"ana@exemplo\.com";"Profissional de saúde";"waitlist-page";"23\/10\/2026/)
  assert.ok(csv.includes('"\'=cmd|x@exemplo.com";"Não informado";"say ""hi"""'))
  assert.equal(csv.split('\r\n').length, 4)
})
