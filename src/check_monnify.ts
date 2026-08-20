import 'dotenv/config';
import axios from 'axios';
import { getMonnifyAccessToken } from './services/monnifyService.js';

async function checkContracts() {
  const token = await getMonnifyAccessToken();
  console.log('Token received successfully.');

  try {
    const res = await axios.get('https://sandbox.monnify.com/api/v1/sdk/transactions/merchant-contracts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Contracts:', res.data);
  } catch (err: any) {
    console.log('Contracts query error:', err?.response?.data || err?.message);
  }

  try {
    const res2 = await axios.get('https://sandbox.monnify.com/api/v1/merchant/details', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Merchant Details:', res2.data);
  } catch (err: any) {
    console.log('Merchant details error:', err?.response?.data || err?.message);
  }
}

checkContracts().then(() => process.exit(0));
