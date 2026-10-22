import assert from 'node:assert/strict';
import test from 'node:test';
import { AsaasError, createAsaasClient, getAsaasConfig } from './asaas';

test('getAsaasConfig selects the base URL from ASAAS_TYPE', () => {
  assert.equal(getAsaasConfig({ ASAAS_API_KEY: 'k', ASAAS_TYPE: 'sandbox' }).baseUrl, 'https://api-sandbox.asaas.com/v3');
  assert.equal(getAsaasConfig({ ASAAS_API_KEY: 'k', ASAAS_TYPE: 'production' }).baseUrl, 'https://api.asaas.com/v3');
  assert.equal(getAsaasConfig({ ASAAS_API_KEY: 'k' }).baseUrl, 'https://api-sandbox.asaas.com/v3');
});

test('getAsaasConfig rejects a missing key or unknown type', () => {
  assert.throws(() => getAsaasConfig({ ASAAS_TYPE: 'sandbox' }), /ASAAS_API_KEY/);
  assert.throws(() => getAsaasConfig({ ASAAS_API_KEY: 'k', ASAAS_TYPE: 'staging' }), /ASAAS_TYPE/);
});

test('getAsaasConfig cleans a key pasted with quotes or the .env escape', () => {
  const key = '$aact_hmlg_abc123';
  for (const pasted of [key, `\\${key}`, `"\\${key}"`, `"${key}"`, `  ${key}\n`]) {
    assert.equal(getAsaasConfig({ ASAAS_API_KEY: pasted }).apiKey, key, pasted);
  }
});

function recordingFetch(response: { status?: number; body: unknown }) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fetchImpl = async (url: string, init?: RequestInit) => {
    calls.push({ url, init: init ?? {} });
    return new Response(JSON.stringify(response.body), { status: response.status ?? 200 });
  };
  return { calls, fetchImpl };
}

test('createPayment sends an UNDEFINED billing type with auth headers', async () => {
  const { calls, fetchImpl } = recordingFetch({ body: { id: 'pay_1', invoiceUrl: 'https://sandbox.asaas.com/i/1' } });
  const client = createAsaasClient({ baseUrl: 'https://api-sandbox.asaas.com/v3', apiKey: 'secret' }, fetchImpl);

  const payment = await client.createPayment({
    customer: 'cus_1',
    value: 149.9,
    dueDate: '2026-10-24',
    description: 'Curso',
    externalReference: 'enr_1',
  });

  assert.equal(payment.id, 'pay_1');
  assert.equal(calls[0]!.url, 'https://api-sandbox.asaas.com/v3/payments');
  const headers = calls[0]!.init.headers as Record<string, string>;
  assert.equal(headers.access_token, 'secret');
  assert.ok(headers['User-Agent']);
  const body = JSON.parse(calls[0]!.init.body as string);
  assert.equal(body.billingType, 'UNDEFINED');
  assert.equal(body.value, 149.9);
  assert.equal(body.externalReference, 'enr_1');
});

test('API errors surface the Asaas description', async () => {
  const { fetchImpl } = recordingFetch({
    status: 400,
    body: { errors: [{ code: 'invalid_customer', description: 'Cliente inválido' }] },
  });
  const client = createAsaasClient({ baseUrl: 'https://x', apiKey: 'k' }, fetchImpl);

  await assert.rejects(client.getPayment('pay_1'), (error: unknown) => {
    assert.ok(error instanceof AsaasError);
    assert.equal(error.status, 400);
    assert.equal(error.message, 'Cliente inválido');
    return true;
  });
});
