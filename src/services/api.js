import axios from 'axios';
import { createToastInterface } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

// Створюємо глобальний інтерфейс для тостів
const toast = createToastInterface({
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
});

const apiClient = axios.create({
  baseURL: 'https://koshtovnya.api-dev.bmax-edu.website',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
});

// Додаємо токен до запитів
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Обробка помилок
apiClient.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    if (!response) {
      toast.error('Немає зв’язку із сервером. Спробуйте ще раз.');
      console.error('Network or timeout error', error);
      return Promise.reject({ message: 'Network error or timeout' });
    }
    switch (response.status) {
      case 400:
        toast.error(response.data.message || 'Неправильні дані запиту');
        break;
      case 401:
        toast.warning('Будь ласка, увійдіть у систему');
        break;
      case 403:
        toast.error('У вас недостатньо прав для цієї дії');
        break;
      case 404:
        toast.info('Ресурс не знайдено');
        break;
      case 422: {
        const errors = response.data.errors || {};
        Object.values(errors)
          .flat()
          .forEach(msg => toast.error(msg));
        break;
      }
      case 500:
        toast.error('Сталася помилка на сервері. Спробуйте пізніше');
        break;
      default:
        toast.error(response.data.message || `Сталася помилка: ${response.status}`);
    }
    return Promise.reject(response.data);
  }
);

