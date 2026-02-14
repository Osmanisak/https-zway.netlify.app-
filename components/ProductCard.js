import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <article className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/products/${product.id}`}>
        <Image
          src={product.images[0]}
          alt={product.name}
          width={600}
          height={400}
          className="h-48 w-full object-cover"
        />
      </Link>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">{product.category}</p>
        <Link href={`/products/${product.id}`} className="mt-1 block font-semibold hover:text-brand">
          {product.name}
        </Link>
        <p className="mt-2 text-lg font-bold">{product.price} kr.</p>
      </div>
    </article>
  );
}
