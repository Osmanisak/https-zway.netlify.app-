'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';


export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Din kurv</h1>
        <p className="text-slate-600">Kurven er tom lige nu.</p>
        <Link href="/products" className="inline-block rounded-lg bg-brand px-4 py-2 text-white">
          Gå til produkter
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Din kurv</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-sm text-slate-600">{item.price} kr. pr. stk.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="rounded border px-3 py-1"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="rounded border px-3 py-1"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-3 rounded border border-red-300 px-3 py-1 text-red-600"
                >
                  Fjern
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-4">
        <p className="text-lg font-bold">Total: {totalPrice} kr.</p>
        <button
          onClick={clearCart}
          className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          Tøm kurv
        </button>
      </div>
    </section>
  );
}
