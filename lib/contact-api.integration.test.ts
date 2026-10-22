import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import { encode } from 'next-auth/jwt'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq } from 'drizzle-orm'
import * as schema from './db/schema'

const baseUrl = process.env.CONTACT_TEST_BASE_URL
const databaseUrl = process.env.CONTACT_TEST_DATABASE_URL

test('contact API persists messages and restricts listing and detail pages to ADMIN', {
  skip: !baseUrl || !databaseUrl,
}, async () => {
  assert.ok(baseUrl!.startsWith('http://localhost:'), 'Integration server must be local')
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  assert.ok(secret, 'An auth secret is required for the local integration session')
  const database = drizzle(neon(databaseUrl!), { schema })
  const input = {
    submissionId: randomUUID(),
    name: 'Pessoa de Teste',
    email: `contact-api-${randomUUID()}@example.org`,
    phone: '(16) 99999-8888',
    reason: 'courses',
    subject: 'Teste API contato',
    message: 'Mensagem fictícia.\n<script>window.contactInjected = true</script>',
    website: '',
  }
  const post = (body: unknown) => fetch(`${baseUrl}/api/contact`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  const cookie = async (role: string) => `authjs.session-token=${await encode({
    token: { sub: 'contact-test', id: 'contact-test', role, name: 'Teste', email: 'test@example.org' },
    secret, salt: 'authjs.session-token', maxAge: 300,
  })}`
  try {
    assert.equal((await post({ ...input, message: 'short' })).status, 400)
    assert.equal((await post({ ...input, website: 'spam' })).status, 400)
    assert.equal((await post({ ...input, message: 'x'.repeat(17000) })).status, 413)
    assert.equal((await fetch(`${baseUrl}/api/contact`, { method: 'POST', body: '{invalid' })).status, 400)
    assert.equal((await post(input)).status, 201)
    assert.equal((await post(input)).status, 200)
    assert.equal((await fetch(`${baseUrl}/api/admin/contact`)).status, 401)
    for (const role of ['USER', 'PROFESSIONAL', 'INSTRUCTOR']) {
      const headers = { Cookie: await cookie(role) }
      assert.equal((await fetch(`${baseUrl}/api/admin/contact`, { headers })).status, 403, role)
      const detail = await fetch(`${baseUrl}/admin/contact/${input.submissionId}`, { headers, redirect: 'manual' })
      const html = await detail.text()
      assert.ok(
        [307, 308].includes(detail.status) || (detail.status === 200 && /NEXT_REDIRECT|__next-page-redirect/.test(html)),
        `Detail must redirect ${role}, including streamed responses`,
      )
      assert.ok(!html.includes(input.email), `Detail must not disclose sender data to ${role}`)
      assert.ok(!html.includes('Mensagem fictícia.'), `Detail must not disclose the message to ${role}`)
    }
    const headers = { Cookie: await cookie('ADMIN') }
    assert.equal((await fetch(`${baseUrl}/api/admin/contact?pageSize=101`, { headers })).status, 400)
    const response = await fetch(`${baseUrl}/api/admin/contact?search=${encodeURIComponent(input.email)}&pageSize=1`, { headers })
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
    const list = await response.json()
    assert.equal(list.totalCount, 1)
    assert.equal(list.pageCount, 1)
    assert.equal(list.data[0].id, input.submissionId)
    assert.equal(list.data[0].message, undefined)
    assert.equal(list.data[0].phone, undefined)
    const nextPage = await fetch(`${baseUrl}/api/admin/contact?search=${encodeURIComponent(input.email)}&pageSize=1&page=1`, { headers })
    assert.equal((await nextPage.json()).data.length, 0)
    const literalSearch = await fetch(`${baseUrl}/api/admin/contact?search=%25`, { headers })
    assert.equal((await literalSearch.json()).totalCount, 0)
    const detail = await fetch(`${baseUrl}/admin/contact/${input.submissionId}`, { headers })
    assert.equal(detail.status, 200)
    const html = await detail.text()
    assert.ok(html.includes('Mensagem fictícia.'))
    assert.ok(html.includes('&lt;script&gt;'))
    assert.ok(!html.includes('<script>window.contactInjected = true</script>'))
  } finally {
    await database.delete(schema.contactMessages).where(eq(schema.contactMessages.email, input.email))
  }
})
