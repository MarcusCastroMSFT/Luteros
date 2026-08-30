import { Lesson } from '@/types/course';
import { VideoPlayer } from '@/components/common/video-player';

interface VideoLessonProps {
  lesson: Lesson;
}

export function VideoLesson({ lesson }: VideoLessonProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg bg-black">
        <VideoPlayer
          src={lesson.videoUrl}
          title={lesson.title}
          poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop&crop=center"
        />
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