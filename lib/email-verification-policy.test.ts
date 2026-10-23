import assert from 'node:assert/strict'
import test from 'node:test'
import {
  EMAIL_VERIFICATION_REQUIRED_SINCE,
  requiresEmailVerification,
  verificationIdentifier,
} from './email-verification-policy'

const after = new Date(EMAIL_VERIFICATION_REQUIRED_SINCE.getTime() + 1000)
const before = new Date(EMAIL_VERIFICATION_REQUIRED_SINCE.getTime() - 1000)

test('new unconfirmed accounts must confirm the e-mail before signing in', () => {
  assert.equal(requiresEmailVerification({ emailVerified: null, createdAt: after }), true)
})

test('confirmed accounts sign in normally', () => {
  assert.equal(requiresEmailVerification({ emailVerified: new Date(), createdAt: after }), false)
})

test('accounts created before confirmation was introduced keep signing in', () => {
  assert.equal(requiresEmailVerification({ emailVerified: null, createdAt: before }), false)
})

test('verification tokens are keyed by the normalized e-mail', () => {
  assert.equal(verificationIdentifier('  Ana@Exemplo.COM '), 'verify:ana@exemplo.com')
})
