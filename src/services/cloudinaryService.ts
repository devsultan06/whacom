import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadLogoToCloudinary(
  mediaUrl: string,
  slug: string
): Promise<string> {
  const folder = process.env.CLOUDINARY_FOLDER || 'qora/logos';
  const publicId = `${slug}_logo_${Date.now()}`;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  // Download media stream from Twilio with Basic Auth
  const response = await axios({
    method: 'get',
    url: mediaUrl,
    responseType: 'arraybuffer',
    auth: accountSid && authToken ? { username: accountSid, password: authToken } : undefined,
  });

  const buffer = Buffer.from(response.data);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          console.error('[Cloudinary Upload Error]:', error);
          reject(error || new Error('Upload to Cloudinary failed'));
        } else {
          console.log(`[Cloudinary Success] Logo uploaded to ${result.secure_url}`);
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export async function uploadProductImageToCloudinary(
  mediaUrl: string,
  merchantSlug: string,
  productSlug: string
): Promise<string> {
  const folder = 'qora/products';
  const publicId = `${merchantSlug}_${productSlug}_${Date.now()}`;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const response = await axios({
    method: 'get',
    url: mediaUrl,
    responseType: 'arraybuffer',
    auth: accountSid && authToken ? { username: accountSid, password: authToken } : undefined,
  });

  const buffer = Buffer.from(response.data);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          console.error('[Product Cloudinary Upload Error]:', error);
          reject(error || new Error('Upload to Cloudinary failed'));
        } else {
          console.log(`[Cloudinary Success] Product image uploaded to ${result.secure_url}`);
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export async function uploadReceiptToCloudinary(
  base64OrUrl: string,
  orderNumber: string
): Promise<string> {
  const folder = 'qora/receipts';
  const publicId = `${orderNumber}_receipt_${Date.now()}`;

  const result = await cloudinary.uploader.upload(base64OrUrl, {
    folder,
    public_id: publicId,
    resource_type: 'image',
  });

  return result.secure_url;
}
