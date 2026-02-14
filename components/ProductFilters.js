'use client';

import { useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';

export default function ProductFilters({ products }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.shortDescription.toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <div className="space-y-6">
      <input
        className="w-full rounded-lg border bg-white px-4 py-3"
        placeholder="Søg efter bil-gadgets..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-lg border border-dashed p-5 text-center text-slate-600">
          Ingen produkter matcher din søgning.
        </p>
      )}
    </div>
  );
}
