import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, Search, Grid, Layout } from 'lucide-react';
import { galleryAPI } from '../services/api';

// Local fallback — used only when the API is unreachable or gallery is empty
const FALLBACK_IMAGES = [
  { src: '/images/exterior.jpg', alt: 'Yumbite restaurant exterior', category: 'Exterior' },
  { src: '/images/interior.png', alt: 'Yumbite restaurant interior', category: 'Interior' },
  { src: '/images/exterior.jpg', alt: 'Yumbite food display', category: 'Food' },
  { src: '/images/interior.png', alt: 'Yumbite dining area', category: 'Interior' },
  { src: '/images/exterior.jpg', alt: 'Yumbite outdoor seating', category: 'Exterior' },
  { src: '/images/interior.png', alt: 'Yumbite counter area', category: 'Interior' },
  { src: '/images/exterior.jpg', alt: 'Yumbite entrance', category: 'Exterior' },
  { src: '/images/interior.png', alt: 'Yumbite kitchen view', category: 'Interior' },
  { src: '/images/exterior.jpg', alt: 'Yumbite signage', category: 'Branding' },
  { src: '/images/interior.png', alt: 'Yumbite seating detail', category: 'Interior' },
  { src: '/images/exterior.jpg', alt: 'Yumbite evening ambiance', category: 'Exterior' },
  { src: '/images/interior.png', alt: 'Yumbite interior lighting', category: 'Interior' },
];

