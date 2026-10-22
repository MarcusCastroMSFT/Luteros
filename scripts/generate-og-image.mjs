import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const imagesDir = join(scriptDir, '..', 'public', 'images');
const fontsDir = join(scriptDir, 'fonts');
const width = 1200;
const height = 630;

// Match the visible wordmark crop used by the site header, excluding the old tagline.
const logoCanvas = await sharp(join(imagesDir, 'logo', 'lutteros-logo.svg'))
  .resize(1200, 1200)
  .png()
  .toBuffer();
const logo = await sharp(logoCanvas)
  .extract({ left: 0, top: 480, width: 1200, height: 240 })
  .resize({ width: 300 })
  .png()
  .toBuffer();

const garden = await sharp(join(imagesDir, 'brand', 'care-garden.svg'))
  .resize({ width: 410 })
  .png()
  .toBuffer();

const background = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="1200" height="630" fill="#faf9f6"/>
  <path d="M1010-90C813-65 709 71 745 274C780 482 948 627 1200 569V0Z" fill="#e4eeeb"/>
  <path d="M1110 383C1220 377 1281 452 1247 557C1217 650 1082 670 1028 589C974 508 1023 388 1110 383Z" fill="#eadfe9"/>
  <g fill="none" stroke="#198189" stroke-width="1.5" stroke-opacity=".4" stroke-linecap="round">
    <path d="M983 48C1045 95 1090 43 1180 83M983 63C1045 110 1090 58 1180 98M983 78C1045 125 1090 73 1180 113"/>
    <path d="M6 523C28 571 58 596 104 608M-9 532C13 580 43 605 89 617"/>
  </g>
</svg>`);

const textLayers = [
  { text: 'Saúde sexual', font: 'Cardo 62', file: 'Cardo-Regular.ttf', color: '#052628', left: 68, top: 190, maxWidth: 660 },
  { text: 'baseada em', font: 'Cardo 62', file: 'Cardo-Regular.ttf', color: '#052628', left: 68, top: 262, maxWidth: 660 },
  { text: 'conhecimento científico', font: 'Cardo Italic 58', file: 'Cardo-Italic.ttf', color: '#146b71', left: 68, top: 340, maxWidth: 680 },
  { text: 'Ciência que fundamenta a prática clínica.', font: 'DM Sans 26', file: 'DMSans.ttf', color: '#475569', left: 70, top: 454, maxWidth: 660 },
  { text: 'lutteros.com.br', font: 'DM Sans 22', file: 'DMSans.ttf', color: '#630a79', left: 70, top: 553, maxWidth: 660 },
];

const renderedText = await Promise.all(textLayers.map(async ({ text, font, file, color, left, top, maxWidth }) => {
  const { data, info } = await sharp({
    text: {
      text: `<span foreground="${color}">${text}</span>`,
      font,
      fontfile: join(fontsDir, file),
      rgba: true,
      dpi: 72,
    },
  }).png().toBuffer({ resolveWithObject: true });
  assert.ok(info.width <= maxWidth && top + info.height <= height, `Text exceeds safe area: ${text}`);
  return { input: data, left, top };
}));

await sharp(background)
  .composite([{ input: logo, left: 70, top: 64 }, { input: garden, left: 770, top: 135 }, ...renderedText])
  .png()
  .toFile(join(imagesDir, 'og-image.png'));

// Social crawlers need a raster image; UI cards keep the scalable SVG.
await sharp(join(imagesDir, 'course-placeholder-v2.svg'))
  .resize(width, height, { fit: 'cover' })
  .png()
  .toFile(join(imagesDir, 'course-placeholder.png'));

for (const name of ['og-image.png', 'course-placeholder.png']) {
  const metadata = await sharp(join(imagesDir, name)).metadata();
  assert.equal(metadata.width, width);
  assert.equal(metadata.height, height);
  assert.equal(metadata.format, 'png');
  console.log(`Generated ${name} (${width} x ${height})`);
}
