import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidCnpj, isValidCpf, isValidCpfCnpj, normalizeCpfCnpj } from './cpf-cnpj';

test('normalizeCpfCnpj strips formatting', () => {
  assert.equal(normalizeCpfCnpj('529.982.247-25'), '52998224725');
});

test('validates CPF check digits', () => {
  assert.equal(isValidCpf('529.982.247-25'), true);
  assert.equal(isValidCpf('52998224726'), false);
  assert.equal(isValidCpf('111.111.111-11'), false);
  assert.equal(isValidCpf('123'), false);
});

test('validates CNPJ check digits', () => {
  assert.equal(isValidCnpj('11.222.333/0001-81'), true);
  assert.equal(isValidCnpj('11.222.333/0001-82'), false);
  assert.equal(isValidCnpj('00000000000000'), false);
});

test('isValidCpfCnpj dispatches on length', () => {
  assert.equal(isValidCpfCnpj('52998224725'), true);
  assert.equal(isValidCpfCnpj('11222333000181'), true);
  assert.equal(isValidCpfCnpj('1234567890'), false);
});
