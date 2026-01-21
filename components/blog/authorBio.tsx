import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AuthorBioProps {
  author: string;
  authorSlug: string;
  bio?: string;
  avatar?: string;
  className?: string;
}

export function AuthorBio({ 
  author,
  authorSlug,
  bio = "Especialista em saúde e educação sexual com vasta experiência em orientação e prevenção.", 
  avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  className = ''
}: AuthorBioProps) {
  return (
    <div className={`rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 font-cardo text-gray-900">Sobre o Autor</h3>
      <div className="flex items-start gap-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={avatar}
            alt={author}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <Link href={`/especialists/${authorSlug}`}>
            <h4 className="font-semibold text-gray-900 mb-2 hover:text-[#e27447] transition-colors cursor-pointer">
              {author}
            </h4>
          </Link>
          <p className="text-gray-600 text-sm leading-relaxed">{bio}</p>
        </div>
      </div>
    </div>
  );
}
