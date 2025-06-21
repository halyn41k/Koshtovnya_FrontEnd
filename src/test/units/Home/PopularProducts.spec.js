// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти

import { mount } from '@vue/test-utils';
import PopularProducts from '@/components/home/PopularProducts.vue';
import api from '@/services/api';

// Мокаємо сервіс api
jest.mock('@/services/api', () => ({
  getPopularProducts: jest.fn(),
  deleteWishlistItem: jest.fn(),
  addToWishlist: jest.fn(),
  addToCart: jest.fn(),
}));

// Тестові продукти
const mockProducts = [
  { id: 1, name: 'Product 1', price: 100, image_url: 'test-url-1', bead_producer_name: 'Producer 1', rating: 4, review_count: 2, is_in_wishlist: false },
  { id: 2, name: 'Product 2', price: 200, image_url: 'test-url-2', bead_producer_name: 'Producer 2', rating: 5, review_count: 3, is_in_wishlist: true },
];

describe('PopularProducts.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();
    api.getPopularProducts.mockResolvedValue({ data: mockProducts });
    wrapper = mount(PopularProducts, {
      global: {
        mocks: { $t: (key) => key, $router: { push: jest.fn() } },
        stubs: ['router-link'],
      },
    });
    await wrapper.vm.$nextTick();
  });

  it('рендерить заголовок секції', () => {
    const title = wrapper.find('h2');
    expect(title.exists()).toBe(true);
    expect(title.text().trim()).toBe('Популярні товари');
  });

  it('отримує популярні товари при монтуванні', () => {
    expect(api.getPopularProducts).toHaveBeenCalled();
    expect(wrapper.vm.products).toEqual(mockProducts);
  });

  it('toggleWishlist додає/видаляє товар зі списку бажаного', async () => {
    const prod = wrapper.vm.visibleProducts[0];
    prod.is_in_wishlist = false;
    api.addToWishlist.mockResolvedValue({});
    await wrapper.vm.toggleWishlist(prod);
    expect(api.addToWishlist).toHaveBeenCalledWith({ product_id: prod.id });
    expect(prod.is_in_wishlist).toBe(true);

    api.deleteWishlistItem.mockResolvedValue({});
    await wrapper.vm.toggleWishlist(prod);
    expect(api.deleteWishlistItem).toHaveBeenCalledWith(prod.id);
    expect(prod.is_in_wishlist).toBe(false);
  });

  it('updateProductsPerPage змінює productsPerPage залежно від ширини вікна', () => {
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
    wrapper.vm.updateProductsPerPage();
    expect(wrapper.vm.productsPerPage).toBe(6);
    Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true });
    wrapper.vm.updateProductsPerPage();
    expect(wrapper.vm.productsPerPage).toBe(3);
  });

  it('updateVisibleProducts відображає правильні продукти для сторінки', () => {
    wrapper.vm.products = mockProducts;
    wrapper.vm.productsPerPage = 1;
    wrapper.vm.currentPage = 1;
    wrapper.vm.updateVisibleProducts();
    expect(wrapper.vm.visibleProducts).toEqual([mockProducts[1]]);
  });

  it('рендерить правильну кількість карточок відповідно до visibleProducts', () => {
    const cards = wrapper.findAll('article');
    expect(cards.length).toBe(wrapper.vm.visibleProducts.length);
  });

  it('рендерить правильну кількість зірок для рейтингу', () => {
    const first = wrapper.find('article');
    const fullStars = first.findAll('svg[fill="#FFD700"]');
    expect(fullStars.length).toBe(Math.round(mockProducts[0].rating));
  });

  it('рендерить кількість відгуків у дужках', () => {
    const firstCount = wrapper.find('article .text-sm');
    expect(firstCount.text()).toBe(`(${mockProducts[0].review_count})`);
  });

  it('showPreviousProducts зменшує currentPage, якщо не на першій сторінці', () => {
    wrapper.vm.currentPage = 1;
    wrapper.vm.showPreviousProducts();
    expect(wrapper.vm.currentPage).toBe(0);
    wrapper.vm.currentPage = 0;
    wrapper.vm.showPreviousProducts();
    expect(wrapper.vm.currentPage).toBe(0);
  });

  it('рендерить правильну кількість крапок пагінації', () => {
    const dots = wrapper.findAll('div.hidden.sm\\:flex span');
    expect(dots.length).toBe(wrapper.vm.totalPages);
  });

  it('toggleWishlist викликає api.addToWishlist для непозначеного продукту', async () => {
    const prod = wrapper.vm.visibleProducts[0];
    prod.is_in_wishlist = false;
    api.addToWishlist.mockResolvedValue({});
    await wrapper.vm.toggleWishlist(prod);
    expect(api.addToWishlist).toHaveBeenCalledWith({ product_id: prod.id });
    expect(prod.is_in_wishlist).toBe(true);
  });

  it('toggleWishlist викликає api.deleteWishlistItem для позначеного продукту', async () => {
    const prod = wrapper.vm.visibleProducts[0];
    prod.is_in_wishlist = true;
    api.deleteWishlistItem.mockResolvedValue({});
    await wrapper.vm.toggleWishlist(prod);
    expect(api.deleteWishlistItem).toHaveBeenCalledWith(prod.id);
    expect(prod.is_in_wishlist).toBe(false);
  });

  it('addToCart викликає api.addToCart з quantity=1', async () => {
    const prod = wrapper.vm.visibleProducts[0];
    api.addToCart.mockResolvedValue({});
    await wrapper.vm.addToCart(prod);
    expect(api.addToCart).toHaveBeenCalledWith({ product_id: prod.id, quantity: 1 });
  });

  it('fetchProducts логічно обробляє помилку API', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => { });
    api.getPopularProducts.mockRejectedValueOnce(new Error('Fail'));
    await wrapper.vm.fetchProducts();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Помилка при завантаженні популярних товарів:'), expect.any(Error));
    spy.mockRestore();
  });

  it('updateVisibleProducts працює для довшого масиву', () => {
    const many = [...Array(10)].map((_, i) => ({ id: i }));
    wrapper.vm.products = many;
    wrapper.vm.productsPerPage = 4;
    wrapper.vm.currentPage = 2;
    wrapper.vm.updateVisibleProducts();
    expect(wrapper.vm.visibleProducts).toEqual(many.slice(8, 12));
  });
});
