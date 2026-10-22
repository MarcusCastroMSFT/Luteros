import assert from 'node:assert/strict'
import test from 'node:test'
import { getAuthRedirect, getPostLoginDestination } from './auth-redirect'

const course = '/courses/curso-teste-marcus'

test('returns the original course for a normal user using the reported login URL', () => {
  const url = new URL(`https://www.lutteros.com.br/login?redirect=${encodeURIComponent(course)}`)
  assert.equal(getPostLoginDestination(url.searchParams, 'USER'), course)
})

test('accepts both redirect parameter names for credentials, Google and registration', () => {
  for (const key of ['redirect', 'redirectTo']) {
    const params = new URLSearchParams({ [key]: course })
    assert.equal(getPostLoginDestination(params), course)
    assert.equal(getPostLoginDestination(params, 'USER'), course)
    assert.equal(getPostLoginDestination(params, 'ADMIN'), course)
    assert.equal(getPostLoginDestination(params, 'INSTRUCTOR'), course)
  }
})

test('preserves queries and fragments on internal return destinations', () => {
  const destination = '/courses/curso-teste-marcus?from=checkout&tab=lessons#conteudo'
  assert.equal(getAuthRedirect(new URLSearchParams({ redirect: destination })), destination)
})

test('preserves the existing redirectTo precedence if both parameters are supplied', () => {
  assert.equal(getAuthRedirect(new URLSearchParams({ redirectTo: '/profile', redirect: course })), '/profile')
})

test('preserves role-based defaults when no return destination is supplied', () => {
  const params = new URLSearchParams()
  for (const role of [undefined, 'USER', 'PROFESSIONAL']) {
    assert.equal(getPostLoginDestination(params, role), '/')
  }
  for (const role of ['ADMIN', 'INSTRUCTOR']) {
    assert.equal(getPostLoginDestination(params, role), '/admin')
  }
})

test('rejects external URLs, protocol-relative URLs, backslashes and control characters', () => {
  for (const destination of [
    '',
    'https://example.org',
    '//example.org',
    '///example.org',
    '/\\example.org',
    '/\n/example.org',
    '/\t/example.org',
    'javascript:alert(1)',
    'courses/example',
  ]) {
    for (const key of ['redirect', 'redirectTo']) {
      const params = new URLSearchParams({ [key]: destination })
      assert.equal(getAuthRedirect(params), null, destination)
      assert.equal(getPostLoginDestination(params, 'USER'), '/', destination)
    }
  }
})

test('uses a valid legacy destination if redirectTo is unsafe', () => {
  assert.equal(getAuthRedirect(new URLSearchParams({ redirectTo: '//example.org', redirect: course })), course)
})
