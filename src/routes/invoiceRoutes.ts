import { Router } from 'express';
import { parseInvoice, generatePdf } from '../controllers/invoiceController.js';

const router = Router();

router.post('/parse', parseInvoice);
router.post('/pdf', generatePdf);

export default router;
