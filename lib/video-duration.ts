const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export interface VideoMetadataElement {
  duration: number;
  preload: string;
  src: string;
  onloadedmetadata: ((event: Event) => void) | null;
  onerror: ((event: Event | string) => void) | null;
  load: () => void;
}

interface VideoDurationDependencies {
  createObjectURL: (file: File) => string;
  revokeObjectURL: (url: string) => void;
  createVideoElement: () => VideoMetadataElement;
}

export function getYouTubeVideoId(value: string): string | null {
  const trimmedValue = value.trim();
  if (!trimmedValue || trimmedValue.startsWith('//')) return null;

  const valueWithProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const url = new URL(valueWithProtocol);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let videoId: string | null = null;

    if (host === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] || null;
    } else if (['youtube.com', 'm.youtube.com', 'youtube-nocookie.com'].includes(host)) {
      if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v');
      } else {
        const [route, pathVideoId] = url.pathname.split('/').filter(Boolean);
        videoId = ['embed', 'live', 'shorts'].includes(route) ? pathVideoId || null : null;
      }
    }

    return videoId && YOUTUBE_VIDEO_ID_PATTERN.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}

export function parseYouTubeDuration(value: string): number | null {
  const match = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(value);
  if (!match || !match.slice(1).some(Boolean)) return null;

  const [, days = '0', hours = '0', minutes = '0', seconds = '0'] = match;
  const duration = Number(days) * 86400
    + Number(hours) * 3600
    + Number(minutes) * 60
    + Number(seconds);

  return Number.isSafeInteger(duration) ? duration : null;
}

export function readVideoFileDuration(
  file: File,
  dependencies: VideoDurationDependencies = {
    createObjectURL: (selectedFile) => URL.createObjectURL(selectedFile),
    revokeObjectURL: (url) => URL.revokeObjectURL(url),
    createVideoElement: () => document.createElement('video'),
  },
): Promise<number> {
  const objectUrl = dependencies.createObjectURL(file);
  const video = dependencies.createVideoElement();

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.onloadedmetadata = null;
      video.onerror = null;
      dependencies.revokeObjectURL(objectUrl);
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error('Não foi possível identificar a duração do vídeo.'));
        return;
      }

      resolve(Math.ceil(duration));
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('Não foi possível identificar a duração do vídeo.'));
    };
    video.preload = 'metadata';
    video.src = objectUrl;
    video.load();
  });
}