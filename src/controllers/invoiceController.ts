import { Request, Response } from 'express';
import { extractInvoiceFromText } from '../services/geminiService.js';
import { processExtractedInvoice } from '../services/invoiceService.js';
import { generateInvoicePdf } from '../services/pdfService.js';

export async function parseInvoice(req: Request, res: Response): Promise<void> {
  try {
    const { prompt, taxRate } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Field "prompt" is required and must be a string.' });
      return;
    }

    const rawData = await extractInvoiceFromText(prompt);
    const processed = processExtractedInvoice(rawData, taxRate || 0);

    res.status(200).json({
      success: true,
      extractedRaw: rawData,
      processedInvoice: processed,
    });
  } catch (err: any) {
    console.error('[Invoice Controller Parse Error]', err);
    res.status(500).json({ success: false, error: err.message || 'Invoice parsing failed' });
  }
}

export async function generatePdf(req: Request, res: Response): Promise<void> {
  try {
    const { prompt, invoiceData, taxRate } = req.body;

    let processed;
    if (invoiceData) {
      processed = processExtractedInvoice(invoiceData, taxRate || 0);
    } else if (prompt && typeof prompt === 'string') {
      const rawData = await extractInvoiceFromText(prompt);
      processed = processExtractedInvoice(rawData, taxRate || 0);
    } else {
      res.status(400).json({ error: 'Provide either "prompt" string or "invoiceData" object.' });
      return;
    }

    const pdfBuffer = await generateInvoicePdf(processed);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${processed.invoiceNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('[Invoice Controller PDF Error]', err);
    res.status(500).json({ success: false, error: err.message || 'PDF generation failed' });
  }
}
