import prisma from './lib/prisma.js';
import { confirmOrderPayment, getMerchantSalesSummary, createTrackedOrder } from './services/orderService.js';

async function main() {
  console.log('1. Fetching merchant...');
  const merchant = await prisma.merchant.findUnique({ where: { slug: 'sultan-store' } });
  if (!merchant) {
    console.error('Merchant sultan-store not found');
    return;
  }

  await prisma.merchant.update({
    where: { id: merchant.id },
    data: {
      location: 'Lekki, Lagos',
      deliveryZones: [
        { area: 'Lagos Island / Lekki', fee: 2500 },
        { area: 'Lagos Mainland / Ikeja', fee: 3000 },
        { area: 'Abuja & Interstate Delivery', fee: 4500 },
        { area: 'Store Pickup', fee: 0 },
      ],
    },
  });
  console.log('Updated location: Lekki, Lagos and 4 delivery zones.');

  console.log('2. Creating tracked order...');
  const order = await createTrackedOrder({
    merchantSlugOrId: merchant.id,
    items: [
      { name: 'Mini party cup parfait', price: 2500, quantity: 2 },
    ],
    deliveryArea: 'Lekki',
    deliveryFee: 2500,
    customerName: 'Chinedu Test',
    customerPhone: '+2348030000000',
  });

  console.log(`Created Order #${order.orderNumber} with Original Total: ₦${order.totalAmount}`);

  console.log('\n3. Testing 1-word Merchant confirmation: "Paid 6500" (no ID typed)...');
  const confirmResult = await confirmOrderPayment(merchant.id, undefined, 6500);
  console.log('Confirmation Result:', {
    success: confirmResult.success,
    orderNumber: confirmResult.order?.orderNumber,
    status: confirmResult.order?.status,
    finalAmount: confirmResult.finalAmount,
    wasDiscounted: confirmResult.wasDiscounted,
    discountGiven: confirmResult.order?.discountAmount,
  });

  console.log('\n4. Fetching Updated Merchant Sales Overview...');
  const sales = await getMerchantSalesSummary(merchant.id);
  console.log('Sales Overview:', sales);

  console.log('\n5. Testing AI Forwarded Conversation Parser ("Amara Bello: I need 2 parfait cups delivered to Lekki")...');
  const { parseConversationToOrder } = await import('./services/aiParserService.js');
  const aiResult = await parseConversationToOrder(merchant.id, 'Amara Bello: I need 2 parfait cups delivered to Lekki');
  console.log('AI Parsed Order Result:', {
    orderNumber: aiResult?.order?.orderNumber,
    customerName: aiResult?.order?.customerName,
    items: aiResult?.order?.items,
    deliveryArea: aiResult?.order?.deliveryArea,
    deliveryFee: aiResult?.order?.deliveryFee,
    totalAmount: aiResult?.order?.totalAmount,
    checkoutUrl: aiResult?.checkoutUrl,
  });
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
