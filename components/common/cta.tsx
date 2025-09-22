import Image from "next/image";
import { AppLinks } from "@/components/app-links";
import { PreTitleTag } from "@/components/common/pre-title-tag";

interface CTAProps {
  preTitle?: string;
  title?: string;
  highlightText?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

export function CTA({
  preTitle = "Download & Enjoy",
  title = "The Best Place To",
  highlightText = "Learn?",
  description = "With the UpSkill App, you can learn no matter where you are. Download now to learn anything, anytime for free.",
  imageSrc = "/images/home/mobile-app.png",
  imageAlt = "Learning illustration",
  className = ""
}: CTAProps) {
  return (
    <section className={`py-16 lg:py-24 w-screen bg-cta-background ${className}`}>
      <div className="max-w-[1428px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            {preTitle && (
              <PreTitleTag text={preTitle} icon="star" />
            )}
            
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight" style={{ fontFamily: 'Cardo, serif' }}>
                {title}{" "}
                <span className="text-cta-highlight" style={{ fontFamily: 'Cardo, serif' }}>
                  {highlightText}
                </span>
                <br />
                Wherever You Are.
              </h2>
              
              {description && (
                <p className="text-lg text-text-secondary max-w-md leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            
            {/* CTA Buttons */}
            <AppLinks colorMode="dark" title={null} className="mt-8" />
          </div>
          
          {/* Image */}
          <div className="relative lg:order-last">
            <div className="relative w-full h-96 lg:h-[500px] flex items-center justify-center">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="text-center text-gray-400">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mx-auto mb-4">
                    <path d="M14.5 4h-5L7 6.5 4.5 9v10L7 21.5l2.5 2.5h5l2.5-2.5L19.5 19V9L17 6.5 14.5 4z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <p className="text-sm">Learning Illustration</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
