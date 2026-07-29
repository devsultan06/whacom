import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRouter from './routes/health.js';
import invoiceRouter from './routes/invoiceRoutes.js';
import whatsappRouter from './routes/whatsappRoutes.js';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', healthRouter);
app.use('/api/v1/invoices', invoiceRouter);
app.use('/api/v1/whatsapp', whatsappRouter);

// Root Endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name: 'Whacom Invoice Engine API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      parseInvoice: 'POST /api/v1/invoices/parse',
      generatePdf: 'POST /api/v1/invoices/pdf',
      whatsappWebhook: 'GET/POST /api/v1/whatsapp/webhook',
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
