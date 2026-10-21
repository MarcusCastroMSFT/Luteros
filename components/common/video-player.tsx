'use client';

import { useState } from 'react';
import { resolveVideoSource } from '@/lib/video';

interface VideoPlayerProps {
  src?: string | null;
  title: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, title, poster, className = '' }: VideoPlayerProps) {
  const source = resolveVideoSource(src);
  const [hasError, setHasError] = useState(false);

  if (!source) {
    return (
      <div className={`flex aspect-video items-center justify-center bg-gray-950 px-6 text-center text-sm text-white ${className}`}>
        Vídeo indisponível ou URL não suportada.
      </div>
    );
  }

  if (source.kind === 'embed') {
    return (
      <iframe
        src={source.src}
        title={title}
        className={`aspect-video w-full border-0 ${className}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  if (hasError) {
    return (
      <div className={`flex aspect-video items-center justify-center bg-gray-950 px-6 text-center text-sm text-white ${className}`}>
        Não foi possível carregar o vídeo. Atualize a página e tente novamente. Se o problema persistir, o limite de redes de acesso da sua conta pode ter sido atingido.
      </div>
    );
  }

  // The browser's native download button and context menu are hidden to discourage saving the lesson.
  return (
    <video
      src={source.src}
      title={title}
      className={`aspect-video w-full bg-black object-contain ${className}`}
      controls
      controlsList="nodownload noremoteplayback"
      disablePictureInPicture
      disableRemotePlayback
      onContextMenu={(event) => event.preventDefault()}
      onError={() => setHasError(true)}
      playsInline
      poster={poster}
      preload="metadata"
    >
      Seu navegador não suporta a tag de vídeo.
    </video>
  );
}
