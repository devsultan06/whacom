import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import healthRouter from './routes/health.js';
import invoiceRouter from './routes/invoiceRoutes.js';
import twilioRouter from './routes/twilioRoutes.js';
import storeRouter from './routes/storeRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';

const app: Express = express();

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow public static PDF downloads
  })
);
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static PDF invoices and logos publicly
app.use('/invoices', express.static(path.join(process.cwd(), 'public', 'invoices')));
app.use('/logos', express.static(path.join(process.cwd(), 'public', 'logos')));

// Routes
app.use('/', healthRouter);
app.use('/api/v1/invoices', invoiceRouter);
app.use('/api/v1/twilio', twilioRouter);
app.use('/api/v1/storefront', storeRouter);
app.use('/api/v1/payments', paymentRouter);

// Root Endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name: 'Qora WhatsApp Commerce OS API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      parseInvoice: 'POST /api/v1/invoices/parse',
      generatePdf: 'POST /api/v1/invoices/pdf',
      twilioWebhook: 'POST /api/v1/twilio/webhook',
    },
  });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
