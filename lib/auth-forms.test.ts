import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const formPaths = [
  '../components/auth/login-form.tsx',
  '../components/auth/register-form.tsx',
  '../components/auth/forgot-password-form.tsx',
  '../components/auth/reset-password-form.tsx',
  '../components/courses/cpf-dialog.tsx',
];

test('forms never rely on the browser default validation', async () => {
  for (const formPath of formPaths) {
    const source = await readFile(new URL(formPath, import.meta.url), 'utf8');
    const forms = source.match(/<form\b[^>]*>/g) ?? [];

    assert.ok(forms.length > 0, `${formPath} should render a form`);
    for (const tag of forms) {
      assert.match(tag, /\bnoValidate\b/, `${formPath}: ${tag}`);
    }
    assert.doesNotMatch(source, /\brequired\b(?!\w)(?!:)/, `${formPath} must not use the native required attribute`);
  }
});

test('auth fields expose validation errors accessibly', async () => {
  const source = await readFile(new URL('../components/auth/auth-ui.tsx', import.meta.url), 'utf8');

  assert.match(source, /aria-invalid/);
  assert.match(source, /aria-describedby/);
  assert.match(source, /role="alert"/);
});

test('the logo lives in the auth layout, not inside each form', async () => {
  const layout = await readFile(new URL('../app/(auth-scene)/layout.tsx', import.meta.url), 'utf8');
  assert.match(layout, /<Logo\b/);

  for (const formPath of formPaths.slice(0, 4)) {
    const source = await readFile(new URL(formPath, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /<Logo\b/, formPath);
  }
});
