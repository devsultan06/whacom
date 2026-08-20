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
        location: true,
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
  const rawSlug = String(req.params.slug).trim();
  const cleanSlug = rawSlug.toLowerCase();

  try {
    const storeSelect = {
      id: true,
      storeName: true,
      slug: true,
      category: true,
      description: true,
      logoUrl: true,
      phone: true,
      location: true,
      deliveryZones: true,
      bankName: true,
      accountNumber: true,
      accountName: true,
      currency: true,
      currencySymbol: true,
      products: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' as const },
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
    };

    // Enforce strict exact slug match (unique per merchant)
    const merchant = await prisma.merchant.findUnique({
      where: { slug: cleanSlug },
      select: storeSelect,
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
  const rawSlug = String(req.params.slug).trim();
  const cleanSlug = rawSlug.toLowerCase();
  const productSlug = String(req.params.productSlug);

  try {
    const metaSelect = {
      id: true,
      storeName: true,
      slug: true,
      logoUrl: true,
      phone: true,
      currency: true,
      currencySymbol: true,
    };

    // Strict exact slug lookup
    const merchant = await prisma.merchant.findUnique({
      where: { slug: cleanSlug },
      select: metaSelect,
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

// POST /api/v1/storefront/:slug/orders - Create tracked retail order from storefront
router.post('/:slug/orders', async (req: Request, res: Response): Promise<void> => {
  const rawSlug = String(req.params.slug).trim();
  const cleanSlug = rawSlug.toLowerCase();
  const { items, deliveryArea, deliveryFee, customerName, customerPhone, paymentChannel, receiptImage } = req.body;

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { slug: cleanSlug },
      select: {
        id: true,
        storeName: true,
        slug: true,
        phone: true,
        currencySymbol: true,
      },
    });

    if (!merchant) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order items are required.' });
      return;
    }

    let receiptUrl: string | undefined = undefined;
    if (receiptImage) {
      try {
        const { uploadReceiptToCloudinary } = await import('../services/cloudinaryService.js');
        receiptUrl = await uploadReceiptToCloudinary(receiptImage, `temp_${Date.now()}`);
      } catch (uploadErr) {
        console.error('[Receipt Upload Failed]:', uploadErr);
      }
    }

    const { createTrackedOrder } = await import('../services/orderService.js');
    const order = await createTrackedOrder({
      merchantSlugOrId: merchant.id,
      items,
      deliveryArea,
      deliveryFee: Number(deliveryFee) || 0,
      customerName,
      customerPhone,
      paymentChannel: paymentChannel || 'DIRECT_BANK_TRANSFER',
    });

    const sym = merchant.currencySymbol || '₦';
    const lines = order.items
      .map((i: any) => `• ${i.quantity}x ${i.name} — ${sym}${i.totalPrice.toLocaleString()}`)
      .join('\n');

    const deliveryText = order.deliveryArea
      ? `Delivery (${order.deliveryArea}): ${sym}${order.deliveryFee.toLocaleString()}\n`
      : '';

    const receiptText = receiptUrl
      ? `\n📄 *Payment Receipt Attached:*\n${receiptUrl}\n`
      : '';

    const whatsappMessage =
      `Hello ${merchant.storeName}! 👋\n` +
      `I want to place Order *#${order.orderNumber}*:\n\n` +
      `${lines}\n` +
      `${deliveryText}` +
      `*Total: ${sym}${order.totalAmount.toLocaleString()}*\n` +
      `${receiptText}\n` +
      `Please confirm my order. Thank you!`;

    const phoneDigits = merchant.phone?.replace(/\D/g, '') || '';
    const whatsappUrl = phoneDigits
      ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(whatsappMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

    // Instantly notify Merchant on WhatsApp
    if (merchant.phone) {
      try {
        const { sendTwilioTextMessage, sendTwilioMediaMessage } = await import('../services/twilioService.js');
        const merchantAlert =
          `🔔 *NEW PENDING ORDER #${order.orderNumber}* ${receiptUrl ? '(Receipt Attached 📄)' : ''}\n\n` +
          `• *Customer:* ${order.customerName || 'Store Customer'}\n` +
          (order.customerPhone ? `• *Phone:* ${order.customerPhone}\n` : '') +
          `• *Items:*\n${lines}\n` +
          `${deliveryText}` +
          `• *Total:* *${sym}${order.totalAmount.toLocaleString()}*${receiptText}\n\n` +
          `_When verified in your bank app, reply:_\n` +
          `👉 *Paid* (to confirm full ${sym}${order.totalAmount.toLocaleString()})\n` +
          `👉 *Paid [amount]* (e.g. *Paid 6500* if discounted)\n` +
          `👉 *Cancel* (to decline/cancel)`;

        if (receiptUrl) {
          await sendTwilioMediaMessage(merchant.phone, merchantAlert, [receiptUrl]);
        } else {
          await sendTwilioTextMessage(merchant.phone, merchantAlert);
        }
      } catch (notifyErr) {
        console.error('[Merchant Alert Failed]:', notifyErr);
      }
    }

    res.json({
      success: true,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      receiptUrl,
      whatsappUrl,
      whatsappMessage,
    });
  } catch (error: any) {
    console.error('[Create Order API Error]:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

export default router;
