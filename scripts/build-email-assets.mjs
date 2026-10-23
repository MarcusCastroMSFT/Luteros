// Renders the raster assets used by transactional and newsletter emails.
// Email clients don't render SVG reliably, so we ship 2x PNGs hosted under
// /email/ and reference them with absolute URLs from lib/email-layout.ts.
//
// Run: node scripts/build-email-assets.mjs
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const outDir = path.join(root, 'public', 'email')

const LOGO_WIDTH = 2 * 150
const SPROUT_WIDTH = 2 * 80
const ICON_SIZE = 2 * 20

async function renderLogo() {
  const svg = await readFile(path.join(root, 'public/images/logo/lutteros-logo.svg'))
  const trimmed = await sharp(svg, { density: 600 }).trim().png().toBuffer()
  const info = await sharp(trimmed)
    .resize({ width: LOGO_WIDTH })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(outDir, 'lutteros-logo.png'))
  return info
}

// Lighter teal/plum so the wordmark keeps contrast in dark-mode clients.
async function renderLogoDark() {
  const source = await readFile(path.join(root, 'public/images/logo/lutteros-logo.svg'), 'utf8')
  const svg = Buffer.from(source.replaceAll('#198189', '#86d3d6').replaceAll('#630a79', '#dcaee8'))
  const trimmed = await sharp(svg, { density: 600 }).trim().png().toBuffer()
  return sharp(trimmed)
    .resize({ width: LOGO_WIDTH })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(outDir, 'lutteros-logo-dark.png'))
}

// Footer illustration: a seedling (growth, learning) from the brand set.
async function renderSprout(colors, file) {
  let source = await readFile(path.join(root, 'public/images/brand/care-sprout.svg'), 'utf8')
  for (const [from, to] of Object.entries(colors)) source = source.replaceAll(from, to)
  return sharp(Buffer.from(source), { density: 400 })
    .trim()
    .resize({ width: SPROUT_WIDTH })
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(outDir, file))
}

async function renderInstagram(color, file) {
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${ICON_SIZE}" height="${ICON_SIZE}" fill="none" stroke="${color}" stroke-width="1.8">
  <rect x="2.9" y="2.9" width="18.2" height="18.2" rx="5.2"/>
  <circle cx="12" cy="12" r="4.2"/>
  <circle cx="17.4" cy="6.6" r="1.05" fill="${color}" stroke="none"/>
</svg>`)
  return sharp(svg, { density: 300 })
    .resize(ICON_SIZE, ICON_SIZE)
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, file))
}

await mkdir(outDir, { recursive: true })
const results = await Promise.all([renderLogo(), renderLogoDark(), renderSprout({}, 'sprout.png'), renderSprout({ '#146b71': '#86d3d6', '#198189': '#86d3d6', '#faf9f6': '#0b2629' }, 'sprout-dark.png'), renderInstagram('#0f5459', 'instagram.png'), renderInstagram('#86d3d6', 'instagram-dark.png')])
const names = ['lutteros-logo.png', 'lutteros-logo-dark.png', 'sprout.png', 'sprout-dark.png', 'instagram.png', 'instagram-dark.png']
for (const [index, info] of results.entries()) {
  const name = names[index]
  console.log(`${name}: ${info.width}x${info.height}, ${info.size} bytes`)
}
