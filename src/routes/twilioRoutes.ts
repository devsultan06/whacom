import { Router } from 'express';
import express from 'express';
import { handleTwilioWebhook } from '../controllers/twilioController.js';

const router = Router();

// Twilio sends urlencoded form data
router.post('/webhook', express.urlencoded({ extended: true }), handleTwilioWebhook);

export default router;
