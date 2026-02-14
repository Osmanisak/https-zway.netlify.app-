'use client';

import { useMemo, useState } from 'react';
import ProductCard from '@/components/ProductCard';

export default function ProductFilters({ products }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Alle');

  const categories = useMemo(
    () => ['Alle', ...new Set(products.map((product) => product.category))],
    [products]
  );

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const searchMatch = product.name.toLowerCase().includes(query.toLowerCase());
      const categoryMatch = category === 'Alle' || product.category === category;
      return searchMatch && categoryMatch;
    });
  }, [products, query, category]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2">
        <input
          className="rounded-lg border px-3 py-2"
          placeholder="Søg efter produkt..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          className="rounded-lg border px-3 py-2"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
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
