import assert from 'node:assert/strict'
import test from 'node:test'
import { renderCheckoutInterstitial, showCheckoutInterstitial } from './checkout-interstitial'

test('interstitial tells the buyer what is happening and uses the site logo', () => {
  const html = renderCheckoutInterstitial('https://www.lutteros.com.br')
  assert.match(html, /Preparando seu pagamento/)
  assert.match(html, /Pix, boleto ou cartão/)
  assert.match(html, /Não feche esta aba/)
  assert.ok(html.includes('src="https://www.lutteros.com.br/email/lutteros-logo.png"'))
  assert.match(html, /<html lang="pt-BR">/)
})

test('interstitial respects reduced motion and is not indexable', () => {
  const html = renderCheckoutInterstitial('https://x.test')
  assert.match(html, /prefers-reduced-motion: reduce/)
  assert.match(html, /name="robots" content="noindex"/)
})

test('a blocked pop-up (null tab) is ignored', () => {
  assert.doesNotThrow(() => showCheckoutInterstitial(null, 'https://x.test'))
})

test('the interstitial is written into the opened tab without keeping an opener', () => {
  const calls: string[] = []
  const tab = {
    opener: 'parent',
    document: { open: () => calls.push('open'), write: (html: string) => calls.push(html.slice(0, 15)), close: () => calls.push('close') },
  } as unknown as Window
  showCheckoutInterstitial(tab, 'https://x.test')
  assert.equal((tab as { opener: unknown }).opener, null)
  assert.deepEqual(calls, ['open', '<!doctype html>', 'close'])
})
