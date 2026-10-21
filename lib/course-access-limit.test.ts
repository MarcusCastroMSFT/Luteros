import assert from 'node:assert/strict';
import test from 'node:test';
import { getClientIp, normalizeIp } from './client-ip';
import { evaluateIpAccess, parseMaxDistinctIps } from './course-access-limit';

test('normalizeIp strips ports and brackets', () => {
  assert.equal(normalizeIp('200.10.20.30'), '200.10.20.30');
  assert.equal(normalizeIp('200.10.20.30:54321'), '200.10.20.30');
  assert.equal(normalizeIp('::ffff:200.10.20.30'), '200.10.20.30');
  assert.equal(normalizeIp('[2001:db8::1]:443'), '2001:0db8:0000:0000::/64');
  assert.equal(normalizeIp('not-an-ip'), null);
  assert.equal(normalizeIp(null), null);
});

test('normalizeIp groups IPv6 addresses by /64 prefix', () => {
  assert.equal(
    normalizeIp('2804:14d:1:2:aaaa:bbbb:cccc:dddd'),
    normalizeIp('2804:14d:1:2:1111:2222:3333:4444'),
  );
  assert.notEqual(normalizeIp('2804:14d:1:2::1'), normalizeIp('2804:14d:1:3::1'));
});

test('getClientIp prefers x-real-ip and falls back to the first forwarded hop', () => {
  assert.equal(getClientIp(new Headers({ 'x-real-ip': '1.2.3.4', 'x-forwarded-for': '9.9.9.9' })), '1.2.3.4');
  assert.equal(getClientIp(new Headers({ 'x-forwarded-for': '5.6.7.8, 10.0.0.1' })), '5.6.7.8');
  assert.equal(getClientIp(new Headers()), null);
});

const now = new Date('2026-10-21T12:00:00Z');
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);

test('a known IP is always allowed', () => {
  const decision = evaluateIpAccess({
    knownIps: [{ ipAddress: 'a', lastSeenAt: hoursAgo(1) }, { ipAddress: 'b', lastSeenAt: hoursAgo(1) }, { ipAddress: 'c', lastSeenAt: hoursAgo(1) }],
    currentIp: 'b',
    now,
    maxDistinctIps: 3,
  });
  assert.equal(decision.allowed, true);
});

test('a new IP is blocked once the budget is used inside the window', () => {
  const knownIps = ['a', 'b', 'c'].map((ipAddress) => ({ ipAddress, lastSeenAt: hoursAgo(2) }));
  assert.equal(evaluateIpAccess({ knownIps, currentIp: 'd', now, maxDistinctIps: 3 }).allowed, false);
  assert.equal(evaluateIpAccess({ knownIps, currentIp: 'd', now, maxDistinctIps: 4 }).allowed, true);
});

test('IPs outside the rolling window stop counting', () => {
  const knownIps = ['a', 'b', 'c'].map((ipAddress) => ({ ipAddress, lastSeenAt: hoursAgo(30) }));
  assert.equal(evaluateIpAccess({ knownIps, currentIp: 'd', now, maxDistinctIps: 3 }).allowed, true);
});

test('a limit of zero disables the check', () => {
  const knownIps = ['a', 'b', 'c', 'd'].map((ipAddress) => ({ ipAddress, lastSeenAt: hoursAgo(1) }));
  assert.equal(evaluateIpAccess({ knownIps, currentIp: 'e', now, maxDistinctIps: 0 }).allowed, true);
});

test('parseMaxDistinctIps falls back to the default on bad input', () => {
  assert.equal(parseMaxDistinctIps(undefined), 3);
  assert.equal(parseMaxDistinctIps('5'), 5);
  assert.equal(parseMaxDistinctIps('0'), 0);
  assert.equal(parseMaxDistinctIps('abc'), 3);
  assert.equal(parseMaxDistinctIps('-2'), 3);
});
