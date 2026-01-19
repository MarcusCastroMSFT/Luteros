'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Clock, 
  FileText, 
  Download, 
  Smartphone, 
  Infinity, 
  Award, 
  Facebook, 
  Linkedin, 
  Link
} from 'lucide-react';
import { toast } from 'sonner';
import { Course } from '@/types/course';
import { PreviewDialog } from './previewDialog';

// Custom X (Twitter) Logo Component
const XLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface CourseInfoProps {
  course: Course;
  onEnroll?: () => void;
}

export function CourseInfo({ course, onEnroll }: CourseInfoProps) {
  const [showVideo, setShowVideo] = useState(false);

  const formatPrice = (price: number) => {
    if (price === 0) return 'Grátis';
    return `R$${price.toFixed(2).replace('.', ',')}`;
  };

  const handleImageClick = () => {
    if (course.video) {
      setShowVideo(true);
    }
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleXShare = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Confira este curso incrível!');
    window.open(`https://x.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const handleLinkedInShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Pronto! Link copiado.', {
        duration: 3000,
      });
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Falha ao copiar link', {
        duration: 3000,
      });
    }
  };

  return (
    <>
      <Card className="w-full py-0 max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardContent className="p-0">
          {/* Course Image/Video */}
          <div className="p-4">
            <div className="relative w-full h-48 overflow-hidden rounded-lg">
              <div 
                className="relative w-full h-full cursor-pointer group"
                onClick={handleImageClick}
              >
                <Image
                  src={course.image}
                  alt={course.title}
                  width={400}
                  height={192}
                  className="w-full h-full object-cover"
                />
                {course.video && (
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-colors">
                    <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Price Section */}
        <div className="px-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold" style={{ color: 'var(--cta-highlight)' }}>
                {formatPrice(course.price)}
              </span>
              {course.originalPrice && course.originalPrice > course.price && (
                <>
                  <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(course.originalPrice)}
                  </span>
                  <span className="text-sm bg-brand-100 dark:bg-brand-900 text-brand-600 dark:text-brand-400 px-2 py-1 rounded">
                    {Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 mb-6">
          <button 
            onClick={onEnroll}
            className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold py-3 rounded-lg mb-3 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            Registrar
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Course Includes Section */}
        <div className="px-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Este curso inclui:
          </h3>

          <div className="space-y-3">
            {/* Video Hours */}
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{course.duration} de video</span>
            </div>

            {/* Articles (if available) */}
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <FileText className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">3 artigos</span>
            </div>

            {/* Downloadable Resources */}
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Download className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{course.lessonsCount * 10 + 49} recursos para download</span>
            </div>

            {/* Mobile and TV Access */}
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Smartphone className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Acesso em dispositivos móveis e TV</span>
            </div>

            {/* Full Lifetime Access */}
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Infinity className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Acesso incluso com assinatura mensal</span>
            </div>

            {/* Certificate of Completion */}
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <Award className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Certificado de conclusão</span>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="px-6 pb-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Compartilhe este curso
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={handleFacebookShare}
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
              >
                <Facebook className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-primary" />
              </button>
              <button 
                onClick={handleXShare}
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
              >
                <XLogo className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-primary" />
              </button>
              <button 
                onClick={handleCopyLink}
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
              >
                <Link className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-primary" />
              </button>
              <button 
                onClick={handleLinkedInShare}
                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
              >
                <Linkedin className="w-4 h-4 text-gray-600 dark:text-gray-300 group-hover:text-primary" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
      </Card>
      
      {/* Video Dialog */}
      <PreviewDialog 
        course={course.video ? { title: course.title, video: course.video } : undefined}
        isOpen={showVideo}
        onClose={() => setShowVideo(false)}
      />
    </>
  );
}
