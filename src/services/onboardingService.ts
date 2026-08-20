import fs from 'fs';
import path from 'path';
import axios from 'axios';
import {
  getMerchantByPhone,
  createMerchant,
  updateMerchant,
  resetMerchant,
  generateSlug,
  generateAdminPin,
} from './merchantService.js';
import { sendTwilioTextMessage, sendTwilioInteractiveTemplate } from './twilioService.js';

import { validateBankAccount } from './monnifyService.js';
import { uploadLogoToCloudinary } from './cloudinaryService.js';

export const TWILIO_TEMPLATES = {
  CATEGORY_LIST_PICKER: 'HX6e085891094df33c8fbf15e03b5f2c7c',
  BANK_LIST_PICKER: 'HXb7b6b2f9a5e2389e5d3275ad901dd8ac',
  SKIP_LOGO_BUTTON: 'HX9980bb4655eca1f39e1de2e38d315a8f',
  QUICK_ACTIONS: 'HX821fac2b17f4ba1c93616abdd04bf090',
};

export const STORE_CATEGORIES = [
  { id: '1', name: 'Fashion & Apparel' },
  { id: '2', name: 'Food & Dining' },
  { id: '3', name: 'Beauty & Cosmetics' },
  { id: '4', name: 'Gadgets & Electronics' },
  { id: '5', name: 'Digital Products' },
  { id: '6', name: 'Services & Custom' },
];

function getCategoryMenuText(): string {
  const options = STORE_CATEGORIES.map((c) => `${c.id}. ${c.name}`).join('\n');

  return (
    `What category best describes what you sell?\n\n` +
    `${options}\n\n` +
    `Reply with a number (1 - 6) or category name.`
  );
}

function parseCategoryChoice(text: string): string | null {
  const clean = text.trim().toLowerCase();
  
  const byId = STORE_CATEGORIES.find((c) => c.id === clean || clean.startsWith(c.id));
  if (byId) return byId.name;

  if (clean.includes('fashion') || clean.includes('cloth') || clean.includes('wear') || clean.includes('apparel') || clean.includes('shoe') || clean.includes('bag')) {
    return 'Fashion & Apparel';
  }
  if (clean.includes('food') || clean.includes('bake') || clean.includes('rest') || clean.includes('cook') || clean.includes('dining') || clean.includes('cake')) {
    return 'Food & Dining';
  }
  if (clean.includes('beauty') || clean.includes('cosmetic') || clean.includes('skin') || clean.includes('hair') || clean.includes('makeup')) {
    return 'Beauty & Cosmetics';
  }
  if (clean.includes('gadget') || clean.includes('phone') || clean.includes('elect') || clean.includes('tech') || clean.includes('laptop')) {
    return 'Gadgets & Electronics';
  }
  if (clean.includes('digital') || clean.includes('course') || clean.includes('ebook') || clean.includes('pdf')) {
    return 'Digital Products';
  }
  if (clean.includes('service') || clean.includes('freelanc') || clean.includes('consult') || clean.includes('tailor')) {
    return 'Services & Custom';
  }

  return null;
}

