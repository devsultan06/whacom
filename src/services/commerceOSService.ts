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

  // 1. "Add Product" button tap or command
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

  // 2. "View Sales" or "Sales" button tap
  if (lowerText === 'view sales' || lowerText === 'sales' || lowerText === 'today sales' || lowerText === 'dashboard') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const totalRevenue = orders
      .filter((o) => o.status === 'PAID')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;

    await sendTwilioTextMessage(
      from,
      `*Sales Overview*\n\n` +
      `*Total Paid Revenue:* ${merchant.currencySymbol || '₦'}${totalRevenue.toLocaleString()}\n` +
      `*Pending Orders:* ${pendingOrders}\n` +
      `*Total Recorded Orders:* ${orders.length}\n\n` +
      `Web Dashboard:\nhttps://qora.app/login`
    );
    return true;
  }

  // 3. "Catalog" or "Products" or "View Products"
  if (lowerText === 'catalog' || lowerText === 'view catalog' || lowerText === 'products' || lowerText === 'my products') {
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
      `Store Link:\nhttps://qora.store/${merchant.slug}`
    );
    return true;
  }

  // 4. Analyze message for Product Broadcast / Photo / Caption with Gemini AI
  const extracted = await extractProductsFromText(cleanText);

  if (extracted.isProduct && extracted.products.length > 0) {
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
      const productLink = `https://qora.store/${merchant.slug}/p/${created.slug}`;

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

  // 5. Default Fallback for Active Merchants
  await sendTwilioTextMessage(
    from,
    `*Qora Merchant OS*\n\n` +
    `How can I help you?\n\n` +
    `• *Add Product:* Send a photo with price in caption (or type it)\n` +
    `• *View Sales:* Type "Sales"\n` +
    `• *View Catalog:* Type "Catalog"\n` +
    `• *Dashboard:* https://qora.app/login`
  );
  return true;
}
