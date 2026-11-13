import assert from 'node:assert/strict';
import test from 'node:test';
import { sanitizeArticleContent } from './article-content.server';
import { formatArticleHtml } from './article-html';

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

test('preserves editor figures for responsive alignment, captions and image zoom', () => {
  const clean = sanitizeArticleContent(
    '<p style="text-align: center;"><figure style="width: 600px !important; display: inline-block;">' +
    '<img src="https://images.example/figure.jpg" width="600" height="390" alt="Figura" onerror="alert(1)">' +
    '<figcaption>Legenda <strong>importante</strong></figcaption></figure></p>',
  );
  const rendered = formatArticleHtml(clean);

  assert.match(clean, /<figure data-align="center" style="width:600px !important">/);
  assert.match(rendered, /class="article-figure" data-align="center" style="--figure-width:600px"/);
  assert.match(rendered, /class="article-figure-zoom" data-zoom=""/);
  assert.match(rendered, /<figcaption>Legenda <strong>importante<\/strong><\/figcaption>/);
  assert.doesNotMatch(rendered, /onerror|display: inline-block/);
});

test('preserves same-origin cover images for lesson figures', () => {
  const clean = sanitizeArticleContent(
    '<figure data-align="center"><img src="/images/articles/capa.webp" alt="Capa do artigo"></figure>',
  );
  const rendered = formatArticleHtml(clean);

  assert.match(rendered, /data-align="center"/);
  assert.match(rendered, /class="article-figure-zoom"/);
  assert.match(rendered, /src="\/images\/articles\/capa\.webp" alt="Capa do artigo"/);
});

test('preserves safe article typography, highlighted cells and PDF links', () => {
  const clean = sanitizeArticleContent(
    '<p style="text-align: justify; position: fixed"><span style="white-space: pre-wrap">Texto <sup>1</sup></span></p>' +
    '<table><tr><td style="background-color: rgb(229, 223, 236); border: 1px solid black">Destaque</td><td>Texto</td></tr></table>' +
    '<a href="/downloads/ficha.pdf">Ficha em PDF</a>',
  );
  const rendered = formatArticleHtml(clean);

  assert.match(clean, /<p style="text-align:justify">/);
  assert.match(clean, /<span style="white-space:pre-wrap">Texto <sup>1<\/sup><\/span>/);
  assert.match(rendered, /<td data-shade="">Destaque<\/td>/);
  assert.match(rendered, /href="\/downloads\/ficha\.pdf" target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(clean, /position|border/);
});

test('rejects unsafe figure alignment and CSS even when safe styles are enabled', () => {
  const clean = sanitizeArticleContent(
    '<figure data-align="center&quot; onmouseover=&quot;alert(1)" style="width: expression(alert(1)); background: url(https://evil.example/x)">' +
    '<img src="javascript:alert(1)" onerror="alert(1)"></figure>' +
    '<p style="text-align: center; background-image: url(https://evil.example/x)">Texto</p>',
  );

  assert.doesNotMatch(clean, /onmouseover|onerror|javascript:|expression|background|evil\.example/);
  assert.doesNotMatch(clean, /data-align=["'][^"']+/);
  assert.match(clean, /<p style="text-align:center">Texto<\/p>/);
});