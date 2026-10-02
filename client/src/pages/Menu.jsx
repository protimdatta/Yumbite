import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingBag, Plus, Minus, Heart, Star, Filter, X } from 'lucide-react';
import { menuAPI } from '../services/api';
import { formatPrice, CATEGORIES, effectivePrice, hasDiscount, getDiscount } from '../utils/helpers';
import { useCart } from '../context/CartContext';

// Clearly-marked SAMPLE data — shown only when the backend/API is unreachable.
// Replace with real Yumbite menu items via the admin dashboard or seed script.
const SAMPLE_MENU = [
  { _id: 'sample-1', name: 'Yumbite Signature Burger', description: 'Double beef patty, cheddar, caramelized onions, signature sauce on brioche', price: 320, category: 'Burgers', image: '', isPopular: true, isAvailable: true },
  { _id: 'sample-2', name: 'Crispy Chicken Burger', description: 'Crispy fried chicken, spicy mayo, pickles, lettuce on sesame bun', price: 280, category: 'Burgers', image: '', isPopular: true, isAvailable: true },
  { _id: 'sample-3', name: 'Crispy Chicken Strips (4pcs)', description: 'Golden fried strips with honey mustard and fries', price: 250, category: 'Chicken', image: '', isPopular: true, isAvailable: true },
  { _id: 'sample-4', name: 'Hot Wings (6pcs)', description: 'Crispy wings in signature hot sauce with ranch dip', price: 220, category: 'Chicken', image: '', isPopular: false, isAvailable: true },
  { _id: 'sample-5', name: 'Chicken Caesar Wrap', description: 'Grilled chicken, romaine, parmesan, caesar dressing', price: 220, category: 'Wraps', image: '', isPopular: false, isAvailable: true },
  { _id: 'sample-6', name: 'Loaded Cheese Fries', description: 'Cheese sauce, bacon bits, jalapeños, sour cream', price: 180, category: 'Fries', image: '', isPopular: true, isAvailable: true },
  { _id: 'sample-7', name: 'Chocolate Milkshake', description: 'Rich chocolate shake with whipped cream', price: 120, category: 'Drinks', image: '', isPopular: false, isAvailable: true },
  { _id: 'sample-8', name: 'Yumbite Feast Combo', description: 'Signature burger + strips + large fries + 2 drinks', price: 650, category: 'Combos', image: '', isPopular: true, isAvailable: true },
];

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState(CATEGORIES);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [filteredItems, setFilteredItems] = useState([]);
  const [usingSample, setUsingSample] = useState(false);
  const scrollContainerRef = useRef(null);
  const { addItem, isInCart, getItemQuantity, incrementQuantity, decrementQuantity, removeItem } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [menuRes, catRes] = await Promise.all([
          menuAPI.getAll({ available: 'true' }),
          menuAPI.getCategories(),
        ]);
        if (menuRes.success && menuRes.data.length > 0) {
          setMenuItems(menuRes.data);
          setUsingSample(false);
        } else if (menuRes.success) {
          setMenuItems(menuRes.data);
        }
        if (catRes.success && catRes.data.length > 0) setCategories(catRes.data);
      } catch (error) {
        console.error('Failed to fetch menu, using sample data:', error);
        setMenuItems(SAMPLE_MENU);
        setUsingSample(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter(item => item.category === activeCategory));
    }
    // Scroll to top of menu when category changes
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeCategory, menuItems]);

  const handleAddToCart = (item) => {
    // Store the discounted (effective) price so cart + checkout match the offer
    addItem({ ...item, price: effectivePrice(item), originalPrice: item.price, discount: getDiscount(item) }, 1);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
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
              WHAT ARE YOU CRAVING?
            </span>
            <h1 className="font-display font-bold text-display-md lg:text-display-lg text-yumbite-white mb-4">
              Our Menu
            </h1>
            <p className="text-body-lg text-yumbite-white/60">
              Discover bold flavors crafted with fresh ingredients. Every item tells a story.
            </p>
          </motion.div>
        </div>
      </motion.header>

      {/* Category Filter */}
      <motion.section
        className="py-8 bg-yumbite-black border-b border-yumbite-border sticky top-16 z-30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-display font-semibold text-heading-md text-yumbite-white">Categories</h2>
            <button className="btn-ghost text-body-sm hidden lg:inline-flex">
              <Filter className="w-4 h-4 mr-1" aria-hidden="true" />
              Filter
            </button>
          </div>
          <div
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide pb-2"
            role="tablist"
            aria-label="Menu categories"
          >
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                role="tab"
                aria-selected={activeCategory === category}
                aria-controls={`menu-panel-${category}`}
                id={`tab-${category}`}
                className={`flex-shrink-0 px-5 py-2.5 rounded-radius-full text-body-sm font-semibold tracking-wide transition-all duration-200 whitespace-nowrap ${
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
        </div>
      </motion.section>

      {/* Menu Grid */}
      <section className="section-padding bg-yumbite-black" aria-label="Menu items">
        <div className="noise-overlay absolute inset-0" aria-hidden="true" />
        <div className="container-custom relative">
          {usingSample && (
            <div className="mb-6 p-4 bg-yumbite-yellow/10 border border-yumbite-yellow/30 rounded-radius-lg text-yumbite-yellow text-body-sm text-center">
              Showing sample menu — connect the backend to display the live Yumbite menu.
            </div>
          )}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="card-base h-80"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="skeleton h-48 w-full" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-6 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-4 w-1/3" />
                    <div className="skeleton h-10 w-full rounded-radius-md mt-4" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 rounded-full bg-yumbite-charcoal border border-yumbite-border flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yumbite-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-heading-lg text-yumbite-white mb-2">No items found</h3>
              <p className="text-yumbite-white/60">Try selecting a different category</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {filteredItems.map((item, index) => (
                  <motion.article
                    key={item._id}
                    className="card-base card-hover group"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03, duration: 0.4 }}
                    whileHover={{ y: -8 }}
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {item.image ? (
                        <motion.img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover img-zoom"
                          loading="lazy"
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.08 }}
                        />
                      ) : (
                        <div className="w-full h-full bg-yumbite-charcoal flex items-center justify-center">
                          <svg className="w-12 h-12 text-yumbite-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {item.isPopular && (
                          <motion.span
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-yumbite-yellow-fill text-yumbite-ink text-caption font-bold rounded-radius-sm shadow-shadow-md"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.03 + 0.3, type: 'spring', stiffness: 500 }}
                          >
                            <Star className="w-3 h-3 fill-current" aria-hidden="true" />
                            POPULAR
                          </motion.span>
                        )}
                        {!item.isAvailable && (
                          <span className="px-2.5 py-1 bg-yumbite-red/90 text-yumbite-white text-caption font-bold rounded-radius-sm">
                            UNAVAILABLE
                          </span>
                        )}
                        {hasDiscount(item) && (
                          <span className="px-2.5 py-1 bg-yumbite-red text-yumbite-white text-caption font-bold rounded-radius-sm shadow-shadow-md">
                            -{getDiscount(item)}% OFF
                          </span>
                        )}
                      </div>

                      {/* Wishlist */}
                      <button
                        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-yumbite-black/60 backdrop-blur-sm border border-yumbite-border text-yumbite-white/70 hover:text-yumbite-red hover:border-yumbite-red/50 flex items-center justify-center group-hover:opacity-100 opacity-0 transition-all duration-200"
                        aria-label="Add to favorites"
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-semibold text-heading-sm text-yumbite-white group-hover:text-yumbite-yellow transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                        <span className="font-display font-bold text-heading-sm text-yumbite-yellow flex-shrink-0 text-right">
                          {hasDiscount(item) && (
                            <span className="block text-caption text-yumbite-white/40 line-through font-normal">
                              {formatPrice(item.price)}
                            </span>
                          )}
                          {formatPrice(effectivePrice(item))}
                        </span>
                      </div>

                      <p className="text-body-sm text-yumbite-white/50 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-3 pt-2 border-t border-yumbite-border">
                        <span className="badge-yellow text-caption">{item.category}</span>
                        {item.spicyLevel > 0 && (
                          <span className="badge-red text-caption flex items-center gap-1">
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                            {'🌶'.repeat(item.spicyLevel)}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls or Add to Cart */}
                      <AnimatePresence>
                        {isInCart(item._id) ? (
                          <motion.div
                            className="flex items-center justify-between"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className="flex items-center gap-2 bg-yumbite-charcoal border border-yumbite-border rounded-radius-md overflow-hidden">
                              <button
                                onClick={() => decrementQuantity(item._id)}
                                className="w-10 h-10 flex items-center justify-center text-yumbite-white/70 hover:text-yumbite-yellow hover:bg-yumbite-yellow/10 transition-colors"
                                aria-label={`Decrease ${item.name}`}
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center font-semibold text-body text-yumbite-white">
                                {getItemQuantity(item._id)}
                              </span>
                              <button
                                onClick={() => incrementQuantity(item._id)}
                                className="w-10 h-10 flex items-center justify-center text-yumbite-white/70 hover:text-yumbite-yellow hover:bg-yumbite-yellow/10 transition-colors"
                                aria-label={`Increase ${item.name}`}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <span className="font-display font-bold text-heading-sm text-yumbite-yellow">
                              {formatPrice(effectivePrice(item) * getItemQuantity(item._id))}
                            </span>
                          </motion.div>
                        ) : (
                          <motion.button
                            onClick={() => handleAddToCart(item)}
                            className="w-full btn-primary justify-center gap-2 py-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                            Add to Cart
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Mobile Horizontal Scroll Fallback */}
          <div className="lg:hidden mt-8">
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
              role="region"
              aria-label="Menu items carousel"
            >
              {filteredItems.slice(0, 10).map((item, index) => (
                <motion.div
                  key={item._id}
                  className="flex-shrink-0 w-72 card-base card-hover"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover img-zoom" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-yumbite-charcoal flex items-center justify-center">
                        <svg className="w-10 h-10 text-yumbite-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-body text-yumbite-white line-clamp-1">{item.name}</h3>
                    <p className="text-yumbite-yellow font-bold text-body">
                      {hasDiscount(item) && (
                        <span className="text-yumbite-white/40 line-through font-normal text-body-sm mr-2">{formatPrice(item.price)}</span>
                      )}
                      {formatPrice(effectivePrice(item))}
                      {hasDiscount(item) && (
                        <span className="ml-2 px-1.5 py-0.5 bg-yumbite-red text-yumbite-white text-caption font-bold rounded-radius-sm">-{getDiscount(item)}%</span>
                      )}
                    </p>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full btn-primary py-2 text-body-sm justify-center"
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
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
            Didn't Find What You're Looking For?
          </h2>
          <p className="text-body-lg text-yumbite-white/60 mb-8 max-w-xl mx-auto">
            Our full menu has even more delicious options. Explore all categories and customize your order.
          </p>
          <a href="/menu" className="btn-primary inline-flex items-center gap-2">
            View Full Menu
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </a>
        </div>
      </motion.section>
    </div>
  );
}