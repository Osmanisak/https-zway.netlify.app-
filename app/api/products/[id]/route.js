import { getProducts, saveProducts } from '@/lib/products';

export async function PUT(request, { params }) {
  const body = await request.json();
  const products = await getProducts();

  const updated = products.map((product) => {
    if (product.id !== params.id) return product;

    return {
      ...product,
      name: body.name,
      price: Number(body.price),
      category: body.category,
      description: body.description,
      images: body.images?.length ? body.images : product.images,
      featured: Boolean(body.featured)
    };
  });

  await saveProducts(updated);
  return Response.json({ ok: true });
}

export async function DELETE(_request, { params }) {
  const products = await getProducts();
  const updated = products.filter((product) => product.id !== params.id);
  await saveProducts(updated);
  return Response.json({ ok: true });
}
