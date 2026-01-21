'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { Lesson } from '@/types/course';

interface PreviewDialogProps {
  lesson?: Lesson | null;
  course?: {
    title: string;
    video: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewDialog({ lesson, course, isOpen, onClose }: PreviewDialogProps) {
  if (!lesson && !course) return null;

  const getVideoUrl = (videoUrl?: string) => {
    // Use the provided video URL or fallback to sample video
    return videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  };

  // Course video preview
  if (course && course.video && course.video.trim() !== '') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white border-gray-200">
          <DialogHeader className="p-6 pb-0 border-b border-gray-100">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Preview: {course.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 bg-white">
            <div className="bg-black rounded-lg overflow-hidden mb-6 shadow-lg">
              <video
                className="w-full h-auto max-h-96"
                controls
                poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop&crop=center"
              >
                <source src={getVideoUrl(course.video)} type="video/mp4" />
                <span className="text-white">Seu navegador não suporta a tag de vídeo.</span>
              </video>
            </div>
            
            <div className="border-t border-gray-200 pt-4 pb-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Duração: 10:30
                  </p>
                  <p className="text-sm text-gray-600">
                    Tipo: Vídeo
                  </p>
                </div>
                <Button 
                  onClick={onClose} 
                  variant="outline" 
                  className="cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Fechar Preview
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Lesson preview (existing functionality)
  if (!lesson) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white border-gray-200">
        <DialogHeader className="p-6 pb-0 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Preview: {lesson.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="px-6 bg-white">
          {lesson.type === 'video' ? (
            <div className="bg-black rounded-lg overflow-hidden mb-6 shadow-lg">
              <video
                className="w-full h-auto max-h-96"
                controls
                poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop&crop=center"
              >
                <source src={getVideoUrl(lesson.videoUrl)} type="video/mp4" />
                <span className="text-white">Seu navegador não suporta a tag de vídeo.</span>
              </video>
            </div>
          ) : lesson.type === 'article' ? (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Play size={16} className="text-brand-600" />
                <span className="text-sm text-gray-600">Preview do Artigo</span>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700">
                  {lesson.description}
                </p>
                <p className="text-gray-600 italic">
                  Esta é uma prévia do conteúdo. Para acessar o artigo completo, inscreva-se no curso.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-brand-50 to-brand-100 rounded-lg p-6 mb-6 border border-brand-200">
              <div className="flex items-center gap-2 mb-4">
                <Play size={16} className="text-brand-600" />
                <span className="text-sm text-gray-600">Preview do Áudio</span>
              </div>
              <p className="text-gray-700 mb-4">
                {lesson.description}
              </p>
              <p className="text-gray-600 italic">
                Esta é uma prévia do conteúdo. Para acessar o áudio completo, inscreva-se no curso.
              </p>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-4 pb-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Duração: {lesson.duration}
                </p>
                <p className="text-sm text-gray-600">
                  Tipo: {lesson.type === 'video' ? 'Vídeo' : lesson.type === 'article' ? 'Artigo' : 'Áudio'}
                </p>
              </div>
              <Button 
                onClick={onClose} 
                variant="outline" 
                className="cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Fechar Preview
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