export default {
  // Wishlist
  getWishlist: async () => {
    const { data } = await apiClient.get('/api/wishlist');
    return data;
  },
  deleteWishlistItem: async id => {
    const { data } = await apiClient.delete(`/api/wishlist/${id}`);
    toast.success('Товар успішно видалено зі списку бажань');
    return data;
  },
  addToWishlist: async payload => {
    const { data } = await apiClient.post('/api/wishlist', payload);
    toast.success('Товар додано до списку бажань');
    return data;
  },

  // Cart
  getCart: async () => {
    const { data } = await apiClient.get('/api/cart');
    toast.success('Кошик завантажено');
    return data;
  },
  getCartCount: async () => {
    const { data } = await apiClient.get('/api/cart/cart-count');
    return data;
  },
  removeFromCart: async id => {
    const { data } = await apiClient.delete(`/api/cart/${id}`);
    toast.success('Товар видалено з кошика');
    return data;
  },
  addToCart: async payload => {
    const { data } = await apiClient.post('/api/cart', payload);
    toast.success('Товар додано до кошика');
    return data;
  },
  updateCartItem: async (id, payload) => {
    const { data } = await apiClient.patch(`/api/cart/${id}`, payload);
    toast.success('Кількість товару в кошику оновлено');
    return data;
  },

  // Auth & Registration
  csrfCookie: async () => {
    const { data } = await apiClient.get('/sanctum/csrf-cookie');
    return data;
  },
  login: async credentials => {
    const { data } = await apiClient.post('/api/login', credentials);
    toast.success('Вхід успішний');
    return data;
  },
  logout: async () => {
    const { data } = await apiClient.post('/api/logout');
    toast.success('Ви вийшли з системи');
    return data;
  },
  register: async userData => {
    const { data } = await apiClient.post('/api/register', userData);
    toast.success('Реєстрація успішна');
    return data;
  },
  changePassword: async payload => {
    const { data } = await apiClient.patch('/api/change-password', payload);
    toast.success('Пароль успішно змінено');
    return data;
  },
  verifyCode: async payload => {
    const { data } = await apiClient.post('/api/verify-code', payload);
    toast.success('Код успішно підтверджено');
    return data;
  },
  resendCode: async payload => {
    const { data } = await apiClient.post('/api/resend-code', payload);
    toast.success('Код повторно надіслано');
    return data;
  },

  // User Info & Addresses
  getUserAddress: async () => {
    const { data } = await apiClient.get('/api/user-address');
    toast.success('Адреси користувача завантажено');
    return data;
  },
  getUserPhone: async () => {
    const { data } = await apiClient.get('/api/user/phone-number');
    return data;
  },
  addUserAddress: async addr => {
    const { data } = await apiClient.post('/api/user-address', addr);
    toast.success('Адресу додано');
    return data;
  },
  updateUserAddress: async (id, addr) => {
    const { data } = await apiClient.patch(`/api/user-address/${id}`, addr);
    toast.success('Адресу оновлено');
    return data;
  },
  deleteUserAddress: async id => {
    const { data } = await apiClient.delete(`/api/user-address/${id}`);
    toast.success('Адресу видалено');
    return data;
  },

  // Nova Poshta
  getNPtcities: async params => {
    const { data } = await apiClient.get('/api/nova-poshta/cities', { params });
    return data;
  },
  getNPtdeliveryCost: async params => {
    const { data } = await apiClient.get('/api/nova-poshta/delivery/cost', { params });
    return data;
  },
  getNPtwarehouses: async params => {
    const { data } = await apiClient.get('/api/nova-poshta/ware-houses', { params });
    return data;
  },
  getNPtstreets: async params => {
    const { data } = await apiClient.get('/api/nova-poshta/streets', { params });
    return data;
  },

  // Orders
  getOrders: async () => {
    const { data } = await apiClient.get('/api/orders');
    return data;
  },
  getOrder: async id => {
    const { data } = await apiClient.get(`/api/orders/${id}`);
    return data;
  },
  createOrder: async params => {
    const { data } = await apiClient.post('/api/orders', null, { params });
    toast.success('Замовлення створено');
    return data;
  },

  // Payment & Notification
  createPayment: async payload => {
    const { data } = await apiClient.post('/api/payment', payload);
    toast.success('Оплату створено');
    return data;
  },
  sendNotification: async payload => {
    const { data } = await apiClient.post('/api/notification', payload);
    toast.success('Сповіщення відправлено');
    return data;
  },

  // Products & Categories
  getProduct: async id => {
    const { data } = await apiClient.get(`/api/products/${id}`);
    return data;
  },
  getProductsFormData: async () => {
    const { data } = await apiClient.get('/api/products/form-data');
    return data;
  },
  getPopularProducts: async () => {
    const { data } = await apiClient.get('/api/popular-products');
    return data;
  },
  getSiteSettings: async () => {
    const { data } = await apiClient.get('/api/site-settings');
    return data;
  },
  getCategoryProducts: (categoryId, config = {}) => {
    return apiClient.get(`/api/categories/${categoryId}/products`, config);
  },
  

  searchProducts: async name => {
    const { data } = await apiClient.get(`/api/products/search/${name}`);
    return data;
  },
  getNewArrivals: async () => {
    const { data } = await apiClient.get('/api/new-arrivals');
    return data;
  },
  getAllProducts: async ({ params } = {}) => {
    const { data } = await apiClient.get('/api/products', { params });
    return data;
  },
  
  getFilter: async () => {
    const { data } = await apiClient.get('/api/product-filter');
    return data;
  },

  // Reviews
  getProductReviews: async id => {
    const { data } = await apiClient.get(`/api/products/${id}/reviews`);
    return data;
  },
  postProductReview: async (id, review) => {
    const { data } = await apiClient.post(`/api/products/${id}/reviews`, review);
    toast.success('Відгук успішно додано');
    return data;
  },
  replyReview: async (id, reply) => {
    const { data } = await apiClient.post(`/api/reviews/${id}/reply`, reply);
    toast.success('Відповідь на відгук додана');
    return data;
  },

  // Delivery types & Profile
  getDeliveryTypes: async () => {
    const { data } = await apiClient.get('/api/delivery-types');
    return data;
  },
  getProfile: async () => {
    const { data } = await apiClient.get('/api/profile');
    toast.success('Профіль завантажено');
    return data;
  },
  updateProfile: async payload => {
    const { data } = await apiClient.patch('/api/profile', payload);
    toast.success('Профіль оновлено');
    return data;
  },

  // Admin
  getAdminOrders: async () => {
    const { data } = await apiClient.get('/api/admin/orders');
    toast.success('Адмін: замовлення отримано');
    return data;
  },
  getAdminOrder: async id => {
    const { data } = await apiClient.get(`/api/admin/orders/${id}`);
    toast.success('Адмін: деталі замовлення отримано');
    return data;
  },
  getUserOrders: async userId => {
    const { data } = await apiClient.get(`/api/admin/users/${userId}/orders`);
    toast.success('Адмін: замовлення користувача отримано');
    return data;
  },
  updateAdminOrder: async (id, orderData) => {
    const { data } = await apiClient.patch(`/api/admin/orders/${id}`, orderData);
    toast.success('Адмін: замовлення оновлено');
    return data;
  },

  getAdminProduct: async id => {
    const { data } = await apiClient.get(`/api/admin/products/${id}`);
    toast.success('Адмін: продукт отримано');
    return data;
  },
  createAdminProduct: async productData => {
    const { data } = await apiClient.post('/api/admin/products', productData);
    toast.success('Адмін: продукт створено');
    return data;
  },
  getAdminProducts: async () => {
    const { data } = await apiClient.get('/api/admin/products');
    toast.success('Адмін: список продуктів отримано');
    return data;
  },
  updateAdminProduct: async (id, productData) => {
    const { data } = await apiClient.post(`/api/admin/products/${id}`, productData);
    toast.success('Адмін: продукт оновлено');
    return data;
  },
  getAdminProductsFormData: async () => {
    const { data } = await apiClient.get('/api/admin/products/form-data');
    toast.success('Адмін: дані для форми продуктів отримано');
    return data;
  },
  deleteAdminProduct: async id => {
    const { data } = await apiClient.delete(`/api/admin/products/${id}`);
    toast.success('Адмін: продукт видалено');
    return data;
  },
  restoreAdminProduct: async id => {
    const { data } = await apiClient.post(`/api/admin/products/${id}/restore`);
    toast.success('Адмін: продукт відновлено');
    return data;
  },
  getAdminProductFilter: async () => {
    const { data } = await apiClient.get('/api/admin/product-filter');
    toast.success('Адмін: фільтр продуктів отримано');
    return data;
  },
  postAdminSiteSettings: async settings => {
    const { data } = await apiClient.post('/api/admin/site-settings', settings);
    toast.success('Адмін: налаштування сайту оновлено');
    return data;
  },

  // Categories
  getCategories: async () => {
    const { data } = await apiClient.get('/api/categories');
    return data;
  }
};
