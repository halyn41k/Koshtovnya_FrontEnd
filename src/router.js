import { createRouter, createWebHistory } from 'vue-router';
import CategorySection from '@/components/categories/CategorySection.vue';


const routes = [
  {
    path: '/',
    redirect: '/homepage'
  },
  {
    path: '/homepage',
    name: 'Home',
    component: () => import('@/components/home/HomePage.vue')
  },
  {
    path: '/category/:categoryId',
    name: 'Category',
    component: CategorySection,
    props: route => ({
      categoryId: Number(route.params.categoryId),
      title: route.query.title || 'Категорія'
    }),
    meta: { title: 'Категорія' }
  },
  
  {
    path: '/bracelets',
    redirect: to => ({
      name: 'Category',
      params: { categoryId: 1 },
      meta: { title: 'Браслети' }
    })
  },
  {
    path: '/herdany',
    redirect: to => ({
      name: 'Category',
      params: { categoryId: 2 },
      meta: { title: 'Гердани' }
    })
  },
  {
    path: '/dukats',
    redirect: to => ({
      name: 'Category',
      params: { categoryId: 3 },
      meta: { title: 'Дукати' }
    })
  },
  {
    path: '/earrings',
    redirect: to => ({
      name: 'Category',
      params: { categoryId: 4 },
      meta: { title: 'Силянки' }
    })
  },
  {
    path: '/sylyanky',
    redirect: to => ({
      name: 'Category',
      params: { categoryId: 5 },
      meta: { title: 'Сережки' }
    })
  },
  {
    path: '/belts',
    redirect: to => ({
      name: 'Category',
      params: { categoryId: 6 },
      meta: { title: 'Пояси' }
    })
  },
  
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/authorization/UserLogin.vue'),
  },
  {
    path: '/registration',
    name: 'Registration',
    component: () => import('@/components/authorization/UserRegistration.vue'),
  },
  {
    path: '/aboutus',
    name: 'AboutUs',
    component: () => import('@/components/infoshop/AboutUs.vue'),
  },
  {
    path: '/aboutdelivery',
    name: 'AboutDelivery',
    component: () => import('@/components/infoshop/AboutDelivery.vue'),
  },
  {
    path: '/productpage/:id',
    name: 'ProductPage',
    component: () => import('@/components/product/ProductPage.vue'),
  },
  {
    path: '/wishlist',
    name: 'UserWishlist',
    component: () => import('@/components/user/UserWishlist.vue'),
  },
  {
    path: '/account',
    name: 'AccountInfo',
    component: () => import('@/components/user/AccountInfo.vue'),
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
    component: () => import('@/components/cart/CartShopPage.vue'),
  },
  {
    path: '/allproduct',
    name: 'AllProductsPage',
    component: () => import('@/components/categories/AllProductsPage.vue'),
  },
  {
    path: '/changepassword',
    name: 'ChangePassword',
    component: () => import('@/components/authorization/ChangePassword.vue'),
  },
  {
    path: '/payment',
    name: 'PaymentComponent',
    component: () => import('@/components/payment/PaymentComponent.vue'),
  },
  {
    path: '/verify',
    name: 'Verify',
    component: () => import('@/components/authorization/UserVerificationComponent.vue')
  },
  {
    path: '/payment-confirmed',
    name: 'PaymentConfirmed',
    component: () => import('@/components/payment/PaymentConfirmed.vue')
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/components/authorization/ResetPassword.vue')
  },
  {
    path: '/admin',
    name: 'AdminPanel',
    component: () => import('@/components/admin/AdminPanel.vue'),
    meta: {
      requiresAdmin: true,
    },
  },
 
];

const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  
  history: createWebHistory(),
  routes,
  // робимо так, щоб клас "active" ставився на активний <router-link>
  linkActiveClass: 'active'
  
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin) {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
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
