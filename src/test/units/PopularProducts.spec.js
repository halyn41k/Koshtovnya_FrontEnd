import { mount } from '@vue/test-utils';
import PopularProducts from '../../components/home/PopularProducts.vue';

jest.mock('axios', () => ({
  get: jest.fn(),
}));

// Стаб для глобального fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        data: [
          { id: 1, name: 'Product 1', price: 100, image_url: 'test-url-1', bead_producer_name: 'Producer 1', is_in_wishlist: false },
          { id: 2, name: 'Product 2', price: 200, image_url: 'test-url-2', bead_producer_name: 'Producer 2', is_in_wishlist: true },
        ],
      }),
  })
);

describe('PopularProducts.vue', () => {
  let wrapper;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    // Мок для localStorage
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
      if (key === 'token') return null; // Симулюємо відсутність токена
      return null;
    });
  
    // Мок для console.warn
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  
    // Мок для window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  
    // Замоканий fetch для уникнення конфліктів
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { id: 1, name: 'Product 1', price: 100, image_url: 'test-url-1', bead_producer_name: 'Producer 1', is_in_wishlist: false },
              { id: 2, name: 'Product 2', price: 200, image_url: 'test-url-2', bead_producer_name: 'Producer 2', is_in_wishlist: true },
            ],
          }),
      })
    );
  
    // Ініціалізація компоненту
    wrapper = mount(PopularProducts, {
      global: {
        mocks: {
          $t: (msg) => msg, // Мок для i18n
          $router: { push: jest.fn() }, // Мок для $router
        },
        stubs: {
          'router-link': {
            template: '<a><slot /></a>', // Рендеринг внутрішнього контенту
          },
        },
      },
    });
  });

  afterEach(() => {
    // Очищення моків
    jest.restoreAllMocks(); // Відновлюємо оригінальні методи
    jest.clearAllMocks();   // Очищення всіх моків
    global.fetch.mockRestore(); // Відновлення оригінального fetch
    wrapper.unmount(); // Демонтаж компоненту
  });

  it('Рендерить заголовок секції', () => {
    const sectionTitle = wrapper.find('.section-title');
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.text()).toBe('popularGoods');
  });

  it('Рендерить кнопки для навігації продуктів', () => {
    const leftArrow = wrapper.find('.left-arrow');
    const rightArrow = wrapper.find('.right-arrow');
    expect(leftArrow.exists()).toBe(true);
    expect(leftArrow.attributes('alt')).toBe('left-arrow');
    expect(rightArrow.exists()).toBe(true);
    expect(rightArrow.attributes('alt')).toBe('right-arrow');
  });

  it('Коректно рендерить продукти з API', async () => {
    // Очікуємо завершення завантаження продуктів
    await wrapper.vm.$nextTick();

    const productCards = wrapper.findAll('.product-card');
    expect(productCards.length).toBe(2);

    // Перевірка даних першого продукту
    const firstProduct = productCards.at(0);
    expect(firstProduct.find('.product-name').text()).toBe('Product 1');
    expect(firstProduct.find('.product-price').text()).toBe('100 грн');
    expect(firstProduct.find('img').attributes('src')).toBe('test-url-1');
    expect(firstProduct.find('.product-material').text()).toBe('Producer 1');
    expect(firstProduct.find('.empty-heart').exists()).toBe(true); // Продукт не у списку бажаного

    // Перевірка даних другого продукту
    const secondProduct = productCards.at(1);
    expect(secondProduct.find('.product-name').text()).toBe('Product 2');
    expect(secondProduct.find('.product-price').text()).toBe('200 грн');
    expect(secondProduct.find('img').attributes('src')).toBe('test-url-2');
    expect(secondProduct.find('.product-material').text()).toBe('Producer 2');
    expect(secondProduct.find('.filled-heart').exists()).toBe(true); // Продукт у списку бажаного
  });

  it('Рендерить коректну кількість "крапок" для сторінок', async () => {
    await wrapper.vm.$nextTick();

    const dots = wrapper.findAll('.dot');
    expect(dots.length).toBe(wrapper.vm.totalPages);
  });

  it('Перевіряє інтерактивність кнопки wishlist', async () => {
    await wrapper.vm.$nextTick();

    const secondProduct = wrapper.findAll('.product-card').at(1);
    const wishlistIcon = secondProduct.find('.wishlist-icon');

    expect(wishlistIcon.exists()).toBe(true);
    await wishlistIcon.trigger('click');

    // Перевірка alert
    expect(window.alert).toHaveBeenCalledWith('Будь ласка, увійдіть у свій обліковий запис.');

    // Перевірка перенаправлення
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith('/login');
  });

  it('Рендерить кнопку "купити" для кожного продукту', async () => {
    await wrapper.vm.$nextTick();

    const productCards = wrapper.findAll('.product-card');
    productCards.forEach((productCard) => {
      const buyButton = productCard.find('.buy-button');
      expect(buyButton.exists()).toBe(true);
      expect(buyButton.text()).toContain('buyButton');
    });
  });

  it('Перевіряє коректне відображення динамічних даних продуктів', async () => {
    // Очікуємо завершення завантаження продуктів
    await wrapper.vm.$nextTick();
  
    const productCards = wrapper.findAll('.product-card');
    expect(productCards.length).toBe(2); // Перевіряємо кількість продуктів
  
    const expectedData = [
      {
        name: 'Product 1',
        price: '100 грн',
        image_url: 'test-url-1',
        bead_producer_name: 'Producer 1',
      },
      {
        name: 'Product 2',
        price: '200 грн',
        image_url: 'test-url-2',
        bead_producer_name: 'Producer 2',
      },
    ];
  
    productCards.forEach((productCard, index) => {
      const productData = expectedData[index];
  
      // Перевіряємо назву продукту
      expect(productCard.find('.product-name').text()).toBe(productData.name);
  
      // Перевіряємо ціну продукту
      expect(productCard.find('.product-price').text()).toBe(productData.price);
  
      // Перевіряємо зображення продукту
      expect(productCard.find('img').attributes('src')).toBe(productData.image_url);
  
      // Перевіряємо виробника продукту
      expect(productCard.find('.product-material').text()).toBe(productData.bead_producer_name);
    });
  });

  it('Перевіряє рендеринг продуктів залежно від поточної сторінки', async () => {
    // Очікуємо завантаження продуктів
    await wrapper.vm.$nextTick();
  
    // Налаштовуємо сторінки вручну для тестування
    wrapper.vm.productsPerPage = 1; // Кількість продуктів на сторінку
    wrapper.vm.totalPages = Math.ceil(wrapper.vm.products.length / wrapper.vm.productsPerPage);
  
    // Оновлюємо видимі продукти для першої сторінки
    wrapper.vm.currentPage = 0;
    wrapper.vm.updateVisibleProducts();
    await wrapper.vm.$nextTick();
  
    // Перевіряємо рендеринг продукту на першій сторінці
    let productCards = wrapper.findAll('.product-card');
    expect(productCards.length).toBe(1);
    expect(productCards.at(0).find('.product-name').text()).toBe('Product 1');
  
    // Переходимо на другу сторінку
    wrapper.vm.currentPage = 1;
    wrapper.vm.updateVisibleProducts();
    await wrapper.vm.$nextTick();
  
    // Перевіряємо рендеринг продукту на другій сторінці
    productCards = wrapper.findAll('.product-card');
    expect(productCards.length).toBe(1);
    expect(productCards.at(0).find('.product-name').text()).toBe('Product 2');
  });
  
  it('Перевіряє рендеринг іконки wishlist залежно від is_in_wishlist', async () => {
    // Очікуємо завершення завантаження продуктів
    await wrapper.vm.$nextTick();
  
    const productCards = wrapper.findAll('.product-card');
    expect(productCards.length).toBe(2); // Перевіряємо кількість продуктів
  
    // Перевіряємо перший продукт
    const firstProduct = productCards.at(0);
    const firstWishlistIconFilled = firstProduct.find('.filled-heart');
    const firstWishlistIconEmpty = firstProduct.find('.empty-heart');
  
    expect(firstWishlistIconFilled.exists()).toBe(false); // Серце не заповнене
    expect(firstWishlistIconEmpty.exists()).toBe(true); // Серце порожнє
  
    // Перевіряємо другий продукт
    const secondProduct = productCards.at(1);
    const secondWishlistIconFilled = secondProduct.find('.filled-heart');
    const secondWishlistIconEmpty = secondProduct.find('.empty-heart');
  
    expect(secondWishlistIconFilled.exists()).toBe(true); // Серце заповнене
    expect(secondWishlistIconEmpty.exists()).toBe(false); // Серце не порожнє
  });
  
  it('Оновлює видимі продукти після натискання на стрілки', async () => {
    // Очікуємо завантаження продуктів
    await wrapper.vm.$nextTick();
  
    // Налаштування тестових даних
    wrapper.vm.productsPerPage = 1; // Відображати по одному продукту на сторінку
    wrapper.vm.totalPages = Math.ceil(wrapper.vm.products.length / wrapper.vm.productsPerPage);
    wrapper.vm.currentPage = 0; // Починаємо з першої сторінки
    wrapper.vm.updateVisibleProducts();
    await wrapper.vm.$nextTick();
  
    // Перевіряємо початкові дані
    let productCards = wrapper.findAll('.product-card');
    expect(productCards.length).toBe(1);
    expect(productCards.at(0).find('.product-name').text()).toBe('Product 1');
  
    // Імітуємо клік по правій стрілці
    const rightArrow = wrapper.find('.right-arrow');
    await rightArrow.trigger('click');
    await wrapper.vm.$nextTick();
  
    // Перевіряємо оновлення продуктів на другій сторінці
    productCards = wrapper.findAll('.product-card');
    expect(productCards.length).toBe(1);
    expect(productCards.at(0).find('.product-name').text()).toBe('Product 2');
  
    // Імітуємо клік по лівій стрілці
    const leftArrow = wrapper.find('.left-arrow');
    await leftArrow.trigger('click');
    await wrapper.vm.$nextTick();
  
    // Перевіряємо повернення до першої сторінки
    productCards = wrapper.findAll('.product-card');
    expect(productCards.length).toBe(1);
    expect(productCards.at(0).find('.product-name').text()).toBe('Product 1');
  });
  
  it('Викликає метод toggleWishlist і оновлює стан продукту при кліку по "серцю"', async () => {
    // Очікуємо завантаження продуктів
    await wrapper.vm.$nextTick();
  
    // Отримуємо другий продукт
    const secondProduct = wrapper.findAll('.product-card').at(1);
    const wishlistIcon = secondProduct.find('.wishlist-icon');
  
    // Створюємо мок для методу toggleWishlist
    wrapper.vm.toggleWishlist = jest.fn();
    await wrapper.vm.$nextTick();
  
    // Імітуємо клік по іконці "серце"
    await wishlistIcon.trigger('click');
    await wrapper.vm.$nextTick();
  
    // Перевіряємо, що викликаний метод toggleWishlist
    expect(wrapper.vm.toggleWishlist).toHaveBeenCalledWith(wrapper.vm.visibleProducts[1]);
  });
  
  it('Викликає API і правильно обробляє відповідь', async () => {
    // Моковані дані відповіді API через fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { id: 1, name: 'Product 1', price: 100, image_url: 'test-url-1', bead_producer_name: 'Producer 1', is_in_wishlist: false },
              { id: 2, name: 'Product 2', price: 200, image_url: 'test-url-2', bead_producer_name: 'Producer 2', is_in_wishlist: true },
            ],
          }),
      })
    );
  
    // Встановлюємо productsPerPage на 2, щоб відповідало кількості продуктів у стабі
    wrapper.vm.productsPerPage = 2;
  
    // Викликаємо fetchProducts
    await wrapper.vm.fetchProducts();
  
    // Перевіряємо, що fetch був викликаний з правильним URL
    expect(global.fetch).toHaveBeenCalledWith('https://koshtovnya.api-dev.bmax-edu.website/api/popular-products?page=1');
  
    // Перевіряємо, чи дані API збережено у змінну products
    expect(wrapper.vm.products).toEqual([
      { id: 1, name: 'Product 1', price: 100, image_url: 'test-url-1', bead_producer_name: 'Producer 1', is_in_wishlist: false },
      { id: 2, name: 'Product 2', price: 200, image_url: 'test-url-2', bead_producer_name: 'Producer 2', is_in_wishlist: true },
    ]);
  
    // Перевіряємо кількість видимих продуктів після обробки
    expect(wrapper.vm.visibleProducts.length).toBe(wrapper.vm.productsPerPage);
  });  
  
});