const categories = ['All', 'Exterior', 'Interior', 'Food', 'Branding', 'Other'];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState('masonry'); // 'masonry' or 'grid'
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [galleryImages, setGalleryImages] = useState(FALLBACK_IMAGES);

  // Load live gallery from backend (admin-managed); fall back to local images
  useEffect(() => {
    const load = async () => {
      try {
        const r = await galleryAPI.getAll(activeCategory === 'All' ? {} : { category: activeCategory });
        if (r.success) {
          setGalleryImages(r.data.map((g) => ({
            src: g.imageUrl,
            alt: g.caption || 'Yumbite photo',
            category: g.category || 'Other',
          })));
        }
      } catch {
        setGalleryImages(FALLBACK_IMAGES);
      }
    };
    load();
  }, [activeCategory]);

  const filteredImages = galleryImages.filter(img => 
    (activeCategory === 'All' || img.category === activeCategory) &&
    img.alt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openLightbox = (index) => {
    const actualIndex = galleryImages.findIndex(img => img === filteredImages[index]);
    setLightboxIndex(actualIndex >= 0 ? actualIndex : 0);
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
              OUR GALLERY
            </span>
            <h1 className="font-display font-bold text-display-xl lg:text-display-lg text-yumbite-white mb-4">
              Food & Ambience
            </h1>
            <p className="text-body-lg text-yumbite-white/60">
              A visual journey through the Yumbite experience — from our kitchen to your table.
            </p>
          </motion.div>
        </div>
      </motion.header>

      {/* Controls */}
      <motion.section
        className="py-8 bg-yumbite-black border-b border-yumbite-border sticky top-16 z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Gallery categories">
              {categories.map((category, index) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  role="tab"
                  aria-selected={activeCategory === category}
                  className={`px-4 py-2 rounded-radius-full text-body-sm font-semibold tracking-wide transition-all duration-200 ${
                    activeCategory === category
                      ? 'bg-yumbite-yellow-fill text-yumbite-ink shadow-shadow-glow-yellow'
                      : 'bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/80 hover:text-yumbite-yellow hover:border-yumbite-yellow/50'
                  }`}
                  style={{ transitionDelay: `${index * 30}ms` }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search & View Toggle */}
            <div className="flex w-full min-w-0 flex-wrap items-center gap-3 lg:w-auto lg:flex-nowrap lg:gap-4">
              <div className="relative w-full min-w-0 sm:flex-1 lg:w-80 lg:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yumbite-muted" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-base w-full pl-10 pr-4 bg-yumbite-charcoal border-yumbite-border"
                  aria-label="Search gallery"
                />
              </div>
              <div className="flex items-center gap-1 bg-yumbite-charcoal border border-yumbite-border rounded-radius-lg p-1" role="group" aria-label="View mode">
                <button
                  onClick={() => setViewMode('masonry')}
                  aria-pressed={viewMode === 'masonry'}
                  className={`p-2 rounded-radius-md transition-all duration-200 ${viewMode === 'masonry' ? 'bg-yumbite-yellow-fill text-yumbite-ink' : 'text-yumbite-white/70 hover:text-yumbite-yellow'}`}
                  aria-label="Masonry view"
                >
                  <Layout className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  className={`p-2 rounded-radius-md transition-all duration-200 ${viewMode === 'grid' ? 'bg-yumbite-yellow-fill text-yumbite-ink' : 'text-yumbite-white/70 hover:text-yumbite-yellow'}`}
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Gallery Grid */}
      <section className="section-padding bg-yumbite-black" aria-label="Gallery images">
        <div className="noise-overlay absolute inset-0" aria-hidden="true" />
        <div className="container-custom relative">
          {filteredImages.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 rounded-full bg-yumbite-charcoal border border-yumbite-border flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-yumbite-muted" />
              </div>
              <h3 className="font-display font-semibold text-heading-lg text-yumbite-white mb-2">No images found</h3>
              <p className="text-yumbite-white/60">Try adjusting your filters or search term</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCategory}-${viewMode}-${searchQuery}`}
                className={viewMode === 'masonry' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 [grid-auto-flow:dense]' 
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {filteredImages.map((image, index) => (
                  <motion.article
                    key={image.src + image.alt}
                    className={viewMode === 'masonry' 
                      ? (index === 0 ? 'lg:col-span-2 lg:row-span-2' : index === 3 ? 'lg:col-span-2' : '') 
                      : ''}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03, duration: 0.4 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="relative aspect-[4/3] lg:aspect-[3/4] overflow-hidden rounded-radius-xl bg-yumbite-charcoal group cursor-pointer" onClick={() => openLightbox(index)}>
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover img-zoom"
                        loading={index < 4 ? 'eager' : 'lazy'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-yumbite-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                        <span className="badge-yellow text-caption self-start">{image.category}</span>
                        <div className="flex items-center justify-between">
                          <span className="text-yumbite-white font-medium text-body-sm">{image.alt}</span>
                          <Expand className="w-6 h-6 text-yumbite-yellow/80" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Load More Placeholder */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <button className="btn-secondary">
              Load More Photos
            </button>
          </motion.div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-yumbite-black/98 backdrop-blur-sm"
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
              className="relative max-w-5xl max-h-[85vh] w-full mx-4"
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
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="text-yumbite-white/70 text-body-sm">
                  {galleryImages[lightboxIndex].alt}
                </div>
                <div className="flex items-center gap-4">
                  <span className="badge-yellow text-caption">{galleryImages[lightboxIndex].category}</span>
                  <span className="text-yumbite-white/50 text-body-sm">
                    {lightboxIndex + 1} / {galleryImages.length}
                  </span>
                </div>
              </div>
            </motion.div>

            <button
              onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
              className="absolute right-6 z-10 w-14 h-14 rounded-full bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/70 hover:text-yumbite-yellow hover:border-yumbite-yellow/50 flex items-center justify-center hidden sm:flex"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Keyboard navigation hint */}
            <motion.div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-yumbite-white/40 text-caption"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <kbd className="px-2 py-1 bg-yumbite-charcoal border border-yumbite-border rounded-radius-sm">←</kbd>
              <span>Navigate</span>
              <kbd className="px-2 py-1 bg-yumbite-charcoal border border-yumbite-border rounded-radius-sm">→</kbd>
              <kbd className="px-2 py-1 bg-yumbite-charcoal border border-yumbite-border rounded-radius-sm">Esc</kbd>
              <span>Close</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}