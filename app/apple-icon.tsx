import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: 'linear-gradient(135deg, #1fa8b2, #146b71)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="124" height="118" viewBox="1 1 22 21" fill="white">
          <path d="M12 21.593C6.37 16.054 1 11.296 1 7.191 1 3.727 3.875 1 6.925 1c2.313 0 4.315 1.364 5.075 3.218C12.76 2.364 14.763 1 17.075 1 20.125 1 23 3.727 23 7.191c0 4.105-5.37 8.863-11 14.402z" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
