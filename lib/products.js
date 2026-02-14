import fs from 'node:fs/promises';
import path from 'node:path';

const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');

export async function getProducts() {
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

export async function getProductBySlug(slug) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug);
}
