import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import { getProductBySlug, getProducts } from '@/lib/products';

export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Produkt ikke fundet | AutoGadget Shop',
      description: 'Produktet findes ikke.'
    };
  }

  return {
    title: `${product.name} | AutoGadget Shop`,
    description: product.shortDescription
  };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <section className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-4">
        {product.images.map((image) => (
          <Image
            key={image}
            src={image}
            alt={product.name}
            width={1000}
            height={700}
            className="w-full rounded-xl border bg-white object-cover"
          />
        ))}
      </div>

      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="mt-3 text-2xl font-extrabold">{product.price} kr.</p>
        <p className="mt-4 text-slate-700">{product.description}</p>

        <div className="mt-6">
          <h2 className="font-semibold">Highlights</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
            {product.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <AddToCartButton product={product} />
          <Link
            href="/kurv"
            className="rounded-lg border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-100"
          >
            Køb nu
          </Link>
        </div>
      </div>
    </section>
  );
}
