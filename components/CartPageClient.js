'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

export default function CartPageClient() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Din kurv</h1>

      {items.length === 0 ? (
        <div className="rounded-xl border bg-white p-5">
          <p className="text-slate-600">Din kurv er tom.</p>
          <Link href="/produkter" className="mt-3 inline-block font-semibold text-brand">
            Gå til produkter
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <article key={item.slug} className="rounded-xl border bg-white p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-sm text-slate-600">{item.price} kr. pr. stk.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                      className="rounded border px-3 py-1"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                      className="rounded border px-3 py-1"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.slug)}
                      className="ml-3 rounded border border-red-300 px-3 py-1 text-red-600"
                    >
                      Fjern
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-xl font-bold">Subtotal: {subtotal} kr.</p>
            <p className="mt-1 text-sm text-slate-600">Betaling kommer senere (ikke implementeret).</p>
          </div>
        </>
      )}
    </section>
  );
}
