import { getYouTubeVideoId, parseYouTubeDuration } from '@/lib/video-duration';

interface YouTubeDurationOptions {
  apiKey: string;
  fetchImpl?: typeof fetch;
}

interface YouTubeVideoResponse {
  items?: Array<{
    contentDetails?: {
      duration?: string;
    };
  }>;
}

export async function fetchYouTubeVideoDuration(
  videoUrl: string,
  { apiKey, fetchImpl = fetch }: YouTubeDurationOptions,
): Promise<number> {
  const videoId = getYouTubeVideoId(videoUrl);
  if (!videoId) throw new Error('URL do YouTube inválida.');
  if (!apiKey) throw new Error('Consulta de duração do YouTube não configurada.');

  const endpoint = new URL('https://www.googleapis.com/youtube/v3/videos');
  endpoint.searchParams.set('part', 'contentDetails');
  endpoint.searchParams.set('id', videoId);
  endpoint.searchParams.set('key', apiKey);

  const response = await fetchImpl(endpoint, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Não foi possível consultar a duração do vídeo.');

  const payload = await response.json() as YouTubeVideoResponse;
  const isoDuration = payload.items?.[0]?.contentDetails?.duration;
  const duration = isoDuration ? parseYouTubeDuration(isoDuration) : null;
  if (!duration) throw new Error('Duração do vídeo indisponível.');

  return duration;
}