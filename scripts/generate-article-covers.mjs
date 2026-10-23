// Generates photo-only article covers with the Azure image deployment and writes
// optimized 16:10 WebP files to public/images/articles.
//
//   node scripts/generate-article-covers.mjs generate [id]   # call the image API (resumable)
//   node scripts/generate-article-covers.mjs build [id]      # crop + optimize into public/
//
// Raw PNGs stay outside the repository. Credentials come from .env and are never printed.
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const promptsFile = join(root, 'scripts', 'article-covers', 'prompts.json');
const artDir = join(root, 'scripts', 'article-covers', 'art');
const rawDir = join(root, '..', 'Luteros-backups', 'article-covers-raw');
const outDir = join(root, 'public', 'images', 'articles');
// Each cover can override this with "version" in prompts.json; bump it when an image changes
// so the new file gets a new URL (the site caches images by URL).
const DEFAULT_VERSION = 'v2';
// Covers that come from prepared art instead of the image API: the approved consultation
// photo and the phases diagram (scripts/build-fases-cover.mjs draws its text from code).
const ART_COVERS = new Set(['anamnese-estruturada', 'fases-resposta-sexual']);
const WIDTH = 1600;
const HEIGHT = 1000; // 16:10, the aspect ratio of the article cards

const [mode = 'build', only] = process.argv.slice(2);
const { style, covers } = JSON.parse(readFileSync(promptsFile, 'utf8'));
const selected = covers.filter((cover) => !only || cover.id === only);

function readEnv() {
  const values = {};
  for (const line of readFileSync(join(root, '.env'), 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (match) values[match[1]] = match[2].trim().replace(/^"|"$/g, '');
  }
  return values;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateOne(env, cover) {
  const rawFile = join(rawDir, `${cover.id}.png`);
  if (existsSync(rawFile)) return console.log(`skip ${cover.id} (already generated)`);
  if (ART_COVERS.has(cover.id)) return console.log(`skip ${cover.id} (uses art in scripts/article-covers/art)`);

  const base = new URL(env.AZURE_US_ENDPOINT).origin;
  const url = `${base}/openai/deployments/${env.AZURE_IMAGE_MODEL}/images/generations?api-version=2025-04-01-preview`;
  const body = JSON.stringify({ prompt: `${cover.prompt} ${style}`, size: '1536x1024', n: 1 });

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'api-key': env.AZURE_US_API_KEY, 'Content-Type': 'application/json' },
      body,
    });
    if (response.ok) {
      const data = await response.json();
      await writeFile(rawFile, Buffer.from(data.data[0].b64_json, 'base64'));
      return console.log(`ok   ${cover.id}`);
    }
    if (response.status === 400) {
      // Content filter or invalid prompt: do not hammer the API.
      const detail = (await response.text()).slice(0, 300);
      throw new Error(`${cover.id}: rejected (${detail})`);
    }
    const wait = response.status === 429 ? 60_000 : 20_000;
    console.log(`retry ${cover.id} (attempt ${attempt}, status ${response.status}), waiting ${wait / 1000}s`);
    await sleep(wait);
  }
  throw new Error(`${cover.id}: failed after retries`);
}

async function buildOne(cover) {
  const source = ART_COVERS.has(cover.id)
    ? join(artDir, `${cover.id}.webp`)
    : join(rawDir, `${cover.id}.png`);
  if (!existsSync(source)) return console.log(`missing ${cover.id}`);
  await mkdir(outDir, { recursive: true });
  const info = await sharp(source)
    .resize({ width: WIDTH, height: HEIGHT, fit: 'cover', position: 'centre' })
    .webp({ quality: 84 })
    .toFile(join(outDir, `${cover.id}-${cover.version ?? DEFAULT_VERSION}.webp`));
  console.log(`built ${cover.id}-${cover.version ?? DEFAULT_VERSION}.webp ${Math.round(info.size / 1024)}KB`);
}

await mkdir(rawDir, { recursive: true });
if (mode === 'generate') {
  const env = readEnv();
  for (const cover of selected) {
    try {
      await generateOne(env, cover);
    } catch (error) {
      console.log(`FAILED ${error.message}`);
    }
    await sleep(12_000);
  }
} else {
  for (const cover of selected) await buildOne(cover);
}
