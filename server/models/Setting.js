import mongoose from 'mongoose';

// Key-value site settings editable from Admin → Settings.
// Only non-secret operational values live here (never API keys).
const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  value: { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);

// Helper: get a single setting value by key (used by orderController)
export const getSetting = async (key) => {
  const doc = await Setting.findOne({ key }).lean();
  if (!doc || doc.value === undefined || doc.value === null || doc.value === '') {
    return SETTING_DEFAULTS[key];
  }
  return doc.value;
};

// Get all settings (merged with defaults)
export async function getAllSettings() {
  const docs = await Setting.find().lean();
  const out = { ...SETTING_DEFAULTS };
  for (const d of docs) {
    if (d.value !== undefined && d.value !== null && d.value !== '') out[d.key] = d.value;
  }
  return out;
}

// Set a single setting value
export async function setSetting(key, value) {
  if (!(key in SETTING_DEFAULTS)) {
    const err = new Error(`Unknown setting: ${key}`);
    err.code = 'BAD_SETTING';
    throw err;
  }
  return Setting.findOneAndUpdate({ key }, { $set: { value } }, { new: true, upsert: true });
};

Setting.getSetting = getSetting;
Setting.getAllSettings = getAllSettings;
Setting.setSetting = setSetting;

// Default settings — these become editable via Admin → Settings
export const SETTING_DEFAULTS = {
  // General / Restaurant Information
  restaurantName: 'Yumbite',
  tagline: 'Bite Into Happiness',
  phone: '01313-886160',
  address: "CXRJ+JH7, Buddhist Temple Rd, Cox's Bazar",
  hours: 'Open Daily · 11 AM - 11 PM',
  currency: 'BDT',

  // Hero Section
  heroSmallHeading: 'WELCOME TO YUMBITE',
  heroMainHeadingLine1: 'Fresh Food',
  heroMainHeadingLine2: 'Great Vibes',
  heroDescription: 'Burgers, fries, shawarma and more, made with love and served with happiness.',
  heroDecorativeText: 'Taste the Happiness',
  heroPrimaryButtonText: 'VIEW MENU',
  heroPrimaryButtonLink: '/menu',
  heroSecondaryButtonText: 'FIND US',
  heroSecondaryButtonLink: '/contact',
  heroBackgroundImage: '/images/exterior.jpg',

  // Restaurant Information Bar (Quick Info Bar)
  // These are calculated from reviews in DB, but admin can override phone/address/hours

  // Popular Menu
  popularSectionTitle: 'Popular Items',
  popularSectionDescription: 'Fresh ingredients. Great taste. Always.',
  viewFullMenuButtonText: 'View Full Menu',
  viewFullMenuButtonLink: '/menu',

  // About YumBite
  aboutSectionLabel: 'ABOUT',
  aboutSectionTitle: 'More Than Just Fast Food',
  aboutDescription: 'At Yumbite, we serve delicious fast food with fresh ingredients and a cozy atmosphere. Our goal is to make every meal a happy moment for you.',
  aboutFeature1Title: 'Fresh Ingredients',
  aboutFeature1Description: 'Sourced daily from local markets. Every bite bursts with natural flavor and quality.',
  aboutFeature2Title: 'Skilled Chefs',
  aboutFeature2Description: 'Our culinary team brings years of expertise and passion to every dish they create.',
  aboutFeature3Title: 'Hygienic & Safe',
  aboutFeature3Description: 'Strict food safety standards. Clean kitchen, safe preparation, peace of mind.',
  aboutFeature4Title: 'Customer Satisfaction',
  aboutFeature4Description: 'Your happiness is our priority. We listen, improve, and serve with a smile.',
  aboutCTAText: 'Explore Our Menu',
  aboutCTALink: '/menu',

  // Gallery
  // Gallery images managed via Admin → Gallery; Home Page reads from galleryAPI

  // Reviews
  // Review rating/count calculated from DB; admin manages review approval

  // Footer
  footerTagline: 'Good Food • Good Mood',
  footerCopyright: '{year} Yumbite. All rights reserved.',

  // Theme (optional — user theme toggle already exists)
  // themePreference: 'dark'  — NOT stored here, use localStorage/cookie
};

export default Setting;