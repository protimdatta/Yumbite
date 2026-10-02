import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ShoppingBag, Plus, Star } from 'lucide-react';
import { menuAPI } from '../services/api';
import { formatPrice, CATEGORIES, effectivePrice, hasDiscount, getDiscount } from '../utils/helpers';
import { useCart } from '../context/CartContext';

const popularItems = [
  {
    _id: 'demo-1',
    name: 'Yumbite Signature Burger',
    description: 'Double beef patty, cheddar cheese, caramelized onions, lettuce, tomato, signature sauce on brioche bun',
    price: 320,
    category: 'Burgers',
    image: '/images/burger-signature.jpg',
    isPopular: true,
  },
  {
    _id: 'demo-2',
    name: 'Crispy Chicken Burger',
    description: 'Crispy fried chicken breast, spicy mayo, pickles, lettuce, tomato on sesame bun',
    price: 280,
    category: 'Burgers',
    image: '/images/burger-chicken.jpg',
    isPopular: true,
  },
  {
    _id: 'demo-3',
    name: 'Crispy Chicken Strips (4pcs)',
    description: 'Golden fried chicken strips served with honey mustard and fries',
    price: 250,
    category: 'Chicken',
    image: '/images/chicken-strips.jpg',
    isPopular: true,
  },
  {
    _id: 'demo-4',
    name: 'Loaded Cheese Fries',
    description: 'Fries topped with cheese sauce, bacon bits, jalapeños, sour cream, green onions',
    price: 180,
    category: 'Fries',
    image: '/images/loaded-fries.jpg',
    isPopular: true,
  },
  {
    _id: 'demo-5',
    name: 'Yumbite Feast Combo',
    description: 'Signature Burger + Chicken Strips (2pcs) + Large Fries + 2 Drinks',
    price: 650,
    category: 'Combos',
    image: '/images/feast-combo.jpg',
    isPopular: true,
  },
  {
    _id: 'demo-6',
    name: 'Korean Fried Chicken',
    description: 'Double fried chicken with gochujang glaze, sesame seeds, pickled radish',
    price: 310,
    category: 'Chicken',
    image: '/images/korean-fried-chicken.jpg',
    isPopular: true,
  },
  {
    _id: 'demo-7',
    name: 'Chocolate Milkshake',
    description: 'Rich chocolate ice cream shake topped with whipped cream',
    price: 120,
    category: 'Drinks',
    image: '/images/chocolate-shake.jpg',
    isPopular: true,
  },
  {
    _id: 'demo-8',
    name: 'Couple Combo',
    description: '2 Chicken Burgers + Medium Fries + 2 Drinks',
    price: 520,
    category: 'Combos',
    image: '/images/couple-combo.jpg',
    isPopular: true,
  },
];

const fallbackImages = {
  Burgers: '/images/home-food-burger.jpg',
  Chicken: '/images/home-food-wrap.jpg',
  Wraps: '/images/home-food-wrap.jpg',
  Fries: '/images/home-food-fries.jpg',
  Drinks: '/images/home-food-drink.jpg',
  Combos: '/images/home-food-burger.jpg',
};

const fallbackImageFor = (category) => fallbackImages[category] || '/images/home-food-burger.jpg';

