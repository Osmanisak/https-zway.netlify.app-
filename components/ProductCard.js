import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <article className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/produkt/${product.slug}`}>
        <Image
          src={product.images[0]}
          alt={product.name}
          width={640}
          height={420}
          className="h-48 w-full object-cover"
        />
      </Link>
      <div className="p-4">
        <Link href={`/produkt/${product.slug}`} className="block text-lg font-semibold hover:text-brand">
          {product.name}
        </Link>
        <p className="mt-1 text-sm text-slate-600">{product.shortDescription}</p>
        <p className="mt-3 text-lg font-bold">{product.price} kr.</p>
      </div>
    </article>
  );
}
