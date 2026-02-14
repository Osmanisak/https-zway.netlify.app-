import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/products';

export const metadata = {
  title: 'Forside | AutoGadget Shop',
  description: 'Find populære bil-gadgets og gør din køretur smartere.'
};

export default async function HomePage() {
  const products = await getProducts();
  const popular = products.filter((product) => product.popular).slice(0, 4);

  return (
    <div className="space-y-14">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-blue-700 p-8 text-white md:p-14">
        <p className="text-sm uppercase tracking-[0.24em] text-blue-200">AutoGadget Shop</p>
        <h1 className="mt-3 text-3xl font-extrabold md:text-5xl">Smarte produkter til biler</h1>
        <p className="mt-4 max-w-2xl text-slate-100">
          Bygget simpelt uden betaling: vælg gadgets til din bil, læg i kurv, og kom hurtigt i gang.
        </p>
        <Link
          href="/produkter"
          className="mt-7 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-slate-900"
        >
          Se produkter
        </Link>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Populære produkter</h2>
          <Link href="/produkter" className="font-semibold text-brand">
            Se alle
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
