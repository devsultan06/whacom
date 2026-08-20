import { getMerchantByPhone } from './merchantService.js';
import { createProduct, getProductsByMerchant } from './productService.js';
import { extractProductsFromText } from './geminiProductExtractor.js';
import { uploadProductImageToCloudinary } from './cloudinaryService.js';
import { sendTwilioTextMessage } from './twilioService.js';
import prisma from '../lib/prisma.js';

export const CATEGORY_EXAMPLES: Record<string, { exampleCaption: string; formatHint: string }> = {
  'Fashion & Apparel': {
    exampleCaption: `"Vintage Denim Jacket ₦18,000\nSizes: M, L, XL | Stock: 6"`,
    formatHint: `Item name, price, sizes, and stock (optional)`,
  },
  'Food & Dining': {
    exampleCaption: `"Mini party cup parfait ₦2,500\nMinimum of 5pcs"`,
    formatHint: `Item name, price, and order requirements`,
  },
  'Beauty & Cosmetics': {
    exampleCaption: `"Hydrating Glow Serum ₦12,500\n50ml Bottle | Stock: 10"`,
    formatHint: `Product name, price, and volume/stock`,
  },
  'Gadgets & Electronics': {
    exampleCaption: `"Wireless Noise Canceling Earbuds ₦24,000\nColor: Black | Stock: 5"`,
    formatHint: `Gadget name, price, specs, and available stock`,
  },
  'Digital Products': {
    exampleCaption: `"Complete Social Media Playbook ₦5,000\nIncludes PDF & Notion Templates"`,
    formatHint: `Course/Ebook title, price, and format details`,
  },
  'Services & Custom': {
    exampleCaption: `"Brand Logo Package ₦45,000\nIncludes 3 Concepts & Source Files"`,
    formatHint: `Service package, price, and deliverables`,
  },
};

export function getCategoryExample(category?: string | null) {
  if (!category) return CATEGORY_EXAMPLES['Fashion & Apparel'];

  const matchKey = Object.keys(CATEGORY_EXAMPLES).find(
    (key) => key.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(key.toLowerCase())
  );

  return matchKey ? CATEGORY_EXAMPLES[matchKey] : {
    exampleCaption: `"Canvas Backpack ₦15,000\nStock: 8"`,
    formatHint: `Item name, price, and details`,
  };
}

