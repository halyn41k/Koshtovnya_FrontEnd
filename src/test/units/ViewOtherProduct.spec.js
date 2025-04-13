import { mount } from '@vue/test-utils';
import ViewOtherProduct from '../../components/ViewOtherProduct.vue';

jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('ViewOtherProduct.vue - Тестування іконки сердечка та стану наведення', () => {
  let wrapper;

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { id: 1, name: 'Product 1', price: 100, image_url: 'test-url-1', bead_producer_name: 'Producer 1', is_in_wishlist: false },
              { id: 2, name: 'Product 2', price: 200, image_url: '', bead_producer_name: 'Producer 2', is_in_wishlist: true },
            ],
          }),
      })
    );

    global.alert = jest.fn();

    jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
      if (key === 'token') return null;
      return null;
    });

    jest.spyOn(console, 'warn').mockImplementation(() => {});

    wrapper = mount(ViewOtherProduct, {
      global: {
        mocks: {
          $t: (msg) => msg,
        },
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
      },
    });
  });

  afterEach(() => {
    global.fetch.mockRestore();
    jest.restoreAllMocks();
    wrapper.unmount();
  });

  it('Рендерить заголовок із локалізованим текстом', () => {
    const title = wrapper.find('.specifications-title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Переглянути інші товари');
  });

  it('Кнопки навігації мають відповідні класи', () => {
    const leftArrow = wrapper.find('.left-arrow');
    const rightArrow = wrapper.find('.right-arrow');

    expect(leftArrow.exists()).toBe(true);
    expect(leftArrow.classes()).toContain('left-arrow');

    expect(rightArrow.exists()).toBe(true);
    expect(rightArrow.classes()).toContain('right-arrow');
  });

  it('Продукти мають відповідні класи', async () => {
    wrapper.setData({
      visibleProducts: [
        { id: 1, name: 'Product 1', price: 100, image_url: 'test-url-1', bead_producer_name: 'Producer 1', is_in_wishlist: false },
        { id: 2, name: 'Product 2', price: 200, image_url: 'test-url-2', bead_producer_name: 'Producer 2', is_in_wishlist: true },
      ],
    });
    await wrapper.vm.$nextTick();

    const productCards = wrapper.findAll('.product-card');
    expect(productCards.length).toBe(2);

    const firstProduct = productCards.at(0);
    expect(firstProduct.classes()).toContain('product-card');

    const buyButton = firstProduct.find('.buy-button');
    expect(buyButton.classes()).toContain('buy-button');
  });

  it('Перевіряє, чи правильно завантажуються зображення продуктів', async () => {
    wrapper.setData({
      visibleProducts: [
        { id: 1, name: 'Product 1', price: 100, image_url: 'test-url-1', bead_producer_name: 'Producer 1', is_in_wishlist: false },
        { id: 2, name: 'Product 2', price: 200, image_url: '', bead_producer_name: 'Producer 2', is_in_wishlist: true }, // Продукт без зображення
      ],
    });
    await wrapper.vm.$nextTick();

    const productCards = wrapper.findAll('.product-card');
    expect(productCards.length).toBe(2);

    // Перевіряємо перший продукт із зображенням
    const firstImage = productCards.at(0).find('img');
    expect(firstImage.exists()).toBe(true);
    expect(firstImage.attributes('src')).toBe('test-url-1'); // URL зображення
    expect(firstImage.attributes('alt')).toBe('Product 1'); // Альтернативний текст

    // Перевіряємо другий продукт без зображення
    const secondImage = productCards.at(1).find('img');
    expect(secondImage.exists()).toBe(true);
    expect(secondImage.attributes('src')).toBe(''); // Порожній URL
    expect(secondImage.attributes('alt')).toBe('Product 2'); // Альтернативний текст
  });

  it('Перевіряє, чи відображається альтернативний текст, якщо зображення відсутнє', async () => {
    wrapper.setData({
      visibleProducts: [
        { id: 2, name: 'Product 2', price: 200, image_url: '', bead_producer_name: 'Producer 2', is_in_wishlist: true }, // Продукт без зображення
      ],
    });
    await wrapper.vm.$nextTick();

    const productCard = wrapper.find('.product-card');
    const image = productCard.find('img');
    expect(image.exists()).toBe(true);
    expect(image.attributes('src')).toBe(''); // URL відсутній
    expect(image.attributes('alt')).toBe('Product 2'); // Альтернативний текст використовується
  });

  it('Логує попередження, якщо користувач не авторизований', async () => {
    await wrapper.vm.fetchWishlist();
    expect(console.warn).toHaveBeenCalledWith('Користувач не авторизований');
  });

  it('Перевіряє стилі іконки сердечка (заповнена/порожня)', async () => {
    wrapper.setData({
      visibleProducts: [
        { id: 1, name: 'Product 1', price: 100, image_url: 'test-url-1', bead_producer_name: 'Producer 1', is_in_wishlist: false },
        { id: 2, name: 'Product 2', price: 200, image_url: '', bead_producer_name: 'Producer 2', is_in_wishlist: true },
      ],
    });
    await wrapper.vm.$nextTick();

    const productCards = wrapper.findAll('.product-card');
    expect(productCards.length).toBe(2);

    // Перевіряємо перший продукт (порожнє сердечко)
    const firstWishlistIcon = productCards.at(0).find('.wishlist-icon');
    expect(firstWishlistIcon.exists()).toBe(true);
    const firstHeart = firstWishlistIcon.find('.empty-heart');
    expect(firstHeart.exists()).toBe(true); // Сердечко порожнє

    // Перевіряємо другий продукт (заповнене сердечко)
    const secondWishlistIcon = productCards.at(1).find('.wishlist-icon');
    expect(secondWishlistIcon.exists()).toBe(true);
    const secondHeart = secondWishlistIcon.find('.filled-heart');
    expect(secondHeart.exists()).toBe(true); // Сердечко заповнене
  });

  it('Перевіряє, чи викликається метод fetchProducts при монтуванні компонента', () => {
    // Створюємо шпигун для методу fetchProducts
    const fetchProductsSpy = jest.spyOn(ViewOtherProduct.methods, 'fetchProducts');
  
    // Монтуємо компонент
    wrapper = mount(ViewOtherProduct, {
      global: {
        mocks: {
          $t: (msg) => msg,
        },
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
      },
    });
  
    // Перевіряємо, чи викликаний метод fetchProducts
    expect(fetchProductsSpy).toHaveBeenCalled();
  
    // Очищуємо шпигун
    fetchProductsSpy.mockRestore();
  });
  
  it('Перевіряє перенаправлення на сторінку логіну, якщо користувач не авторизований', async () => {
    // Мок для $router.push
    const pushMock = jest.fn();
    wrapper = mount(ViewOtherProduct, {
      global: {
        mocks: {
          $t: (msg) => msg,
          $router: { push: pushMock }, // Мокаємо $router
        },
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
      },
    });
  
    // Додаємо продукт для перевірки взаємодії
    wrapper.setData({
      visibleProducts: [
        { id: 1, name: 'Product 1', price: 100, image_url: 'test-url-1', bead_producer_name: 'Producer 1', is_in_wishlist: false },
      ],
    });
    await wrapper.vm.$nextTick();
  
    const productCard = wrapper.find('.product-card');
    const wishlistIcon = productCard.find('.wishlist-icon');
  
    // Мокаємо localStorage.getItem, щоб повертав null
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);
  
    // Викликаємо toggleWishlist
    await wishlistIcon.trigger('click');
  
    // Перевіряємо, чи було перенаправлення на логін
    expect(pushMock).toHaveBeenCalledWith('/login');
  
    // Очищуємо моки
    jest.restoreAllMocks();
  });

  it('Перевіряє поведінку компонента без токена', async () => {
    // Мокаємо localStorage.getItem, щоб повертав null
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);
  
    // Викликаємо метод fetchWishlist
    await wrapper.vm.fetchWishlist();
  
    // Перевіряємо, чи було згенеровано попередження
    expect(console.warn).toHaveBeenCalledWith('Користувач не авторизований');
  
    // Перевіряємо, що список бажаного порожній
    expect(wrapper.vm.wishlist).toEqual([]);
  
    // Очищуємо моки
    jest.restoreAllMocks();
  });

  it('Перевіряє кількість точок у dots-container та активну точку', async () => {
    // Мокаємо продукти, щоб було кілька сторінок
    wrapper.setData({
      products: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        price: (i + 1) * 100,
        image_url: `test-url-${i + 1}`,
        bead_producer_name: `Producer ${i + 1}`,
        is_in_wishlist: false,
      })),
      currentPage: 1, // Встановлюємо поточну сторінку
      productsPerPage: 3, // Кількість продуктів на сторінку
    });
    
    // Оновлюємо totalPages вручну
    wrapper.setData({
      totalPages: Math.ceil(wrapper.vm.products.length / wrapper.vm.productsPerPage),
    });
    
    await wrapper.vm.$nextTick();
  
    // Розраховуємо загальну кількість сторінок
    const totalPages = wrapper.vm.totalPages;
  
    // Перевіряємо кількість точок
    const dots = wrapper.findAll('.dot');
    expect(dots.length).toBe(totalPages);
  
    // Перевіряємо, чи активна точка відповідає currentPage
    dots.forEach((dot, index) => {
      if (index === wrapper.vm.currentPage) {
        expect(dot.classes()).toContain('dark'); // Активна точка має клас 'dark'
      } else {
        expect(dot.classes()).toContain('light'); // Неактивна точка має клас 'light'
      }
    });
  });

  it('Перевіряє, чи здійснюється запит на правильний URL', async () => {
    // Мокаємо глобальний fetch
    const mockFetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
    );
    global.fetch = mockFetch;

    await wrapper.vm.fetchProducts();

    expect(mockFetch).toHaveBeenCalledWith('https://koshtovnya.api-dev.bmax-edu.website/api/popular-products');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Очищення мока
    global.fetch.mockRestore();
  });

  it('Перевіряє, чи надсилається правильний токен у заголовку при запиті до /api/wishlist', async () => {
    // Мокаємо axios.get
    const axiosMock = require('axios');
    const token = 'test-token';
  
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
      if (key === 'token') return token; // Симулюємо наявність токена
      return null;
    });
  
    axiosMock.get.mockResolvedValueOnce({
      data: {
        products: [
          { id: 1, name: 'Product 1' },
          { id: 2, name: 'Product 2' },
        ],
      },
    });
  
    await wrapper.vm.fetchWishlist();
  
    // Перевіряємо, що запит виконувався з правильними заголовками
    expect(axiosMock.get).toHaveBeenCalledWith('https://koshtovnya.api-dev.bmax-edu.website/api/wishlist', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    // Очищуємо моки
    jest.restoreAllMocks();
  });

  it('Перевіряє, чи синхронізується wishlist зі списком продуктів', async () => {
    // Мокаємо axios.get
    const axiosMock = require('axios');
  
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
      if (key === 'token') return 'test-token'; // Симулюємо наявність токена
      return null;
    });
  
    // Мокаємо список бажаного
    axiosMock.get.mockResolvedValueOnce({
      data: {
        products: [
          { id: 1, name: 'Product 1' }, // Продукт із wishlist
        ],
      },
    });
  
    // Мокаємо продукти
    wrapper.setData({
      products: [
        { id: 1, name: 'Product 1', is_in_wishlist: false }, // Має бути в wishlist
        { id: 2, name: 'Product 2', is_in_wishlist: false }, // Не має бути в wishlist
      ],
    });
  
    await wrapper.vm.fetchWishlist();
  
    // Перевіряємо синхронізацію стану wishlist
    expect(wrapper.vm.wishlist).toEqual([1]); // ID продукту у wishlist
    expect(wrapper.vm.products[0].is_in_wishlist).toBe(true); // Продукт 1 має бути позначений у wishlist
    expect(wrapper.vm.products[1].is_in_wishlist).toBe(false); // Продукт 2 не має бути позначений у wishlist
  
    // Очищуємо моки
    jest.restoreAllMocks();
  });

  it('Перевіряє, чи правильно передається product_id у запиті POST до /api/wishlist', async () => {
    // Мокаємо axios.post
    const axiosMock = require('axios');
    axiosMock.post = jest.fn().mockResolvedValueOnce({}); // Успішна відповідь на POST
  
    // Мокаємо localStorage
    const token = 'test-token';
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
      if (key === 'token') return token;
      return null;
    });
  
    // Додаємо продукт до wishlist
    const product = { id: 1, name: 'Product 1', is_in_wishlist: false };
    await wrapper.vm.toggleWishlist(product);
  
    // Перевіряємо, чи був викликаний POST із правильними параметрами
    expect(axiosMock.post).toHaveBeenCalledWith(
      'https://koshtovnya.api-dev.bmax-edu.website/api/wishlist',
      { product_id: 1 }, // product_id має бути переданий
      {
        headers: {
          Authorization: `Bearer ${token}`, // Заголовок з токеном
        },
      }
    );
  
    // Перевіряємо, що продукт оновлений як доданий до wishlist
    expect(product.is_in_wishlist).toBe(true);
  
    // Очищуємо моки
    jest.restoreAllMocks();
  });  
});
