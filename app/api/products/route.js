import { getProducts, saveProducts } from '@/lib/products';

export async function GET() {
  const products = await getProducts();
  return Response.json(products);
}

export async function POST(request) {
  const body = await request.json();
  const products = await getProducts();

  const newProduct = {
    id: crypto.randomUUID(),
    name: body.name,
    price: Number(body.price),
    category: body.category,
    description: body.description,
    images: body.images?.length ? body.images : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'],
    featured: Boolean(body.featured)
  };

  const updated = [...products, newProduct];
  await saveProducts(updated);

  return Response.json(newProduct, { status: 201 });
}
