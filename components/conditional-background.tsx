'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';

export function ConditionalBackground() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  if (!isHomePage) return null;

  return (
    <div className="fixed top-0 right-0 z-0 pointer-events-none">
      <Image
        src="/images/home/item-9.png"
        alt=""
        width={900}
        height={1100}
        className="opacity-30"
        style={{ position: 'fixed', top: 0, right: 0 }}
      />
    </div>
  );
}
