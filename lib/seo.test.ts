import assert from 'node:assert/strict';
import test from 'node:test';
import { absoluteUrl, escapeXml, stripHtml, truncateMeta } from './seo';

test('truncateMeta keeps short text and trims long text on a word boundary', () => {
  assert.equal(truncateMeta('Texto curto.'), 'Texto curto.');
  const long = 'palavra '.repeat(60);
  const result = truncateMeta(long, 160);
  assert.ok(result.length <= 160);
  assert.ok(result.endsWith('…'));
  assert.ok(!result.includes('palavr…'));
});

test('truncateMeta strips markup and handles empty values', () => {
  assert.equal(truncateMeta('<p>Olá&nbsp;<strong>mundo</strong></p>'), 'Olá mundo');
  assert.equal(truncateMeta(null), '');
});

test('stripHtml removes scripts and collapses whitespace', () => {
  assert.equal(stripHtml('<p>a</p><script>alert(1)</script>\n<p>b</p>'), 'a b');
});

test('absoluteUrl keeps absolute URLs and prefixes relative paths', () => {
  assert.equal(absoluteUrl('https://example.com/a.png'), 'https://example.com/a.png');
  assert.match(absoluteUrl('/images/a.png'), /^https?:\/\/.+\/images\/a\.png$/);
});

test('escapeXml escapes reserved characters', () => {
  assert.equal(escapeXml(`<a href="x">Tom & 'Jerry'</a>`), '&lt;a href=&quot;x&quot;&gt;Tom &amp; &apos;Jerry&apos;&lt;/a&gt;');
});
