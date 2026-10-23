import assert from 'node:assert/strict'
import test from 'node:test'
import { formatArticleHtml } from './article-html'

const editorFigure = (pStyle = 'text-align: center;') =>
  `<p class="mb-2 text-gray-900" style="${pStyle}"><figure itemscope="" itemtype="https://schema.org/ImageObject" style="width: 600px !important; display: inline-block;"><img src="https://blob.example/a.jpeg" itemprop="height" alt="Imagem inserida" loading="lazy" width="600" height="390" style="width: 600px !important; max-width: none !important;"><figcaption itemprop="caption" style="background-color: rgb(230, 244, 245);">Figura 1: Caracterização da queixa sexual.</figcaption></figure></p>`

test('returns an empty string for empty content', () => {
  assert.equal(formatArticleHtml(null), '')
  assert.equal(formatArticleHtml(''), '')
})

test('moves figures out of paragraphs and keeps the authored alignment', () => {
  const html = formatArticleHtml(`<p>Antes</p>${editorFigure()}<p>Depois</p>`)
  assert.doesNotMatch(html, /<p[^>]*>\s*<figure/)
  assert.match(html, /<p>Antes<\/p><figure class="article-figure" data-align="center"/)
  assert.match(html, /<\/figure><p>Depois<\/p>/)
  assert.match(formatArticleHtml(editorFigure('text-align: right;')), /data-align="end"/)
  assert.match(formatArticleHtml(editorFigure('text-align: justify;')), /data-align="start"/)
})

test('replaces fixed !important sizes with a responsive max width', () => {
  const html = formatArticleHtml(editorFigure())
  assert.doesNotMatch(html, /!important|max-width: none|itemprop/)
  assert.match(html, /style="--figure-width:600px"/)
  assert.match(html, /<img src="https:\/\/blob\.example\/a\.jpeg" alt="Imagem inserida" width="600" height="390" loading="lazy" decoding="async">/)
})

test('wraps the image in a zoom button named after the caption', () => {
  const html = formatArticleHtml(editorFigure())
  assert.match(html, /<button type="button" class="article-figure-zoom" data-zoom="" aria-label="Ampliar imagem: Figura 1: Caracterização da queixa sexual\.">/)
  assert.match(html, /<figcaption>Figura 1: Caracterização da queixa sexual\.<\/figcaption>/)
})

test('escapes quotes from the caption inside the button label', () => {
  const html = formatArticleHtml('<figure><img src="https://x/a.png" alt=""><figcaption>Uso de "dilatadores"</figcaption></figure>')
  assert.match(html, /aria-label="Ampliar imagem: Uso de &quot;dilatadores&quot;"/)
})

const cell = (text: string, style = 'width: 75px; border: 1px solid black;') =>
  `<td class="border border-gray-300 px-3 py-2" style="${style}"><p class="mb-2">${text}</p></td>`

test('turns 3+ column tables into a grid with column headers', () => {
  const html = formatArticleHtml(
    `<table class="border-collapse border border-gray-300 w-full my-4"><colgroup><col><col><col></colgroup><tbody><tr>${cell('Produto')}${cell('Uso')}${cell('Limite')}</tr><tr>${cell('Coletor')}${cell('Interno')}${cell('Silicone')}</tr></tbody></table>`,
  )
  assert.match(html, /^<div class="article-table" data-kind="grid" role="region" aria-label="Tabela" tabindex="0"><table><thead><tr><th scope="col">/)
  assert.match(html, /<\/thead><tbody><tr><td><p class="mb-2">Coletor<\/p><\/td>/)
  assert.doesNotMatch(html, /border: 1px solid black|border-gray-300|colgroup/)
})

test('classifies two-column and single-column tables', () => {
  const pairs = formatArticleHtml(`<table><tbody><tr>${cell('Condições médicas')}${cell('Diabetes')}</tr></tbody></table>`)
  assert.match(pairs, /data-kind="pairs"/)
  assert.doesNotMatch(pairs, /<th/)

  const note = formatArticleHtml(`<table><tbody><tr>${cell('Destaque')}</tr></tbody></table>`)
  assert.match(note, /data-kind="note"/)
})

test('turns pasted Word checkboxes into a visible symbol and drops other control characters', () => {
  assert.equal(formatArticleHtml('<p>Tem orgasmo? \u009Asim \u009Anão\u0085</p>'), '<p>Tem orgasmo? ☐sim ☐não</p>')
})

test('keeps spans and marks cells the author shaded', () => {
  const html = formatArticleHtml(
    `<table><tbody><tr><td colspan="2" style="background-color: rgb(229, 223, 236); border: 1px solid black;">A</td><td>B</td></tr></tbody></table>`,
  )
  assert.match(html, /data-kind="grid"/)
  assert.match(html, /<th scope="col" colspan="2" data-shade="">A<\/th>/)
})
