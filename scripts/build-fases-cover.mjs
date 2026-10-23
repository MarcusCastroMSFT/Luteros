// Builds the "Fases da resposta sexual" cover as an illustrated diagram.
// The text is rendered from code, so every label and accent is exact (image models
// tend to misspell Portuguese text). Output feeds generate-article-covers.mjs.
//
//   node scripts/build-fases-cover.mjs
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fontsDir = join(root, 'scripts', 'fonts');
const out = join(root, 'scripts', 'article-covers', 'art', 'fases-resposta-sexual.webp');
const backgroundFile = join(root, 'scripts', 'article-covers', 'art', 'fases-background.webp');
const W = 1600;
const H = 1000;

const TEAL = '#198189';
const PLUM = '#630a79';
const INK = '#052628';

// Circular model of the original cover: seven phases clockwise, one dashed shortcut
// ("Desejo espontâneo") and one dashed note about intimacy.
const nodes = [
  { text: 'Neutralidade sexual', x: 800, y: 110, w: 380, h: 110, tone: 'teal' },
  { text: 'Motivação e receptividade', x: 1200, y: 235, w: 380, h: 110, tone: 'teal' },
  { text: 'Estímulos sexuais em contexto adequado', x: 1240, y: 460, w: 420, h: 140, tone: 'teal' },
  { text: 'Excitação subjetiva', x: 1090, y: 700, w: 380, h: 110, tone: 'plum' },
  { text: 'Desejo responsivo', x: 780, y: 880, w: 380, h: 110, tone: 'plum' },
  { text: 'Satisfação física e/ou emocional', x: 420, y: 700, w: 380, h: 110, tone: 'plum' },
  { text: 'Intimidade emocional', x: 400, y: 330, w: 380, h: 110, tone: 'plum' },
];
const spontaneous = { text: 'Desejo espontâneo', x: 1450, y: 880, w: 260, h: 100 };
const note = { text: 'Aumento da intimidade pode motivar futura atividade sexual', x: 175, y: 520, w: 230 };

const solid = [
  ['M992 112 Q1090 95 1150 178', TEAL],
  ['M1215 292 Q1230 330 1235 386', TEAL],
  ['M1210 532 Q1180 590 1140 644', TEAL],
  ['M960 716 Q880 760 830 825', PLUM],
  ['M600 880 Q500 860 450 764', PLUM],
  ['M395 644 Q385 520 395 390', PLUM],
  ['M560 300 Q640 200 650 140', PLUM],
];
const dashed = [
  ['M1380 830 Q1300 770 1255 745', PLUM],
  ['M232 700 Q80 650 70 500 Q65 380 205 335', PLUM],
];
const pill = ({ x, y, w, h, tone }) => {
  const color = tone === 'teal' ? TEAL : PLUM;
  const fill = tone === 'teal' ? '#e4eeeb' : '#eadfe9';
  return `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="#faf9f6" stroke="${color}" stroke-width="2.5"/><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" fill-opacity=".85"/>`;
};

const marker = (id, color) =>
  `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="${color}"/></marker>`;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${marker('a-teal', TEAL)}${marker('a-plum', PLUM)}</defs>
  <circle cx="800" cy="495" r="185" fill="#fff" stroke="${TEAL}" stroke-width="2" stroke-opacity=".45"/>
  <circle cx="800" cy="495" r="162" fill="none" stroke="${PLUM}" stroke-width="1.5" stroke-opacity=".35"/>
  ${solid.map(([d, c]) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="3.5" stroke-linecap="round" marker-end="url(#a-${c === TEAL ? 'teal' : 'plum'})"/>`).join('')}
  ${dashed.map(([d, c]) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="9 9" stroke-linecap="round" marker-end="url(#a-plum)"/>`).join('')}
  ${nodes.map(pill).join('')}
  <rect x="${spontaneous.x - spontaneous.w / 2}" y="${spontaneous.y - spontaneous.h / 2}" width="${spontaneous.w}" height="${spontaneous.h}" rx="26" fill="#faf9f6" fill-opacity=".94" stroke="${PLUM}" stroke-width="2.5" stroke-dasharray="9 9"/>
</svg>`;

async function label(text, width, { size = 32, color = INK, align = 'centre' } = {}) {
  const { data, info } = await sharp({
    text: {
      text: `<span foreground="${color}">${text}</span>`,
      font: `DM Sans ${size}`,
      fontfile: join(fontsDir, 'DMSans.ttf'),
      width,
      align,
      rgba: true,
      dpi: 72,
    },
  }).png().toBuffer({ resolveWithObject: true });
  return { input: data, w: info.width, h: info.height };
}

const layers = [];
for (const n of nodes) {
  const t = await label(n.text, n.w - 60);
  layers.push({ input: t.input, left: Math.round(n.x - t.w / 2), top: Math.round(n.y - t.h / 2) });
}
const sp = await label(spontaneous.text, spontaneous.w - 40);
layers.push({ input: sp.input, left: Math.round(spontaneous.x - sp.w / 2), top: Math.round(spontaneous.y - sp.h / 2) });
const nt = await label(note.text, note.w, { size: 27, color: '#0f5459', align: 'left' });
layers.push({ input: nt.input, left: note.x - 85, top: Math.round(note.y - nt.h / 2) });

const bloom = await sharp(join(root, 'public', 'images', 'brand', 'care-bloom.svg')).resize({ width: 230 }).png().toBuffer();
const bloomMeta = await sharp(bloom).metadata();
layers.push({ input: bloom, left: 800 - Math.round(bloomMeta.width / 2), top: 495 - Math.round(bloomMeta.height / 2) });

const background = await sharp(backgroundFile).resize(W, H, { fit: 'cover' }).toBuffer();
const diagram = await sharp(Buffer.from(svg)).png().toBuffer();
await sharp(background).composite([{ input: diagram }, ...layers]).webp({ quality: 90 }).toFile(out);
console.log('Wrote', out);
