import { Request, Response } from 'express';
import { WhatsAppWebhookPayload } from '../types/whatsapp.js';
import { extractInvoiceFromText } from '../services/geminiService.js';
import { processExtractedInvoice } from '../services/invoiceService.js';
import { generateInvoicePdf } from '../services/pdfService.js';
import { sendTextMessage, sendDocumentMessage } from '../services/whatsappService.js';

export function verifyWebhook(req: Request, res: Response): void {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'whacom_verify_token_12345';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[WhatsApp Webhook] Verification successful');
    res.status(200).send(challenge);
  } else {
    console.warn('[WhatsApp Webhook] Verification failed - token mismatch');
    res.sendStatus(403);
  }
}

export async function handleWebhook(req: Request, res: Response): Promise<void> {
  // Always return 200 OK immediately to Meta to acknowledge event receipt
  res.status(200).send('EVENT_RECEIVED');

  console.log('[WhatsApp Webhook Payload Received]:', JSON.stringify(req.body, null, 2));

  const body = req.body as WhatsAppWebhookPayload;

  if (body.object !== 'whatsapp_business_account') {
    return;
  }

  const entries = body.entry || [];
  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      const messages = change.value.messages || [];
      for (const msg of messages) {
        if (msg.type === 'text' && msg.text?.body) {
          const fromPhone = msg.from;
          const textContent = msg.text.body;

          console.log(`[WhatsApp Inbound] From ${fromPhone}: "${textContent}"`);

          // Process invoice pipeline asynchronously
          processInvoiceWorkflow(fromPhone, textContent).catch((err) => {
            console.error('[WhatsApp Pipeline Error]', err);
          });
        }
      }
    }
  }
}

async function processInvoiceWorkflow(fromPhone: string, textContent: string): Promise<void> {
  try {
    // 1. Send immediate progress acknowledgment
    await sendTextMessage(
      fromPhone,
      `⌛ Processing your invoice request...\n\n"${textContent}"`
    );

    // 2. Extract structured JSON via Gemini AI
    const rawData = await extractInvoiceFromText(textContent);

    // 3. Validate & calculate invoice totals
    const processedInvoice = processExtractedInvoice(rawData);

    // 4. Render PDF document
    const pdfBuffer = await generateInvoicePdf(processedInvoice);

    // 5. Send PDF Document back to WhatsApp merchant
    const caption = `📄 *Invoice Generated Successfully!*\n\n` +
      `*Invoice #:* ${processedInvoice.invoiceNumber}\n` +
      `*Customer:* ${processedInvoice.customerName}\n` +
      `*Total Amount:* ${processedInvoice.currencySymbol}${processedInvoice.totalAmount.toLocaleString()}\n` +
      `*Due Date:* ${processedInvoice.dueDate}`;

    await sendDocumentMessage(
      fromPhone,
      pdfBuffer,
      `${processedInvoice.invoiceNumber}.pdf`,
      caption
    );
  } catch (error: any) {
    console.error(`[Invoice Workflow Failed for ${fromPhone}]`, error);
    const errorMessage = error?.message || 'Failed to parse invoice text.';
    await sendTextMessage(
      fromPhone,
      `⚠️ *Invoice Generation Failed*\n\n${errorMessage}\n\nPlease check your text and try again (e.g. "Create invoice for John. Website design. ₦250,000. Due Friday.")`
    );
  }
}
