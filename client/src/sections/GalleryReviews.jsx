import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Expand, Facebook, MessageSquare } from 'lucide-react';
import { BRAND } from '../utils/brand';
import { galleryAPI, reviewAPI } from '../services/api';

// Local fallback — used only when the API is unreachable
const FALLBACK_IMAGES = [
  { src: '/images/exterior.jpg', alt: 'Yumbite restaurant exterior' },
  { src: '/images/interior.png', alt: 'Yumbite restaurant interior' },
  { src: '/images/exterior.jpg', alt: 'Yumbite food display' },
  { src: '/images/interior.png', alt: 'Yumbite dining area' },
  { src: '/images/exterior.jpg', alt: 'Yumbite outdoor seating' },
  { src: '/images/interior.png', alt: 'Yumbite counter area' },
];

// Real reviews supplied by the restaurant — never invented
const STATIC_REVIEWS = [
  {
    id: 'google-1',
    name: 'Rahim Ahmed',
    rating: 5,
    text: 'Amazing burgers! The signature burger is a must-try. Fresh ingredients, great taste, and quick service. Definitely coming back.',
    date: '2 weeks ago',
    avatar: 'RA',
    photo: '',
  },
  {
    id: 'google-2',
    name: 'Sarah Khan',
    rating: 5,
    text: 'Best fast food in Cox\'s Bazar! The loaded fries are incredible and the chicken strips are perfectly crispy. Great atmosphere too.',
    date: '1 month ago',
    avatar: 'SK',
    photo: '',
  },
];

