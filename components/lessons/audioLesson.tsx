'use client';

import { useState, useRef, useEffect } from 'react';
import { Lesson } from '@/types/course';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  Headphones 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioLessonProps {
  lesson: Lesson;
}

export function AudioLesson({ lesson }: AudioLessonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value);
    
    if (audio) {
      audio.volume = newVolume;
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const changePlaybackRate = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!lesson.videoUrl) {
    return (
      <div className="rounded-lg border bg-muted/50 p-6 text-center text-sm text-muted-foreground">
        Áudio indisponível.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Audio Player */}
      <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-lg p-6 border border-brand-200">
        <audio ref={audioRef} src={lesson.videoUrl} preload="metadata" />
        
        {/* Audio Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-brand-200 rounded-full flex items-center justify-center">
            <Headphones size={24} className="text-cta-highlight" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
            <p className="text-sm text-gray-600">Duração: {lesson.duration}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(-10)}
            className="text-gray-600"
          >
            <SkipBack size={20} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(-5)}
            className="text-gray-600"
          >
            <RotateCcw size={16} />
            <span className="text-xs ml-1">5s</span>
          </Button>

          <Button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-cta-highlight hover:bg-cta-highlight/90 text-white"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(5)}
            className="text-gray-600"
          >
            <span className="text-xs mr-1">5s</span>
            <SkipForward size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(10)}
            className="text-gray-600"
          >
            <SkipForward size={20} />
          </Button>
        </div>

        {/* Volume and Speed Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-gray-600"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Velocidade:</span>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <Button
                key={rate}
                variant={playbackRate === rate ? "default" : "ghost"}
                size="sm"
                onClick={() => changePlaybackRate(rate)}
                className={`text-xs ${
                  playbackRate === rate 
                    ? 'bg-cta-highlight text-white' 
                    : 'text-gray-600'
                }`}
              >
                {rate}x
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Notes Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">
          Anotações de Escuta
        </h3>
        <textarea
          className="w-full h-24 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 resize-none focus:ring-2 focus:ring-cta-highlight focus:border-transparent"
          placeholder="Faça anotações enquanto escuta esta audioaula..."
        />
      </div>
    </div>
  );
}
