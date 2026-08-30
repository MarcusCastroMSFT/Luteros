export type VideoSource =
  | { kind: 'embed'; src: string }
  | { kind: 'file'; src: string };

const VIDEO_FILE_PATTERN = /\.(?:m4v|mov|mp4|og[gv]|webm)$/i;
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{6,}$/;

function parseHttpUrl(value: string): URL | null {
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  const valueWithProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const url = new URL(valueWithProtocol);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

function getYouTubeId(url: URL): string | null {
  const host = url.hostname.toLowerCase().replace(/^www\./, '');

  if (host === 'youtu.be') {
    return url.pathname.split('/').filter(Boolean)[0] || null;
  }

  if (!['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
    return null;
  }

  if (url.pathname === '/watch') return url.searchParams.get('v');

  const [route, videoId] = url.pathname.split('/').filter(Boolean);
  return ['embed', 'live', 'shorts'].includes(route) ? videoId || null : null;
}

export function resolveVideoSource(value?: string | null): VideoSource | null {
  if (!value) return null;

  const url = parseHttpUrl(value);
  if (!url) return null;

  const youtubeId = getYouTubeId(url);
  if (youtubeId && VIDEO_ID_PATTERN.test(youtubeId)) {
    return {
      kind: 'embed',
      src: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
    };
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const vimeoId = url.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part));
    if (vimeoId) {
      return { kind: 'embed', src: `https://player.vimeo.com/video/${vimeoId}` };
    }
  }

  if (VIDEO_FILE_PATTERN.test(url.pathname)) {
    return { kind: 'file', src: url.toString() };
  }

  return null;
}