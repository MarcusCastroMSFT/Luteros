import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizeArticleContent } from './article-content.server';

test('returns an empty string when article content is absent', () => {
  assert.equal(sanitizeArticleContent(null), '');
  assert.equal(sanitizeArticleContent(undefined), '');
  assert.equal(sanitizeArticleContent(''), '');
});

test('preserves semantic rich text produced by the article editor', () => {
  const result = sanitizeArticleContent(`
    <h2>Título</h2>
    <p><strong>Texto</strong> com <em>ênfase</em>.</p>
    <ul><li>Primeiro item</li></ul>
    <blockquote>Uma citação</blockquote>
    <pre><code>const answer = 42;</code></pre>
  `);

  assert.match(result, /<h2>Título<\/h2>/);
  assert.match(result, /<strong>Texto<\/strong>/);
  assert.match(result, /<em>ênfase<\/em>/);
  assert.match(result, /<ul><li>Primeiro item<\/li><\/ul>/);
  assert.match(result, /<blockquote>Uma citação<\/blockquote>/);
  assert.match(result, /<pre><code>const answer = 42;<\/code><\/pre>/);
});

test('removes executable markup, event handlers, styles, and unsafe URLs', () => {
  const result = sanitizeArticleContent(`
    <script>alert(1)</script>
    <img src="https://images.example/image.jpg" onerror="alert(1)" style="position:fixed">
    <a href="javascript:alert(1)" onclick="alert(1)">Abrir</a>
    <iframe srcdoc="<script>alert(1)</script>"></iframe>
  `);

  assert.doesNotMatch(result, /script|onerror|onclick|style=|javascript:|srcdoc/i);
  assert.match(result, /<img src="https:\/\/images\.example\/image\.jpg" \/>/);
});

test('allows HTTPS YouTube and Vimeo embeds and removes unapproved iframe hosts', () => {
  const result = sanitizeArticleContent(`
    <iframe src="https://www.youtube.com/embed/abc" allowfullscreen></iframe>
    <iframe src="https://player.vimeo.com/video/123" allowfullscreen></iframe>
    <iframe src="https://evil.example/embed/abc"></iframe>
    <iframe src="//www.youtube.com/embed/protocol-relative"></iframe>
  `);

  assert.match(result, /https:\/\/www\.youtube\.com\/embed\/abc/);
  assert.match(result, /https:\/\/player\.vimeo\.com\/video\/123/);
  assert.doesNotMatch(result, /evil\.example|protocol-relative/);
});

test('hardens links that open a new tab', () => {
  const result = sanitizeArticleContent(
    '<a href="https://example.com/material" target="_blank">Material</a>',
  );

  assert.match(result, /target="_blank"/);
  assert.match(result, /rel="noopener noreferrer"/);
});