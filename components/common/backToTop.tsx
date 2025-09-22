"use client"

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

interface BackToTopProps {
  showAfter?: number;
  className?: string;
}

export function BackToTop({ showAfter = 300, className = "" }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = document.documentElement.scrollTop;
      const maxHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = maxHeight > 0 ? (scrolled / maxHeight) * 100 : 0;

      setIsVisible(scrolled > showAfter);
      
      // Consider it complete when within 20px of the bottom
      const adjustedProgress = scrolled >= (maxHeight - 20) && maxHeight > 0 ? 100 : progress;
      setScrollProgress(Math.min(Math.max(adjustedProgress, 0), 100));
    };

    const throttledToggleVisibility = throttle(toggleVisibility, 100);

    window.addEventListener("scroll", throttledToggleVisibility);
    // Also call once on mount to set initial state
    toggleVisibility();

    return () => window.removeEventListener("scroll", throttledToggleVisibility);
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Simple throttle function
  function throttle<T extends (...args: unknown[]) => void>(func: T, limit: number) {
    let inThrottle: boolean;
    return function(this: unknown, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  if (!isVisible) {
    return null;
  }

  const circumference = 2 * Math.PI * 18; // radius = 18
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 transition-all duration-300 cursor-pointer ${className}`}
      aria-label="Back to top"
    >
      {/* Progress Ring */}
      <div className="relative">
        <svg
          className="w-14 h-14 transform -rotate-90"
          viewBox="0 0 40 40"
        >
          {/* Background Circle */}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border opacity-20"
          />
          {/* Progress Circle */}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-cta-highlight transition-all duration-300 ease-out"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
            }}
          />
        </svg>
        
        {/* Button Background */}
        <div className="absolute inset-1 bg-app-button-dark border border-border rounded-full shadow-lg transition-all duration-300">
          {/* Arrow Icon */}
          <div className="w-full h-full flex items-center justify-center">
            <ArrowUp className="w-6 h-6 text-white transition-colors duration-300" />
          </div>
        </div>
      </div>
    </button>
  );
}
