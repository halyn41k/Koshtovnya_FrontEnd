import axios from 'axios';

// Create an axios instance with base URL and JSON headers
const apiClient = axios.create({
  baseURL: 'https://koshtovnya.api-dev.bmax-edu.website',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Authorization header
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export default {
  // Wishlist
  getWishlist: async () => {
    const response = await apiClient.get('/api/wishlist');
    return response.data;
  },
  deleteWishlistItem: async (id) => {
    const response = await apiClient.delete(`/api/wishlist/${id}`);
    return response.data;
  },
  addToWishlist: async (payload) => {
    const response = await apiClient.post('/api/wishlist', payload);
    return response.data;
  },

  // Cart
  getCart: async () => {
    const response = await apiClient.get('/api/cart');
    return response.data;
  },
  getCartCount: async () => {
    const response = await apiClient.get('/api/cart/cart-count');
    return response.data;
  },
  removeFromCart: async (id) => {
    const response = await apiClient.delete(`/api/cart/${id}`);
    return response.data;
  },
  addToCart: async (payload) => {
    const response = await apiClient.post('/api/cart', payload);
    return response.data;
  },
  updateCartItem: async (id, payload) => {
    const response = await apiClient.patch(`/api/cart/${id}`, payload);
    return response.data;
  },

  // Auth
  login: async (credentials) => {
    const response = await apiClient.post('/api/login', credentials);
    return response.data;
  },
  logout: async () => {
    const response = await apiClient.post('/api/logout');
    return response.data;
  },
  register: async (data) => {
    const response = await apiClient.post('/api/register', data);
    return response.data;
  },
  csrfCookie: async () => {
    const response = await apiClient.get('/sanctum/csrf-cookie');
    return response.data;
  },
  changePassword: async (data) => {
    const response = await apiClient.patch('/api/change-password', data);
    return response.data;
  },
  verifyCode: async (data) => {
    const response = await apiClient.post('/api/verify-code', data);
    return response.data;
  },
  resendCode: async (data) => {
    const response = await apiClient.post('/api/resend-code', data);
    return response.data;
  },

  // User info
  getUserAddress: async () => {
    const response = await apiClient.get('/api/user-address');
    return response.data;
  },
  getUserPhone: async () => {
    const response = await apiClient.get('/api/user/phone-number');
    return response.data;
  },
  addUserAddress: async (data) => {
    const response = await apiClient.post('/api/user-address', data);
    return response.data;
  },
  updateUserAddress: async (id, data) => {
    const response = await apiClient.patch(`/api/user-address/${id}`, data);
    return response.data;
  },
  deleteUserAddress: async (id) => {
    const response = await apiClient.delete(`/api/user-address/${id}`);
    return response.data;
  },

  // Nova Poshta
  getNPtcities: async (params) => {
    const response = await apiClient.get('/api/nova-poshta/cities', { params });
    return response.data;
  },
  getNPtdeliveryCost: async (params) => {
    const response = await apiClient.get('/api/nova-poshta/delivery/cost', { params });
    return response.data;
  },
  getNPtwarehouses: async (params) => {
    const response = await apiClient.get('/api/nova-poshta/ware-houses', { params });
    return response.data;
  },
  getNPtstreets: async (params) => {
    const response = await apiClient.get('/api/nova-poshta/streets', { params });
    return response.data;
  },

  // Orders
  getOrders: async () => {
    const response = await apiClient.get('/api/orders');
    return response.data;
  },
  getOrder: async (id) => {
    const response = await apiClient.get(`/api/orders/${id}`);
    return response.data;
  },
  createOrder: async (params) => {
    const response = await apiClient.post('/api/orders', null, { params });
    return response.data;
  },

  // Payment & Notification
  createPayment: async (data) => {
    const response = await apiClient.post('/api/payment', data);
    return response.data;
  },
  sendNotification: async (data) => {
    const response = await apiClient.post('/api/notification', data);
    return response.data;
  },

  // Products & Categories
  getProduct: async (id) => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data;
  },
  getProductsFormData: async () => {
    const response = await apiClient.get('/api/products/form-data');
    return response.data;
  },
  getPopularProducts: async () => {
    const response = await apiClient.get('/api/popular-products');
    return response.data;
  },
  getSiteSettings: async () => {
    const response = await apiClient.get('/api/site-settings');
    return response.data;
  },
  getCategoryProducts: async (id) => {
    const response = await apiClient.get(`/api/categories/${id}/products`);
    return response.data;
  },
  searchProducts: async (name) => {
    const response = await apiClient.get(`/api/products/search/${name}`);
    return response.data;
  },
  getNewArrivals: async () => {
    const response = await apiClient.get('/api/new-arrivals');
    return response.data;
  },
  getAllProducts: async () => {
    const response = await apiClient.get('/api/products');
    return response.data;
  },
  getFilter: async () => {
    const response = await apiClient.get('/api/filter');
    return response.data;
  },

  // Reviews
  getProductReviews: async (id) => {
    const response = await apiClient.get(`/api/products/${id}/reviews`);
    return response.data;
  },
  postProductReview: async (id, data) => {
    const response = await apiClient.post(`/api/products/${id}/reviews`, data);
    return response.data;
  },
  replyReview: async (id, data) => {
    const response = await apiClient.post(`/api/reviews/${id}/reply`, data);
    return response.data;
  },

  // Delivery types & Profile
  getDeliveryTypes: async () => {
    const response = await apiClient.get('/api/delivery-types');
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get('/api/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await apiClient.patch('/api/profile', data);
    return response.data;
  },

  // Admin
  getAdminOrders: async () => {
    const response = await apiClient.get('/api/admin/orders');
    return response.data;
  },
  getAdminOrder: async (id) => {
    const response = await apiClient.get(`/api/admin/orders/${id}`);
    return response.data;
  },
  getUserOrders: async (userId) => {
    const response = await apiClient.get(`/api/admin/users/${userId}/orders`);
    return response.data;
  },
  updateAdminOrder: async (id, data) => {
    const response = await apiClient.patch(`/api/admin/orders/${id}`, data);
    return response.data;
  },

  getAdminProduct: async (id) => {
    const response = await apiClient.get(`/api/admin/products/${id}`);
    return response.data;
  },
  createAdminProduct: async (data) => {
    const response = await apiClient.post('/api/admin/products', data);
    return response.data;
  },
  getAdminProducts: async () => {
    const response = await apiClient.get('/api/admin/products');
    return response.data;
  },
  updateAdminProduct: async (id, data) => {
    const response = await apiClient.post(`/api/admin/products/${id}`, data);
    return response.data;
  },
  getAdminProductsFormData: async () => {
    const response = await apiClient.get('/api/admin/products/form-data');
    return response.data;
  },
  deleteAdminProduct: async (id) => {
    const response = await apiClient.delete(`/api/admin/products/${id}`);
    return response.data;
  },
  restoreAdminProduct: async (id) => {
    const response = await apiClient.post(`/api/admin/products/${id}/restore`);
    return response.data;
  },

  getAdminProductFilter: async () => {
    const response = await apiClient.get('/api/admin/product-filter');
    return response.data;
  },
  postAdminSiteSettings: async (data) => {
    const response = await apiClient.post('/api/admin/site-settings', data);
    return response.data;
  }
};
