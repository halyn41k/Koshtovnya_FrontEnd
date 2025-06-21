// describe.skip('Тести для MyComponent', () => {
//     it('цей тест не виконається', () => {
//       expect(true).toBe(false)
//     })
//   })

//Протестовано головні аспекти

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => { });
  jest.spyOn(console, 'error').mockImplementation(() => { });
  jest.spyOn(console, 'log').mockImplementation(() => { });
});

import { shallowMount } from '@vue/test-utils';
import NewArrivals from '@/components/Home/NewArrivals.vue';
import api from '@/services/api';
import bus from '@/eventBus';

// Мокаємо сервіс api
jest.mock('@/services/api', () => ({
  getNewArrivals: jest.fn(),
  deleteWishlistItem: jest.fn(),
  addToWishlist: jest.fn(),
  addToCart: jest.fn(),
}));

// Дані для тестування
const testProductData = [
  { id: 1, name: 'Product 1', image_url: 'url1', price: 100, bead_producer_name: 'Producer 1', rating: 3, review_count: 5, is_in_wishlist: false },
  { id: 2, name: 'Product 2', image_url: 'url2', price: 200, bead_producer_name: 'Producer 2', rating: 5, review_count: 2, is_in_wishlist: true },
  { id: 3, name: 'Product 3', image_url: 'url3', price: 300, bead_producer_name: 'Producer 3', rating: 1, review_count: 0, is_in_wishlist: false },
  { id: 4, name: 'Product 4', image_url: 'url4', price: 400, bead_producer_name: 'Producer 4', rating: 4, review_count: 1, is_in_wishlist: false },
  { id: 5, name: 'Product 5', image_url: 'url5', price: 500, bead_producer_name: 'Producer 5', rating: 2, review_count: 3, is_in_wishlist: false },
];

