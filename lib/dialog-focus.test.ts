import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldRestoreDialogFocus } from './dialog-focus';

test('restores dialog focus only when an embedded iframe receives focus', () => {
  assert.equal(shouldRestoreDialogFocus({ tagName: 'IFRAME' }), true);
  assert.equal(shouldRestoreDialogFocus({ tagName: 'BUTTON' }), false);
  assert.equal(shouldRestoreDialogFocus(null), false);
});