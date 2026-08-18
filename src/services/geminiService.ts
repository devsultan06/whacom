import { GoogleGenAI, Type } from '@google/genai';
import { ExtractedInvoiceData } from '../types/invoice.js';

export async function extractInvoiceFromText(merchantPrompt: string): Promise<ExtractedInvoiceData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  const ai = new GoogleGenAI({ apiKey });
  const currentDate = new Date().toISOString().split('T')[0];

  const systemInstruction = `You are a precision AI parser for invoice creation.
Extract structured invoice details from the merchant's natural language message.
Today's date is ${currentDate}. Use this reference date to compute relative due dates (e.g. "due Friday", "due in 7 days").
Ensure price values are numbers without currency symbols. Default currency to "NGN" if ₦ or Naira is mentioned or if unspecified.`;

  let retries = 3;
  let lastError: any;

  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: merchantPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              customerName: { type: Type.STRING, description: 'Customer or client name' },
              customerEmail: { type: Type.STRING, description: 'Customer email address if provided' },
              customerPhone: { type: Type.STRING, description: 'Customer phone number if provided' },
              dueDate: { type: Type.STRING, description: 'Due date in YYYY-MM-DD format' },
              currency: { type: Type.STRING, description: 'Currency code e.g. NGN, USD' },
              notes: { type: Type.STRING, description: 'Special instructions or notes' },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    description: { type: Type.STRING, description: 'Product or service description' },
                    quantity: { type: Type.NUMBER, description: 'Quantity (defaults to 1 if omitted)' },
                    unitPrice: { type: Type.NUMBER, description: 'Unit price' },
                  },
                  required: ['description', 'unitPrice'],
                },
              },
            },
            required: ['customerName', 'items'],
          },
        },
      });

      if (!response.text) {
        throw new Error('Gemini returned an empty response.');
      }

      return JSON.parse(response.text) as ExtractedInvoiceData;
    } catch (err: any) {
      lastError = err;
      const isRateLimit = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota');
      if (isRateLimit && retries > 1) {
        console.log(`[Gemini Rate Limit] Waiting 5 seconds before retry... (${retries - 1} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        retries--;
      } else {
        throw err;
      }
    }
  }

  throw lastError;
}
