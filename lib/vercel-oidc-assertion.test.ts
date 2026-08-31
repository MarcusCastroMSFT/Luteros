import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createVercelOidcAssertion } from './vercel-oidc-assertion.server';

test('requests a Vercel OIDC token with the Azure token exchange audience', async () => {
  let requestedAudience: string | undefined;
  const assertion = createVercelOidcAssertion(async (options) => {
    requestedAudience = options?.audience;
    return 'short-lived-assertion';
  });

  assert.equal(await assertion(), 'short-lived-assertion');
  assert.equal(requestedAudience, 'api://AzureADTokenExchange');
});