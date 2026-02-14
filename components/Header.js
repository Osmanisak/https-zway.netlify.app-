'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function Header() {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="container-default flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-bold text-brand">
          MinWebshop
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link href="/products" className="hover:text-brand">
            Produkter
          </Link>
          <Link href="/cart" className="hover:text-brand">
            Kurv ({totalItems})
          </Link>
          <Link href="/admin" className="hover:text-brand">
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
