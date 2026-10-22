import { Metadata } from 'next';
import { ContactPageClient } from './contact-client';
import { DEFAULT_SOCIAL_IMAGE } from '@/lib/social-images';

export const metadata: Metadata = {
  title: 'Contato | lutteros',
  description: 'Entre em contato com a equipe lutteros. Estamos aqui para ajudar você em sua jornada de aprendizado.',
  openGraph: {
    images: [DEFAULT_SOCIAL_IMAGE],
    title: 'Contato | lutteros',
    description: 'Entre em contato com a equipe lutteros. Estamos aqui para ajudar você em sua jornada de aprendizado.',
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
