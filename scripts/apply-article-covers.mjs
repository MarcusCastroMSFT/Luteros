// Points articles at the new covers in public/images/articles, or reverts them.
//
//   node scripts/apply-article-covers.mjs plan [id]    # show what would change (default, read-only)
//   node scripts/apply-article-covers.mjs apply [id]   # update blog_articles.image
//   node scripts/apply-article-covers.mjs revert [id]  # restore the original image URLs
//
// [id] limits the run to one cover (an "id" from prompts.json); without it all covers are used.
//
// The database is shared with production: run `apply` only AFTER the new files are
// deployed, otherwise the live site would request images that do not exist yet.
// The original URLs live in ../Luteros-backups/article-images-original/manifest.json.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { neon } from '@neondatabase/serverless';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, '..', 'Luteros-backups', 'article-images-original', 'manifest.json'), 'utf8'));
const { covers } = JSON.parse(readFileSync(join(root, 'scripts', 'article-covers', 'prompts.json'), 'utf8'));
const DEFAULT_VERSION = 'v2'; // a cover can override it with "version" in prompts.json
const [mode = 'plan', only] = process.argv.slice(2);

function databaseUrl() {
  const text = readFileSync(join(root, '.env.local'), 'utf8');
  const match = text.match(/^\s*DATABASE_URL\s*=\s*"?([^"\r\n]+)"?/m);
  if (!match) throw new Error('DATABASE_URL not found in .env.local');
  return match[1];
}

const sql = neon(databaseUrl());
const originalBySlug = new Map(manifest.map((item) => [item.slug, item.originalImageUrl]));
const rows = covers.filter((cover) => !only || cover.id === only).map((cover) => ({
  slug: cover.slug,
  next: mode === 'revert' ? originalBySlug.get(cover.slug) : `/images/articles/${cover.id}-${cover.version ?? DEFAULT_VERSION}.webp`,
}));

let changed = 0;
for (const { slug, next } of rows) {
  if (!next) {
    console.log(`SKIP ${slug.slice(0, 50)}: no target`);
    continue;
  }
  const [current] = await sql`select image from blog_articles where slug = ${slug}`;
  if (!current) {
    console.log(`MISSING article ${slug.slice(0, 50)}`);
    continue;
  }
  if (current.image === next) {
    console.log(`same    ${slug.slice(0, 50)}`);
    continue;
  }
  if (mode === 'plan') {
    console.log(`would   ${slug.slice(0, 50)} -> ${next.split('/').pop()}`);
  } else {
    await sql`update blog_articles set image = ${next}, "updatedAt" = now() where slug = ${slug}`;
    console.log(`updated ${slug.slice(0, 50)} -> ${next.split('/').pop()}`);
    changed += 1;
  }
}
console.log(mode === 'plan' ? 'Dry run only: nothing was written.' : `${changed} article(s) updated.`);
