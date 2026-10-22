import assert from 'node:assert/strict';
import test from 'node:test';
import { formatBrazilianPhone, isValidBrazilianPhone } from './phone';

test('formats Brazilian mobile and landline numbers', () => {
  assert.equal(formatBrazilianPhone('16999998888'), '(16) 99999-8888');
  assert.equal(formatBrazilianPhone('1633334444'), '(16) 3333-4444');
});

test('formats progressively without trailing separators', () => {
  const cases = [
    ['', ''],
    ['1', '(1'],
    ['16', '(16'],
    ['169', '(16) 9'],
    ['169999', '(16) 9999'],
    ['1699998', '(16) 9999-8'],
  ];
  for (const [input, expected] of cases) {
    assert.equal(formatBrazilianPhone(input), expected);
  }
});

test('handles pasted formatting and the Brazilian country code', () => {
  assert.equal(formatBrazilianPhone('(16) 99999-8888'), '(16) 99999-8888');
  assert.equal(formatBrazilianPhone('+55 (16) 99999-8888'), '(16) 99999-8888');
  assert.equal(formatBrazilianPhone('+55 16 3333 4444'), '(16) 3333-4444');
  assert.equal(formatBrazilianPhone('abc'), '');
  assert.equal(formatBrazilianPhone('16999998888123'), '(16) 99999-8888');
});

test('accepts an empty optional phone and complete numbers, not partial masks', () => {
  for (const value of ['', '(16) 99999-8888', '(16) 3333-4444']) {
    assert.equal(isValidBrazilianPhone(value), true, value);
  }
  for (const value of ['(', '(16', '(16) 9999-8', '(16) 99999-88', '169999988881']) {
    assert.equal(isValidBrazilianPhone(value), false, value);
  }
});
