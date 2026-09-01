'use client';

interface YouTubeDurationClientOptions {
  signal?: AbortSignal;
  fetchImpl?: typeof fetch;
}

interface YouTubeDurationResponse {
  success?: boolean;
  duration?: number;
  error?: string;
}

export async function requestYouTubeVideoDuration(
  url: string,
  { signal, fetchImpl = fetch }: YouTubeDurationClientOptions = {},
): Promise<number> {
  const response = await fetchImpl('/api/courses/video-duration/youtube', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
    credentials: 'include',
    signal,
  });
  const payload = await response.json() as YouTubeDurationResponse;
  const duration = payload.duration;

  if (!response.ok) {
    throw new Error(payload.error || 'Não foi possível consultar a duração do vídeo.');
  }
  if (!payload.success || !Number.isSafeInteger(duration) || duration === undefined || duration <= 0) {
    throw new Error('Resposta inválida ao consultar a duração do vídeo.');
  }

  return duration;
}