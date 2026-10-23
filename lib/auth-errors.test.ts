import assert from 'node:assert/strict'
import test from 'node:test'
import { translateAuthError } from './auth-errors'

test('explains how to continue when the e-mail already has a password account', () => {
  const message = translateAuthError('OAuthAccountNotLinked')
  assert.match(message, /Já existe uma conta com este e-mail/)
  assert.match(message, /senha/)
})

test('maps common Auth.js codes to Portuguese messages', () => {
  assert.equal(translateAuthError('CredentialsSignin'), 'E-mail ou senha incorretos.')
  assert.match(translateAuthError('AccessDenied'), /autorizado/)
  assert.match(translateAuthError('OAuthCallback'), /Google/)
})

test('falls back to a message that matches the provider', () => {
  assert.match(translateAuthError('Unknown', 'google'), /Google/)
  assert.match(translateAuthError(undefined, 'credentials'), /Verifique seus dados/)
  assert.match(translateAuthError(null), /Falha ao entrar/)
})
