export interface AudioMetadataElement {
  duration: number;
  preload: string;
  src: string;
  onloadedmetadata: ((event: Event) => void) | null;
  onerror: ((event: Event | string) => void) | null;
  load: () => void;
}

interface AudioDurationDependencies {
  createObjectURL: (file: File) => string;
  revokeObjectURL: (url: string) => void;
  createAudioElement: () => AudioMetadataElement;
}

export function readAudioFileDuration(
  file: File,
  dependencies: AudioDurationDependencies = {
    createObjectURL: (selectedFile) => URL.createObjectURL(selectedFile),
    revokeObjectURL: (url) => URL.revokeObjectURL(url),
    createAudioElement: () => document.createElement('audio'),
  },
): Promise<number> {
  const objectUrl = dependencies.createObjectURL(file);
  const audio = dependencies.createAudioElement();

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      audio.onloadedmetadata = null;
      audio.onerror = null;
      dependencies.revokeObjectURL(objectUrl);
    };

    audio.onloadedmetadata = () => {
      const duration = audio.duration;
      cleanup();

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error('Não foi possível identificar a duração do áudio.'));
        return;
      }

      resolve(Math.round(duration));
    };
    audio.onerror = () => {
      cleanup();
      reject(new Error('Não foi possível identificar a duração do áudio.'));
    };
    audio.preload = 'metadata';
    audio.src = objectUrl;
    audio.load();
  });
}