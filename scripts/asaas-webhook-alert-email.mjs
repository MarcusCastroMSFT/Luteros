// Keeps the alert e-mail of the production Asaas payment webhook in sync with the site's contact e-mail
// (`contactEmail` in lib/legal-entity.ts). Asaas sends a notice there when webhook deliveries fail.
//
// Run: node scripts/asaas-webhook-alert-email.mjs            (shows what would change)
//      node scripts/asaas-webhook-alert-email.mjs --apply    (updates Asaas production)
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const apply = process.argv.includes('--apply')
const WEBHOOK_PATH = '/api/webhooks/asaas'

function loadEnv(file) {
  const env = {}
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match) continue
    let value = match[2]
    if (/^(".*"|'.*')$/.test(value)) value = value.slice(1, -1)
    env[match[1]] = value.replace(/^\\\$/, '$')
  }
  return env
}

const entity = readFileSync(path.join(root, 'lib/legal-entity.ts'), 'utf8')
const contactEmail = entity.match(/contactEmail:\s*'([^']+)'/)?.[1]
if (!contactEmail) throw new Error('contactEmail not found in lib/legal-entity.ts')

const env = loadEnv(path.join(root, '.env'))
if (env.ASAAS_TYPE !== 'production') throw new Error('.env is not the production configuration')

const headers = { access_token: env.ASAAS_API_KEY, 'User-Agent': 'Lutteros/1.0', 'Content-Type': 'application/json' }
const list = await fetch('https://api.asaas.com/v3/webhooks?limit=100', { headers }).then((r) => r.json())
const webhook = (list.data ?? []).find((item) => item.url?.endsWith(WEBHOOK_PATH))
if (!webhook) throw new Error(`No Asaas webhook points to ${WEBHOOK_PATH}`)

console.log(`Webhook ${webhook.id}: alert e-mail ${webhook.email} -> ${contactEmail}`)
if (webhook.email === contactEmail) {
  console.log('Already up to date.')
  process.exit(0)
}
if (!apply) {
  console.log('Dry run. Use --apply to update Asaas.')
  process.exit(0)
}

const response = await fetch(`https://api.asaas.com/v3/webhooks/${webhook.id}`, {
  method: 'PUT',
  headers,
  body: JSON.stringify({ email: contactEmail }),
})
const updated = await response.json().catch(() => ({}))
console.log('PUT webhook ->', response.status, JSON.stringify({ email: updated.email, enabled: updated.enabled, sendType: updated.sendType, errors: updated.errors }))
