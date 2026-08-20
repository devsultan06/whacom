import { GoogleGenAI, Type } from '@google/genai';
import prisma from '../lib/prisma.js';
import { createTrackedOrder } from './orderService.js';

export interface ParsedConversationOrder {
  customerName?: string;
  customerPhone?: string;
  deliveryArea?: string;
  deliveryFee?: number;
  items: {
    name: string;
    quantity: number;
    price: number;
    productId?: string;
  }[];
  totalAmount?: number;
  notes?: string;
}

/**
 * Parses a forwarded customer WhatsApp conversation into a structured order.
 */
export async function parseConversationToOrder(
  merchantId: string,
  rawText: string
): Promise<{ order: any; checkoutUrl: string } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  // 1. Fetch merchant's live catalog and delivery zones for accurate matching
  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
    include: {
      products: {
        where: { isActive: true },
        select: { id: true, name: true, price: true, category: true },
      },
    },
  });

  if (!merchant) return null;

  const catalogContext = merchant.products.map((p) => `- ${p.name} (₦${p.price}) [ID: ${p.id}]`).join('\n');
  const deliveryZonesContext = Array.isArray(merchant.deliveryZones)
    ? (merchant.deliveryZones as any[]).map((z) => `- ${z.area} (₦${z.fee})`).join('\n')
    : 'Standard Delivery: ₦2,500';

  const systemInstruction = `You are Qora's AI Order Parser.
A merchant has forwarded a customer conversation or entered an order request.
Extract the customer name, phone number, delivery location, and ordered items.

MERCHANT'S ACTIVE CATALOG:
${catalogContext || 'No catalog items uploaded yet.'}

MERCHANT'S DELIVERY ZONES:
${deliveryZonesContext}

RULES:
1. Match ordered items against the merchant's catalog where possible to get exact item names and prices.
2. If an item is mentioned with an explicit price in the message (e.g. "perfume ₦15,000"), use that price.
3. If quantity is omitted, default quantity to 1.
4. Extract delivery area and match delivery fee from merchant's delivery zones. If unspecified, delivery fee is 0.
5. Extract the customer name from conversation headers like "[Amara Bello: ...]" or "Amara wants..." if present.
6. If the message does not describe an order or purchase request, return an empty items list.`;

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: rawText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isOrder: { type: Type.BOOLEAN, description: 'True if the message is an order or purchase request' },
            customerName: { type: Type.STRING, description: 'Customer name if identified' },
            customerPhone: { type: Type.STRING, description: 'Customer phone number if present' },
            deliveryArea: { type: Type.STRING, description: 'Delivery location / area' },
            deliveryFee: { type: Type.NUMBER, description: 'Delivery fee' },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING, description: 'Matched product ID if found in catalog' },
                  name: { type: Type.STRING, description: 'Product name' },
                  quantity: { type: Type.NUMBER, description: 'Quantity ordered' },
                  price: { type: Type.NUMBER, description: 'Unit price in NGN' },
                },
                required: ['name', 'quantity', 'price'],
              },
            },
            notes: { type: Type.STRING, description: 'Special instructions' },
          },
          required: ['isOrder', 'items'],
        },
      },
    });

    if (!response.text) return null;

    const parsed = JSON.parse(response.text);
    if (!parsed.isOrder || !parsed.items || parsed.items.length === 0) {
      return null;
    }

    // 2. Create the tracked order in DB
    const order = await createTrackedOrder({
      merchantSlugOrId: merchant.id,
      items: parsed.items.map((i: any) => ({
        productId: i.productId || undefined,
        name: i.name,
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1,
      })),
      deliveryArea: parsed.deliveryArea || undefined,
      deliveryFee: Number(parsed.deliveryFee) || 0,
      customerName: parsed.customerName || 'Customer',
      customerPhone: parsed.customerPhone || undefined,
      paymentChannel: 'DIRECT_BANK_TRANSFER',
    });

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const checkoutUrl = `${frontendBase}/pay/${order.orderNumber}`;

    return {
      order,
      checkoutUrl,
    };
  } catch (error) {
    console.error('[AI Order Parser Error]:', error);
    return null;
  }
}
