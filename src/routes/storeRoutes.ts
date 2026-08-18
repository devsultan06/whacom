import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/v1/storefront - Fetch all active stores for directory/marketplace
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const stores = await prisma.merchant.findMany({
      where: {
        onboardingStep: 'ACTIVE',
        slug: { not: null },
      },
      select: {
        id: true,
        storeName: true,
        slug: true,
        category: true,
        description: true,
        logoUrl: true,
        currencySymbol: true,
        createdAt: true,
        _count: {
          select: {
            products: { where: { isActive: true } },
          },
        },
        products: {
          where: { isActive: true },
          take: 3,
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, stores });
  } catch (error: any) {
    console.error('[Store Directory API Error]:', error);
    res.status(500).json({ error: 'Failed to fetch store directory' });
  }
});

// GET /api/v1/storefront/:slug - Fetch store details and all active products
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  const slug = String(req.params.slug);

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: {
        id: true,
        storeName: true,
        slug: true,
        category: true,
        description: true,
        logoUrl: true,
        phone: true,
        currency: true,
        currencySymbol: true,
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            stock: true,
            isUnlimitedStock: true,
            isDigital: true,
            category: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!merchant) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    res.json({ success: true, store: merchant });
  } catch (error: any) {
    console.error('[Storefront API Error]:', error);
    res.status(500).json({ error: 'Failed to fetch store data' });
  }
});

// GET /api/v1/storefront/:slug/p/:productSlug - Fetch single product
router.get('/:slug/p/:productSlug', async (req: Request, res: Response): Promise<void> => {
  const slug = String(req.params.slug);
  const productSlug = String(req.params.productSlug);

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: {
        id: true,
        storeName: true,
        slug: true,
        logoUrl: true,
        phone: true,
        currency: true,
        currencySymbol: true,
      },
    });

    if (!merchant) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    const product = await prisma.product.findFirst({
      where: {
        merchantId: merchant.id,
        slug: productSlug,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        stock: true,
        isUnlimitedStock: true,
        isDigital: true,
        category: true,
        imageUrl: true,
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ success: true, store: merchant, product });
  } catch (error: any) {
    console.error('[Product API Error]:', error);
    res.status(500).json({ error: 'Failed to fetch product data' });
  }
});

export default router;
