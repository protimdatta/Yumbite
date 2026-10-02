export function formatPrice(price) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Discount helpers — single source of truth, mirrors backend order math
export function getDiscount(item) {
  const d = Number(item?.discount || 0);
  if (!Number.isFinite(d)) return 0;
  return Math.min(Math.max(d, 0), 100);
}

export function hasDiscount(item) {
  return getDiscount(item) > 0;
}

export function effectivePrice(item) {
  return Math.round(Number(item.price) * (1 - getDiscount(item) / 100));
}

export function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  return phone;
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, limit = 300) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${import.meta.env.VITE_API_URL || ''}${path}`;
}

export const CATEGORIES = [
  'All',
  'Burgers',
  'Chicken',
  'Wraps',
  'Fries',
  'Drinks',
  'Combos',
];

export const ORDER_STATUSES = [
  { value: 'Pending', label: 'Pending', color: 'yellow' },
  { value: 'Confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'Preparing', label: 'Preparing', color: 'orange' },
  { value: 'Ready', label: 'Ready', color: 'purple' },
  { value: 'Out for Delivery', label: 'Out for Delivery', color: 'cyan' },
  { value: 'Delivered', label: 'Delivered', color: 'green' },
  { value: 'Cancelled', label: 'Cancelled', color: 'red' },
];

export function getStatusColor(status) {
  const statusMap = {
    Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    Preparing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Ready: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Out for Delivery': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    Delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
    Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return statusMap[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}

export const PAYMENT_METHODS = [
  { value: 'COD', label: 'Cash on Delivery' },
  { value: 'SSLCommerz', label: 'Online Payment' },
];

export const PAYMENT_STATUSES = {
  unpaid: { label: 'Unpaid', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  pending: { label: 'Payment Pending', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  paid: { label: 'Paid', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  failed: { label: 'Payment Failed', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  refunded: { label: 'Refunded', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
};

export function getPaymentStatusMeta(status) {
  return PAYMENT_STATUSES[status] || { label: status || 'Unknown', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
}

export function scrollToElement(selector, offset = 80) {
  const element = document.querySelector(selector);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth',
    });
  }
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

export function openMapsQuery(query) {
  const encodedQuery = encodeURIComponent(query);
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodedQuery}`, '_blank');
}

export function openPhoneDialer(phone) {
  window.location.href = `tel:${phone.replace(/\D/g, '')}`;
}

export function openEmailClient(email, subject = '', body = '') {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  if (body) params.append('body', body);
  window.location.href = `mailto:${email}${params.toString() ? `?${params.toString()}` : ''}`;
}