export default function PopularMenu() {
  const [activeCategory, setActiveCategory] = useState('Popular');
  const [menuItems, setMenuItems] = useState(popularItems);
  const [isLoading, setIsLoading] = useState(false);
  const { addItem, isInCart, getItemQuantity, incrementQuantity, decrementQuantity } = useCart();

  // Fetch real menu data from API (once per mount; guarded against
  // setting state after unmount if the user navigates away mid-request)
  useEffect(() => {
    let cancelled = false;
    const fetchMenu = async () => {
      try {
        setIsLoading(true);
        const response = await menuAPI.getAll({ popular: 'true', limit: 8 });
        if (!cancelled && response.success && response.data.length > 0) {
          setMenuItems(response.data);
        }
      } catch (error) {
        console.log('Using demo data for popular menu');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchMenu();
    return () => { cancelled = true; };
  }, []);

  const handleAddToCart = (item) => {
    addItem({ ...item, price: effectivePrice(item), originalPrice: item.price, discount: getDiscount(item) }, 1);
  };

  const visibleItems = (activeCategory === 'Popular'
    ? menuItems
    : menuItems.filter((item) => item.category === activeCategory)
  ).slice(0, 4);

  return (
    <section 
      id="menu"
      className="relative border-b border-yumbite-border bg-yumbite-black py-7 sm:py-9 lg:py-10"
      aria-label="Popular Menu"
    >
      <div className="noise-overlay absolute inset-0" aria-hidden="true" />
      
      <div className="container-custom relative grid items-start gap-5 lg:grid-cols-[205px_minmax(0,1fr)] lg:gap-x-7">
        {/* Section Header */}
        <motion.div
          className="max-w-xs lg:col-start-1 lg:row-start-1"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-1 inline-block text-caption font-semibold tracking-[0.18em] text-yumbite-yellow">
            OUR MENU
          </span>
          <h2 className="font-display font-bold text-heading-lg text-yumbite-white lg:text-display-sm">
            Popular Items
          </h2>
          <div className="my-2 h-1 w-9 bg-yumbite-yellow-fill" aria-hidden="true" />
          <p className="max-w-xl text-body-sm text-yumbite-white/60">
            Fresh ingredients. Great taste. Always.
          </p>
          <a href="/menu" className="btn-primary mt-4 px-4 py-2.5 text-caption">
            View Full Menu <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide lg:hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          role="tablist"
          aria-label="Menu categories"
        >
          {['Popular', ...CATEGORIES.slice(1)].map((category, index) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              role="tab"
              aria-selected={activeCategory === category}
              aria-controls="menu-panel-Popular"
              id={`tab-${category}`}
              className={`px-5 py-2.5 rounded-radius-full text-body-sm font-semibold tracking-wide transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-yumbite-yellow-fill text-yumbite-ink shadow-shadow-glow-yellow'
                  : 'bg-yumbite-charcoal border border-yumbite-border text-yumbite-white/80 hover:text-yumbite-yellow hover:border-yumbite-yellow/50'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Menu Carousel */}
        <div className="relative min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-3">
          <div
            className="grid min-w-0 grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:grid-cols-4"
            role="region"
            aria-label="Popular menu items"
            id="menu-panel-Popular"
          >
            <AnimatePresence>
              {visibleItems.map((item, index) => (
                <motion.article
                  key={item._id}
                  className="min-w-0 card-base card-hover group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <motion.img
                      src={item.image || fallbackImageFor(item.category)}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(event) => {
                        const fallback = fallbackImageFor(item.category);
                        if (event.currentTarget.src.endsWith(fallback)) {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = '/images/interior.png';
                        } else {
                          event.currentTarget.src = fallback;
                        }
                      }}
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.04 }}
                    />
                    
                    {/* Popular Badge */}
                    {item.isPopular && (
                      <motion.div
                        className="absolute top-3 left-3"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.05 + 0.3, type: 'spring', stiffness: 500 }}
                      >
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yumbite-yellow-fill text-yumbite-ink text-caption font-bold rounded-radius-sm shadow-shadow-md">
                          <Star className="w-3 h-3 fill-current" aria-hidden="true" />
                          POPULAR
                        </span>
                      </motion.div>
                    )}
                    {hasDiscount(item) && (
                      <div className={`absolute ${item.isPopular ? 'top-12' : 'top-3'} left-3`}>
                        <span className="inline-flex items-center px-2.5 py-1 bg-yumbite-red text-yumbite-white text-caption font-bold rounded-radius-sm shadow-shadow-md">
                          -{getDiscount(item)}% OFF
                        </span>
                      </div>
                    )}

                  </div>

                  {/* Content */}
                  <div className="space-y-2 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="min-w-0 font-display text-body-sm font-semibold text-yumbite-white group-hover:text-yumbite-yellow transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <span className="flex-shrink-0 text-right font-display text-body-sm font-bold text-yumbite-yellow">
                        {hasDiscount(item) && (
                          <span className="block text-caption text-yumbite-white/40 line-through font-normal">
                            {formatPrice(item.price)}
                          </span>
                        )}
                        {formatPrice(effectivePrice(item))}
                      </span>
                    </div>

                    <p className="line-clamp-2 min-h-[2.5rem] text-caption text-yumbite-white/60">
                      {item.description}
                    </p>

                    {/* Quantity Controls when in cart */}
                    <AnimatePresence>
                      {isInCart(item._id) && (
                        <motion.div
                          className="flex items-center justify-between"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="flex items-center gap-2 bg-yumbite-charcoal border border-yumbite-border rounded-radius-md overflow-hidden">
                            <button
                              onClick={() => decrementQuantity(item._id)}
                              className="w-9 h-9 flex items-center justify-center text-yumbite-white/70 hover:text-yumbite-yellow hover:bg-yumbite-yellow/10 transition-colors"
                              aria-label={`Decrease ${item.name}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-10 text-center font-semibold text-body text-yumbite-white">
                              {getItemQuantity(item._id)}
                            </span>
                            <button
                              onClick={() => incrementQuantity(item._id)}
                              className="w-9 h-9 flex items-center justify-center text-yumbite-white/70 hover:text-yumbite-yellow hover:bg-yumbite-yellow/10 transition-colors"
                              aria-label={`Increase ${item.name}`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-display font-bold text-heading-sm text-yumbite-yellow">
                            {formatPrice(effectivePrice(item) * getItemQuantity(item._id))}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!isInCart(item._id) && (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full btn-primary justify-center gap-2 py-2 text-caption"
                      >
                        <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

        </div>

        {/* View Full Menu CTA */}
        <motion.div
          className="hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <a
            href="/menu"
            className="btn-secondary inline-flex items-center gap-2"
          >
            View Full Menu
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}