describe('NewArrivals.vue', () => {
  let wrapper;
  const $t = (key) => key === 'newArrivals' ? 'Новинки' : key;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Початковий мок повертає перші 5
    api.getNewArrivals.mockResolvedValue({ data: testProductData });
    wrapper = shallowMount(NewArrivals, { global: { mocks: { $t }, stubs: ['router-link'] } });
    await wrapper.vm.$nextTick();
  });

  it('рендерить правильну кількість елементів продукції за productsPerPage', () => {
    // productsPerPage за замовчуванням 3
    const articles = wrapper.findAll('article');
    expect(articles.length).toBe(wrapper.vm.productsPerPage);
  });

  it('рендерить правильну кількість зірок залежно від рейтингу', () => {
    const first = wrapper.find('article');
    const fullStars = first.findAll('svg[fill="#FFD700"]');
    expect(fullStars.length).toBe(Math.round(testProductData[0].rating));
  });

  it('showNextProducts змінює сторінку і оновлює видимі продукти', async () => {
    wrapper.vm.showNextProducts();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.currentPage).toBe(1);
    const expected = testProductData.slice(wrapper.vm.productsPerPage, wrapper.vm.productsPerPage * 2);
    expect(wrapper.vm.visibleProducts).toEqual(expected);
  });

  it('showPreviousProducts працює коректно', async () => {
    wrapper.vm.currentPage = 1;
    wrapper.vm.updateVisibleProducts();
    wrapper.vm.showPreviousProducts();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.currentPage).toBe(0);
    expect(wrapper.vm.visibleProducts).toEqual(testProductData.slice(0, wrapper.vm.productsPerPage));
  });

  it('toggleWishlist додає та видаляє товар із wishlist', async () => {
    const prod = wrapper.vm.visibleProducts[0];
    // додавання
    prod.is_in_wishlist = false;
    api.addToWishlist.mockResolvedValue({});
    await wrapper.vm.toggleWishlist(prod);
    expect(api.addToWishlist).toHaveBeenCalledWith({ product_id: prod.id });
    expect(prod.is_in_wishlist).toBe(true);
    // видалення
    api.deleteWishlistItem.mockResolvedValue({});
    await wrapper.vm.toggleWishlist(prod);
    expect(api.deleteWishlistItem).toHaveBeenCalledWith(prod.id);
    expect(prod.is_in_wishlist).toBe(false);
  });

  it('addToCart викликає api.addToCart і емінтить подію', async () => {
    const prod = wrapper.vm.visibleProducts[0];
    api.addToCart.mockResolvedValue({ data: {} });
    const busSpy = jest.spyOn(bus, 'emit');
    await wrapper.vm.addToCart(prod);
    expect(api.addToCart).toHaveBeenCalledWith({ product_id: prod.id, quantity: 1 });
    expect(busSpy).toHaveBeenCalledWith('cart-updated');
  });

  it('updateVisibleProducts коректно фільтрує масив', () => {
    wrapper.vm.productsPerPage = 2;
    wrapper.vm.products = testProductData;
    wrapper.vm.currentPage = 2;
    wrapper.vm.updateVisibleProducts();
    expect(wrapper.vm.visibleProducts).toEqual(testProductData.slice(4, 6));
  });

  it('пагінаційні точки відображаються з класами залежно від currentPage', async () => {
    wrapper.vm.totalPages = 3;
    wrapper.vm.currentPage = 1;
    await wrapper.vm.$nextTick();
    const dotsContainer = wrapper.find('.hidden.sm\\:flex');
    expect(dotsContainer.exists()).toBe(true);
    const dots = dotsContainer.findAll('span');
    expect(dots.length).toBe(3);
    dots.forEach((dot, idx) => {
      const classes = dot.classes();
      if (idx === 1) expect(classes).toContain('opacity-75'); else expect(classes).toContain('opacity-25');
    });
  });

  it('має обробляти зміну розміру вікна та оновлювати productsPerPage', async () => {
    // встановимо великий розмір вікна
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
    wrapper.vm.updateProductsPerPage();
    expect(wrapper.vm.productsPerPage).toBe(6);  // менше см-брейкпойнта

    // тепер вузький екран
    Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true });
    wrapper.vm.updateProductsPerPage();
    expect(wrapper.vm.productsPerPage).toBe(3);  // більше см
  });

  it('або викликає console.error при помилці fetchProducts', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => { });
    api.getNewArrivals.mockRejectedValueOnce(new Error('Fail'));
    await wrapper.vm.fetchProducts();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Помилка при завантаженні популярних товарів:'), expect.any(Error));
    spy.mockRestore();
  });

  it('toggleWishlist не змінює значення, якщо API повернув помилку', async () => {
    const prod = { ...wrapper.vm.visibleProducts[0], is_in_wishlist: false };
    api.addToWishlist.mockRejectedValueOnce(new Error('Fail'));
    await wrapper.vm.toggleWishlist(prod);
    expect(prod.is_in_wishlist).toBe(false);
  });

  it('addToCart викидає console.error, якщо API повернув помилку', async () => {
    const prod = wrapper.vm.visibleProducts[0];
    const spy = jest.spyOn(console, 'error').mockImplementation(() => { });
    api.addToCart.mockRejectedValueOnce({ response: { data: 'Error' } });
    await wrapper.vm.addToCart(prod);
    expect(spy).toHaveBeenCalledWith('Помилка додавання в кошик:', 'Error');
    spy.mockRestore();
  });

  it('не змінює currentPage при showNextProducts на останній сторінці', () => {
    wrapper.vm.totalPages = 1;
    wrapper.vm.currentPage = 0;
    wrapper.vm.showNextProducts();
    expect(wrapper.vm.currentPage).toBe(0);
  });

  it('не змінює currentPage при showPreviousProducts на нульовій сторінці', () => {
    wrapper.vm.currentPage = 0;
    wrapper.vm.showPreviousProducts();
    expect(wrapper.vm.currentPage).toBe(0);
  });
});
