import 'dotenv/config';
import { validateBankAccount } from './services/monnifyService.js';

async function test() {
  console.log('1. Testing Valid OPay account (7026018862)...');
  const validRes = await validateBankAccount('7026018862', 'OPay');
  console.log('Valid Result:', validRes);

  console.log('\n2. Testing Invalid account (0000000000)...');
  const invalidRes = await validateBankAccount('0000000000', 'OPay');
  console.log('Invalid Result:', invalidRes);
}

test().then(() => process.exit(0));
