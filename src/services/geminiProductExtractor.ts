import { GoogleGenAI, Type } from '@google/genai';

export interface ExtractedProduct {
  name: string;
  price: number;
  costPrice?: number;
  stock?: number | null;
  isUnlimitedStock: boolean;
  isDigital?: boolean;
  digitalFileUrl?: string;
  description?: string;
  category?: string;
}

export interface ExtractedProductResult {
  isProduct: boolean;
  products: ExtractedProduct[];
  clarificationMessage?: string;
}

export async function extractProductsFromText(merchantText: string): Promise<ExtractedProductResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are a precision AI assistant for African WhatsApp merchants (e.g. food vendors, fashion sellers, gadget stores, digital creators, beauty retailers).
Your job is to analyze incoming merchant WhatsApp messages (such as forwarded product broadcasts, photo captions, inventory updates, digital product links, or quick notes) and extract structured product details.

Key Extraction Rules:
1. "price": Must be a clean numeric value (e.g., "₦2,500" -> 2500, "10k" -> 10000, "25,000 naira" -> 25000).
2. "stock": If stock quantity is explicitly stated (e.g., "stock 10", "qty: 5", "5 pairs left"), extract as an integer.
3. "isUnlimitedStock": If NO stock is mentioned (very common for food, parfait, cakes, made-to-order, or digital goods), set "isUnlimitedStock" to TRUE and "stock" to null.
4. "isDigital" & "digitalFileUrl": If the product is an ebook, course, guide, template, webinar, or contains a download/access link (Google Drive, Notion, Canva, Dropbox, Telegram, PDF, etc.), set "isDigital" to true and extract the URL into "digitalFileUrl".
5. "description": Extract additional attributes like "Minimum of 5pcs", sizes, ingredients, or variations.
6. "isProduct": Set to true if the message is clearly intended to add, list, or sell one or more products. Set to false if it's general chat or unrelated inquiry.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: merchantText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isProduct: { type: Type.BOOLEAN, description: 'True if message describes one or more products with price' },
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Product title / name' },
                  price: { type: Type.NUMBER, description: 'Selling price as a clean number' },
                  costPrice: { type: Type.NUMBER, description: 'Cost price if mentioned' },
                  stock: { type: Type.INTEGER, description: 'Stock count, or null if unlimited' },
                  isUnlimitedStock: { type: Type.BOOLEAN, description: 'True if no stock limit was specified' },
                  isDigital: { type: Type.BOOLEAN, description: 'True if it is a digital product, ebook, course, or template' },
                  digitalFileUrl: { type: Type.STRING, description: 'Access or download URL if provided' },
                  description: { type: Type.STRING, description: 'Extra details, minimum orders, sizes, or notes' },
                  category: { type: Type.STRING, description: 'Suggested product category' },
                },
                required: ['name', 'price', 'isUnlimitedStock'],
              },
            },
            clarificationMessage: { type: Type.STRING, description: 'Helpful message if price or essential details are missing' },
          },
          required: ['isProduct', 'products'],
        },
      },
    });

    if (!response.text) {
      return { isProduct: false, products: [] };
    }

    return JSON.parse(response.text) as ExtractedProductResult;
  } catch (error: any) {
    console.error('[Gemini Product Extraction Error]:', error?.message || error);
    return { isProduct: false, products: [] };
  }
}
