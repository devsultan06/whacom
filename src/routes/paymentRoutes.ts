import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma.js';
import { initializeMonnifyTransaction } from '../services/monnifyService.js';
import { confirmOrderPayment } from '../services/orderService.js';
import { sendTwilioTextMessage } from '../services/twilioService.js';

const router = Router();

// GET /api/v1/payments/order/:orderNumber - Fetch order details for dynamic paylink checkout
router.get('/order/:orderNumber', async (req: Request, res: Response): Promise<void> => {
  const cleanRef = String(req.params.orderNumber).replace(/^#/, '').trim().toUpperCase();

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: cleanRef },
          { orderNumber: `ORD-${cleanRef}` },
        ],
      },
      include: {
        items: true,
        merchant: {
          select: {
            id: true,
            storeName: true,
            slug: true,
            logoUrl: true,
            phone: true,
            bankName: true,
            accountNumber: true,
            accountName: true,
            currencySymbol: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: `Order #${cleanRef} not found.` });
      return;
    }

    res.json({ success: true, order });
  } catch (error: any) {
    console.error('[Get Order Error]:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// POST /api/v1/payments/initialize - Initialize online checkout session via Monnify
router.post('/initialize', async (req: Request, res: Response): Promise<void> => {
  const { orderNumber, customerName, customerEmail, customerPhone } = req.body;

  try {
    const cleanRef = String(orderNumber).replace(/^#/, '').trim().toUpperCase();
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: cleanRef },
          { orderNumber: `ORD-${cleanRef}` },
        ],
      },
      include: {
        merchant: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: `Order #${cleanRef} not found.` });
      return;
    }

    if (order.status === 'PAID') {
      res.status(400).json({ error: `Order #${order.orderNumber} is already PAID.` });
      return;
    }

    const email = customerEmail || `${order.orderNumber.toLowerCase()}@qora.store`;
    const name = customerName || order.customerName || 'Valued Customer';
    const paymentRef = `QOR_${order.orderNumber}_${Date.now()}`;

    // Update order with payment channel & reference
    await prisma.order.update({
      where: { id: order.id },
      data: {
        customerName: name,
        customerPhone: customerPhone || order.customerPhone,
        customerEmail: email,
        paymentChannel: 'MONNIFY_ONLINE',
        paymentRef: paymentRef,
      },
    });

    const initResult = await initializeMonnifyTransaction({
      amount: order.totalAmount,
      customerName: name,
      customerEmail: email,
      paymentReference: paymentRef,
      paymentDescription: `Payment for Order #${order.orderNumber} at ${order.merchant.storeName}`,
    });

    res.json({
      success: true,
      orderNumber: order.orderNumber,
      amount: order.totalAmount,
      paymentReference: paymentRef,
      checkoutUrl: initResult.checkoutUrl,
      apiKey: initResult.apiKey,
      contractCode: initResult.contractCode,
    });
  } catch (error: any) {
    console.error('[Payment Initialize Error]:', error?.response?.data || error?.message || error);
    res.status(500).json({ error: error?.response?.data?.responseMessage || error?.message || 'Failed to initialize payment' });
  }
});

// POST /api/v1/payments/monnify-webhook - Server-to-server webhook callback from Monnify
router.post('/monnify-webhook', async (req: Request, res: Response): Promise<void> => {
  const event = req.body;
  console.log('[Monnify Webhook Received]:', JSON.stringify(event, null, 2));

  try {
    // Event format: { eventType: 'SUCCESSFUL_TRANSACTION', eventData: { paymentReference, amountPaid, ... } }
    const eventData = event.eventData || event;
    const paymentReference = eventData.paymentReference;
    const paymentStatus = eventData.paymentStatus || eventData.status;

    if (paymentStatus === 'PAID' || paymentStatus === 'SUCCESS' || event.eventType === 'SUCCESSFUL_TRANSACTION') {
      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { paymentRef: paymentReference },
            { orderNumber: paymentReference.replace(/^QOR_/, '').split('_')[0] },
          ],
        },
        include: {
          merchant: true,
          items: true,
        },
      });

      if (order && order.status !== 'PAID') {
        const amountPaid = parseFloat(eventData.amountPaid || eventData.amount || order.totalAmount);
        await confirmOrderPayment(order.merchantId, order.orderNumber, amountPaid);

        // Send instant celebration WhatsApp alert to merchant
        const sym = order.merchant.currencySymbol || '₦';
        const itemsList = order.items.map((i) => `• ${i.quantity}x ${i.name}`).join('\n');

        await sendTwilioTextMessage(
          order.merchant.phone,
          `🎉 *NEW PAID ORDER #${order.orderNumber}!*\n\n` +
          `*Amount:* ${sym}${amountPaid.toLocaleString()} (Paid via Monnify Online)\n` +
          `*Customer:* ${order.customerName || 'Online Customer'}\n` +
          `*Phone:* ${order.customerPhone || 'N/A'}\n\n` +
          `*Items:*\n${itemsList}\n\n` +
          `Your daily sales revenue has been credited! 🚀`
        );
      }
    }

    res.status(200).json({ responseMessage: 'Webhook processed successfully' });
  } catch (error: any) {
    console.error('[Monnify Webhook Error]:', error);
    res.status(500).json({ error: 'Webhook processing error' });
  }
});

export default router;
