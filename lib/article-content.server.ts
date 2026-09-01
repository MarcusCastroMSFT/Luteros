import sanitizeHtml, { type IOptions } from 'sanitize-html';

const EMBED_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
]);

function isAllowedEmbedUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && EMBED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

const ARTICLE_SANITIZER_OPTIONS: IOptions = {
  allowedTags: [
    'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'strong', 'b', 'em', 'i', 'u', 's', 'blockquote',
    'ul', 'ol', 'li', 'pre', 'code', 'hr', 'a', 'img', 'iframe',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen'],
    th: ['colspan', 'rowspan'],
    td: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['https'],
    iframe: ['https'],
  },
  allowProtocolRelative: false,
  exclusiveFilter(frame) {
    return frame.tag === 'iframe'
      && (!frame.attribs.src || !isAllowedEmbedUrl(frame.attribs.src));
  },
  transformTags: {
    a: (_tagName, attribs) => ({
      tagName: 'a',
      attribs: attribs.target === '_blank'
        ? { ...attribs, rel: 'noopener noreferrer' }
        : attribs,
    }),
  },
};

export function sanitizeArticleContent(content: string | null | undefined): string {
  if (!content) return '';
  return sanitizeHtml(content, ARTICLE_SANITIZER_OPTIONS);
}