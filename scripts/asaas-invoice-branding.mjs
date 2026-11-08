// Applies the Lutteros look to the hosted Asaas invoice (the page buyers pay on).
// Asaas lets us set the logo plus three colors; every submission goes through their review
// (usually a few hours) and the previously approved look stays live meanwhile.
//
// Run: node scripts/asaas-invoice-branding.mjs            (shows what would be sent)
//      node scripts/asaas-invoice-branding.mjs --apply    (sends it to Asaas production)
import { readFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const apply = process.argv.includes('--apply')

// Brand palette: ivory behind the wordmark, deep teal behind the company data (white text, ~10:1 contrast).
const BRANDING = { logoBackgroundColor: '#faf9f6', infoBackgroundColor: '#0f5459', fontColor: '#FFFFFF' }

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

async function renderLogo() {
  const svg = readFileSync(path.join(root, 'public/images/logo/lutteros-logo.svg'))
  const wordmark = await sharp(svg, { density: 600 }).trim().resize({ width: 480 }).png().toBuffer()
  return sharp(wordmark)
    .extend({ top: 44, bottom: 44, left: 60, right: 60, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer()
}

const env = loadEnv(path.join(root, '.env'))
if (env.ASAAS_TYPE !== 'production') throw new Error('.env is not the production configuration')

const logo = await renderLogo()
console.log('Colors:', JSON.stringify(BRANDING), '| logo:', `${(logo.length / 1024).toFixed(1)} KB PNG`)

if (!apply) {
  console.log('Dry run. Use --apply to send it to Asaas.')
  process.exit(0)
}

const form = new FormData()
for (const [key, value] of Object.entries(BRANDING)) form.append(key, value)
form.append('enabled', 'true')
form.append('logoFile', new Blob([logo], { type: 'image/png' }), 'lutteros-logo.png')

const headers = { access_token: env.ASAAS_API_KEY, 'User-Agent': 'Lutteros/1.0' }
const saved = await fetch('https://api.asaas.com/v3/myAccount/paymentCheckoutConfig/', { method: 'POST', headers, body: form })
console.log('POST paymentCheckoutConfig ->', saved.status, JSON.stringify(await saved.json().catch(() => ({}))).slice(0, 500))

const current = await fetch('https://api.asaas.com/v3/myAccount/paymentCheckoutConfig/', { headers })
const config = await current.json().catch(() => ({}))
console.log('Current config:', JSON.stringify({ ...config, logoUrl: config.logoUrl ? '<set>' : null }))
