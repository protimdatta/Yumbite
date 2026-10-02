import GalleryImage from '../models/GalleryImage.js';

// Public: visible gallery images
export const getGalleryImages = async (req, res) => {
  try {
    const filter = { isVisible: true };
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }
    const images = await GalleryImage.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: images });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: all images including hidden
export const getAllGalleryImages = async (req, res) => {
  try {
    const images = await GalleryImage.find().sort({ createdAt: -1 }).limit(200);
    res.json({ success: true, data: images });
  } catch (error) {
    console.error('Get all gallery error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: add image
export const createGalleryImage = async (req, res) => {
  try {
    const { imageUrl, caption, category, isVisible } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'Image URL is required' });
    }
    const image = await GalleryImage.create({
      imageUrl,
      caption: caption || '',
      category: category || 'Other',
      isVisible: isVisible !== false
    });
    res.status(201).json({ success: true, data: image });
  } catch (error) {
    console.error('Create gallery error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: update image
export const updateGalleryImage = async (req, res) => {
  try {
    const { imageUrl, caption, category, isVisible } = req.body;
    const image = await GalleryImage.findByIdAndUpdate(
      req.params.id,
      { imageUrl, caption, category, isVisible },
      { new: true, runValidators: true }
    );
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    res.json({ success: true, data: image });
  } catch (error) {
    console.error('Update gallery error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid image ID' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: delete image
export const deleteGalleryImage = async (req, res) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete gallery error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid image ID' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};