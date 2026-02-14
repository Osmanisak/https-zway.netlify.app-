'use client';

import { useEffect, useState } from 'react';

const emptyForm = {
  name: '',
  price: '',
  category: '',
  description: '',
  images: '',
  featured: false
};

export default function AdminPanel() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadProducts = async () => {
    const response = await fetch('/api/products');
    const data = await response.json();
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      images: form.images
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    };

    if (editingId) {
      await fetch(`/api/products/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    setForm(emptyForm);
    setEditingId(null);
    loadProducts();
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      description: product.description,
      images: product.images.join(', '),
      featured: product.featured
    });
  };

  const handleDelete = async (id) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    loadProducts();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <section>
        <h2 className="mb-4 text-xl font-bold">Produkter</h2>
        <div className="space-y-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-lg border bg-white p-4">
              <p className="font-semibold">{product.name}</p>
              <p className="text-sm text-slate-600">
                {product.price} kr. · {product.category}
              </p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => startEdit(product)} className="rounded border px-3 py-1">
                  Rediger
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="rounded border border-red-300 px-3 py-1 text-red-600"
                >
                  Slet
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="text-xl font-bold">{editingId ? 'Rediger produkt' : 'Opret produkt'}</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            required
            className="w-full rounded border px-3 py-2"
            placeholder="Navn"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            required
            type="number"
            className="w-full rounded border px-3 py-2"
            placeholder="Pris"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
          />
          <input
            required
            className="w-full rounded border px-3 py-2"
            placeholder="Kategori"
            value={form.category}
            onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
          />
          <textarea
            required
            className="w-full rounded border px-3 py-2"
            rows={4}
            placeholder="Beskrivelse"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Billede URL(s), adskilt med komma"
            value={form.images}
            onChange={(event) => setForm((prev) => ({ ...prev, images: event.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))}
            />
            Vis på forsiden (udvalgt)
          </label>

          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-brand px-4 py-2 font-semibold text-white">
              {editingId ? 'Gem ændringer' : 'Opret produkt'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="rounded-lg border px-4 py-2"
              >
                Annuller
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
