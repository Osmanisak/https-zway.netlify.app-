import Image from 'next/image';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/AddToCartButton';
import { getProductById, getProducts } from '@/lib/products';

export async function generateMetadata({ params }) {
  const product = await getProductById(params.id);

  if (!product) {
    return {
      title: 'Produkt ikke fundet | MinWebshop',
      description: 'Produktet findes ikke.'
    };
  }

  return {
    title: `${product.name} | MinWebshop`,
    description: product.description
  };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ id: product.id }));
}

export default async function ProductPage({ params }) {
  const product = await getProductById(params.id);

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
        <p className="text-sm uppercase tracking-wide text-slate-500">{product.category}</p>
        <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
        <p className="mt-3 text-2xl font-extrabold">{product.price} kr.</p>
        <p className="mt-5 text-slate-700">{product.description}</p>
        <div className="mt-7">
          <AddToCartButton product={product} />
        </div>
      </div>
    </section>
  );
}
