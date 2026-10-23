// Builds "Figura 1: Caracterização da queixa sexual" (article: Protocolo de anamnese em Sexologia).
// Text is rendered from code so every label and accent is exact.
//
//   node scripts/build-anamnese-figure.mjs
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fontsDir = join(root, 'scripts', 'fonts');
const out = join(root, 'public', 'images', 'articles', 'figures', 'anamnese-figura-1-v1.webp');
const backgroundFile = join(root, 'scripts', 'article-covers', 'art', 'fases-background.webp');
const W = 1600;
const H = 1040;

const TEAL = '#198189';
const PLUM = '#630a79';
const INK = '#052628';
const MINT = '#e4eeeb';
const LILAC = '#eadfe9';

const step1 = { x: 800, y: 95, w: 560, h: 92 };
const step2 = { x: 800, y: 265, w: 900, h: 104 };
const panel = { x: 110, y: 385, w: 1380, h: 330 };
const step4 = { x: 800, y: 870, w: 1240, h: 170 };
const chips = [
  { text: 'Desejo sexual?', tone: 'teal' },
  { text: 'Excitação sexual?', tone: 'teal' },
  { text: 'Orgasmo?', tone: 'teal' },
  { text: 'Sente dor na relação sexual?', tone: 'plum' },
];
const chipW = 300;
const chipH = 170;
const chipGap = 40;
const chipsLeft = 800 - (chips.length * chipW + (chips.length - 1) * chipGap) / 2;
const chipY = panel.y + 215;

const arrow = (x, y1, y2) =>
  `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2 - 8}" stroke="${TEAL}" stroke-width="4" stroke-linecap="round"/><path d="M${x - 13} ${y2 - 18} L${x} ${y2} L${x + 13} ${y2 - 18} z" fill="${TEAL}"/>`;

const box = ({ x, y, w, h }, { fill, stroke, rx = 30, dash }) =>
  `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="3"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${arrow(800, step1.y + step1.h / 2 + 8, step2.y - step2.h / 2 - 8)}
  ${arrow(800, step2.y + step2.h / 2 + 8, panel.y - 8)}
  ${arrow(800, panel.y + panel.h + 8, step4.y - step4.h / 2 - 8)}
  ${box(step1, { fill: TEAL, stroke: TEAL, rx: 46 })}
  ${box(step2, { fill: MINT, stroke: TEAL, rx: 52 })}
  <rect x="${panel.x}" y="${panel.y}" width="${panel.w}" height="${panel.h}" rx="36" fill="#ffffff" fill-opacity=".92" stroke="${PLUM}" stroke-width="3"/>
  ${chips
    .map((c, i) => {
      const x = chipsLeft + i * (chipW + chipGap) + chipW / 2;
      return box({ x, y: chipY, w: chipW, h: chipH }, { fill: c.tone === 'teal' ? MINT : LILAC, stroke: c.tone === 'teal' ? TEAL : PLUM, rx: 34 });
    })
    .join('')}
  ${box(step4, { fill: LILAC, stroke: PLUM, rx: 40 })}
</svg>`;

async function text(content, width, { font = 'DM Sans', file = 'DMSans.ttf', size = 36, color = INK } = {}) {
  const { data, info } = await sharp({
    text: {
      text: `<span foreground="${color}">${content}</span>`,
      font: `${font} ${size}`,
      fontfile: join(fontsDir, file),
      width,
      align: 'centre',
      rgba: true,
      dpi: 72,
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { input: data, w: info.width, h: info.height };
}

const layers = [];
const place = (t, cx, cy) => layers.push({ input: t.input, left: Math.round(cx - t.w / 2), top: Math.round(cy - t.h / 2) });

place(await text('Diante da queixa sexual', step1.w - 60, { size: 40, color: '#ffffff' }), step1.x, step1.y);
place(await text('Identificar a fase da resposta sexual acometida', step2.w - 80, { size: 40 }), step2.x, step2.y);
place(
  await text('Qual a fase da resposta sexual está comprometida?', panel.w - 120, { font: 'Cardo', file: 'Cardo-Regular.ttf', size: 46, color: PLUM }),
  800,
  panel.y + 70,
);
for (const [i, c] of chips.entries()) {
  const x = chipsLeft + i * (chipW + chipGap) + chipW / 2;
  place(await text(c.text, chipW - 50, { size: 36, color: c.tone === 'teal' ? '#0f5459' : PLUM }), x, chipY);
}
place(
  await text(
    'Caracteriza a queixa quanto à data em que surgiu, duração, fatores desencadeantes e condições associadas.',
    step4.w - 120,
    { size: 38 },
  ),
  step4.x,
  step4.y,
);

const background = await sharp(backgroundFile).resize(W, H, { fit: 'cover' }).toBuffer();
const shapes = await sharp(Buffer.from(svg)).png().toBuffer();
await sharp(background)
  .composite([{ input: shapes }, ...layers])
  .webp({ quality: 90 })
  .toFile(out);
console.log('Wrote', out);
