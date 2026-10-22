const ASAAS_BASE_URLS = {
  sandbox: 'https://api-sandbox.asaas.com/v3',
  production: 'https://api.asaas.com/v3',
} as const

export interface AsaasConfig {
  baseUrl: string
  apiKey: string
}

export interface AsaasCustomer {
  id: string
  name: string
  cpfCnpj: string | null
  email: string | null
}

export interface AsaasPayment {
  id: string
  customer: string
  status: string
  value: number
  billingType: string
  dueDate: string
  invoiceUrl: string | null
  externalReference: string | null
  deleted?: boolean
}

export interface CreateCustomerInput {
  name: string
  email: string
  cpfCnpj: string
  externalReference: string
}

export interface CreatePaymentInput {
  customer: string
  value: number
  dueDate: string
  description: string
  externalReference: string
}

export class AsaasError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errors: Array<{ code?: string; description?: string }> = [],
  ) {
    super(message)
    this.name = 'AsaasError'
  }
}

// Tolerates values pasted as written in .env files: surrounding quotes and the "\$" escape.
export function sanitizeApiKey(raw: string): string {
  return raw.trim().replace(/^["']+|["']+$/g, '').replace(/^\\+/, '').trim()
}

export function getAsaasConfig(env: Record<string, string | undefined> = process.env): AsaasConfig {
  const apiKey = sanitizeApiKey(env.ASAAS_API_KEY ?? '')
  if (!apiKey) {
    throw new Error('ASAAS_API_KEY is not configured (escape a leading "$" as "\\$" in .env files)')
  }

  const type = (env.ASAAS_TYPE ?? 'sandbox').trim().toLowerCase()
  if (type === 'production' || type === 'prod') {
    return { baseUrl: ASAAS_BASE_URLS.production, apiKey }
  }
  if (type === 'sandbox') {
    return { baseUrl: ASAAS_BASE_URLS.sandbox, apiKey }
  }

  throw new Error('ASAAS_TYPE must be "sandbox" or "production"')
}

export type AsaasFetch = (input: string, init?: RequestInit) => Promise<Response>

export function createAsaasClient(config: AsaasConfig, fetchImpl: AsaasFetch = fetch) {
  async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const response = await fetchImpl(`${config.baseUrl}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'luteros-app',
        access_token: config.apiKey,
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
    })

    const text = await response.text()
    let payload: unknown = null
    try {
      payload = text ? JSON.parse(text) : null
    } catch {
      payload = null
    }

    if (!response.ok) {
      const errors = (payload as { errors?: AsaasError['errors'] } | null)?.errors ?? []
      const description = errors[0]?.description ?? `Asaas request failed with status ${response.status}`
      throw new AsaasError(description, response.status, errors)
    }

    return payload as T
  }

  return {
    createCustomer(input: CreateCustomerInput): Promise<AsaasCustomer> {
      return request<AsaasCustomer>('/customers', { method: 'POST', body: input })
    },

    // UNDEFINED lets the payer pick Pix, boleto or card on the Asaas-hosted invoice,
    // so card data never touches this application.
    createPayment(input: CreatePaymentInput): Promise<AsaasPayment> {
      return request<AsaasPayment>('/payments', {
        method: 'POST',
        body: { ...input, billingType: 'UNDEFINED' },
      })
    },

    getPayment(paymentId: string): Promise<AsaasPayment> {
      return request<AsaasPayment>(`/payments/${encodeURIComponent(paymentId)}`)
    },

    deletePayment(paymentId: string): Promise<{ deleted: boolean; id: string }> {
      return request(`/payments/${encodeURIComponent(paymentId)}`, { method: 'DELETE' })
    },
  }
}

export type AsaasClient = ReturnType<typeof createAsaasClient>

let cachedClient: AsaasClient | null = null

export function getAsaasClient(): AsaasClient {
  cachedClient ??= createAsaasClient(getAsaasConfig())
  return cachedClient
}
