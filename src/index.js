import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/components/HomePage.vue'),
  },
  {
    path: '/bracelets',
    name: 'BraceletSection',
    component: () => import('@/components/Categories/BraceletSection.vue'),
  },
  {
    path: '/herdany',
    name: 'Gerdany',
    component: () => import('@/components/Categories/GerdanSection.vue'),
  },
  {
    path: '/dukats',
    name: 'Dukats',
    component: () => import('@/components/Categories/DucatsSection.vue'),
  },
  {
    path: '/sylyanky',
    name: 'Sylyanky',
    component: () => import('@/components/Categories/SyluankaSection.vue'),
  },
  {
    path: '/earrings',
    name: 'Earrings',
    component: () => import('@/components/Categories/EaringsSection.vue'),
  },
  {
    path: '/belts',
    name: 'Belts',
    component: () => import('@/components/Categories/BeltsSection.vue'),
  },
  {
    path: '/aboutus',
    name: 'Aboutus',
    component: () => import('@/components/AboutUs.vue'),
  },
  {
    path: '/aboutdelivery',
    name: 'AboutDelivery',
    component: () => import('@/components/AboutDelivery.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/UserLogin.vue'),
  },
  {
    path: '/registration',
    name: 'Registration',
    component: () => import('@/components/UserRegistration.vue'),
  },
  {
    path: '/productpage/:id',
    name: 'ProductPage',
    component: () => import('@/components/ProductPage.vue'),
  },
  {
    path: '/wishlist',
    name: 'UserWishlist',
    component: () => import('@/components/User/UserWishlist.vue'),
  },
  {
    path: '/account',
    name: 'AccountInfo',
    component: () => import('@/components/User/AccountInfo.vue'),
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('token');
      if (!token) {
        next({ name: 'Login' });
      } else {
        next();
      }
    },
  },
  {
    path: '/cart',
    name: 'CartShop',
    component: () => import('@/components/Cart/CartShopPage.vue'),
  },
  {
    path: '/allproduct',
    name: 'AllProductsPage',
    component: () => import('@/components/Categories/AllProductsPage.vue'),
  },
  {
    path: '/changepassword',
    name: 'ChangePassword',
    component: () => import('@/components/ChangePassword.vue'),
  },
  {
    path: '/payment',
    name: 'PaymentComponent',
    component: () => import('@/components/Payment/PaymentComponent.vue'),
  },
  {
    path: '/verify',
    name: 'Verify',
    component: () => import('@/components/UserVerificationComponent.vue')
  },
  {
    path: '/payment-confirmed',
    name: 'Verify',
    component: () => import('@/components/Payment/PaymentConfirmed.vue')
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: () => import('@/components/Admin/AdminPanel.vue'),
    meta: {
      requiresAdmin: true, // позначаємо, що цей маршрут потребує адмінських прав
    },
  },
  {
    path: '/updateproduct',
    name: 'ProductUpdate',
    component: () => import('@/components/Admin/ProductUpdate.vue'),
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem('token');
      if (!token) {
        next({ name: 'Login' });
      } else {
        next();
      }
    },
  },
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});


router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    const storedUser = localStorage.getItem('user');
    console.log("Stored user:", storedUser);
    const user = storedUser ? JSON.parse(storedUser) : null;
    console.log("Parsed user:", user);
    if (user && (user.role === 'superadmin' || user.role === 'admin' || user.role === 'manager')) {
      next();
    } else {
      next({ name: 'Home' });
    }
  } else {
    next();
  }
});


export default router;
