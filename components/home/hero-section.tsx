import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DisplayHeading } from "@/components/common/display-heading";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-8 h-8 bg-cta-highlight rounded-full opacity-60"></div>
      <div className="absolute top-32 right-20 w-4 h-4 bg-pink-400 rounded-full opacity-60"></div>
      <div className="absolute bottom-20 left-20 w-6 h-6 bg-cta-background rounded-full opacity-60"></div>
      
      {/* Decorative Shapes */}
      <div className="absolute top-20 right-10 w-16 h-16 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full text-cta-highlight">
          <path d="M20,20 L80,20 L50,80 Z" fill="currentColor" />
        </svg>
      </div>
      
      <div className="absolute bottom-32 right-32 w-20 h-20 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full text-pink-400">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="10,5" />
        </svg>
      </div>

      <div className="max-w-[1428px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 xl:gap-24 items-center">
          {/* Left Content */}
          <div className="space-y-8 lg:pr-8">

            {/* Main Heading */}
            <div className="space-y-4">
              <DisplayHeading size="xl" highlightText="#1 Plataforma">
                #1 Plataforma de Saúde Sexual
              </DisplayHeading>
            </div>

            {/* Description */}
            <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
                Acesse conhecimento confiável e acessível sobre saúde sexual, 
                com conteúdos validados por médicos e especialistas. <br/>
                Promovemos educação, bem-estar e respeito para todas as pessoas, 
                em um espaço seguro, inclusivo e livre de tabus.
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <Link href="/courses">
                <Button 
                  size="lg" 
                  className="cursor-pointer bg-cta-highlight hover:bg-cta-highlight/90 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Conferir Cursos
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Images */}
          <div className="relative lg:pl-8">
            <div className="grid grid-cols-2 gap-6">
              {/* Left large image */}
              <div className="relative">
                {/* Background border frame positioned behind image to left and bottom */}
                <div className="absolute top-6 -left-6 border border-cta-highlight w-full h-[28rem]" style={{ borderRadius: '96px 28px 96px 28px' }}></div>
                {/* Image positioned in front */}
                <div className="relative bg-white shadow-xl overflow-hidden w-full h-[28rem]" style={{ borderRadius: '92px 24px 92px 24px' }}>
                  <Image
                    src="/images/home/page-title-home4-1.jpg"
                    alt="Student learning online"
                    width={450}
                    height={700}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right column with two smaller images */}
              <div className="space-y-8 -mt-8">
                {/* Top right image */}
                <div className="relative">
                  <div className="bg-white shadow-lg overflow-hidden" style={{ borderRadius: '80px 8px 80px 8px' }}>
                    <Image
                      src="/images/home/page-title-home4-2.jpg"
                      alt="Art student working"
                      width={400}
                      height={300}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                </div>

                {/* Bottom right image */}
                <div className="relative">
                  <div className="bg-white shadow-lg overflow-hidden" style={{ borderRadius: '80px 8px 80px 8px' }}>
                    <Image
                      src="/images/home/page-title-home4-3.jpg"
                      alt="Creative workspace"
                      width={400}
                      height={300}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements around images */}
            <div className="absolute top-1/2 -right-8 w-8 h-8 bg-cta-background rounded-lg transform -rotate-45 opacity-60"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
