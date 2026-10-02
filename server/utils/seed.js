import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from '../models/MenuItem.js';
import Admin from '../models/Admin.js';
import { getBootstrapAdmin, warnIfDefaultAdmin } from './adminBootstrap.js';

dotenv.config();

const sampleMenuItems = [
  // BURGERS
  {
    name: 'Yumbite Signature Burger',
    description: 'Double beef patty, cheddar cheese, caramelized onions, lettuce, tomato, signature sauce on brioche bun',
    price: 320,
    category: 'Burgers',
    image: '/images/burger-signature.jpg',
    isPopular: true,
    ingredients: ['Beef Patty', 'Cheddar Cheese', 'Caramelized Onions', 'Lettuce', 'Tomato', 'Signature Sauce', 'Brioche Bun'],
    spicyLevel: 1
  },
  {
    name: 'Crispy Chicken Burger',
    description: 'Crispy fried chicken breast, spicy mayo, pickles, lettuce, tomato on sesame bun',
    price: 280,
    category: 'Burgers',
    image: '/images/burger-chicken.jpg',
    isPopular: true,
    ingredients: ['Fried Chicken Breast', 'Spicy Mayo', 'Pickles', 'Lettuce', 'Tomato', 'Sesame Bun'],
    spicyLevel: 2
  },
  {
    name: 'BBQ Bacon Burger',
    description: 'Beef patty, smoked bacon, BBQ sauce, onion rings, cheddar, lettuce on brioche bun',
    price: 350,
    category: 'Burgers',
    image: '/images/burger-bbq.jpg',
    isPopular: false,
    ingredients: ['Beef Patty', 'Smoked Bacon', 'BBQ Sauce', 'Onion Rings', 'Cheddar Cheese', 'Lettuce', 'Brioche Bun'],
    spicyLevel: 1
  },
  {
    name: 'Spicy Jalapeño Burger',
    description: 'Beef patty, jalapeños, pepper jack cheese, chipotle mayo, lettuce, tomato on brioche bun',
    price: 300,
    category: 'Burgers',
    image: '/images/burger-spicy.jpg',
    isPopular: false,
    ingredients: ['Beef Patty', 'Jalapeños', 'Pepper Jack Cheese', 'Chipotle Mayo', 'Lettuce', 'Tomato', 'Brioche Bun'],
    spicyLevel: 4
  },
  {
    name: 'Mushroom Swiss Burger',
    description: 'Beef patty, sautéed mushrooms, swiss cheese, garlic aioli, arugula on brioche bun',
    price: 330,
    category: 'Burgers',
    image: '/images/burger-mushroom.jpg',
    isPopular: false,
    ingredients: ['Beef Patty', 'Sautéed Mushrooms', 'Swiss Cheese', 'Garlic Aioli', 'Arugula', 'Brioche Bun'],
    spicyLevel: 0
  },

  // CHICKEN
  {
    name: 'Crispy Chicken Strips (4pcs)',
    description: 'Golden fried chicken strips served with honey mustard and fries',
    price: 250,
    category: 'Chicken',
    image: '/images/chicken-strips.jpg',
    isPopular: true,
    ingredients: ['Chicken Breast', 'Seasoned Flour', 'Honey Mustard Sauce', 'Fries'],
    spicyLevel: 1
  },
  {
    name: 'Hot Wings (6pcs)',
    description: 'Crispy wings tossed in signature hot sauce, served with ranch dip',
    price: 220,
    category: 'Chicken',
    image: '/images/hot-wings.jpg',
    isPopular: true,
    ingredients: ['Chicken Wings', 'Hot Sauce', 'Ranch Dip', 'Celery Sticks'],
    spicyLevel: 3
  },
  {
    name: 'Grilled Chicken Sandwich',
    description: 'Grilled chicken breast, avocado, bacon, lettuce, tomato, garlic aioli on ciabatta',
    price: 290,
    category: 'Chicken',
    image: '/images/grilled-chicken-sandwich.jpg',
    isPopular: false,
    ingredients: ['Grilled Chicken Breast', 'Avocado', 'Bacon', 'Lettuce', 'Tomato', 'Garlic Aioli', 'Ciabatta'],
    spicyLevel: 0
  },
  {
    name: 'Korean Fried Chicken',
    description: 'Double fried chicken with gochujang glaze, sesame seeds, pickled radish',
    price: 310,
    category: 'Chicken',
    image: '/images/korean-fried-chicken.jpg',
    isPopular: true,
    ingredients: ['Chicken', 'Gochujang Glaze', 'Sesame Seeds', 'Pickled Radish'],
    spicyLevel: 3
  },

  // WRAPS
  {
    name: 'Chicken Caesar Wrap',
    description: 'Grilled chicken, romaine, parmesan, caesar dressing in spinach tortilla',
    price: 220,
    category: 'Wraps',
    image: '/images/chicken-caesar-wrap.jpg',
    isPopular: true,
    ingredients: ['Grilled Chicken', 'Romaine Lettuce', 'Parmesan', 'Caesar Dressing', 'Spinach Tortilla'],
    spicyLevel: 0
  },
  {
    name: 'Spicy Buffalo Wrap',
    description: 'Crispy chicken, buffalo sauce, blue cheese, lettuce, tomato in flour tortilla',
    price: 230,
    category: 'Wraps',
    image: '/images/buffalo-wrap.jpg',
    isPopular: false,
    ingredients: ['Crispy Chicken', 'Buffalo Sauce', 'Blue Cheese', 'Lettuce', 'Tomato', 'Flour Tortilla'],
    spicyLevel: 3
  },
  {
    name: 'Veggie Hummus Wrap',
    description: 'Roasted vegetables, hummus, feta, arugula, balsamic glaze in whole wheat tortilla',
    price: 200,
    category: 'Wraps',
    image: '/images/veggie-wrap.jpg',
    isPopular: false,
    ingredients: ['Roasted Vegetables', 'Hummus', 'Feta Cheese', 'Arugula', 'Balsamic Glaze', 'Whole Wheat Tortilla'],
    spicyLevel: 0
  },

  // FRIES
  {
    name: 'Classic Fries',
    description: 'Crispy golden fries with sea salt',
    price: 120,
    category: 'Fries',
    image: '/images/classic-fries.jpg',
    isPopular: true,
    ingredients: ['Potatoes', 'Sea Salt', 'Canola Oil'],
    spicyLevel: 0
  },
  {
    name: 'Loaded Cheese Fries',
    description: 'Fries topped with cheese sauce, bacon bits, jalapeños, sour cream, green onions',
    price: 180,
    category: 'Fries',
    image: '/images/loaded-fries.jpg',
    isPopular: true,
    ingredients: ['Fries', 'Cheese Sauce', 'Bacon Bits', 'Jalapeños', 'Sour Cream', 'Green Onions'],
    spicyLevel: 2
  },
  {
    name: 'Truffle Parmesan Fries',
    description: 'Fries tossed in truffle oil, parmesan, parsley, garlic aioli',
    price: 190,
    category: 'Fries',
    image: '/images/truffle-fries.jpg',
    isPopular: false,
    ingredients: ['Fries', 'Truffle Oil', 'Parmesan', 'Parsley', 'Garlic Aioli'],
    spicyLevel: 0
  },
  {
    name: 'Sweet Potato Fries',
    description: 'Crispy sweet potato fries with cinnamon sugar and marshmallow dip',
    price: 150,
    category: 'Fries',
    image: '/images/sweet-potato-fries.jpg',
    isPopular: false,
    ingredients: ['Sweet Potatoes', 'Cinnamon Sugar', 'Marshmallow Dip'],
    spicyLevel: 0
  },

  // DRINKS
  {
    name: 'Classic Coca-Cola',
    description: 'Ice cold Coca-Cola (330ml)',
    price: 50,
    category: 'Drinks',
    image: '/images/coke.jpg',
    isPopular: true,
    ingredients: ['Coca-Cola'],
    spicyLevel: 0
  },
  {
    name: 'Chocolate Milkshake',
    description: 'Rich chocolate ice cream shake topped with whipped cream',
    price: 120,
    category: 'Drinks',
    image: '/images/chocolate-shake.jpg',
    isPopular: true,
    ingredients: ['Chocolate Ice Cream', 'Milk', 'Whipped Cream', 'Chocolate Syrup'],
    spicyLevel: 0
  },
  {
    name: 'Strawberry Milkshake',
    description: 'Fresh strawberry ice cream shake with whipped cream',
    price: 120,
    category: 'Drinks',
    image: '/images/strawberry-shake.jpg',
    isPopular: false,
    ingredients: ['Strawberry Ice Cream', 'Milk', 'Whipped Cream', 'Fresh Strawberries'],
    spicyLevel: 0
  },
  {
    name: 'Iced Coffee',
    description: 'Cold brew coffee with milk and vanilla syrup',
    price: 90,
    category: 'Drinks',
    image: '/images/iced-coffee.jpg',
    isPopular: false,
    ingredients: ['Cold Brew Coffee', 'Milk', 'Vanilla Syrup', 'Ice'],
    spicyLevel: 0
  },
  {
    name: 'Fresh Lemonade',
    description: 'Freshly squeezed lemonade with mint',
    price: 80,
    category: 'Drinks',
    image: '/images/lemonade.jpg',
    isPopular: false,
    ingredients: ['Fresh Lemons', 'Mint', 'Sugar', 'Water'],
    spicyLevel: 0
  },

  // COMBOS
  {
    name: 'Yumbite Feast Combo',
    description: 'Signature Burger + Chicken Strips (2pcs) + Large Fries + 2 Drinks',
    price: 650,
    category: 'Combos',
    image: '/images/feast-combo.jpg',
    isPopular: true,
    ingredients: ['Signature Burger', 'Chicken Strips (2pcs)', 'Large Fries', '2 Drinks'],
    spicyLevel: 1
  },
  {
    name: 'Couple Combo',
    description: '2 Chicken Burgers + Medium Fries + 2 Drinks',
    price: 520,
    category: 'Combos',
    image: '/images/couple-combo.jpg',
    isPopular: true,
    ingredients: ['2 Chicken Burgers', 'Medium Fries', '2 Drinks'],
    spicyLevel: 2
  },
  {
    name: 'Family Bucket',
    description: '4 Hot Wings + 2 Burgers + Large Fries + 4 Drinks + Onion Rings',
    price: 950,
    category: 'Combos',
    image: '/images/family-bucket.jpg',
    isPopular: false,
    ingredients: ['4 Hot Wings', '2 Burgers', 'Large Fries', '4 Drinks', 'Onion Rings'],
    spicyLevel: 2
  },
  {
    name: 'Student Special',
    description: 'Any Burger + Fries + Drink',
    price: 380,
    category: 'Combos',
    image: '/images/student-combo.jpg',
    isPopular: true,
    ingredients: ['Any Burger', 'Fries', 'Drink'],
    spicyLevel: 1
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');

    // Insert sample data
    const createdItems = await MenuItem.insertMany(sampleMenuItems);
    console.log(`Seeded ${createdItems.length} menu items`);

    // Create default admin if none exists
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

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();