import MenuItem from '../models/MenuItem.js';
import Admin from '../models/Admin.js';
import GalleryImage from '../models/GalleryImage.js';
import { getBootstrapAdmin, warnIfDefaultAdmin } from './adminBootstrap.js';

// Sample menu shown when the database starts empty (in-memory mode).
// Clearly-marked SAMPLE data — replace via admin dashboard with the real menu.
const SAMPLE_MENU = [
  { name: 'Yumbite Signature Burger', description: 'Double beef patty, cheddar, caramelized onions, signature sauce on brioche', price: 320, category: 'Burgers', image: '', isPopular: true, ingredients: ['Beef Patty', 'Cheddar', 'Signature Sauce', 'Brioche Bun'], spicyLevel: 1 },
  { name: 'Crispy Chicken Burger', description: 'Crispy fried chicken, spicy mayo, pickles, lettuce on sesame bun', price: 280, category: 'Burgers', image: '', isPopular: true, ingredients: ['Fried Chicken', 'Spicy Mayo', 'Sesame Bun'], spicyLevel: 2 },
  { name: 'BBQ Bacon Burger', description: 'Beef patty, smoked bacon, BBQ sauce, onion rings, cheddar', price: 350, category: 'Burgers', image: '', isPopular: false, ingredients: ['Beef Patty', 'Bacon', 'BBQ Sauce'], spicyLevel: 1 },
  { name: 'Crispy Chicken Strips (4pcs)', description: 'Golden fried strips with honey mustard and fries', price: 250, category: 'Chicken', image: '', isPopular: true, ingredients: ['Chicken Breast', 'Honey Mustard'], spicyLevel: 1 },
  { name: 'Hot Wings (6pcs)', description: 'Crispy wings in signature hot sauce with ranch dip', price: 220, category: 'Chicken', image: '', isPopular: false, discount: 10, ingredients: ['Chicken Wings', 'Hot Sauce', 'Ranch'], spicyLevel: 3 },
  { name: 'Korean Fried Chicken', description: 'Double fried chicken, gochujang glaze, sesame, pickled radish', price: 310, category: 'Chicken', image: '', isPopular: true, ingredients: ['Chicken', 'Gochujang'], spicyLevel: 3 },
  { name: 'Chicken Caesar Wrap', description: 'Grilled chicken, romaine, parmesan, caesar dressing', price: 220, category: 'Wraps', image: '', isPopular: false, ingredients: ['Grilled Chicken', 'Caesar Dressing'], spicyLevel: 0 },
  { name: 'Spicy Buffalo Wrap', description: 'Crispy chicken, buffalo sauce, lettuce, tomato', price: 230, category: 'Wraps', image: '', isPopular: false, ingredients: ['Crispy Chicken', 'Buffalo Sauce'], spicyLevel: 3 },
  { name: 'Classic Fries', description: 'Crispy golden fries with sea salt', price: 120, category: 'Fries', image: '', isPopular: true, ingredients: ['Potatoes', 'Sea Salt'], spicyLevel: 0 },
  { name: 'Loaded Cheese Fries', description: 'Cheese sauce, bacon bits, jalapeños, sour cream', price: 180, category: 'Fries', image: '', isPopular: true, ingredients: ['Fries', 'Cheese Sauce', 'Bacon'], spicyLevel: 2 },
  { name: 'Chocolate Milkshake', description: 'Rich chocolate shake with whipped cream', price: 120, category: 'Drinks', image: '', isPopular: true, ingredients: ['Chocolate Ice Cream', 'Milk'], spicyLevel: 0 },
  { name: 'Fresh Lemonade', description: 'Freshly squeezed lemonade with mint', price: 80, category: 'Drinks', image: '', isPopular: false, ingredients: ['Lemon', 'Mint'], spicyLevel: 0 },
  { name: 'Yumbite Feast Combo', description: 'Signature burger + strips + large fries + 2 drinks', price: 650, category: 'Combos', image: '', isPopular: true, discount: 15, ingredients: ['Burger', 'Strips', 'Fries', 'Drinks'], spicyLevel: 1 },
  { name: 'Couple Combo', description: '2 chicken burgers + medium fries + 2 drinks', price: 520, category: 'Combos', image: '', isPopular: true, discount: 20, ingredients: ['Burgers', 'Fries', 'Drinks'], spicyLevel: 2 },
];

export async function ensureSeeded() {
  try {
    const menuCount = await MenuItem.countDocuments();
    if (menuCount === 0) {
      await MenuItem.insertMany(SAMPLE_MENU);
      console.log(`Seeded ${SAMPLE_MENU.length} sample menu items`);
    }

    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const { email, password, usingDefaults } = getBootstrapAdmin();
      await Admin.create({
        username: 'admin',
        email,
        password,
        role: 'superadmin'
      });
      if (usingDefaults) warnIfDefaultAdmin();
      else console.log(`Created admin account: ${email}`);
    }

    const galleryCount = await GalleryImage.countDocuments();
    if (galleryCount === 0) {
      await GalleryImage.insertMany([
        { imageUrl: '/images/exterior.jpg', caption: 'Yumbite restaurant exterior', category: 'Exterior' },
        { imageUrl: '/images/interior.png', caption: 'Yumbite restaurant interior', category: 'Interior' },
        { imageUrl: '/images/exterior.jpg', caption: 'Find us on Buddhist Temple Rd', category: 'Exterior' },
        { imageUrl: '/images/interior.png', caption: 'Cozy dining space', category: 'Interior' },
      ]);
      console.log('Seeded 4 gallery images');
    }
  } catch (error) {
    console.error('Auto-seed failed:', error.message);
  }
}