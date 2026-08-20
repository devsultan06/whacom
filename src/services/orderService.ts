import prisma from '../lib/prisma.js';
import { sendTwilioTextMessage } from './twilioService.js';

export interface CreateOrderItemInput {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  isDigital?: boolean;
  digitalFileUrl?: string;
}

export interface CreateOrderInput {
  merchantSlugOrId: string;
  items: CreateOrderItemInput[];
  deliveryArea?: string;
  deliveryFee?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentChannel?: 'DIRECT_BANK_TRANSFER' | 'MONNIFY_ONLINE' | 'CASH_ON_DELIVERY';
}

/**
 * Generate next sequential order number (e.g. ORD-1042)
 */
async function generateOrderNumber(merchantId: string): Promise<string> {
  const count = await prisma.order.count({ where: { merchantId } });
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${count + 1001}`;
}

/**
 * 1. Create a Tracked Order in Neon DB
 */
export async function createTrackedOrder(input: CreateOrderInput) {
  const merchant = await prisma.merchant.findFirst({
    where: {
      OR: [
        { id: input.merchantSlugOrId },
        { slug: input.merchantSlugOrId.toLowerCase().trim() },
      ],
    },
  });

  if (!merchant) {
    throw new Error('Merchant not found');
  }

  const itemsTotal = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = input.deliveryFee || 0;
  const totalAmount = itemsTotal + deliveryFee;
  const orderNumber = await generateOrderNumber(merchant.id);

  const order = await prisma.order.create({
    data: {
      orderNumber,
      merchantId: merchant.id,
      customerName: input.customerName || 'WhatsApp Customer',
      customerPhone: input.customerPhone || '',
      customerEmail: input.customerEmail || null,
      deliveryArea: input.deliveryArea || null,
      deliveryFee,
      itemsTotal,
      totalAmount,
      currency: merchant.currency || 'NGN',
      status: input.paymentChannel === 'MONNIFY_ONLINE' ? 'PENDING_PAYMENT' : 'PENDING_WHATSAPP',
      paymentChannel: input.paymentChannel || 'DIRECT_BANK_TRANSFER',
      items: {
        create: input.items.map((i) => ({
          productId: i.productId || null,
          name: i.name,
          unitPrice: i.price,
          totalPrice: i.price * i.quantity,
          quantity: i.quantity,
          isDigital: Boolean(i.isDigital),
          digitalFileUrl: i.digitalFileUrl || null,
        })),
      },
    },
    include: {
      items: true,
      merchant: true,
    },
  });

  return order;
}

/**
 * 2. Confirm Order Payment (With optional custom negotiated amount)
 */
export async function confirmOrderPayment(merchantId: string, orderNumberOrId?: string, customPaidAmount?: number) {
  let order;
  const isLatest = !orderNumberOrId || orderNumberOrId.toLowerCase() === 'latest';

  if (isLatest) {
    order = await prisma.order.findFirst({
      where: {
        merchantId,
        status: { in: ['PENDING_WHATSAPP', 'PENDING_PAYMENT', 'PENDING_VERIFICATION'] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        merchant: true,
      },
    });

    if (!order) {
      return { success: false, error: 'You have no active pending orders to confirm.' };
    }
  } else {
    const cleanRef = orderNumberOrId.replace(/^#/, '').trim().toUpperCase();
    order = await prisma.order.findFirst({
      where: {
        merchantId,
        OR: [
          { id: orderNumberOrId },
          { orderNumber: cleanRef },
          { orderNumber: `ORD-${cleanRef}` },
        ],
      },
      include: {
        items: true,
        merchant: true,
      },
    });

    if (!order) {
      return { success: false, error: `Order #${cleanRef} was not found.` };
    }
  }

  if (order.status === 'PAID') {
    return { success: false, error: `Order #${order.orderNumber} is already marked as PAID.` };
  }

  const finalAmount = customPaidAmount !== undefined && customPaidAmount > 0 ? customPaidAmount : order.totalAmount;
  const discountAmount = finalAmount < order.totalAmount ? order.totalAmount - finalAmount : 0;

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      totalAmount: finalAmount,
      discountAmount,
    },
    include: {
      items: true,
      merchant: true,
    },
  });

  // Decrement inventory stock for non-unlimited physical products
  for (const item of order.items) {
    if (item.productId) {
      const prod = await prisma.product.findUnique({ where: { id: item.productId } });
      if (prod && !prod.isUnlimitedStock && prod.stock !== null && prod.stock > 0) {
        await prisma.product.update({
          where: { id: prod.id },
          data: { stock: Math.max(0, prod.stock - item.quantity) },
        });
      }
    }
  }

  // If digital products exist, auto-deliver to customer if phone is available
  const digitalItems = order.items.filter((i) => i.isDigital && i.digitalFileUrl);
  if (digitalItems.length > 0 && order.customerPhone) {
    const digitalLinksText = digitalItems
      .map((d) => `• *${d.name}:*\n${d.digitalFileUrl}`)
      .join('\n\n');

    try {
      await sendTwilioTextMessage(
        order.customerPhone,
        `🎉 *Payment Confirmed for Order #${order.orderNumber}!*\n\n` +
        `Thank you for your purchase from *${order.merchant.storeName}*.\n\n` +
        `*Your Digital Download Access:*\n${digitalLinksText}\n\n` +
        `Enjoy!`
      );
    } catch (e) {
      console.error('[Digital Auto-Delivery Failed]:', e);
    }
  }

  return {
    success: true,
    order: updatedOrder,
    wasDiscounted: discountAmount > 0,
    originalAmount: order.totalAmount,
    finalAmount,
  };
}

