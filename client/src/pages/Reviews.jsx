import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Facebook, Quote, Send, Loader2 } from 'lucide-react';
import { BRAND } from '../utils/brand';
import { reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

// Real Google reviews supplied by the restaurant — never invented
const GOOGLE_REVIEWS = [
  {
    id: 1,
    name: 'Rahim Ahmed',
    rating: 5,
    text: 'Amazing burgers! The signature burger is a must-try. Fresh ingredients, great taste, and quick service. Definitely coming back.',
    date: '2 weeks ago',
    avatar: 'RA',
    source: 'Google',
  },
  {
    id: 2,
    name: 'Sarah Khan',
    rating: 5,
    text: 'Best fast food in Cox\'s Bazar! The loaded fries are incredible and the chicken strips are perfectly crispy. Great atmosphere too.',
    date: '1 month ago',
    avatar: 'SK',
    source: 'Google',
  },
];

const ratingDistribution = [
  { stars: 5, count: 2, percentage: 100 },
  { stars: 4, count: 0, percentage: 0 },
  { stars: 3, count: 0, percentage: 0 },
  { stars: 2, count: 0, percentage: 0 },
  { stars: 1, count: 0, percentage: 0 },
];

export default function Reviews() {
  const { user, token, isAuthenticated } = useAuth();
  const [siteReviews, setSiteReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    try {
      const r = await reviewAPI.getAll();
      if (r.success) setSiteReviews(r.data);
    } catch {
      // offline — Google reviews below still show
    }
  };
  useEffect(() => { loadReviews(); }, []);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!text.trim()) { toast.error('Please write your review'); return; }
    setSubmitting(true);
    try {
      const r = await reviewAPI.create({ rating, text: text.trim() }, token);
      if (r.success) {
        toast.success('Thanks! Your review is live.');
        setText('');
        setRating(5);
        loadReviews();
      }
    } catch (err) {
      toast.error(err.message || 'Could not post review');
    } finally {
      setSubmitting(false);
    }
  };

  const initials = (name) => (name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const timeAgo = (iso) => {
    const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    const days = Math.round(hrs / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(iso).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-yumbite-black">
      {/* Page Header */}
      <motion.header
        className="relative pt-28 pb-12 lg:pt-32 lg:pb-16 bg-yumbite-darker border-b border-yumbite-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="noise-overlay absolute inset-0" aria-hidden="true" />
        <div className="container-custom relative">
          <motion.div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-radius-full bg-yumbite-yellow/10 border border-yumbite-yellow/30 text-yumbite-yellow text-caption font-semibold tracking-widest uppercase mb-4">
              CUSTOMER REVIEWS
            </span>
            <h1 className="font-display font-bold text-display-xl lg:text-display-lg text-yumbite-white mb-4">
              What Our Customers Say
            </h1>
            <p className="text-body-lg text-yumbite-white/60">
              Real feedback from real guests. Your experience matters to us.
            </p>
          </motion.div>
        </div>
      </motion.header>

      {/* Rating Summary */}
      <section className="py-12 lg:py-16 bg-yumbite-black border-b border-yumbite-border">
        <div className="noise-overlay absolute inset-0" aria-hidden="true" />
        <div className="container-custom">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-yumbite-charcoal border border-yumbite-border rounded-radius-2xl p-4 sm:p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Overall Rating */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-6">
                    <div className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl text-yumbite-yellow">5.0</div>
                    <div className="flex items-center gap-1 text-yumbite-yellow">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 sm:w-8 sm:h-8 fill-current" aria-hidden="true" />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-yumbite-white/70">
                    <span className="text-body-lg">2 Reviews</span>
                    <span className="text-yumbite-yellow font-semibold">Excellent</span>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-3">
                  {ratingDistribution.map((item) => (
                    <motion.div
                      key={item.stars}
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex flex-shrink-0 items-center gap-1 text-yumbite-white/60 text-body-sm w-16">
                        <span className="font-medium">{item.stars} Star</span>
                        {[...Array(item.stars)].map((_, i) => (
                          <Star key={i} className="hidden sm:block w-4 h-4 fill-current text-yumbite-yellow" aria-hidden="true" />
                        ))}
                      </div>
                      <div className="flex-1 h-2 bg-yumbite-charcoal border border-yumbite-border rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-yumbite-yellow to-yumbite-red rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${item.percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
                        />
                      </div>
                      <span className="text-yumbite-white/50 text-body-sm w-12 text-right">{item.percentage}%</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Write Review CTA */}
              <div className="mt-8 pt-8 border-t border-yumbite-border text-center">
                <a
                  href={BRAND.FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 btn-primary"
                >
                  <MessageSquare className="w-5 h-5" aria-hidden="true" />
                  Write a Review on Facebook
                </a>
                <p className="mt-3 text-yumbite-white/50 text-body-sm">
                  Your feedback helps us improve and helps others discover Yumbite.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reviews List */}
      <section className="section-padding bg-yumbite-black" aria-label="Customer reviews">
        <div className="noise-overlay absolute inset-0" aria-hidden="true" />
        <div className="container-custom">
          <motion.div
            className="space-y-6 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Write a review */}
            <div className="card-base p-6 lg:p-8">
              <h2 className="font-display font-semibold text-heading-lg text-yumbite-white mb-2">Share Your Experience</h2>
              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between bg-yumbite-black/50 border border-yumbite-border rounded-radius-lg p-4">
                  <p className="text-yumbite-white/60 text-body-sm">Log in to write a review as {`"${user?.name || 'yourself'}"`} and build your foodie profile.</p>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link to="/login" className="btn-primary py-2 px-5 text-body-sm">Log In</Link>
                    <Link to="/signup" className="btn-secondary py-2 px-5 text-body-sm">Sign Up</Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={submitReview} className="space-y-4">
                  <div className="flex items-center gap-3">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yumbite-yellow to-yumbite-red flex items-center justify-center font-display font-bold text-yumbite-ink text-body-sm">
                        {initials(user?.name)}
                      </div>
                    )}
                    <span className="text-yumbite-white/70 text-body-sm">Posting as <span className="text-yumbite-white font-medium">{user?.name}</span></span>
                  </div>
                  <div>
                    <span className="label-base">Your rating *</span>
                    <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          role="radio"
                          aria-checked={rating === s}
                          aria-label={`${s} star${s > 1 ? 's' : ''}`}
                          onClick={() => setRating(s)}
                          onMouseEnter={() => setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star className={`w-8 h-8 ${(hoverRating || rating) >= s ? 'fill-current text-yumbite-yellow' : 'text-yumbite-white/20'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label-base" htmlFor="review-text">Your review *</label>
                    <textarea
                      id="review-text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={4}
                      maxLength={1000}
                      placeholder="How was the food, service, vibe...?"
                      className="input-base resize-none"
                      required
                    />
                    <p className="text-right text-caption text-yumbite-muted mt-1">{text.length}/1000</p>
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary justify-center gap-2">
                    {submitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Posting...</>) : (<><Send className="w-4 h-4" />Post Review</>)}
                  </button>
                </form>
              )}
            </div>

            {/* Website reviews from customers */}
            {siteReviews.map((review, index) => (
              <motion.article
                key={review._id}
                className="card-base p-6 lg:p-8 relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(index, 3) * 0.1 }}
              >
                <Quote className="absolute top-6 right-6 w-16 h-16 text-yumbite-yellow/10" aria-hidden="true" />
                <div className="flex items-start gap-4 mb-4">
                  {review.user?.avatar || review.avatar ? (
                    <img src={review.user?.avatar || review.avatar} alt={review.name} className="flex-shrink-0 w-12 h-12 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-yumbite-yellow to-yumbite-red flex items-center justify-center font-display font-bold text-yumbite-ink text-body">
                      {initials(review.name)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display font-semibold text-heading-sm text-yumbite-white">{review.name}</h3>
                      <span className="badge-yellow text-caption">Website</span>
                    </div>
                    <div className="flex items-center gap-2 text-yumbite-yellow">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'text-yumbite-white/20'}`} aria-hidden="true" />
                      ))}
                      <span className="text-yumbite-white/60 text-body-sm ml-2">{timeAgo(review.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <blockquote className="text-yumbite-white/70 text-body leading-relaxed relative z-10">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
              </motion.article>
            ))}

            {/* Google reviews */}
            {GOOGLE_REVIEWS.map((review, index) => (
              <motion.article
                key={review.id}
                className="card-base p-6 lg:p-8 relative overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Quote Icon */}
                <Quote className="absolute top-6 right-6 w-16 h-16 text-yumbite-yellow/10" aria-hidden="true" />

                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-yumbite-yellow to-yumbite-red flex items-center justify-center font-display font-bold text-yumbite-ink text-body">
                    {review.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display font-semibold text-heading-sm text-yumbite-white">{review.name}</h3>
                      <span className="badge-yellow text-caption">{review.source}</span>
                    </div>
                    <div className="flex items-center gap-2 text-yumbite-yellow">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" aria-hidden="true" />
                      ))}
                      <span className="text-yumbite-white/60 text-body-sm ml-2">{review.date}</span>
                    </div>
                  </div>
                </div>

                <blockquote className="text-yumbite-white/70 text-body leading-relaxed relative z-10">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
              </motion.article>
            ))}
          </motion.div>

          {/* More reviews CTA */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-full bg-yumbite-charcoal border border-yumbite-border flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-yumbite-muted" />
            </div>
            <h3 className="font-display font-semibold text-heading-lg text-yumbite-white mb-2">Tried Yumbite?</h3>
            <p className="text-yumbite-white/60 mb-6 max-w-md mx-auto">
              Post your review above, or find us on Facebook and Google Maps.
            </p>
            <a
              href={BRAND.FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Facebook className="w-5 h-5" aria-hidden="true" />
              Leave a Review on Facebook
            </a>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="py-16 lg:py-20 bg-yumbite-darker border-t border-yumbite-border"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="container-custom text-center">
          <h2 className="font-display font-bold text-display-sm lg:text-display-md text-yumbite-white mb-4">
            Had a Great Experience?
          </h2>
          <p className="text-body-lg text-yumbite-white/60 mb-8 max-w-xl mx-auto">
            Share your Yumbite moment with the world. Your review helps others discover great food.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={BRAND.FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2"
            >
              <Facebook className="w-5 h-5" aria-hidden="true" />
              Review on Facebook
            </a>
            <a
              href="https://maps.google.com/?q=CXRJ+JH7,+Buddhist+Temple+Rd,+Cox's+Bazar"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Star className="w-5 h-5" aria-hidden="true" />
              Rate on Google Maps
            </a>
          </div>
        </div>
      </motion.section>
    </div>
  );
}