import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'images');
mkdirSync(outDir, { recursive: true });

const WIDTH = 1200;
const HEIGHT = 630;
const LOGO_WIDTH = 640;

// --- 1. Prepare the brand logo (light version, made for dark backgrounds) ---
// Render large for a crisp result, then trim the transparent padding baked
// into the source SVG and scale to the target width.
const rendered = await sharp(join(outDir, 'logo', 'lutteros-light.svg'))
  .resize({ width: LOGO_WIDTH * 3 })
  .png()
  .toBuffer();

const logo = await sharp(rendered)
  .trim({ threshold: 10 })
  .resize({ width: LOGO_WIDTH })
  .png()
  .toBuffer();

const { width: logoW = LOGO_WIDTH, height: logoH = 0 } = await sharp(logo).metadata();

// --- 2. Layout maths (everything centred horizontally) ---
const logoX = Math.round((WIDTH - logoW) / 2);
const logoY = 88;
const headingY = logoY + logoH + 92;
const line1Y = headingY + 62;
const line2Y = line1Y + 44;

// --- 3. Background + decorative artwork + text ---
const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="28%" cy="16%" r="100%">
      <stop offset="0%" stop-color="#1e4c4f"/>
      <stop offset="52%" stop-color="#0d1f21"/>
      <stop offset="100%" stop-color="#060d0e"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1fa8b2"/>
      <stop offset="100%" stop-color="#146b71"/>
    </linearGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="60"/>
    </filter>
  </defs>

  <!-- Base -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <!-- Decorative soft blooms -->
  <circle cx="1090" cy="110" r="210" fill="#1fa8b2" opacity="0.20" filter="url(#soft)"/>
  <circle cx="1000" cy="600" r="250" fill="#0f6b70" opacity="0.26" filter="url(#soft)"/>
  <circle cx="110" cy="560" r="190" fill="#134e52" opacity="0.28" filter="url(#soft)"/>

  <!-- Thin decorative rings -->
  <circle cx="1060" cy="140" r="150" fill="none" stroke="#2ad0da" stroke-opacity="0.12" stroke-width="2"/>
  <circle cx="1060" cy="140" r="235" fill="none" stroke="#2ad0da" stroke-opacity="0.06" stroke-width="2"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="${WIDTH}" height="8" fill="url(#accent)"/>

  <!-- Heading -->
  <text x="${WIDTH / 2}" y="${headingY}" text-anchor="middle" font-family="'DejaVu Sans','Segoe UI',Arial,sans-serif" font-size="46" font-weight="700" fill="#4fd8cf">Saúde Sexual e Bem-estar</text>

  <!-- Description (wrapped) -->
  <text x="${WIDTH / 2}" y="${line1Y}" text-anchor="middle" font-family="'DejaVu Sans','Segoe UI',Arial,sans-serif" font-size="29" font-weight="400" fill="#cfe3e2">Promovemos educação, bem-estar e respeito para todas as pessoas,</text>
  <text x="${WIDTH / 2}" y="${line2Y}" text-anchor="middle" font-family="'DejaVu Sans','Segoe UI',Arial,sans-serif" font-size="29" font-weight="400" fill="#cfe3e2">em um espaço seguro, inclusivo e livre de tabus.</text>
</svg>
`;

const background = await sharp(Buffer.from(svg)).png().toBuffer();

// --- 4. Composite the logo onto the background ---
const outPath = join(outDir, 'og-image.png');
await sharp(background)
  .composite([{ input: logo, left: logoX, top: logoY }])
  .png()
  .toFile(outPath);

console.log('Generated', outPath, `(logo ${logoW}x${logoH})`);
