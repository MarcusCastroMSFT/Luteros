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

  // For demo purposes, we'll use a placeholder audio file
  // In a real app, you'd have actual audio URLs in your lesson data
  const getAudioUrl = () => {
    // This would typically come from lesson.audioUrl or similar
    return 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setIsPlaying(false));
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

  return (
    <div className="space-y-6">
      {/* Audio Player */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6 border border-orange-200 dark:border-orange-700">
        <audio ref={audioRef} src={getAudioUrl()} preload="metadata" />
        
        {/* Audio Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center">
            <Headphones size={24} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{lesson.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Duração: {lesson.duration}</p>
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
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
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
            className="text-gray-600 dark:text-gray-400"
          >
            <SkipBack size={20} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(-5)}
            className="text-gray-600 dark:text-gray-400"
          >
            <RotateCcw size={16} />
            <span className="text-xs ml-1">5s</span>
          </Button>

          <Button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(5)}
            className="text-gray-600 dark:text-gray-400"
          >
            <span className="text-xs mr-1">5s</span>
            <SkipForward size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skip(10)}
            className="text-gray-600 dark:text-gray-400"
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
              className="text-gray-600 dark:text-gray-400"
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
              className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">Velocidade:</span>
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
              <Button
                key={rate}
                variant={playbackRate === rate ? "default" : "ghost"}
                size="sm"
                onClick={() => changePlaybackRate(rate)}
                className={`text-xs ${
                  playbackRate === rate 
                    ? 'bg-orange-600 text-white' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {rate}x
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Audio Transcript */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
          Transcrição do Áudio
        </h3>
        <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed space-y-2">
          <p>
            <span className="text-gray-400 dark:text-gray-500">[00:00]</span> Welcome to this audio lesson. 
            In this session, we&apos;ll be covering the key concepts and practical applications...
          </p>
          <p>
            <span className="text-gray-400 dark:text-gray-500">[00:30]</span> Let&apos;s start by understanding 
            the fundamental principles that will guide our learning journey...
          </p>
          <p>
            <span className="text-gray-400 dark:text-gray-500">[01:15]</span> As we progress through 
            this material, you&apos;ll notice how these concepts build upon each other...
          </p>
        </div>
      </div>

      {/* Audio Notes Section */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Anotações de Escuta
        </h3>
        <textarea
          className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Faça anotações enquanto escuta esta audioaula..."
        />
      </div>
    </div>
  );
}
