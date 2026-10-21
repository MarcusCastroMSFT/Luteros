import assert from 'node:assert/strict';
import test from 'node:test';
import { hasPaidAccess, mapAsaasStatus } from './payment-status';
import { getCourseChargeAmount } from './course-pricing';

test('mapAsaasStatus grants access only for captured payments', () => {
  assert.equal(mapAsaasStatus('CONFIRMED'), 'COMPLETED');
  assert.equal(mapAsaasStatus('RECEIVED'), 'COMPLETED');
  assert.equal(mapAsaasStatus('RECEIVED_IN_CASH'), 'COMPLETED');
  assert.equal(mapAsaasStatus('PENDING'), 'PENDING');
  assert.equal(mapAsaasStatus('AWAITING_RISK_ANALYSIS'), 'PENDING');
  assert.equal(mapAsaasStatus('OVERDUE'), 'OVERDUE');
  assert.equal(mapAsaasStatus('REFUNDED'), 'REFUNDED');
  assert.equal(mapAsaasStatus('CHARGEBACK_REQUESTED'), 'REFUNDED');
  assert.equal(mapAsaasStatus(undefined), 'PENDING');
});

test('hasPaidAccess blocks unpaid, overdue and refunded enrollments', () => {
  assert.equal(hasPaidAccess('COMPLETED'), true);
  assert.equal(hasPaidAccess(null), true);
  assert.equal(hasPaidAccess('PENDING'), false);
  assert.equal(hasPaidAccess('OVERDUE'), false);
  assert.equal(hasPaidAccess('REFUNDED'), false);
  assert.equal(hasPaidAccess('CANCELLED'), false);
});

test('getCourseChargeAmount uses the discount price like the public page', () => {
  assert.equal(getCourseChargeAmount({ price: '169.00', discountPrice: '149.90', isFree: false }), 149.9);
  assert.equal(getCourseChargeAmount({ price: '159.50', discountPrice: null, isFree: false }), 159.5);
  assert.equal(getCourseChargeAmount({ price: '99.00', discountPrice: '0.00', isFree: false }), 0);
  assert.equal(getCourseChargeAmount({ price: '99.00', discountPrice: null, isFree: true }), 0);
  assert.equal(getCourseChargeAmount({ price: null, discountPrice: null, isFree: false }), 0);
});
