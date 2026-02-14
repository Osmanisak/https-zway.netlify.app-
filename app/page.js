import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/products';

export default async function HomePage() {
  const products = await getProducts();
  const featured = products.filter((product) => product.featured).slice(0, 3);

  return (
    <div className="space-y-16">
      <section className="rounded-2xl bg-gradient-to-r from-brand to-blue-400 p-8 text-white md:p-14">
        <p className="text-sm uppercase tracking-[0.25em]">Ny kollektion</p>
        <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">Simpel webshop klar til brug</h1>
        <p className="mt-4 max-w-xl text-white/90">
          Start din webshop på få minutter. Ingen database, bare Next.js, Tailwind og JSON produkter.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-brand"
        >
          Se alle produkter
        </Link>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Udvalgte produkter</h2>
          <Link href="/products" className="text-sm font-semibold text-brand">
            Se alle
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
