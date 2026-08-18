import dotenv from 'dotenv';
dotenv.config();

import { handleOnboardingMessage } from './services/onboardingService.js';
import { getMerchantByPhone, resetMerchant } from './services/merchantService.js';

async function runOnboardingTest() {
  const testPhone = 'whatsapp:+2348000000001';
  console.log('🧪 Starting Onboarding Pipeline Test for:', testPhone);

  // 1. Reset test merchant
  await resetMerchant(testPhone);
  console.log('\n--- Step 1: Initial Greeting ("Hi Qora i want to setup my store") ---');
  await handleOnboardingMessage(testPhone, 'Hi Qora i want to setup my store');

  let merchant = await getMerchantByPhone(testPhone);
  console.log('Merchant State after Greeting:', merchant?.onboardingStep);

  // 2. Store Name
  console.log('\n--- Step 2: Providing Store Name ("Amara Closet Lekki") ---');
  await handleOnboardingMessage(testPhone, 'Amara Closet Lekki');

  merchant = await getMerchantByPhone(testPhone);
  console.log('Merchant Name:', merchant?.storeName);
  console.log('Merchant Slug:', merchant?.slug);
  console.log('State after Store Name:', merchant?.onboardingStep);

  // 3. Category Selection
  console.log('\n--- Step 3: Selecting Category ("1" for Fashion) ---');
  await handleOnboardingMessage(testPhone, '1');

  merchant = await getMerchantByPhone(testPhone);
  console.log('Merchant Category:', merchant?.category);
  console.log('State after Category:', merchant?.onboardingStep);

  // 4. Bank Details
  console.log('\n--- Step 4: Providing Bank Details ("GTBank 0123456789 Amara Bello") ---');
  await handleOnboardingMessage(testPhone, 'GTBank 0123456789 Amara Bello');

  merchant = await getMerchantByPhone(testPhone);
  console.log('Bank Name:', merchant?.bankName);
  console.log('Account Number:', merchant?.accountNumber);
  console.log('State after Bank:', merchant?.onboardingStep);

  // 5. Logo upload (or skip)
  console.log('\n--- Step 5: Finishing Logo Step ("Skip") ---');
  await handleOnboardingMessage(testPhone, 'Skip');

  merchant = await getMerchantByPhone(testPhone);
  console.log('\n=============================================');
  console.log('🎉 FINAL ACTIVE MERCHANT PROFILE (from Neon DB):');
  console.log('=============================================');
  console.log('Store Name  :', merchant?.storeName);
  console.log('Store Slug  :', merchant?.slug);
  console.log('Store URL   :', `https://qora.store/${merchant?.slug}`);
  console.log('Category    :', merchant?.category);
  console.log('Bank Info   :', `${merchant?.bankName} - ${merchant?.accountNumber}`);
  console.log('Admin PIN   :', merchant?.adminPin);
  console.log('Status      :', merchant?.onboardingStep);
  console.log('=============================================\n');

  if (merchant?.onboardingStep === 'ACTIVE' && merchant?.adminPin?.length === 5) {
    console.log('✅ ALL ONBOARDING TESTS PASSED SUCCESSFULLY!');
  } else {
    throw new Error('Onboarding failed to complete!');
  }
}

runOnboardingTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
