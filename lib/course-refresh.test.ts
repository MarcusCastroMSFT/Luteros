import assert from 'node:assert/strict';
import test from 'node:test';
import { COURSE_REFRESH_INTERVAL_MS, subscribeToCourseRefresh } from '../hooks/use-course-refresh';

test('open course pages refresh every 15 seconds, resume on focus/online, and clean up', (t) => {
  t.mock.timers.enable({ apis: ['setInterval'] });
  const browser = Object.assign(new EventTarget(), {
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
  });
  const document = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  const navigator = { onLine: true };
  let unsubscribe = () => {};
  t.after(() => unsubscribe());
  for (const [name, value] of Object.entries({ window: browser, document, navigator })) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { value, configurable: true });
    t.after(() => {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    });
  }

  let refreshes = 0;
  unsubscribe = subscribeToCourseRefresh(() => { refreshes++; });
  assert.equal(COURSE_REFRESH_INTERVAL_MS, 15_000);
  assert.equal(refreshes, 1, 'mount must bypass an old browser router snapshot');
  t.mock.timers.tick(14_999);
  assert.equal(refreshes, 1);
  t.mock.timers.tick(1);
  assert.equal(refreshes, 2);
  t.mock.timers.tick(15_000);
  assert.equal(refreshes, 3, 'polling must continue after the first refresh');

  document.visibilityState = 'hidden';
  browser.dispatchEvent(new Event('focus'));
  t.mock.timers.tick(30_000);
  assert.equal(refreshes, 3, 'hidden tabs must not poll');
  document.visibilityState = 'visible';
  document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(refreshes, 4);
  browser.dispatchEvent(new Event('focus'));
  assert.equal(refreshes, 5);

  navigator.onLine = false;
  t.mock.timers.tick(15_000);
  assert.equal(refreshes, 5);
  navigator.onLine = true;
  browser.dispatchEvent(new Event('online'));
  assert.equal(refreshes, 6);

  unsubscribe();
  t.mock.timers.tick(30_000);
  browser.dispatchEvent(new Event('focus'));
  browser.dispatchEvent(new Event('online'));
  document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(refreshes, 6, 'unmount must remove the timer and every listener');
});
