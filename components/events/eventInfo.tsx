'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, BadgeDollarSign, Facebook, Linkedin, Link } from 'lucide-react';
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
  isRegistered?: boolean;
  isRegistering?: boolean;
  isCheckingRegistration?: boolean;
  onCancelRegistration?: () => void;
}

export function EventInfo({ 
  image, 
  cost, 
  totalSlots, 
  bookedSlots, 
  onBookNow,
  isRegistered = false,
  isRegistering = false,
  isCheckingRegistration = false,
  onCancelRegistration
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
    <Card className="w-full py-0 max-w-md mx-auto bg-white border border-gray-200 shadow-lg">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Informações
          </h3>

          {/* Cost */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <BadgeDollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Preço:</span>
            </div>
            <span className="text-lg font-bold" style={{ color: 'var(--cta-highlight)' }}>
              {cost === '0' || cost === 'Gratuito' ? 'Gratuito' : `R$ ${cost}`}
            </span>
          </div>

          {/* Total Slots */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Lugares:</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {totalSlots}
            </span>
          </div>

          {/* Booked Slots */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Lugares Reservados:</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {bookedSlots}
            </span>
          </div>

          {/* Separator */}
          <hr className="border-gray-200 mb-6" />

          {/* Registration Buttons */}
          {isCheckingRegistration ? (
            <div className="w-full mb-6">
              <div className="w-full bg-gray-200 rounded-lg h-12 animate-pulse"></div>
            </div>
          ) : !isRegistered ? (
            <button 
              onClick={onBookNow}
              disabled={isRegistering || bookedSlots >= totalSlots}
              className={`w-full font-semibold py-3 rounded-lg mb-6 transition-colors flex items-center justify-center gap-2 ${
                bookedSlots >= totalSlots
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : isRegistering
                  ? 'bg-slate-600 text-white cursor-wait'
                  : 'bg-slate-800 hover:bg-slate-900 text-white cursor-pointer'
              }`}
            >
              {isRegistering ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : bookedSlots >= totalSlots ? (
                'Evento Lotado'
              ) : (
                <>
                  Participar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          ) : (
            <div className="mb-6 space-y-3">
              <div className="w-full bg-green-100 text-green-800 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 border border-green-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Inscrição Confirmada
              </div>
              <button 
                onClick={onCancelRegistration}
                disabled={isRegistering}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegistering ? 'Cancelando...' : 'Cancelar Inscrição'}
              </button>
            </div>
          )}

          {/* Share Section */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 mb-3">
              Compartilhar
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={handleFacebookShare}
                className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <Facebook className="w-4 h-4 text-gray-600 group-hover:text-primary" />
              </button>
              <button 
                onClick={handleXShare}
                className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <XLogo className="w-4 h-4 text-gray-600 group-hover:text-primary" />
              </button>
              <button 
                onClick={handleCopyLink}
                className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <Link className="w-4 h-4 text-gray-600 group-hover:text-primary" />
              </button>
              <button 
                onClick={handleLinkedInShare}
                className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <Linkedin className="w-4 h-4 text-gray-600 group-hover:text-primary" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
