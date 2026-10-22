import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import sharp from 'sharp';

const imagesDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');

for (const name of ['og-image.png', 'course-placeholder.png']) {
  test(`${name} is a crawler-compatible 1200 x 630 PNG under 1 MB`, async () => {
    const imagePath = join(imagesDir, name);
    const metadata = await sharp(imagePath).metadata();
    assert.equal(metadata.format, 'png');
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 630);
    assert.equal(metadata.space, 'srgb');
    assert.ok((await stat(imagePath)).size < 1024 * 1024);
    await sharp(imagePath).raw().toBuffer();
  });
}

test('course placeholder SVG remains valid and preserves its card aspect ratio', async () => {
  const svg = sharp(join(imagesDir, 'course-placeholder-v2.svg'));
  const metadata = await svg.metadata();
  assert.equal(metadata.format, 'svg');
  assert.equal(metadata.width, 800);
  assert.equal(metadata.height, 480);
  await svg.resize(400, 192, { fit: 'cover' }).png().toBuffer();
});
