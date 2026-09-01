import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const authFormPaths = [
  '../components/auth/login-form.tsx',
  '../components/auth/register-form.tsx',
  '../components/auth/forgot-password-form.tsx',
  '../components/auth/reset-password-form.tsx',
];

test('auth headers keep the logo and title in separate non-overlapping flow space', async () => {
  for (const formPath of authFormPaths) {
    const source = await readFile(new URL(formPath, import.meta.url), 'utf8');

    assert.doesNotMatch(source, /justify-center\s+-my-/, formPath);
    assert.match(source, /flex flex-col items-center gap-/, formPath);
  }
});