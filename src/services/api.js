import axios from 'axios';
import router from '@/router';
import i18n from '@/i18n';              // ваш Vue I18n–екземпляр
import { createToastInterface } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const toast = createToastInterface({
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  // щоб можна було писати ключі i18n напряму
  i18n,
  i18nName: 't'
});

// helper для тостів з урахуванням мови з localStorage або i18n
function showToast(type, ukMessageKey, originalMessage = '') {
  const storedLang = localStorage.getItem('language');
  const currentLang = storedLang || i18n.global.locale.value || 'uk';
  const msg = i18n.t(ukMessageKey);
  // якщо бек повернув свою тексту, показуємо її у оригінальному вигляді
  const detail = originalMessage || msg;
  toast[type](detail);
}

let hasShownAuthToast = false;

const apiClient = axios.create({
  baseURL: 'https://koshtovnya.api-dev.bmax-edu.website',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const storedLang = localStorage.getItem('language');
  const lang = storedLang || i18n.global.locale.value || 'uk';
  const currency = (localStorage.getItem('currency') || 'uah').toLowerCase();

  if (config.method === 'get') {
    config.params = { ...(config.params || {}), lang, currency };
  } else {
    if (config.data instanceof FormData) {
      config.data.append('lang', lang);
      config.data.append('currency', currency);
    } else if (config.data) {
      config.data = { ...config.data, lang, currency };
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
    if (!response) {
      showToast('error', 'toasts.networkError', 'Network error or timeout');
      return Promise.reject({ message: 'Network error or timeout' });
    }

    const msg = response.data?.message || '';

    if (response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') window.location.href = '/login';
      if (!hasShownAuthToast) {
        showToast('warning', 'toasts.loginRequired', msg);
        hasShownAuthToast = true;
        setTimeout(() => { hasShownAuthToast = false; }, 10000);
      }
      return Promise.reject(response.data);
    }

    if (msg.toLowerCase().includes('banned')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?error=user_is_banned';
      showToast('error', 'toasts.userBanned');
      return Promise.reject(response.data);
    }

    if (msg.toLowerCase().includes('you are already subscribed for notifications')) {
      showToast('error', 'toasts.alreadySubscribed', msg);
      return Promise.reject(response.data);
    }
    if (msg.toLowerCase().includes('not enough stock available')) {
      showToast('error', 'toasts.notEnoughStock', msg);
      return Promise.reject(response.data);
    }

    switch (response.status) {
      case 400:
        showToast('error', 'toasts.badRequest', msg);
        break;
      case 403:
        showToast('error', 'toasts.forbidden', msg);
        break;
      case 404:
        if (response.config.url.startsWith('/api/')) {
          return Promise.reject(response.data);
        }
        showToast('info', 'toasts.pageNotFound', msg);
        router.push({ name: 'NotFound' });
        return Promise.reject(response.data);
      case 422:
        Object.values(response.data.errors || {}).flat().forEach(m =>
          showToast('error', 'toasts.validationError', m)
        );
        break;
      case 500:
        if (msg.toLowerCase().includes('out of range value for column')) {
          showToast('error', 'toasts.notEnoughStock', msg);
        } else {
          showToast('error', 'toasts.serverError', msg);
        }
        break;
      default:
        showToast('error', 'toasts.unknownError', `Error: ${response.status}`);
    }

    return Promise.reject(response.data);
  }
);


export default {
// 1) Отримати wishlist користувача
  getWishlist: async () => {
    // GET /api/wishlist?lang=uk&currency=uah
    const { data } = await apiClient.get('/api/wishlist')
    // повертаємо обʼєкт або масив, як його повертає бек
    return data
  },
  // 2) Видалити один елемент
  deleteWishlistItem: async id => {
    await apiClient.delete(`/api/wishlist/${id}`)
    toast.success('Товар успішно видалено зі списку бажань')
    // повернути просто id для зручності
    return id
  },

  // 3) Додати у список бажань
  addToWishlist: async payload => {
    // payload = { product_id: <id> }
    await apiClient.post('/api/wishlist', payload)
    toast.success('Товар додано до списку бажань')
    // не обовʼязково повертати дані
  },

 
  addToCart: async payload => {
    // payload = { product_id, quantity, size }
    await apiClient.post('/api/cart', payload)
    toast.success('Товар додано до кошика')
  },

    // 2) Отримати кошик користувача
  getCart: async () => {
    // GET /api/cart?lang=uk&currency=uah
    const { data } = await apiClient.get('/api/cart')
    return data
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

 getAdminOrders: async (page = 1) => {
   const { data } = await apiClient.get('/api/admin/orders', {
     params: { page }
   });
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
  getAdminProducts: async ({ params, url } = {}) => {
  // якщо url не вказано, викликаємо базовий ендпоінт
  const endpoint = url || '/api/admin/products';
  // params – це звичайний об’єкт фільтрів/пагінації
  const response = await apiClient.get(endpoint, { params });
  return response.data; // повертаємо data з відповіді
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


  getSettings: async () => {
    const form = new FormData();
    form.append('_method', 'GET');
    const { data } = await apiClient.post("/api/admin/site-settings", form);
    return data;
  },
  updateSettings: async formData => {
    const { data } = await apiClient.post("/api/admin/site-settings", formData);
    return data;
  },
  getCategories: async () => {
    const { data } = await apiClient.get("/api/categories");
    return data;
  },
  createCategory: async formData => {
    const { data } = await apiClient.post("/api/admin/categories", formData);
    return data;
  },
  updateCategory: async (id, formData) => {
    const { data } = await apiClient.post(`/api/admin/categories/${id}`, formData);
    return data;
  },
  deleteCategory: async id => {
    const { data } = await apiClient.delete(`/api/admin/categories/${id}`);
    return data;
  },

   getProductDetail: async (id) => {
    try {
      const { data } = await apiClient.get(`/api/admin/products/${id}`);
      toast.success('Дані товару завантажено');
      return data.data;
    } catch (error) {
      console.error(`Помилка завантаження деталей товару ${id}:`, error);
      toast.error('Не вдалося завантажити деталі товару');
      throw error;
    }
  },

  listProducts: async (params = {}) => {
    try {
      const { data } = await apiClient.get('/api/admin/products', { params });
      // data: { data: [...], links:..., meta:... }
      // Не показуємо toast щокроку, щоб не спамити, але можна за потреби.
      return data;
    } catch (error) {
      console.error('Помилка завантаження списку товарів:', error.response || error);
      toast.error('Не вдалося завантажити товари');
      throw error;
    }
  },

  // 4) Створення нового продукту
  createProduct: async (formData) => {
    try {
      const { data } = await apiClient.post('/api/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Товар успішно додано');
      return data.data || data.product;
    } catch (error) {
      console.error('Помилка створення товару:', error.response || error);
      if (error.response?.status === 422 && error.response.data.errors) {
        const msgs = [];
        Object.values(error.response.data.errors).forEach(arr => {
          if (Array.isArray(arr)) arr.forEach(m => msgs.push(m));
        });
        toast.error(msgs.join('; '));
      } else {
        toast.error('Не вдалося створити товар');
      }
      throw error;
    }
  },

  // 5) Оновлення продукту (PATCH через POST+_method)
  updateProduct: async (id, formData) => {
    if (!id) throw new Error('Product ID is required');
    try {
      const { data } = await apiClient.post(`/api/admin/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Товар успішно оновлено');
      return data.data || data.product;
    } catch (error) {
      console.error(`Помилка оновлення товару ${id}:`, error.response || error);
      if (error.response?.status === 422 && error.response.data.errors) {
        const msgs = [];
        Object.values(error.response.data.errors).forEach(arr => {
          if (Array.isArray(arr)) arr.forEach(m => msgs.push(m));
        });
        toast.error(msgs.join('; '));
      } else {
        toast.error('Не вдалося оновити товар');
      }
      throw error;
    }
  },

  // 6) Видалення продукту
  deleteProduct: async (id) => {
    if (!id) throw new Error('Product ID is required');
    try {
      const { data } = await apiClient.delete(`/api/admin/products/${id}`);
      toast.success('Товар видалено');
      return data;
    } catch (error) {
      console.error(`Помилка видалення товару ${id}:`, error.response || error);
      toast.error('Не вдалося видалити товар');
      throw error;
    }
  },

  // 7) Відновлення продукту
  restoreProduct: async (id) => {
    if (!id) throw new Error('Product ID is required');
    try {
      const { data } = await apiClient.post(`/api/admin/products/${id}/restore`);
      toast.success('Товар відновлено');
      return data;
    } catch (error) {
      console.error(`Помилка відновлення товару ${id}:`, error.response || error);
      toast.error('Не вдалося відновити товар');
      throw error;
    }
  },

  // 8) Дані для форми (категорії, виробники і т.д.)
  getProductFormData: async () => {
    try {
      const { data } = await apiClient.get('/api/admin/products/form-data');
      toast.success('Дані для форми завантажено');
      return data.data;
    } catch (error) {
      console.error('Помилка завантаження form-data:', error.response || error);
      toast.error('Не вдалося завантажити дані для форми');
      throw error;
    }
  },
    getAdminStatsIncome: async (params) => {
    // params може бути { period } або { start_date, end_date }
    const { data } = await apiClient.get('/api/admin/stats/income', { params });
    return data;
  },
  
   getDeliveryTypes: async () => {
    const response = await apiClient.get('/api/delivery-types');
    return response.data;
  },
};

