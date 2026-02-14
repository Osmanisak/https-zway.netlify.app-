'use client';

import { useCart } from '@/lib/cart-context';

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart();

  return (
    <button
      type="button"
      onClick={() => addToCart(product)}
      className="rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:bg-blue-500"
    >
      Tilføj til kurv
    </button>
  );
}
