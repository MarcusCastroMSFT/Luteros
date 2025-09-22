'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, DollarSign, Facebook, Linkedin, Link } from 'lucide-react';
import { toast } from 'sonner';

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

interface EventInfoProps {
  image: string;
  cost: string;
  totalSlots: number;
  bookedSlots: number;
  onBookNow?: () => void;
}

export function EventInfo({ 
  image, 
  cost, 
  totalSlots, 
  bookedSlots, 
  onBookNow 
}: EventInfoProps) {
  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleXShare = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Check out this amazing event!');
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
    <Card className="w-full py-0 max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
      <CardContent className="p-0">
        {/* Event Image */}
        <div className="p-4">
          <div className="relative w-full h-48 overflow-hidden rounded-lg">
            <Image
              src={image}
              alt="Event"
              width={400}
              height={192}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Event Info Section */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Informações
          </h3>

          {/* Cost */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Preço:</span>
            </div>
            <span className="text-lg font-bold" style={{ color: 'var(--cta-highlight)' }}>
              {cost}
            </span>
          </div>

          {/* Total Slots */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Lugares:</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalSlots}
            </span>
          </div>

          {/* Booked Slots */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Lugares Reservados:</span>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {bookedSlots}
            </span>
          </div>

          {/* Separator */}
          <hr className="border-gray-200 dark:border-gray-600 mb-6" />

          {/* Book Now Button */}
          <button 
            onClick={onBookNow}
            className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold py-3 rounded-lg mb-6 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            Participar
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Share Section */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Compartilhar
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
  );
}
