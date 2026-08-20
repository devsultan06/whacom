import prisma from '../lib/prisma.js';

export interface CreateMerchantInput {
  phone: string;
  storeName?: string;
  slug?: string;
  category?: string;
  location?: string;
  deliveryZones?: any;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  logoUrl?: string;
  adminPin?: string;
  onboardingStep?: string;
}

export async function getMerchantByPhone(phone: string) {
  const normalizedPhone = phone.trim();
  return prisma.merchant.findUnique({
    where: { phone: normalizedPhone },
  });
}

export async function getMerchantBySlug(slug: string) {
  return prisma.merchant.findUnique({
    where: { slug: slug.toLowerCase().trim() },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function createMerchant(data: CreateMerchantInput) {
  return prisma.merchant.create({
    data: {
      phone: data.phone.trim(),
      storeName: data.storeName,
      slug: data.slug,
      category: data.category,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      logoUrl: data.logoUrl,
      adminPin: data.adminPin,
      onboardingStep: data.onboardingStep || 'AWAITING_STORE_NAME',
    },
  });
}

export async function updateMerchant(phone: string, data: Partial<CreateMerchantInput>) {
  return prisma.merchant.update({
    where: { phone: phone.trim() },
    data,
  });
}

export async function resetMerchant(phone: string) {
  const existing = await getMerchantByPhone(phone);
  if (existing) {
    return prisma.merchant.update({
      where: { phone: phone.trim() },
      data: {
        storeName: null,
        slug: null,
        category: null,
        bankName: null,
        accountNumber: null,
        accountName: null,
        logoUrl: null,
        adminPin: null,
        onboardingStep: 'AWAITING_STORE_NAME',
      },
    });
  }
  return null;
}

export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return base || `store-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function generateAdminPin(): string {
  // Generate random 5-digit PIN
  return Math.floor(10000 + Math.random() * 90000).toString();
}
