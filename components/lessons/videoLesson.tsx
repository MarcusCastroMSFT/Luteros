'use client';

import { useState } from 'react';
import { Lesson } from '@/types/course';
import { Play, Pause, Volume2, Maximize, Settings } from 'lucide-react';

interface VideoLessonProps {
  lesson: Lesson;
}

export function VideoLesson({ lesson }: VideoLessonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // For demo purposes, we'll use a placeholder video
  // In a real app, you'd have actual video URLs in your lesson data
  const getVideoUrl = () => {
    // This would typically come from lesson.videoUrl or similar
    return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  };

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          className="w-full h-auto max-h-96"
          controls
          poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop&crop=center"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={getVideoUrl()} type="video/mp4" />
          Seu navegador não suporta a tag de vídeo.
        </video>
        
        {/* Custom overlay for styling (optional) */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white opacity-80">
          <div className="flex items-center gap-3">
            <button 
              className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <span className="text-sm">00:00 / {lesson.duration}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors">
              <Volume2 size={16} />
            </button>
            <button className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors">
              <Settings size={16} />
            </button>
            <button className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-colors">
              <Maximize size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Video Description */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">
          Sobre este vídeo
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          {lesson.description}
        </p>
      </div>

      {/* Video Notes Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">
          Fazer Anotações
        </h3>
        <textarea
          className="w-full h-24 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 resize-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Adicione suas anotações para esta videoaula..."
        />
      </div>
    </div>
  );
}
