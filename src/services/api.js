// services/api.js
import axios from 'axios';
import router from '@/router';
import i18n from '@/i18n';              // експорт вашого Vue I18n-екземпляру
import { createToastInterface } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const toast = createToastInterface({
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
});

let hasShownAuthToast = false;

const apiClient = axios.create({
  baseURL: 'https://koshtovnya.api-dev.bmax-edu.website',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(config => {
  // --- Auth token ---
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // --- Поточна мова та валюта ---
  const lang = i18n.global.locale.value || localStorage.getItem('language') || 'uk';
  const currency = (localStorage.getItem('currency') || 'uah').toLowerCase();

  // Для GET: додаємо у params
  if (config.method === 'get') {
    config.params = {
      ...(config.params || {}),
      lang,
      currency,
    };
  } else {
    // Для інших: у body
    if (config.data instanceof FormData) {
      config.data.append('lang', lang);
      config.data.append('currency', currency);
    } else if (config.data) {
      config.data = {
        ...config.data,
        lang,
        currency,
      };
    } else {
      config.data = { lang, currency };
    }
  }

  return config;
}, error => Promise.reject(error));

apiClient.interceptors.response.use(
  response => response,
  error => {
    const response = error.response;

    // Якщо зовсім немає відповіді
    if (!response) {
      toast.error('Немає зв’язку із сервером. Спробуйте ще раз.');
      return Promise.reject({ message: 'Network error or timeout' });
    }

    // 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        window.location.href = '/login';
      }
      // Одноразово показуємо toast
      if (!hasShownAuthToast) {
        toast.warning('Будь ласка, увійдіть у систему');
        hasShownAuthToast = true;
        setTimeout(() => { hasShownAuthToast = false; }, 10000);
      }
      return Promise.reject(response.data);
    }

    // Інші кастомні помилки з message
    const msg = (response.data?.message || '').toLowerCase();
    if (msg.includes('banned')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?error=user_is_banned';
      return Promise.reject(response.data);
    }
    if (msg.includes('you are already subscribed for notifications')) {
      toast.error('Ви вже підписані на сповіщення для цього товару 😢');
      return Promise.reject(response.data);
    }
    if (msg.includes('not enough stock available')) {
      toast.error('Немає достатньо товару в наявності 😢');
      return Promise.reject(response.data);
    }

    // HTTP-статуси
    switch (response.status) {
      case 400:
        toast.error(response.data.message || 'Неправильні дані запиту');
        break;
      case 403:
        toast.error('У вас недостатньо прав для цієї дії');
        break;
        case 404:
      // якщо це API-запит, просто відхиляємо проміс
      if (response.config.url.startsWith('/api/')) {
        return Promise.reject(response.data);
      }
      // інакше — редіректимо на сторінку 404
      toast.info('Сторінку не знайдено');
      router.push({ name: 'NotFound' });
      return Promise.reject(response.data);


      case 422:
        Object.values(response.data.errors || {})
          .flat()
          .forEach(m => toast.error(m));
        break;
      case 500:
        if (msg.includes('out of range value for column')) {
          toast.error('Цей товар більше не в наявності 😢');
        } else {
          toast.error('Сталася помилка на сервері. Спробуйте пізніше');
        }
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
  
    if ('size' in payload) {
      toast.success('Розмір товару оновлено');
    } else {
      toast.success('Кількість товару в кошику оновлено');
    }
  
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

  sendResetCode: async email => {
    const { data } = await apiClient.post("/api/send-code", { email });
    return data;
  },
  verifyResetCode: async payload => {
    const { data } = await apiClient.post("/api/verify-reset-code", payload);
    return data;
  },
  resetPassword: async payload => {
    const { data } = await apiClient.patch("/api/reset-password", payload);
    return data;
  },
  verifyAccount: async payload => {
    const { data } = await apiClient.post("/api/verify", payload);
    return data;
  },
  resendVerificationCode: async payload => {
    const { data } = await apiClient.post("/api/resend-code", payload);
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
  updateUser: async (id, payload) => {
    const { data } = await apiClient.patch(`/api/user/${id}`, payload);
    toast.success('Дані користувача оновлено');
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
  cancelOrder: async id => {
    const { data } = await apiClient.post(`/api/orders/${id}/cancel`);
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
  toast.success('Ви будете повідомлені, коли товар зʼявиться в наявності');
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
  
  getFilter: async (config = {}) => {
  const { data } = await apiClient.get('/api/product-filter', config)
  return data
},

getAdminFilter: async (config = {}) => {
  const { data } = await apiClient.get('/api/admin/product-filter', config)
  return data
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
  getTopLatestReviews: async () => {
    const { data } = await apiClient.get("/api/reviews/top-latest");
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
  // Admin statistics
  getAdminStatsSummary: async params => {
    const { data } = await apiClient.get("/api/admin/stats/summary", { params });
    return data;
  },

  getAdminStatsPopularProducts: async params => {
    const { data } = await apiClient.get("/api/admin/stats/popular-products", { params });
    return data;
  },
  getAdminStatsLatestOrders: async params => {
    const { data } = await apiClient.get("/api/admin/stats/latest-orders", { params });
    return data;
  },



   getUsers: async ({ role, sort_by, sort_order } = {}, url = null) => {
    const endpoint = url || '/api/admin/users';
    return apiClient.get(endpoint, { params: { role, sort_by, sort_order } });
  },
  searchUsers: async (query, params = {}) => {
    return apiClient.get(`/api/admin/users/search/${encodeURIComponent(query)}`, { params });
  },
  banUser: async id => {
    return apiClient.post(`/api/admin/users/${id}/ban`);
  },
  unbanUser: async id => {
    return apiClient.post(`/api/admin/users/${id}/unban`);
  },
  createUser: async data => {
    return apiClient.post('/api/admin/user', data);
  },
  updateAdminUser: async (id, data) => {
    return apiClient.patch(`/api/admin/user/${id}`, data);
  },
  deleteAdminUser: async id => {
    return apiClient.delete(`/api/admin/users/${id}`);
  },

  // Site settings
  getAdminSiteSettings: async () => {
    const { data } = await apiClient.get('/api/site-settings');
    return data;
  },

  // Statistics
  getAdminStatsOrderDynamics: async params => {
    const { data } = await apiClient.get('/api/admin/stats/order-dynamics', { params });
    return data;
  },


  // Categories
  getCategories: async () => {
    const { data } = await apiClient.get('/api/categories');
    return data;
  },

  
};
