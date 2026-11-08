// Page shown in the new tab while the checkout is being created. The tab has to be opened
// during the click (pop-up blockers), but the Asaas link only exists a second or two later,
// so this fills the wait instead of leaving a blank page.

export function renderCheckoutInterstitial(origin: string): string {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Pagamento · Lutteros</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #faf9f6; color: #052628; font-family: 'DM Sans', 'Helvetica Neue', Arial, sans-serif; }
  main { width: 100%; max-width: 440px; padding: 40px 32px; text-align: center; background: #fff; border: 1px solid #e1e8e5; border-radius: 20px; }
  img { display: block; width: 150px; height: auto; margin: 0 auto 28px; }
  .spinner { width: 44px; height: 44px; margin: 0 auto 24px; border: 3px solid #e4eeeb; border-top-color: #198189; border-radius: 50%; animation: spin 0.9s linear infinite; }
  h1 { margin: 0 0 12px; font-family: Cardo, Georgia, 'Times New Roman', serif; font-size: 28px; line-height: 34px; font-weight: 400; }
  p { margin: 0 0 8px; font-size: 15px; line-height: 24px; color: #2c4346; }
  .hint { margin-top: 20px; font-size: 13px; color: #5b6f71; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) { .spinner { animation: none; border-top-color: #198189; border-right-color: #198189; } }
  @media (prefers-color-scheme: dark) {
    body { background: #061b1d; color: #eef5f3; }
    main { background: #0b2629; border-color: #1b4044; }
    p { color: #cddbd8; }
    .hint { color: #a2b7b4; }
    .spinner { border-color: #1f4448; border-top-color: #86d3d6; }
  }
</style>
</head>
<body>
<main role="status" aria-live="polite">
  <picture>
    <source srcset="${origin}/email/lutteros-logo-dark.png" media="(prefers-color-scheme: dark)">
    <img src="${origin}/email/lutteros-logo.png" alt="Lutteros" width="150">
  </picture>
  <div class="spinner" aria-hidden="true"></div>
  <h1>Preparando seu pagamento</h1>
  <p>Em instantes você será levado ao ambiente seguro do Asaas para escolher Pix, boleto ou cartão.</p>
  <p class="hint">Não feche esta aba.</p>
</main>
</body>
</html>`
}

/** Fills a just-opened blank tab with the interstitial. Safe to call on a blocked (null) tab. */
export function showCheckoutInterstitial(tab: Window | null, origin: string): void {
  if (!tab) return
  tab.opener = null
  tab.document.open()
  tab.document.write(renderCheckoutInterstitial(origin))
  tab.document.close()
}
