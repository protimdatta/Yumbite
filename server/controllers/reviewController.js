import Review from '../models/Review.js';

// Public: approved website reviews (newest first)
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true, source: 'website' })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name avatar');
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Logged-in customer: submit a review
export const createReview = async (req, res) => {
  try {
    const { rating, text } = req.body;
    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Please give a rating between 1 and 5' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Please write your review' });
    }

    const review = await Review.create({
      user: req.user._id,
      name: req.user.name,
      rating: numRating,
      text: text.trim(),
      source: 'website',
      isApproved: true
    });

    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error('Create review error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(200).populate('user', 'name email avatar');
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: approve / hide
export const toggleReviewApproval = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    review.isApproved = !review.isApproved;
    await review.save();
    res.json({ success: true, data: review });
  } catch (error) {
    console.error('Toggle review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: delete review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid review ID' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};