const initialsOf = (name) => (name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

export default function GalleryReviews() {
  const useVerticalEntrance = window.innerWidth < 1440;
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const galleryRef = useRef(null);
  const reviewRef = useRef(null);
  const [galleryImages, setGalleryImages] = useState(FALLBACK_IMAGES);
  const [siteReviews, setSiteReviews] = useState([]);

  // Live customer reviews first, then the supplied Google reviews
  const displayReviews = [
    ...siteReviews.map((r) => ({
      id: r._id,
      name: r.name,
      rating: r.rating,
      text: r.text,
      date: 'Website review',
      avatar: initialsOf(r.name),
      photo: r.user?.avatar || '',
    })),
    ...STATIC_REVIEWS,
  ];
  const averageRating = displayReviews.length
    ? (displayReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / displayReviews.length).toFixed(1)
    : '0.0';
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: displayReviews.filter((review) => Number(review.rating) === rating).length,
  }));

  useEffect(() => {
    let cancelled = false;
    const loadReviews = async () => {
      try {
        const r = await reviewAPI.getAll();
        if (!cancelled && r.success) setSiteReviews(r.data.slice(0, 6));
      } catch {
        // offline — static reviews still show
      }
    };
    loadReviews();
    return () => { cancelled = true; };
  }, []);

  // Live gallery from backend (admin-managed); falls back to local images
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await galleryAPI.getAll({ });
        if (cancelled) return;
        if (r.success && r.data.length > 0) {
          const mapped = r.data.slice(0, 8).map((g) => ({
            src: g.imageUrl,
            alt: g.caption || 'Yumbite photo',
          }));
          // Pad with fallback so the masonry grid (needs 4) never crashes
          setGalleryImages([...mapped, ...FALLBACK_IMAGES].slice(0, Math.max(mapped.length, 4)));
        }
      } catch {
        if (!cancelled) setGalleryImages(FALLBACK_IMAGES);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const scrollGallery = (direction) => {
    if (galleryRef.current) {
      const scrollAmount = 320;
      galleryRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const scrollReviews = (direction) => {
    if (reviewRef.current) {
      const scrollAmount = 380;
      reviewRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <section 
      id="gallery"
      className="relative border-b border-yumbite-border bg-yumbite-black py-7 sm:py-9 lg:py-10"
      aria-label="Gallery & Reviews"
    >
      <div className="noise-overlay absolute inset-0" aria-hidden="true" />
      
      <div className="container-custom relative">
        {/* Section Header */}
        <motion.div
          className="hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-radius-full bg-yumbite-yellow/10 border border-yumbite-yellow/30 text-yumbite-yellow text-caption font-semibold tracking-widest uppercase mb-3">
                EXPERIENCE
              </span>
              <h2 className="font-display font-bold text-display-md lg:text-display-lg text-yumbite-white">
                Gallery & Reviews
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-1 text-yumbite-yellow">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" aria-hidden="true" />
                ))}
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-3xl lg:text-4xl text-yumbite-yellow">5.0</div>
                <div className="text-yumbite-white/60 text-body-sm">2 Reviews</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid gap-3 lg:grid-cols-2">
          {/* LEFT: Gallery */}
          <motion.div
            className="relative min-w-0 rounded-radius-lg border border-yumbite-border bg-yumbite-card p-3 sm:p-4"
            initial={{ opacity: 0, x: useVerticalEntrance ? 0 : -40, y: useVerticalEntrance ? 20 : 0 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-caption font-semibold tracking-[0.16em] text-yumbite-yellow">OUR GALLERY</p>
                <h3 className="font-display text-heading-md font-semibold text-yumbite-white">Food &amp; Ambience</h3>
              </div>
              <Link to="/gallery" className="btn-ghost hidden px-2 py-1 text-caption sm:inline-flex">
                View More Photos
                <Expand className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <motion.div
                className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-radius-md bg-yumbite-charcoal group"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                onClick={() => openLightbox(0)}
              >
                <img
                  src={galleryImages[0].src}
                  alt={galleryImages[0].alt}
                  className="w-full h-full object-cover img-zoom"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-yumbite-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-yumbite-white font-medium">Restaurant Exterior</span>
                </div>
                <Expand className="absolute top-4 right-4 w-8 h-8 bg-yumbite-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-yumbite-white opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
              </motion.div>

              <motion.div
                className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-radius-md bg-yumbite-charcoal group"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                onClick={() => openLightbox(1)}
              >
                <img
                  src={galleryImages[1].src}
                  alt={galleryImages[1].alt}
                  className="w-full h-full object-cover img-zoom"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-yumbite-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-yumbite-white font-medium">Interior Dining</span>
                </div>
              </motion.div>

              <motion.div
                className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-radius-md bg-yumbite-charcoal group"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                onClick={() => openLightbox(2)}
              >
                <img src={galleryImages[2].src} alt={galleryImages[2].alt} className="h-full w-full object-cover img-zoom" loading="lazy" />
              </motion.div>

              <motion.div
                className="relative aspect-[4/3] min-w-0 overflow-hidden rounded-radius-md bg-yumbite-charcoal group"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                onClick={() => openLightbox(3)}
              >
                <img
                  src={galleryImages[3].src}
                  alt={galleryImages[3].alt}
                  className="w-full h-full object-cover img-zoom"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-yumbite-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-yumbite-white font-medium">Cozy Corner</span>
                </div>
              </motion.div>
            </div>

            {/* Horizontal Scroll Gallery for Mobile */}
            <div 
              ref={galleryRef}
              className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 lg:hidden"
              role="region"
              aria-label="Gallery images"
            >
              {galleryImages.slice(4).map((image, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 w-36 aspect-[4/3] overflow-hidden rounded-radius-md bg-yumbite-charcoal"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={() => openLightbox(index + 4)}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover img-zoom"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>

            {/* Gallery Nav Buttons (Mobile) */}
            <div className="flex justify-center gap-3 lg:hidden">
              <button
                onClick={() => scrollGallery('left')}
                className="w-10 h-10 rounded-full bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/70 hover:text-yumbite-yellow hover:border-yumbite-yellow/50 flex items-center justify-center"
                aria-label="Previous gallery image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollGallery('right')}
                className="w-10 h-10 rounded-full bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/70 hover:text-yumbite-yellow hover:border-yumbite-yellow/50 flex items-center justify-center"
                aria-label="Next gallery image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* RIGHT: Reviews */}
          <motion.div
            className="relative min-w-0 rounded-radius-lg border border-yumbite-border bg-yumbite-card p-3 sm:p-4"
            initial={{ opacity: 0, x: useVerticalEntrance ? 0 : 40, y: useVerticalEntrance ? 20 : 0 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-caption font-semibold tracking-[0.16em] text-yumbite-yellow">WHAT OUR CUSTOMERS SAY</p>
                <h3 className="font-display text-heading-md font-semibold text-yumbite-white">Reviews</h3>
              </div>
              <a
                href={BRAND.FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost hidden px-2 py-1 text-caption sm:inline-flex"
              >
                Facebook Reviews
                <Facebook className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>

            {/* Rating Summary */}
            <motion.div
              className="mb-3 rounded-radius-md border border-yumbite-border bg-yumbite-charcoal p-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="font-display text-4xl font-bold text-yumbite-yellow">{averageRating}</div>
                  <div>
                    <div className="flex items-center gap-1 text-yumbite-yellow">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(averageRating)) ? 'fill-current' : 'text-yumbite-white/20'}`} aria-hidden="true" />
                      ))}
                    </div>
                    <div className="mt-1 text-caption text-yumbite-white/60">{displayReviews.length} reviews</div>
                  </div>
                </div>
                <div className="grid min-w-0 flex-1 grid-cols-1 gap-1 sm:max-w-[170px]">
                  {ratingDistribution.map(({ rating, count }) => (
                    <div key={rating} className="flex items-center gap-1.5 text-caption text-yumbite-white/60">
                      <span className="w-4 text-right">{rating}★</span>
                      <span className="h-1 flex-1 overflow-hidden rounded-full bg-yumbite-white/10">
                        <span className="block h-full bg-yumbite-yellow-fill" style={{ width: `${displayReviews.length ? (count / displayReviews.length) * 100 : 0}%` }} />
                      </span>
                      <span className="w-3 text-right">{count}</span>
                    </div>
                  ))}
                </div>
                <Link to="/reviews" className="btn-secondary whitespace-nowrap px-3 py-2 text-caption">
                    Write a Review
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </motion.div>

            {/* Reviews Carousel */}
            <div 
              ref={reviewRef}
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              role="region"
              aria-label="Customer reviews"
            >
              {displayReviews.slice(0, 2).map((review, index) => (
                <motion.article
                  key={review.id}
                  className="min-w-0 card-base flex flex-col p-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {review.photo ? (
                      <img src={review.photo} alt={review.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" loading="lazy" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yumbite-yellow to-yumbite-red flex items-center justify-center font-display font-bold text-yumbite-ink text-body">
                        {review.avatar}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-yumbite-white">{review.name}</div>
                      <div className="flex items-center gap-1 text-yumbite-yellow">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < (review.rating || 5) ? 'fill-current' : 'text-yumbite-white/20'}`} aria-hidden="true" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-yumbite-white/70 text-body-sm leading-relaxed flex-1 mb-4">
                    "{review.text}"
                  </p>
                  
                  <div className="text-yumbite-muted text-caption">{review.date}</div>
                </motion.article>
              ))}
            </div>

            {/* Review Nav Buttons (Mobile) */}
            <div className="flex justify-center gap-3 lg:hidden">
              <button
                onClick={() => scrollReviews('left')}
                className="w-10 h-10 rounded-full bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/70 hover:text-yumbite-yellow hover:border-yumbite-yellow/50 flex items-center justify-center"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollReviews('right')}
                className="w-10 h-10 rounded-full bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/70 hover:text-yumbite-yellow hover:border-yumbite-yellow/50 flex items-center justify-center"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-yumbite-black/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label="Image gallery"
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/70 hover:text-yumbite-yellow hover:border-yumbite-yellow/50 flex items-center justify-center"
              aria-label="Close lightbox"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
              className="absolute left-6 z-10 w-14 h-14 rounded-full bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/70 hover:text-yumbite-yellow hover:border-yumbite-yellow/50 flex items-center justify-center hidden sm:flex"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <motion.div
              className="relative max-w-4xl max-h-[85vh] w-full mx-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={galleryImages[lightboxIndex].src}
                alt={galleryImages[lightboxIndex].alt}
                className="w-full h-auto rounded-radius-xl shadow-shadow-xl"
              />
              <div className="absolute bottom-4 left-4 right-4 text-center text-yumbite-white/70 text-body-sm">
                {lightboxIndex + 1} / {galleryImages.length}
              </div>
            </motion.div>

            <button
              onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
              className="absolute right-6 z-10 w-14 h-14 rounded-full bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/70 hover:text-yumbite-yellow hover:border-yumbite-yellow/50 flex items-center justify-center hidden sm:flex"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}