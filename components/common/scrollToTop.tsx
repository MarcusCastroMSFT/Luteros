'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (scrollHeight > 0) {
        setScrollProgress((currentScroll / scrollHeight) * 100);
      }
      
      setIsVisible(currentScroll > 200);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 cursor-pointer transition-all duration-300 hover:scale-105"
      aria-label="Back to top"
    >
      <div className="relative w-12 h-12">
        {/* Dark background circle */}
        <div className="absolute inset-0 w-12 h-12 bg-slate-900 rounded-full shadow-lg"></div>
        
        {/* Progress SVG */}
        <svg
          className="absolute inset-0 w-12 h-12 transform -rotate-90"
          viewBox="0 0 40 40"
        >
          {/* Background circle for progress track */}
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="opacity-30 text-gray-600"
          />
          {/* Progress circle */}
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-cta-highlight transition-all duration-150"
          />
        </svg>
        
        {/* Arrow icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <ArrowUp className="h-4 w-4 text-white" />
        </div>
      </div>
    </div>
  );
}
