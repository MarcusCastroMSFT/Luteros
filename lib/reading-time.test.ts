import assert from 'node:assert/strict';
import test from 'node:test';
import {
  estimateReadingSeconds,
  formatLessonDuration,
  formatReadingTime,
  formatSectionDuration,
  resolveLessonDuration,
} from './reading-time';

const words = (count: number) => Array.from({ length: count }, () => 'palavra').join(' ');

test('estimates 60 seconds for 200 words', () => {
  assert.equal(estimateReadingSeconds(`<p>${words(200)}</p>`), 60);
});

test('ignores html tags, scripts and entities-only noise', () => {
  const html = `<h2>Titulo</h2><script>var a = 1 2 3 4 5 6;</script><p>${words(9)}&nbsp;&nbsp;</p>`;
  assert.equal(estimateReadingSeconds(html), Math.ceil((1 + 9) * 0.3));
});

test('does not split a word at an html entity', () => {
  assert.equal(estimateReadingSeconds('<p>caf&eacute;</p>'), 1);
});

test('returns 0 for empty content', () => {
  assert.equal(estimateReadingSeconds(null), 0);
  assert.equal(estimateReadingSeconds(''), 0);
  assert.equal(estimateReadingSeconds('<p> </p>'), 0);
});

test('formats reading time in whole minutes, at least one', () => {
  assert.equal(formatReadingTime(1), '1 min');
  assert.equal(formatReadingTime(61), '2 min');
  assert.equal(formatReadingTime(300), '5 min');
});

test('article duration comes from the content, not the stored value', () => {
  const lesson = { type: 'article' as const, duration: 0, content: `<p>${words(400)}</p>` };
  assert.equal(resolveLessonDuration(lesson), 120);
});

test('article without content keeps the stored duration', () => {
  assert.equal(resolveLessonDuration({ type: 'article', duration: 90, content: null }), 90);
});

test('non-article lessons keep the stored duration', () => {
  assert.equal(resolveLessonDuration({ type: 'video', duration: 931, content: `<p>${words(400)}</p>` }), 931);
  assert.equal(resolveLessonDuration({ type: 'video', duration: null, content: null }), 0);
});

test('lesson duration label is minutes for articles and mm:ss otherwise', () => {
  assert.equal(formatLessonDuration('article', 300), '5 min');
  assert.equal(formatLessonDuration('article', 0), '');
  assert.equal(formatLessonDuration('video', 971), '16:11');
  assert.equal(formatLessonDuration('video', 0), '0:00');
});

test('section duration is minutes when it only has articles, mm:ss otherwise', () => {
  assert.equal(formatSectionDuration([{ type: 'article', duration: 300 }, { type: 'article', duration: 61 }]), '7 min');
  assert.equal(formatSectionDuration([{ type: 'video', duration: 600 }, { type: 'article', duration: 61 }]), '11:01');
  assert.equal(formatSectionDuration([{ type: 'article', duration: 0 }]), '');
  assert.equal(formatSectionDuration([]), '0:00');
});
