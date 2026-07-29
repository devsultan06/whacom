import axios from 'axios';
import FormData from 'form-data';

const getWhatsAppConfig = () => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || token === 'your_meta_whatsapp_access_token_here') {
    console.warn('[WhatsAppService] WHATSAPP_TOKEN is not configured in .env');
  }
  if (!phoneNumberId || phoneNumberId === 'your_whatsapp_phone_number_id_here') {
    console.warn('[WhatsAppService] WHATSAPP_PHONE_NUMBER_ID is not configured in .env');
  }

  return { token, phoneNumberId };
};

export async function sendTextMessage(to: string, messageText: string): Promise<void> {
  const { token, phoneNumberId } = getWhatsAppConfig();
  if (!token || !phoneNumberId) {
    console.log(`[WhatsApp Mock Send] To: ${to} | Text: ${messageText}`);
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  await axios.post(
    url,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { body: messageText },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

export async function uploadMedia(pdfBuffer: Buffer, filename: string): Promise<string> {
  const { token, phoneNumberId } = getWhatsAppConfig();
  if (!token || !phoneNumberId) {
    console.log('[WhatsApp Mock Upload] Mocking PDF upload, returning dummy_media_id');
    return 'mock_media_id_12345';
  }

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/media`;

  const form = new FormData();
  form.append('file', pdfBuffer, {
    filename,
    contentType: 'application/pdf',
  });
  form.append('type', 'application/pdf');
  form.append('messaging_product', 'whatsapp');

  const response = await axios.post(url, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      ...form.getHeaders(),
    },
  });

  return response.data.id;
}

export async function sendDocumentMessage(
  to: string,
  pdfBuffer: Buffer,
  filename: string,
  caption: string
): Promise<void> {
  const mediaId = await uploadMedia(pdfBuffer, filename);
  const { token, phoneNumberId } = getWhatsAppConfig();

  if (!token || !phoneNumberId) {
    console.log(`[WhatsApp Mock Send Document] To: ${to} | MediaId: ${mediaId} | Caption: ${caption}`);
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
  await axios.post(
    url,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'document',
      document: {
        id: mediaId,
        filename,
        caption,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
}
