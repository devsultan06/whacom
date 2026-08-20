import 'dotenv/config';
import axios from 'axios';
import { getMonnifyAccessToken } from './services/monnifyService.js';

async function testApiKey() {
  const token = await getMonnifyAccessToken();
  console.log('Got token:', token ? 'YES' : 'NO');

  // Try checking reserved accounts or subaccounts
  try {
    const res = await axios.get('https://sandbox.monnify.com/api/v1/bank-transfer/reserved-accounts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Reserved accounts:', res.data);
  } catch (err: any) {
    console.log('Reserved accounts error:', err?.response?.data || err?.message);
  }
}

testApiKey().then(() => process.exit(0));