export async function handleOnboardingMessage(
  from: string,
  text: string,
  mediaUrl?: string
): Promise<boolean> {
  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();

  // 1. Manual reset
  if (lowerText === 'reset' || lowerText === 'start over' || lowerText === 'restart onboarding') {
    await resetMerchant(from);
    await sendTwilioTextMessage(
      from,
      `Store setup has been reset.\n\n` +
      `Welcome to Qora.\n\n` +
      `What is your Store / Business Name?\n` +
      `(e.g., Amara's Closet, Sultan Gadgets, Lagos Bakes)`
    );
    return true;
  }

  let merchant = await getMerchantByPhone(from);

  // 2. New merchant / Not yet registered
  if (!merchant) {
    const isGreeting =
      /hi|hello|hey|start|setup|set up|qora|store|sell|join|register|account|begin/i.test(lowerText) ||
      cleanText.length < 3;

    if (isGreeting) {
      merchant = await createMerchant({
        phone: from,
        onboardingStep: 'AWAITING_STORE_NAME',
      });

      await sendTwilioTextMessage(
        from,
        `Welcome to Qora.\n\n` +
        `Let's set up your store in 60 seconds so you can turn chats into tracked sales.\n\n` +
        `What is your Store / Business Name?\n` +
        `(e.g., Amara's Closet, Sultan Gadgets, Lagos Bakes)`
      );
      return true;
    } else {
      const storeName = cleanText;
      const slug = generateSlug(storeName);
      merchant = await createMerchant({
        phone: from,
        storeName,
        slug,
        onboardingStep: 'AWAITING_CATEGORY',
      });

      await sendTwilioTextMessage(from, `Registered: *${storeName}*`);
      await sendTwilioInteractiveTemplate(from, TWILIO_TEMPLATES.CATEGORY_LIST_PICKER);
      return true;
    }
  }

  // 3. Merchant already active -> Not in onboarding
  if (merchant.onboardingStep === 'ACTIVE') {
    return false;
  }

  // 4. Handle State Machine
  switch (merchant.onboardingStep) {
    case 'AWAITING_STORE_NAME': {
      const isGreeting =
        /^(hi|hello|hey|start|setup|set up|qora|i want to|want to set)/i.test(lowerText) ||
        lowerText.includes('set up my store') ||
        lowerText.includes('setup my store');

      if (isGreeting) {
        await sendTwilioTextMessage(
          from,
          `Welcome to Qora.\n\n` +
          `What is your Store / Business Name?\n` +
          `(e.g., Amara's Closet, Sultan Gadgets, Lagos Bakes)`
        );
        return true;
      }

      const storeName = cleanText;
      const slug = generateSlug(storeName);

      await updateMerchant(from, {
        storeName,
        slug,
        onboardingStep: 'AWAITING_CATEGORY',
      });

      await sendTwilioTextMessage(from, `Registered: *${storeName}*`);
      await sendTwilioInteractiveTemplate(from, TWILIO_TEMPLATES.CATEGORY_LIST_PICKER);
      return true;
    }

    case 'AWAITING_CATEGORY': {
      const category = parseCategoryChoice(cleanText) || cleanText;

      await updateMerchant(from, {
        category,
        onboardingStep: 'AWAITING_LOCATION',
      });

      await sendTwilioTextMessage(
        from,
        `Category: *${category}*\n\n` +
        `📍 *Where is your store/business located?*\n` +
        `(e.g., *Lekki, Lagos* or *Wuse 2, Abuja* or *Ikeja, Lagos*)\n\n` +
        `This will be displayed on your store profile so customers know where you are based.`
      );
      return true;
    }

    case 'AWAITING_LOCATION': {
      const location = cleanText;

      await updateMerchant(from, {
        location,
        onboardingStep: 'AWAITING_BANK_NAME',
      });

      await sendTwilioTextMessage(from, `📍 Location saved: *${location}*`);
      await sendTwilioInteractiveTemplate(from, TWILIO_TEMPLATES.BANK_LIST_PICKER);
      return true;
    }

    case 'AWAITING_BANK_NAME': {
      const selectedBank = cleanText;

      await updateMerchant(from, {
        bankName: selectedBank,
        onboardingStep: 'AWAITING_ACCOUNT_NUMBER',
      });

      await sendTwilioTextMessage(
        from,
        `Bank: *${selectedBank}*\n\nPlease enter your 10-digit account number:`
      );
      return true;
    }

    case 'AWAITING_ACCOUNT_NUMBER': {
      const match = cleanText.match(/\b\d{10}\b/);
      const accountNumber = match ? match[0] : (cleanText.replace(/\D/g, '').length === 10 ? cleanText.replace(/\D/g, '') : null);

      if (!accountNumber) {
        await sendTwilioTextMessage(
          from,
          `Please enter a valid 10-digit account number:\n(e.g., 0123456789)`
        );
        return true;
      }

      // Verify account with Monnify
      const bankName = merchant.bankName || 'GTBank';
      const validation = await validateBankAccount(accountNumber, bankName);

      const accountName = validation.isValid && validation.accountName
        ? validation.accountName
        : undefined;

      await updateMerchant(from, {
        accountNumber,
        accountName,
        onboardingStep: 'AWAITING_LOGO',
      });

      if (accountName) {
        await sendTwilioTextMessage(
          from,
          `Account Verified: *${accountName}*\nBank: *${bankName}*\nAccount Number: *${accountNumber}*`
        );
      } else {
        await sendTwilioTextMessage(
          from,
          `Settlement Account Saved: *${bankName} (${accountNumber})*`
        );
      }

      await sendTwilioInteractiveTemplate(from, TWILIO_TEMPLATES.SKIP_LOGO_BUTTON);
      return true;
    }

    case 'AWAITING_LOGO': {
      let logoUrl: string | undefined = undefined;

      const isSkip = /^(skip|no|later|none|pass)/i.test(lowerText);
      if (!isSkip && mediaUrl && merchant.slug) {
        try {
          logoUrl = await uploadLogoToCloudinary(mediaUrl, merchant.slug);
        } catch (uploadErr) {
          console.error('[Logo Cloudinary Upload Failed]:', uploadErr);
        }
      }

      const adminPin = generateAdminPin();
      const slug = merchant.slug || generateSlug(merchant.storeName || 'my-store');

      await updateMerchant(from, {
        logoUrl: logoUrl || merchant.logoUrl || undefined,
        adminPin,
        slug,
        onboardingStep: 'ACTIVE',
      });

      const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
      const storeUrl = `${frontendBase}/store/${slug}`;
      const loginUrl = `${frontendBase}/login`;

      await sendTwilioTextMessage(
        from,
        `🎉 *Your store is live!*\n\n` +
        `*Storefront Link:*\n${storeUrl}\n\n` +
        `*Admin Login PIN:*\n*${adminPin}*\n\n` +
        `*Web Dashboard:*\n${loginUrl}\n(Login with code: ${adminPin})`
      );

      await sendTwilioInteractiveTemplate(from, TWILIO_TEMPLATES.QUICK_ACTIONS);
      return true;
    }

    default: {
      return false;
    }
  }
}
