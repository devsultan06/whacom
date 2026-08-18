import prisma from '../lib/prisma.js';

export interface CreateProductInput {
  name: string;
  price: number;
  description?: string;
  stock?: number | null;
  isUnlimitedStock?: boolean;
  isDigital?: boolean;
  digitalFileUrl?: string;
  category?: string;
  imageUrl?: string;
  costPrice?: number;
}

export function generateProductSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  return `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function createProduct(merchantId: string, input: CreateProductInput) {
  const slug = generateProductSlug(input.name);
  const isDigital = input.isDigital ?? (!!input.digitalFileUrl || input.category === 'Digital Products');
  const isUnlimited = isDigital ? true : (input.isUnlimitedStock ?? (input.stock === null || input.stock === undefined));

  return prisma.product.create({
    data: {
      merchantId,
      name: input.name,
      slug,
      price: input.price,
      costPrice: input.costPrice,
      description: input.description,
      stock: isUnlimited ? null : input.stock,
      isUnlimitedStock: isUnlimited,
      isDigital,
      digitalFileUrl: input.digitalFileUrl,
      category: input.category,
      imageUrl: input.imageUrl,
      isActive: true,
    },
  });
}

export async function getProductsByMerchant(merchantId: string) {
  return prisma.product.findMany({
    where: { merchantId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProductById(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: { merchant: true },
  });
}

export async function getProductBySlug(merchantSlug: string, productSlug: string) {
  const merchant = await prisma.merchant.findUnique({
    where: { slug: merchantSlug },
  });

  if (!merchant) return null;

  return prisma.product.findFirst({
    where: {
      merchantId: merchant.id,
      slug: productSlug,
      isActive: true,
    },
  });
}

export async function updateProductStock(productId: string, newStock: number | null) {
  return prisma.product.update({
    where: { id: productId },
    data: {
      stock: newStock,
      isUnlimitedStock: newStock === null,
    },
  });
}

export async function deleteProduct(merchantId: string, productId: string) {
  return prisma.product.updateMany({
    where: { id: productId, merchantId },
    data: { isActive: false },
  });
}
