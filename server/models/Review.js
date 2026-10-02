import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  text: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  source: {
    type: String,
    enum: ['website', 'google', 'facebook'],
    default: 'website'
  },
  isApproved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

reviewSchema.index({ isApproved: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;