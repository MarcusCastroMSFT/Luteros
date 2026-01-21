import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-gradient-to-br from-brand-50 to-brand-secondary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
          {/* Left side - 404 Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              <Image
                src="/images/404.png"
                alt="Ilustração de Erro 404"
                width={500}
                height={400}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
          
          {/* Right side - Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Ops! Parece que você se perdeu.
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-md mx-auto lg:mx-0">
              A página que você está procurando não está disponível. Tente pesquisar novamente ou use o botão abaixo.
            </p>
            
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-200 group"
            >
              Voltar Para a Página Inicial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
