import 'dotenv/config';
import { initializeMonnifyTransaction } from './services/monnifyService.js';

async function test() {
  try {
    const res = await initializeMonnifyTransaction({
      amount: 5000,
      customerName: 'Sultan Tester',
      customerEmail: 'devsultan@gmail.com',
      paymentReference: 'TEST_REF_' + Date.now(),
      paymentDescription: 'Testing order payment',
    });
    console.log('Success:', res);
  } catch (err: any) {
    console.error('Monnify Error details:', err?.response?.data || err?.message || err);
  }
}

test().then(() => process.exit(0));
