import assert from 'node:assert/strict'
import type { TestContext } from 'node:test'
import { neon, neonConfig } from '@neondatabase/serverless'
import { getTableColumns, type Table } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './db/schema'

export type HttpQuery = { query: string; params: unknown[] }

type MockOptions = {
  fail?: boolean
  returning?: { table: Table; values: Record<string, unknown> }
}

// Runs the real drizzle neon-http driver against an intercepted fetch, so tests
// fail on driver limitations (such as interactive transactions) without a database.
export function createNeonHttpMock(context: TestContext, options: MockOptions = {}) {
  const requests: HttpQuery[][] = []
  const originalFetch = neonConfig.fetchFunction
  context.after(() => { neonConfig.fetchFunction = originalFetch })

  const mockFetch: typeof fetch = async (_input, init) => {
    const payload = JSON.parse(String(init?.body))
    assert.ok(Array.isArray(payload.queries), 'Writes must use a single transactional batch')
    requests.push(payload.queries)
    if (options.fail) {
      return new Response(JSON.stringify({ message: 'Simulated constraint violation', code: '23503' }), { status: 400 })
    }

    const columns = options.returning ? Object.values(getTableColumns(options.returning.table)) : []
    return new Response(JSON.stringify({
      results: payload.queries.map((query: HttpQuery) => {
        const returnsRows = query.query.includes('returning')
        return {
          command: query.query.split(' ')[0].toUpperCase(),
          rowCount: 1,
          fields: returnsRows ? columns.map((column) => ({ name: column.name, dataTypeID: 25 })) : [],
          rows: returnsRows
            ? [columns.map((column) => options.returning?.values[column.name] ?? null)]
            : [],
        }
      }),
    }), { status: 200 })
  }
  neonConfig.fetchFunction = mockFetch

  const database = drizzle(neon('postgresql://test:test@database.invalid/test'), { schema })
  return { database, requests }
}
