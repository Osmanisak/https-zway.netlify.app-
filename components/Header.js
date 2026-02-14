'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
      <div className="container-default flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-bold text-brand">
          AutoGadget Shop
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/produkter" className="hover:text-brand">
            Produkter
          </Link>
          <Link href="/kontakt" className="hover:text-brand">
            Kontakt
          </Link>
          <Link href="/kurv" className="hover:text-brand">
            Kurv ({totalItems})
          </Link>
        </nav>
      </div>
    </header>
  );
}