export async function handleActiveMerchantMessage(
  from: string,
  text: string,
  mediaUrl?: string
): Promise<boolean> {
  const merchant = await getMerchantByPhone(from);
  if (!merchant || merchant.onboardingStep !== 'ACTIVE') {
    return false;
  }

  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();
  const catExample = getCategoryExample(merchant.category);
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';

  // 1. Order Payment Confirmation & Negotiation (e.g. "Paid", "Paid 6500", "Paid #1042 ₦6,500", "Paid #1042", "Confirm")
  const isPlainPaid = /^(?:paid|confirm|received|confirm\s+payment)$/i.test(cleanText);
  const paidWithAmountOnly = cleanText.match(/^(?:paid|confirm|received)\s+(?:₦|n|ngn)?\s*([\d,]{3,})/i);
  const paidWithRefAndAmount = cleanText.match(/^(?:paid|confirm|received|confirm\s+payment)\s+(?:#|ord-)?([a-z0-9-]+)(?:\s+(?:₦|n|ngn)?\s*([\d,]+))?/i);

  if (isPlainPaid || paidWithAmountOnly || paidWithRefAndAmount) {
    let orderNum: string | undefined = undefined;
    let rawAmount: number | undefined = undefined;

    if (isPlainPaid) {
      orderNum = undefined; // Will auto-resolve latest pending order
      rawAmount = undefined;
    } else if (paidWithAmountOnly) {
      orderNum = undefined; // Will auto-resolve latest pending order
      rawAmount = parseFloat(paidWithAmountOnly[1].replace(/,/g, ''));
    } else if (paidWithRefAndAmount) {
      const refPart = paidWithRefAndAmount[1].trim();
      // If refPart is purely numbers like "6500" and not prefixed with #, check if it's an amount
      if (/^\d{4,}$/.test(refPart) && !paidWithRefAndAmount[2] && parseInt(refPart) >= 500) {
        orderNum = undefined;
        rawAmount = parseFloat(refPart);
      } else {
        orderNum = refPart;
        rawAmount = paidWithRefAndAmount[2] ? parseFloat(paidWithRefAndAmount[2].replace(/,/g, '')) : undefined;
      }
    }

    const { confirmOrderPayment } = await import('./orderService.js');
    const result = await confirmOrderPayment(merchant.id, orderNum, rawAmount);

    if (!result.success) {
      await sendTwilioTextMessage(
        from,
        `⚠️ ${result.error}\n\n` +
        `Type *Sales* to see your active orders.`
      );
      return true;
    }

    const order = result.order!;
    const sym = merchant.currencySymbol || '₦';
    const discountText = result.wasDiscounted
      ? `\n*Discount Given:* ${sym}${(result.originalAmount! - result.finalAmount!).toLocaleString()}\n*Original Price:* ${sym}${result.originalAmount!.toLocaleString()}`
      : '';

    await sendTwilioTextMessage(
      from,
      `✅ *Order #${order.orderNumber} Confirmed as PAID!*\n\n` +
      `*Amount Collected:* ${sym}${order.totalAmount.toLocaleString()}${discountText}\n` +
      `*Customer:* ${order.customerName || 'WhatsApp Customer'}\n` +
      `*Items:* ${order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}\n\n` +
      `Your sales revenue has been updated! 📈`
    );
    return true;
  }

  // 2. Dynamic Payment Link Generator for Negotiated Orders (e.g. "Paylink #1042 ₦6,500", "Paylink #1042")
  const paylinkMatch = cleanText.match(/^(?:paylink|link|payment\s+link)\s+(?:#|ord-)?([a-z0-9-]+)(?:\s+(?:₦|n|ngn)?\s*([\d,]+))?/i);
  if (paylinkMatch) {
    const orderNum = paylinkMatch[1].trim();
    const rawAmount = paylinkMatch[2] ? parseFloat(paylinkMatch[2].replace(/,/g, '')) : undefined;

    const { updateOrderAmount } = await import('./orderService.js');
    if (rawAmount) {
      await updateOrderAmount(merchant.id, orderNum, rawAmount);
    }

    const payUrl = `${frontendBase}/pay/${orderNum.toUpperCase().startsWith('ORD-') ? orderNum.toUpperCase() : `ORD-${orderNum.toUpperCase()}`}`;

    await sendTwilioTextMessage(
      from,
      `💳 *Payment Link for Order #${orderNum.toUpperCase()}*\n\n` +
      (rawAmount ? `*Adjusted Total:* ${merchant.currencySymbol || '₦'}${rawAmount.toLocaleString()}\n\n` : '') +
      `Forward this link to your customer to pay via Card or Instant Bank Transfer:\n` +
      `${payUrl}`
    );
    return true;
  }

  // 3. Cancel Order (e.g. "Cancel", "Cancel #1042")
  const cancelMatch = cleanText.match(/^cancel(?:\s+(?:#|ord-)?([a-z0-9-]+))?/i);
  if (cancelMatch) {
    const orderNum = cancelMatch[1] ? cancelMatch[1].trim() : undefined;
    const { cancelOrder } = await import('./orderService.js');
    const result = await cancelOrder(merchant.id, orderNum);

    if (!result.success) {
      await sendTwilioTextMessage(from, `⚠️ ${result.error}`);
      return true;
    }

    await sendTwilioTextMessage(
      from,
      `🚫 *Order #${result.order!.orderNumber} has been cancelled.*\n` +
      `Inventory has been restored.`
    );
    return true;
  }

  // 4. Update Store Location (e.g. "Location Lekki, Lagos" or "Set location Wuse 2, Abuja")
  const locMatch = cleanText.match(/^(?:set\s+)?location\s+(.+)/i);
  if (locMatch) {
    const newLocation = locMatch[1].trim();
    await prisma.merchant.update({
      where: { id: merchant.id },
      data: { location: newLocation },
    });

    await sendTwilioTextMessage(
      from,
      `📍 *Store Location Updated!*\n\n` +
      `*New Location:* ${newLocation}\n\n` +
      `This is now live on your store profile:\n` +
      `${frontendBase}/store/${merchant.slug}`
    );
    return true;
  }

  // 5. Manage Delivery Zones (e.g. "Delivery Lekki 2500, Mainland 3000, Pickup 0", "Add delivery Abuja 4500", "Delivery")
  const addDeliveryMatch = cleanText.match(/^add\s+delivery\s+([^,\d]+)\s+(?:₦|n|ngn)?\s*([\d,]+)/i);
  if (addDeliveryMatch) {
    const area = addDeliveryMatch[1].trim();
    const fee = parseFloat(addDeliveryMatch[2].replace(/,/g, ''));

    const currentZones = Array.isArray(merchant.deliveryZones) ? [...(merchant.deliveryZones as any[])] : [];
    const existingIndex = currentZones.findIndex((z) => z.area.toLowerCase() === area.toLowerCase());

    if (existingIndex >= 0) {
      currentZones[existingIndex].fee = fee;
    } else {
      currentZones.push({ area, fee });
    }

    await prisma.merchant.update({
      where: { id: merchant.id },
      data: { deliveryZones: currentZones },
    });

    const sym = merchant.currencySymbol || '₦';
    await sendTwilioTextMessage(
      from,
      `🚚 *Delivery Zone Added!*\n\n` +
      `• *${area}* — ${fee === 0 ? 'Free / Pickup' : `${sym}${fee.toLocaleString()}`}\n\n` +
      `Updated for your store at ${frontendBase}/store/${merchant.slug}`
    );
    return true;
  }

  const deliveryBulkMatch = cleanText.match(/^delivery\s+(.+)/i);
  if (deliveryBulkMatch && !/^(free|pickup|view|list|zones?)$/i.test(deliveryBulkMatch[1].trim())) {
    const rawZonesText = deliveryBulkMatch[1].trim();
    const parsedZones: { area: string; fee: number }[] = [];

    // Parse comma-separated "Area Fee, Area Fee" (e.g. "Lekki 2500, Mainland 3000, Store Pickup 0")
    const parts = rawZonesText.split(/[,;\n]+/);
    for (const part of parts) {
      const match = part.trim().match(/^(.+?)\s+(?:₦|n|ngn)?\s*([\d,]+)$/i);
      if (match) {
        parsedZones.push({
          area: match[1].trim(),
          fee: parseFloat(match[2].replace(/,/g, '')),
        });
      } else if (part.toLowerCase().includes('free') || part.toLowerCase().includes('pickup')) {
        parsedZones.push({
          area: part.trim(),
          fee: 0,
        });
      }
    }

    if (parsedZones.length > 0) {
      await prisma.merchant.update({
        where: { id: merchant.id },
        data: { deliveryZones: parsedZones },
      });

      const sym = merchant.currencySymbol || '₦';
      const zonesList = parsedZones
        .map((z) => `• *${z.area}* — ${z.fee === 0 ? 'Free' : `${sym}${z.fee.toLocaleString()}`}`)
        .join('\n');

      await sendTwilioTextMessage(
        from,
        `✅ *Delivery Rates Updated!*\n\n` +
        `${zonesList}\n\n` +
        `Live on your storefront: ${frontendBase}/store/${merchant.slug}`
      );
      return true;
    }
  }

  // View Delivery Zones ("Delivery" or "View Delivery")
  if (lowerText === 'delivery' || lowerText === 'view delivery' || lowerText === 'delivery rates' || lowerText === 'delivery zones') {
    const sym = merchant.currencySymbol || '₦';
    const zones = Array.isArray(merchant.deliveryZones) && (merchant.deliveryZones as any[]).length > 0
      ? (merchant.deliveryZones as any[])
      : [
          { area: 'Lagos Island / Lekki', fee: 2500 },
          { area: 'Lagos Mainland', fee: 3000 },
          { area: 'Abuja & Interstate', fee: 4500 },
          { area: 'Store Pickup', fee: 0 },
        ];

    const zonesList = zones
      .map((z: any) => `• *${z.area}* — ${z.fee === 0 ? 'Free' : `${sym}${z.fee.toLocaleString()}`}`)
      .join('\n');

    await sendTwilioTextMessage(
      from,
      `🚚 *Your Active Delivery Rates:*\n\n` +
      `${zonesList}\n\n` +
      `_To update your rates, reply:_\n*Delivery Area1 Fee, Area2 Fee*\n_(e.g., Delivery Lekki 2000, Mainland 2500, Pickup 0)_\n\n` +
      `_To add a single rate:_\n*Add delivery Abuja 4500*`
    );
    return true;
  }

  // 4. "Add Product" button tap or command
  if (lowerText === 'add product' || lowerText === 'add a product' || lowerText === 'new product') {
    await sendTwilioTextMessage(
      from,
      `*Add New Product*\n\n` +
      `Send a product photo with the price in the caption:\n` +
      `(e.g., ${catExample.exampleCaption})\n\n` +
      `Or type the product details directly without a photo.`
    );
    return true;
  }

  // 5. "View Sales" or "Sales" button tap
  if (lowerText === 'view sales' || lowerText === 'sales' || lowerText === 'today sales' || lowerText === 'dashboard') {
    const { getMerchantSalesSummary } = await import('./orderService.js');
    const summary = await getMerchantSalesSummary(merchant.id);
    const sym = merchant.currencySymbol || '₦';

    let recentOrdersText = '';
    if (summary.recentOrders.length > 0) {
      recentOrdersText = '\n*Recent Orders:*\n' + summary.recentOrders.map((o: any) => {
        const tag = o.status === 'PAID' ? '✅ Paid' : '⏳ Pending';
        return `• *#${o.orderNumber}* - ${sym}${o.totalAmount.toLocaleString()} (${tag})`;
      }).join('\n') + '\n';
    }

    await sendTwilioTextMessage(
      from,
      `*Sales Overview*\n\n` +
      `*Total Paid Revenue:* ${sym}${summary.totalPaidRevenue.toLocaleString()}\n` +
      `*Today's Revenue:* ${sym}${summary.todayPaidRevenue.toLocaleString()}\n` +
      `*Pending Orders:* ${summary.pendingCount}\n` +
      `*Completed Orders:* ${summary.paidCount}\n` +
      recentOrdersText +
      `\nWeb Dashboard:\n${frontendBase}/login\n\n` +
      `_Tip: Confirm a direct payment by replying: "Paid #1042" or with a discount: "Paid #1042 ₦6,500"_`
    );
    return true;
  }

  // 3. "Catalog" or "Products" or "View Products"
  if (lowerText === 'catalog' || lowerText === 'view catalog' || lowerText === 'products' || lowerText === 'my products') {
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const products = await getProductsByMerchant(merchant.id);
    if (products.length === 0) {
      await sendTwilioTextMessage(
        from,
        `You don't have any products in your store yet.\n\n` +
        `Send a photo with a caption like:\n` +
        `${catExample.exampleCaption}\n\n` +
        `to add your first item!`
      );
      return true;
    }

    const list = products.slice(0, 8).map((p: any, index: number) => {
      const stockInfo = p.isDigital ? 'Digital Download' : (p.isUnlimitedStock ? 'In Stock' : `${p.stock} left`);
      return `${index + 1}. *${p.name}* - ${merchant.currencySymbol || '₦'}${p.price.toLocaleString()} (${stockInfo})`;
    }).join('\n');

    await sendTwilioTextMessage(
      from,
      `*Your Product Catalog (${products.length} items)*\n\n` +
      `${list}\n\n` +
      `Store Link:\n${frontendBase}/store/${merchant.slug}`
    );
    return true;
  }

  // 4. Analyze message for Product Broadcast / Photo / Caption with Gemini AI
  const extracted = await extractProductsFromText(cleanText);

  if (extracted.isProduct && extracted.products.length > 0) {
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const slugBase = merchant.slug || 'store';
    const addedProducts: string[] = [];

    for (const prod of extracted.products) {
      let imageUrl: string | undefined = undefined;

      // Upload image to Cloudinary if mediaUrl is provided with this product
      if (mediaUrl) {
        try {
          imageUrl = await uploadProductImageToCloudinary(mediaUrl, slugBase, prod.name.replace(/\s+/g, '-'));
        } catch (uploadErr) {
          console.error('[Product Image Upload Failed]:', uploadErr);
        }
      }

      const created = await createProduct(merchant.id, {
        name: prod.name,
        price: prod.price,
        costPrice: prod.costPrice,
        stock: prod.stock,
        isUnlimitedStock: prod.isUnlimitedStock,
        isDigital: prod.isDigital,
        digitalFileUrl: prod.digitalFileUrl,
        description: prod.description,
        category: prod.category || merchant.category || undefined,
        imageUrl,
      });

      const stockText = created.isDigital
        ? 'Digital Product (Auto-Delivered on Payment)'
        : (prod.isUnlimitedStock ? 'In Stock' : `${prod.stock} in stock`);

      const accessText = created.digitalFileUrl ? `\nAccess Link: Saved & Protected` : '';
      const descText = prod.description ? `\nDetails: ${prod.description}` : '';
      const productLink = `${frontendBase}/store/${merchant.slug}/p/${created.slug}`;

      addedProducts.push(
        `*${created.name}*\n` +
        `Price: ${merchant.currencySymbol || '₦'}${created.price.toLocaleString()}\n` +
        `Type: ${stockText}${accessText}${descText}\n` +
        `Product Link:\n${productLink}`
      );
    }

    const title = extracted.products.length > 1 ? `*${extracted.products.length} Products Added.*` : `*Product Added.*`;

    await sendTwilioTextMessage(
      from,
      `${title}\n\n` +
      `${addedProducts.join('\n\n---\n\n')}\n\n` +
      `Send another photo or caption to add more items.`
    );
    return true;
  }

  // 5. AI Conversation / Forwarded Message to Order Parser
  try {
    const { parseConversationToOrder } = await import('./aiParserService.js');
    const parseResult = await parseConversationToOrder(merchant.id, cleanText);

    if (parseResult && parseResult.order) {
      const order = parseResult.order;
      const sym = merchant.currencySymbol || '₦';
      const itemsList = order.items
        .map((i: any) => `  • ${i.quantity}x ${i.name} — ${sym}${i.totalPrice.toLocaleString()}`)
        .join('\n');
      const deliveryText = order.deliveryArea
        ? `• *Delivery (${order.deliveryArea}):* ${sym}${order.deliveryFee.toLocaleString()}\n`
        : '';

      await sendTwilioTextMessage(
        from,
        `✨ *Order Summary (#${order.orderNumber})*\n\n` +
        `${itemsList}\n` +
        `${deliveryText}` +
        `• *Total: ${sym}${order.totalAmount.toLocaleString()}*\n\n` +
        `🔗 ${parseResult.checkoutUrl}`
      );
      return true;
    }
  } catch (parseErr) {
    console.error('[AI Parser Fallback Error]:', parseErr);
  }

  // 6. Default Fallback for Active Merchants
  await sendTwilioTextMessage(
    from,
    `*Qora Merchant OS*\n\n` +
    `How can I help you?\n\n` +
    `• *Forward Customer Chat:* Forward any WhatsApp message to generate a checkout link\n` +
    `• *Add Product:* Send a photo with price in caption\n` +
    `• *View Sales:* Type "Sales"\n` +
    `• *Delivery Rates:* Type "Delivery"\n` +
    `• *Dashboard:* ${frontendBase}/login`
  );
  return true;
}
