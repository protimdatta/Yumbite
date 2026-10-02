import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'yumbite_cart';

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on init
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      } catch {
        // storage unavailable — cart still works in memory
      }
    }
  }, [cart, isLoading]);

  const addItem = useCallback((item, quantity = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(i => i._id === item._id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { ...item, quantity }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((itemId) => {
    setCart(prev => prev.filter(item => item._id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setCart(prev => prev.map(item =>
      item._id === itemId ? { ...item, quantity } : item
    ));
  }, [removeItem]);

  const incrementQuantity = useCallback((itemId) => {
    setCart(prev => prev.map(item =>
      item._id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    ));
  }, []);

  const decrementQuantity = useCallback((itemId) => {
    setCart(prev => {
      const item = prev.find(i => i._id === itemId);
      if (!item || item.quantity <= 1) {
        return prev.filter(i => i._id !== itemId);
      }
      return prev.map(i =>
        i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const getItemCount = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const getSubtotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const getTotal = useCallback(() => {
    const subtotal = getSubtotal();
    // Add delivery fee if needed
    return subtotal;
  }, [getSubtotal]);

  const isInCart = useCallback((itemId) => {
    return cart.some(item => item._id === itemId);
  }, [cart]);

  const getItemQuantity = useCallback((itemId) => {
    const item = cart.find(i => i._id === itemId);
    return item ? item.quantity : 0;
  }, [cart]);

  const value = {
    cart,
    isOpen,
    setIsOpen,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    getTotal,
    isInCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}