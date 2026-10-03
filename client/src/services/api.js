const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://yumbite.onrender.com');
const API_BASE = `${API_BASE_URL.replace(/\/$/, '')}/api`;

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const { headers: optHeaders, ...restOptions } = options;
  const isFormData = typeof FormData !== 'undefined' && restOptions.body instanceof FormData;
  const config = {
    ...restOptions,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...optHeaders,
    },
  };

  if (config.body && typeof config.body === 'object' && !isFormData) {
    config.body = JSON.stringify(config.body);
  }

  try {
    let response;
    try {
      response = await fetch(url, config);
    } catch (networkError) {
      throw new Error('Cannot reach the server. Please check your connection and try again.');
    }

    const text = await response.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Server returned an invalid response. Please try again.');
      }
    }

    if (!response.ok) {
      throw new Error((data && data.message) || `Request failed (status ${response.status})`);
    }

    if (!data) {
      throw new Error('Server returned an empty response. Please try again.');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Menu API
export const menuAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/menu?${query}`);
  },

  getCategories: () => fetchAPI('/menu/categories'),

  getById: (id) => fetchAPI(`/menu/${id}`),

  create: (data, token) => fetchAPI('/menu', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  }),

  update: (id, data, token) => fetchAPI(`/menu/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  }),

  delete: (id, token) => fetchAPI(`/menu/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }),

  toggleAvailability: (id, token) => fetchAPI(`/menu/${id}/toggle`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  }),
};

// Order API
export const orderAPI = {
  create: (data, token) => fetchAPI('/orders', {
    method: 'POST',
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    body: data,
  }),

  initiateOnline: (data, token) => fetchAPI('/orders/initiate', {
    method: 'POST',
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
    body: data,
  }),

  track: (orderNumber, phone) => {
    const query = new URLSearchParams({ phone }).toString();
    return fetchAPI(`/orders/track/${encodeURIComponent(orderNumber)}?${query}`);
  },

  invoice: (orderId, token) => fetchAPI(`/orders/${orderId}/invoice`, {
    headers: { Authorization: `Bearer ${token}` },
  }),

  getAll: (params = {}, token) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/orders?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getStats: (token) => fetchAPI('/orders/stats', {
    headers: { Authorization: `Bearer ${token}` },
  }),

  getById: (id, token) => fetchAPI(`/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }),

  updateStatus: (id, status, token) => fetchAPI(`/orders/${id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: { status },
  }),

  markCashReceived: (id, token) => fetchAPI(`/orders/${id}/cash-received`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  }),
};

// User (customer) API
export const userAPI = {
  register: (data) => fetchAPI('/users/register', {
    method: 'POST',
    body: data,
  }),

  login: (email, password) => fetchAPI('/users/login', {
    method: 'POST',
    body: { email, password },
  }),

  google: (idToken) => fetchAPI('/users/google', {
    method: 'POST',
    body: { idToken },
  }),

  me: (token) => fetchAPI('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  }),

  updateMe: (data, token) => fetchAPI('/users/me', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  }),

  myOrders: (token) => fetchAPI('/users/orders', {
    headers: { Authorization: `Bearer ${token}` },
  }),

  uploadAvatar: (file, token) => {
    const formData = new FormData();
    formData.append('image', file);
    return fetchAPI('/users/avatar', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  },

  forgotPassword: (email) => fetchAPI('/users/forgot-password', {
    method: 'POST',
    body: { email },
  }),

  verifyOtp: (email, otp) => fetchAPI('/users/verify-otp', {
    method: 'POST',
    body: { email, otp },
  }),

  resetPassword: (email, password) => fetchAPI('/users/reset-password', {
    method: 'POST',
    body: { email, password },
  }),
};

// Auth API (admin)
export const authAPI = {
  login: (email, password) => fetchAPI('/auth/login', {
    method: 'POST',
    body: { email, password },
  }),

  getMe: (token) => fetchAPI('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  }),

  updateProfile: (data, token) => fetchAPI('/auth/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  }),

  changePassword: (data, token) => fetchAPI('/auth/password', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  }),

  setup: (data) => fetchAPI('/auth/setup', {
    method: 'POST',
    body: data,
  }),
};

// Gallery API
export const galleryAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/gallery?${query}`);
  },

  getAllAdmin: (token) => fetchAPI('/gallery/all', {
    headers: { Authorization: `Bearer ${token}` },
  }),

  create: (data, token) => fetchAPI('/gallery', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  }),

  update: (id, data, token) => fetchAPI(`/gallery/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  }),

  delete: (id, token) => fetchAPI(`/gallery/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }),
};

// Review API (customer reviews)
export const reviewAPI = {
  getAll: () => fetchAPI('/reviews'),

  create: (data, token) => fetchAPI('/reviews', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  }),

  getAllAdmin: (token) => fetchAPI('/reviews/all', {
    headers: { Authorization: `Bearer ${token}` },
  }),

  toggle: (id, token) => fetchAPI(`/reviews/${id}/toggle`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  }),

  delete: (id, token) => fetchAPI(`/reviews/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  }),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file, token) => {
    const formData = new FormData();
    formData.append('image', file);
    return fetchAPI('/upload/image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  },
};

// Contact API (public contact form -> owner inbox via backend/Resend)
export const contactAPI = {
  send: (data) => fetchAPI('/contact', {
    method: 'POST',
    body: data,
  }),
};

// Admin analytics + user management (admin JWT only)
export const adminAPI = {
  overview: (token) => fetchAPI('/admin/overview', {
    headers: { Authorization: `Bearer ${token}` },
  }),

  users: (params = {}, token) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/admin/users?${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  userDetail: (id, token) => fetchAPI(`/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  }),

  setUserActive: (id, isActive, token) => fetchAPI(`/admin/users/${id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: { isActive },
  }),
};

// Site settings (public read, admin write)
export const settingsAPI = {
  get: () => fetchAPI('/settings'),

  update: (data, token) => fetchAPI('/settings', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: data,
  }),
};

// Health check
export const healthAPI = {
  check: () => fetchAPI('/health'),
};