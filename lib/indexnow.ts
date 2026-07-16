// IndexNow — instantly notify search engines (Bing, Yandex, etc.) when content
// changes. See https://www.indexnow.org and https://www.bing.com/indexnow/getstarted
//
// The verification key is hosted at /<key>.txt (public/05fb...txt). Search
// engines fetch that file to confirm ownership before accepting submissions.

const INDEXNOW_KEY = '05fb1599817b427f8bb465227c9c50df'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

/**
 * Submit one or more URLs to IndexNow. Fire-and-forget safe: it never throws,
 * so callers can await it without risking the main request. Only runs for the
 * verified production host (skips localhost / preview deployments).
 */
export async function submitToIndexNow(urls: string | string[]): Promise<void> {
  const list = (Array.isArray(urls) ? urls : [urls]).filter(Boolean)
  if (list.length === 0) return

  let host: string
  try {
    host = new URL(list[0]).host
  } catch {
    return
  }

  // Only notify IndexNow for the verified production domain where the key file
  // is actually reachable. Prevents useless pings from localhost/preview.
  if (!host.endsWith('lutteros.com.br')) return

  const baseUrl = `https://${host}`

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${baseUrl}/${INDEXNOW_KEY}.txt`,
        urlList: list,
      }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`IndexNow submit failed (${res.status}): ${text}`)
    }
  } catch (error) {
    console.error('IndexNow submit error:', error)
  }
}
