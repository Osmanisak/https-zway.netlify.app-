import fs from 'node:fs/promises';
import path from 'node:path';

const filePath = path.join(process.cwd(), 'data', 'products.json');

export async function getProducts() {
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

export async function getProductById(id) {
  const products = await getProducts();
  return products.find((product) => product.id === id);
}

export async function saveProducts(products) {
  await fs.writeFile(filePath, JSON.stringify(products, null, 2), 'utf-8');
}
