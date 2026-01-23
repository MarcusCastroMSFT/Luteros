import { Metadata } from 'next';
import { ContactPageClient } from './contact-client';

export const metadata: Metadata = {
  title: 'Contato | lutteros',
  description: 'Entre em contato com a equipe lutteros. Estamos aqui para ajudar você em sua jornada de aprendizado.',
  openGraph: {
    title: 'Contato | lutteros',
    description: 'Entre em contato com a equipe lutteros. Estamos aqui para ajudar você em sua jornada de aprendizado.',
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