/**
 * 3. Update Order Amount or Delivery Fee
 */
export async function updateOrderAmount(merchantId: string, orderNumberOrId: string, newTotal: number, reason?: string) {
  const cleanRef = orderNumberOrId.replace(/^#/, '').trim().toUpperCase();

  const order = await prisma.order.findFirst({
    where: {
      merchantId,
      OR: [
        { id: orderNumberOrId },
        { orderNumber: cleanRef },
        { orderNumber: `ORD-${cleanRef}` },
      ],
    },
  });

  if (!order) {
    return { success: false, error: `Order #${cleanRef} was not found.` };
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      totalAmount: newTotal,
    },
  });

  return { success: true, order: updated };
}

/**
 * 4. Cancel Order & Restore Inventory
 */
export async function cancelOrder(merchantId: string, orderNumberOrId?: string) {
  let order;
  const isLatest = !orderNumberOrId || orderNumberOrId.toLowerCase() === 'latest';

  if (isLatest) {
    order = await prisma.order.findFirst({
      where: {
        merchantId,
        status: { in: ['PENDING_WHATSAPP', 'PENDING_PAYMENT', 'PENDING_VERIFICATION'] },
      },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: 'You have no active pending orders to cancel.' };
    }
  } else {
    const cleanRef = orderNumberOrId.replace(/^#/, '').trim().toUpperCase();
    order = await prisma.order.findFirst({
      where: {
        merchantId,
        OR: [
          { id: orderNumberOrId },
          { orderNumber: cleanRef },
          { orderNumber: `ORD-${cleanRef}` },
        ],
      },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: `Order #${cleanRef} was not found.` };
    }
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'CANCELLED' },
  });

  return { success: true, order: updated };
}

/**
 * 5. Get Real-time Sales Metrics from DB
 */
export async function getMerchantSalesSummary(merchantId: string) {
  const orders = await prisma.order.findMany({
    where: { merchantId },
    orderBy: { createdAt: 'desc' },
  });

  const paidOrders = orders.filter((o) => o.status === 'PAID');
  const pendingOrders = orders.filter((o) => o.status.startsWith('PENDING'));

  const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayPaidRevenue = paidOrders
    .filter((o) => o.paidAt && o.paidAt >= today)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    totalPaidRevenue,
    todayPaidRevenue,
    paidCount: paidOrders.length,
    pendingCount: pendingOrders.length,
    totalCount: orders.length,
    recentOrders: orders.slice(0, 5),
  };
}
