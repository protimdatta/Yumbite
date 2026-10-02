import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  caption: {
    type: String,
    trim: true,
    maxlength: [200, 'Caption cannot exceed 200 characters'],
    default: ''
  },
  category: {
    type: String,
    trim: true,
    enum: ['Exterior', 'Interior', 'Food', 'Branding', 'Other'],
    default: 'Other'
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const GalleryImage = mongoose.model('GalleryImage', galleryImageSchema);

export default GalleryImage;