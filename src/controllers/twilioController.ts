import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

import { extractInvoiceFromText } from '../services/geminiService.js';
import { processExtractedInvoice } from '../services/invoiceService.js';
import { generateInvoicePdf } from '../services/pdfService.js';
import { sendTwilioTextMessage, sendTwilioMediaMessage } from '../services/twilioService.js';

import { handleOnboardingMessage } from '../services/onboardingService.js';
import { handleActiveMerchantMessage } from '../services/commerceOSService.js';

export async function handleTwilioWebhook(req: Request, res: Response): Promise<void> {
  // Twilio expects a 200 OK TwiML response
  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send('<Response></Response>');

  const from = req.body.From; // e.g. whatsapp:+2347036886069
  const textContent = req.body.Body || ''; // e.g. "Amara's Closet" or "Create invoice for..."
  const numMedia = parseInt(req.body.NumMedia || '0', 10);
  const mediaUrl = numMedia > 0 ? req.body.MediaUrl0 : undefined;

  if (!from) return;

  console.log(`[Twilio Inbound] From: ${from}, Text: "${textContent}", Media: ${mediaUrl || 'None'}`);

  try {
    // 1. Try handling as onboarding step first
    const handledByOnboarding = await handleOnboardingMessage(from, textContent, mediaUrl);
    if (handledByOnboarding) {
      console.log(`[Twilio Onboarding] Processed step for ${from}`);
      return;
    }

    // 2. Active Merchant: Check for Invoice Workflow
    const isInvoiceRequest = /^(create invoice|make invoice|generate invoice|send invoice)/i.test(textContent.trim());
    if (isInvoiceRequest) {
      processTwilioInvoiceWorkflow(from, textContent).catch((err) => {
        console.error('[Twilio Invoice Pipeline Error]', err?.message || err);
      });
      return;
    }

    // 3. Active Merchant: Product management, sales, catalog, and bookkeeping
    const handledByCommerceOS = await handleActiveMerchantMessage(from, textContent, mediaUrl);
    if (handledByCommerceOS) {
      console.log(`[Twilio Commerce OS] Processed merchant action for ${from}`);
      return;
    }
  } catch (err: any) {
    console.error('[Twilio Webhook Processing Error]', err?.message || err);
  }
}

async function processTwilioInvoiceWorkflow(from: string, textContent: string): Promise<void> {
  try {
    // 1. Send immediate progress text
    await sendTwilioTextMessage(
      from,
      `⌛ Processing your invoice request...\n\n"${textContent}"`
    );

    // 2. Gemini AI extraction
    const rawData = await extractInvoiceFromText(textContent);

    // 3. Process totals
    const processedInvoice = processExtractedInvoice(rawData);

    // 4. Generate PDF buffer
    const pdfBuffer = await generateInvoicePdf(processedInvoice);

    // 5. Save PDF to public folder for static serving
    const publicDir = path.join(process.cwd(), 'public', 'invoices');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const fileName = `${processedInvoice.invoiceNumber}.pdf`;
    const filePath = path.join(publicDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    // Construct public media URL using host header or ngrok base URL
    const host = process.env.PUBLIC_URL || 'https://946d-102-89-85-26.ngrok-free.app';
    const mediaUrl = `${host}/invoices/${fileName}`;

    // 6. Send invoice summary and PDF Media URL via Twilio
    const caption =
      `📄 *Invoice Generated Successfully!*\n\n` +
      `*Invoice #:* ${processedInvoice.invoiceNumber}\n` +
      `*Customer:* ${processedInvoice.customerName}\n` +
      `*Total Amount:* ${processedInvoice.currencySymbol}${processedInvoice.totalAmount.toLocaleString()}\n` +
      `*Due Date:* ${processedInvoice.dueDate}\n\n` +
      `📥 Download PDF: ${mediaUrl}`;

    await sendTwilioMediaMessage(from, caption, [mediaUrl]);
    console.log(`[Twilio Success] Invoice ${fileName} delivered to ${from}`);
  } catch (error: any) {
    console.error(`[Twilio Invoice Workflow Failed for ${from}]`, error?.message || error);
    await sendTwilioTextMessage(
      from,
      `⚠️ *Invoice Generation Failed*\n\n${error?.message || 'Failed to parse invoice text.'}\n\nPlease check your text and try again!`
    );
  }
}
