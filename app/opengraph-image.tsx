import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'lutteros - Saúde Sexual e Bem-estar';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Image generation
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(circle at 30% 20%, #1c3b3d 0%, #0d1b1c 55%, #070f10 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background: 'linear-gradient(90deg, #1fa8b2, #146b71)',
          }}
        />

        {/* Logo badge */}
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 36,
            background: 'linear-gradient(135deg, #1fa8b2, #146b71)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 44,
            boxShadow: '0 20px 60px rgba(31, 168, 178, 0.35)',
          }}
        >
          <svg width="96" height="92" viewBox="1 1 22 21" fill="white">
            <path d="M12 21.593C6.37 16.054 1 11.296 1 7.191 1 3.727 3.875 1 6.925 1c2.313 0 4.315 1.364 5.075 3.218C12.76 2.364 14.763 1 17.075 1 20.125 1 23 3.727 23 7.191c0 4.105-5.37 8.863-11 14.402z" />
          </svg>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: -2,
            display: 'flex',
          }}
        >
          lutteros
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: '#4fd1c5',
            marginTop: 8,
            display: 'flex',
          }}
        >
          Saúde Sexual e Bem-estar
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255, 255, 255, 0.72)',
            marginTop: 28,
            maxWidth: 900,
            textAlign: 'center',
            display: 'flex',
          }}
        >
          Cursos, artigos e especialistas para cuidar da sua saúde íntima
        </div>
      </div>
    ),
    { ...size },
  );
}
