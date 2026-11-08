import assert from 'node:assert/strict'
import test from 'node:test'
import { MIN_CHARGE_AMOUNT, isBelowMinimumCharge } from './course-pricing'

test('Asaas minimum charge is R$ 5,00', () => {
  assert.equal(MIN_CHARGE_AMOUNT, 5)
})

test('a paid course charging less than R$ 5,00 is below the minimum', () => {
  assert.equal(isBelowMinimumCharge({ price: '2.00', discountPrice: '1.00', isFree: false }), true)
  assert.equal(isBelowMinimumCharge({ price: '4.99', discountPrice: null, isFree: false }), true)
})

test('the discount price is what gets charged, so it decides the minimum', () => {
  assert.equal(isBelowMinimumCharge({ price: '147.50', discountPrice: '1.00', isFree: false }), true)
  assert.equal(isBelowMinimumCharge({ price: '2.00', discountPrice: '5.00', isFree: false }), false)
})

test('R$ 5,00 or more, free and zero-priced courses are accepted', () => {
  assert.equal(isBelowMinimumCharge({ price: '5.00', discountPrice: null, isFree: false }), false)
  assert.equal(isBelowMinimumCharge({ price: '147.50', discountPrice: '169.50', isFree: false }), false)
  assert.equal(isBelowMinimumCharge({ price: '1.00', discountPrice: null, isFree: true }), false)
  assert.equal(isBelowMinimumCharge({ price: null, discountPrice: null, isFree: false }), false)
})
