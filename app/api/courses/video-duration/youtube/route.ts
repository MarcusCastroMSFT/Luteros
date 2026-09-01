import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrInstructor } from '@/lib/auth-helpers';
import { getYouTubeVideoId } from '@/lib/video-duration';
import { fetchYouTubeVideoDuration } from '@/lib/youtube-video.server';

const MAX_VIDEO_URL_LENGTH = 2048;

export async function POST(request: NextRequest) {
  const authResult = await requireAdminOrInstructor(request);
  if (authResult instanceof NextResponse) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Requisição inválida.' }, { status: 400 });
  }

  const url = typeof body === 'object' && body !== null && 'url' in body
    ? (body as { url?: unknown }).url
    : null;
  if (typeof url !== 'string' || url.length > MAX_VIDEO_URL_LENGTH || !getYouTubeVideoId(url)) {
    return NextResponse.json({ success: false, error: 'URL do YouTube inválida.' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY || '';
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Consulta de duração do YouTube não configurada.' },
      { status: 503 },
    );
  }

  try {
    const duration = await fetchYouTubeVideoDuration(url, { apiKey });
    return NextResponse.json({ success: true, duration });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Não foi possível consultar a duração do vídeo.' },
      { status: 502 },
    );
  }
}