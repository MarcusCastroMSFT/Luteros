import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Artigo não encontrado
          </h2>
          <p className="text-gray-600 mb-8">
            O artigo que você está procurando não existe ou foi removido.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Blog
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              Ir para a Página Inicial
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
