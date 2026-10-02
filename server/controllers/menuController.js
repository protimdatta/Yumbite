import MenuItem from '../models/MenuItem.js';

// Get all menu items with optional filtering
export const getMenuItems = async (req, res) => {
  try {
    const { category, available, search, popular, limit, page } = req.query;
    
    const filter = {};
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (available !== undefined) {
      filter.isAvailable = available === 'true';
    }
    
    if (popular === 'true') {
      filter.isPopular = true;
    }
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;
    
    const items = await MenuItem.find(filter)
      .sort({ isPopular: -1, category: 1, name: 1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await MenuItem.countDocuments(filter);
    
    res.json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single menu item
export const getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Get menu item error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid menu item ID' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create menu item (Admin only)
export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, discount, category, image, isAvailable, isPopular, ingredients, spicyLevel } = req.body;
    
    const item = await MenuItem.create({
      name,
      description,
      price,
      discount: discount || 0,
      category,
      image: image || '',
      isAvailable: isAvailable !== false,
      isPopular: isPopular === true,
      ingredients: ingredients || [],
      spicyLevel: spicyLevel || 0
    });
    
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error('Create menu item error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update menu item (Admin only)
export const updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, discount, category, image, isAvailable, isPopular, ingredients, spicyLevel } = req.body;
    
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { name, description, price, discount, category, image, isAvailable, isPopular, ingredients, spicyLevel },
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Update menu item error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid menu item ID' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete menu item (Admin only)
export const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    
    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid menu item ID' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle availability (Admin only)
export const toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    
    item.isAvailable = !item.isAvailable;
    await item.save();
    
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Toggle availability error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid menu item ID' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get categories
export const getCategories = async (req, res) => {
  try {
    const categories = await MenuItem.distinct('category', { isAvailable: true });
    const orderedCategories = ['All', 'Burgers', 'Chicken', 'Wraps', 'Fries', 'Drinks', 'Combos'];
    const sortedCategories = orderedCategories.filter(c => categories.includes(c));
    res.json({ success: true, data: sortedCategories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};