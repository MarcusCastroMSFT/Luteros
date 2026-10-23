import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lutteros — Saúde sexual baseada em conhecimento científico',
    short_name: 'Lutteros',
    description:
      'Ciência e prática clínica em saúde sexual, com conteúdos fundamentados em evidências e revisados por especialistas.',
    lang: 'pt-BR',
    start_url: '/',
    scope: '/',
    display: 'browser',
    background_color: '#faf9f6',
    theme_color: '#198189',
    categories: ['health', 'education', 'medical'],
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
