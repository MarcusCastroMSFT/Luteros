import sanitizeHtml, { type IOptions } from 'sanitize-html';
import { normalizeArticleFigures } from './article-html';

const EMBED_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
]);

const TABLE_CELL_STYLES = {
  'background-color': [/^#[\da-f]{3,8}$/i, /^rgba?\(\s*[\d.,%\s]+\)$/i, /^[a-z]{3,20}$/i],
};

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
    'strong', 'b', 'em', 'i', 'u', 's', 'span', 'sup', 'sub', 'blockquote',
    'ul', 'ol', 'li', 'pre', 'code', 'hr', 'a', 'img', 'iframe',
    'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    p: ['style'],
    h1: ['style'],
    h2: ['style'],
    h3: ['style'],
    h4: ['style'],
    h5: ['style'],
    h6: ['style'],
    span: ['style'],
    strong: ['style'],
    b: ['style'],
    em: ['style'],
    i: ['style'],
    sup: ['style'],
    sub: ['style'],
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen'],
    figure: ['style', { name: 'data-align', values: ['start', 'center', 'end'] }],
    th: ['colspan', 'rowspan', 'style'],
    td: ['colspan', 'rowspan', 'style'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^(?:left|right|center|justify|start|end)$/i],
      'white-space': [/^pre-wrap$/i],
    },
    figure: {
      width: [/^\d{1,4}px(?:\s*!important)?$/i],
    },
    th: TABLE_CELL_STYLES,
    td: TABLE_CELL_STYLES,
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
  return sanitizeHtml(normalizeArticleFigures(content), ARTICLE_SANITIZER_OPTIONS);
}