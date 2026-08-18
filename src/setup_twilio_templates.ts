import dotenv from 'dotenv';
dotenv.config();
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function createAllInteractiveTemplates() {
  console.log('🚀 Creating interactive templates in Twilio Content API...');

  // 1. Category List Picker
  const categoryPicker = await client.content.v1.contents.create({
    friendlyName: `qora_categories_${Date.now()}`,
    language: 'en',
    types: {
      'twilio/list-picker': {
        body: 'What category best describes what you sell?',
        button: 'Select Category',
        items: [
          { id: 'Fashion & Apparel', item: 'Fashion & Apparel', description: 'Clothing, footwear, and accessories' },
          { id: 'Food & Dining', item: 'Food & Dining', description: 'Meals, baked goods, and groceries' },
          { id: 'Beauty & Cosmetics', item: 'Beauty & Cosmetics', description: 'Skincare, hair care, and cosmetics' },
          { id: 'Gadgets & Electronics', item: 'Gadgets & Electronics', description: 'Phones, computers, and accessories' },
          { id: 'Digital Products', item: 'Digital Products', description: 'Ebooks, courses, and downloads' },
          { id: 'Services & Custom', item: 'Services & Custom', description: 'Consulting, bespoke design, and bookings' },
        ],
      },
    },
  });
  console.log('✅ Created Category Picker SID:', categoryPicker.sid);

  // 2. Bank List Picker
  const bankPicker = await client.content.v1.contents.create({
    friendlyName: `qora_banks_${Date.now()}`,
    language: 'en',
    types: {
      'twilio/list-picker': {
        body: 'Where should your sales settlements be sent?',
        button: 'Select Bank',
        items: [
          { id: 'GTBank', item: 'GTBank', description: 'Guaranty Trust Bank' },
          { id: 'Access Bank', item: 'Access Bank', description: 'Access Bank Nigeria' },
          { id: 'Zenith Bank', item: 'Zenith Bank', description: 'Zenith Bank Plc' },
          { id: 'First Bank', item: 'First Bank', description: 'First Bank of Nigeria' },
          { id: 'OPay', item: 'OPay', description: 'OPay Digital Services' },
          { id: 'Kuda Bank', item: 'Kuda Bank', description: 'Kuda Microfinance Bank' },
          { id: 'Moniepoint', item: 'Moniepoint', description: 'Moniepoint MFB' },
          { id: 'PalmPay', item: 'PalmPay', description: 'PalmPay Nigeria' },
          { id: 'Other Bank', item: 'Other Bank', description: 'Enter another commercial bank' },
        ],
      },
    },
  });
  console.log('✅ Created Bank Picker SID:', bankPicker.sid);

  // 3. Skip Logo Button
  const logoPrompt = await client.content.v1.contents.create({
    friendlyName: `qora_skip_logo_${Date.now()}`,
    language: 'en',
    types: {
      'twilio/quick-reply': {
        body: 'Optional: Send your business logo image, or tap below to skip.',
        actions: [
          { id: 'Skip', title: 'Skip' },
        ],
      },
    },
  });
  console.log('✅ Created Skip Logo SID:', logoPrompt.sid);

  // 4. Quick Actions Buttons
  const quickActions = await client.content.v1.contents.create({
    friendlyName: `qora_quick_actions_${Date.now()}`,
    language: 'en',
    types: {
      'twilio/quick-reply': {
        body: 'Your store is live. What would you like to do next?',
        actions: [
          { id: 'Add Product', title: 'Add Product' },
          { id: 'View Sales', title: 'View Sales' },
          { id: 'Create Order', title: 'Create Order' },
        ],
      },
    },
  });
  console.log('✅ Created Quick Actions SID:', quickActions.sid);

  return {
    CATEGORY_LIST_PICKER: categoryPicker.sid,
    BANK_LIST_PICKER: bankPicker.sid,
    SKIP_LOGO_BUTTON: logoPrompt.sid,
    QUICK_ACTIONS: quickActions.sid,
  };
}

createAllInteractiveTemplates()
  .then((res) => {
    console.log('\n✨ TEMPLATES REGISTERED IN TWILIO:', res);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Setup failed:', err);
    process.exit(1);
  });
