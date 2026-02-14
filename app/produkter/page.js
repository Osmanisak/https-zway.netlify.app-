import ProductFilters from '@/components/ProductFilters';
import { getProducts } from '@/lib/products';

export const metadata = {
  title: 'Produkter | AutoGadget Shop',
  description: 'Se alle bil-gadgets med nem søgning.'
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Produkter</h1>
      <p className="text-slate-600">Søg blandt vores udvalg af smarte produkter til biler.</p>
      <ProductFilters products={products} />
    </section>
  );
}
