import axios from 'axios';

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com';

// Standard Nigerian Bank Codes used by Monnify / NIBSS
export const BANK_CODES: Record<string, string> = {
  'gtbank': '058',
  'gtb': '058',
  'guaranty trust bank': '058',
  'access bank': '044',
  'access': '044',
  'zenith bank': '057',
  'zenith': '057',
  'first bank': '011',
  'firstbank': '011',
  'opay': '999992',
  'paycom': '999992',
  'kuda bank': '090267',
  'kuda': '090267',
  'moniepoint': '50515',
  'moniepoint mfb': '50515',
  'palmpay': '999991',
  'united bank for africa': '033',
  'uba': '033',
  'stanbic': '221',
  'stanbic ibtc': '221',
  'fidelity bank': '070',
  'fidelity': '070',
  'ecobank': '050',
  'fcmb': '214',
  'sterling bank': '232',
  'sterling': '232',
  'wema bank': '035',
  'wema': '035',
  'alat': '035',
  'union bank': '032',
  'providus bank': '101',
  'providus': '101',
};

export function getBankCode(bankName: string): string {
  const clean = bankName.toLowerCase().trim();
  for (const [key, code] of Object.entries(BANK_CODES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return code;
    }
  }
  return '058'; // Default fallback
}

export async function getMonnifyAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 60000) {
    return cachedToken;
  }

  const apiKey = process.env.MONNIFY_API_KEY;
  const secretKey = process.env.MONNIFY_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error('MONNIFY_API_KEY or MONNIFY_SECRET_KEY is missing in .env');
  }

  const authHeader = Buffer.from(`${apiKey}:${secretKey}`).toString('base64');

  const response = await axios.post(
    `${MONNIFY_BASE_URL}/api/v1/auth/login`,
    {},
    {
      headers: {
        Authorization: `Basic ${authHeader}`,
      },
    }
  );

  if (response.data?.requestSuccessful && response.data?.responseBody?.accessToken) {
    cachedToken = response.data.responseBody.accessToken;
    const expiresInSeconds = response.data.responseBody.expiresIn || 3600;
    tokenExpiresAt = now + expiresInSeconds * 1000;
    return cachedToken!;
  }

  throw new Error(response.data?.responseMessage || 'Failed to authenticate with Monnify');
}

export interface BankValidationResult {
  isValid: boolean;
  accountNumber: string;
  accountName?: string;
  bankCode: string;
  errorMessage?: string;
}

export async function validateBankAccount(
  accountNumber: string,
  bankNameOrCode: string
): Promise<BankValidationResult> {
  try {
    const token = await getMonnifyAccessToken();
    const bankCode = /^\d+$/.test(bankNameOrCode)
      ? bankNameOrCode
      : getBankCode(bankNameOrCode);

    const response = await axios.get(
      `${MONNIFY_BASE_URL}/api/v1/disbursements/account/validate`,
      {
        params: {
          accountNumber: accountNumber.trim(),
          bankCode: bankCode,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data?.requestSuccessful && response.data?.responseBody) {
      return {
        isValid: true,
        accountNumber: response.data.responseBody.accountNumber || accountNumber,
        accountName: response.data.responseBody.accountName,
        bankCode: response.data.responseBody.bankCode || bankCode,
      };
    }

    return {
      isValid: false,
      accountNumber,
      bankCode,
      errorMessage: response.data?.responseMessage || 'Could not verify account name.',
    };
  } catch (error: any) {
    console.error('[Monnify Bank Validation Error]:', error?.response?.data || error?.message || error);
    return {
      isValid: false,
      accountNumber,
      bankCode: getBankCode(bankNameOrCode),
      errorMessage: error?.response?.data?.responseMessage || error?.message || 'Verification service unreachable',
    };
  }
}

export async function initializeMonnifyTransaction(params: {
  amount: number;
  customerName: string;
  customerEmail: string;
  paymentReference: string;
  paymentDescription: string;
  redirectUrl?: string;
}) {
  const token = await getMonnifyAccessToken();
  const contractCode = process.env.MONNIFY_CONTRACT_CODE || process.env.MONNIFY_WALLET_ACCOUNT || '6975655381';

  const payload = {
    amount: params.amount,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    paymentReference: params.paymentReference,
    paymentDescription: params.paymentDescription,
    currencyCode: 'NGN',
    contractCode: contractCode,
    redirectUrl: params.redirectUrl || 'http://localhost:3000',
    paymentMethods: ['CARD', 'ACCOUNT_TRANSFER', 'USSD'],
  };

  const response = await axios.post(
    `${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.data?.requestSuccessful && response.data?.responseBody) {
    return {
      success: true,
      transactionReference: response.data.responseBody.transactionReference,
      paymentReference: response.data.responseBody.paymentReference,
      checkoutUrl: response.data.responseBody.checkoutUrl,
      apiKey: process.env.MONNIFY_API_KEY,
      contractCode: contractCode,
    };
  }

  throw new Error(response.data?.responseMessage || 'Failed to initialize Monnify transaction');
}
