import fs from 'node:fs'
import path from 'node:path'

/**
 * Generates the login/register scene with the Azure AI Foundry image model.
 *
 *   npx tsx --env-file=.env scripts/generate-auth-scene.ts --out public/images/auth/scene-1.png
 *   npx tsx --env-file=.env scripts/generate-auth-scene.ts --prompt-file prompt.txt --out ...
 *
 * Needs AZURE_US_ENDPOINT, AZURE_US_API_KEY and AZURE_IMAGE_MODEL.
 */

const PROMPT = `Photorealistic cinematic wide photograph, landscape 3:2, shot at blue hour just after sunset.
A serene, intimate, sensual-but-tasteful tropical retreat built around a perfectly still turquoise lagoon pool.
COMPOSITION IS CRITICAL: the water's edge / horizon runs exactly across the vertical middle of the frame (50% height).
The upper half shows the retreat; the lower half is calm, glassy teal water that faithfully mirrors it with soft ripples.
Left and right are framed by warm-lit modern open-air timber pavilions with deep roof overhangs, glowing paper lanterns, soft candle-like amber light, lush palms, frangipani and orchid flowers, and a few floating lotus blossoms near the shore.
The centre of the frame is deliberately open and calm: distant misty green hills and a twilight sky that blends deep teal into soft plum-magenta and peach at the horizon.
Colour palette: deep teal, turquoise, plum purple, magenta, warm gold and cream. Warm, safe, welcoming, wellness and sexual-health care mood; elegant and discreet, never explicit.
No people, no faces, no text, no lettering, no logos, no watermark, no lens flare, no HDR halos, no oversaturation.`

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? undefined : process.argv[i + 1]
}

const endpoint = process.env.AZURE_US_ENDPOINT?.replace(/\/+$/, '')
const apiKey = process.env.AZURE_US_API_KEY
const model = arg('model') ?? process.env.AZURE_IMAGE_MODEL
const out = arg('out') ?? 'public/images/auth/scene-raw.png'
const promptFile = arg('prompt-file')
const prompt = promptFile ? fs.readFileSync(promptFile, 'utf8').trim() : PROMPT

if (!endpoint || !apiKey || !model) {
  console.error('Set AZURE_US_ENDPOINT, AZURE_US_API_KEY and AZURE_IMAGE_MODEL (use --env-file=.env).')
  process.exit(1)
}

// The project endpoint (.../api/projects/<name>) shares its host with the OpenAI-compatible v1 API.
const host = new URL(endpoint).origin
const url = `${host}/openai/v1/images/generations`

async function main() {
  console.log(`Model: ${model}`)
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'api-key': apiKey!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, size: arg('size') ?? '1536x1024', n: 1, quality: arg('quality') ?? 'high' }),
  })

  if (!res.ok) {
    console.error(`HTTP ${res.status}: ${(await res.text()).slice(0, 600)}`)
    process.exit(1)
  }

  const payload = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> }
  const item = payload.data?.[0]
  if (!item) {
    console.error('Response had no image.')
    process.exit(1)
  }

  const buffer = item.b64_json
    ? Buffer.from(item.b64_json, 'base64')
    : Buffer.from(await (await fetch(item.url!)).arrayBuffer())

  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, buffer)
  console.log(`Saved ${out} (${(buffer.length / 1024).toFixed(0)} KB)`)
}

main()
