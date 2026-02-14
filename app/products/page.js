import ProductFilters from '@/components/ProductFilters';
import { getProducts } from '@/lib/products';

export const metadata = {
  title: 'Produkter | MinWebshop',
  description: 'Se alle produkter med søgning og filtrering.'
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Produkter</h1>
      <p className="text-slate-600">Søg og filtrér blandt alle varer i shoppen.</p>
      <ProductFilters products={products} />
    </section>
  );
}
