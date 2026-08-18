import twilio from 'twilio';

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error('TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing in .env');
  }
  return twilio(accountSid, authToken);
}

function getFromNumber() {
  return process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
}

export async function sendTwilioTextMessage(to: string, messageBody: string) {
  try {
    const client = getTwilioClient();
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    console.log(`[Twilio Text Outbound] To: ${formattedTo}`);
    const message = await client.messages.create({
      from: getFromNumber(),
      to: formattedTo,
      body: messageBody,
    });
    return message.sid;
  } catch (err: any) {
    console.warn(`[Twilio Text Warning for ${to}]:`, err?.message || err);
    return null;
  }
}

export async function sendTwilioMediaMessage(to: string, messageBody: string, mediaUrl: string[]) {
  try {
    const client = getTwilioClient();
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    console.log(`[Twilio Media Outbound] To: ${formattedTo}, Media: ${mediaUrl[0]}`);
    const message = await client.messages.create({
      from: getFromNumber(),
      to: formattedTo,
      body: messageBody,
      mediaUrl: mediaUrl,
    });
    return message.sid;
  } catch (err: any) {
    console.warn(`[Twilio Media Warning for ${to}]:`, err?.message || err);
    return null;
  }
}

export async function sendTwilioInteractiveTemplate(
  to: string,
  contentSid: string,
  contentVariables?: Record<string, string>
) {
  try {
    const client = getTwilioClient();
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    console.log(`[Twilio Interactive Outbound] To: ${formattedTo}, ContentSid: ${contentSid}`);
    const message = await client.messages.create({
      from: getFromNumber(),
      to: formattedTo,
      contentSid: contentSid,
      contentVariables: contentVariables ? JSON.stringify(contentVariables) : undefined,
    });
    return message.sid;
  } catch (err: any) {
    console.warn(`[Twilio Interactive Warning for ${to}]:`, err?.message || err);
    return null;
  }
}


