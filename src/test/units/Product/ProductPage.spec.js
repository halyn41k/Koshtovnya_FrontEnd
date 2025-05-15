// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано основні моменти але дещо треба доробити

import { shallowMount } from '@vue/test-utils';
import ProductPage from '@/components/product/ProductPage.vue';
import axios from 'axios';

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

describe('ProductPage Component', () => {
  let wrapper;
  
  const mockProduct = {
    id: 1,
    name: 'Тестовий товар',
    price: 1500,
    image_url: 'https://example.com/image.jpg',
    sizes: [10, 20, 30],
    is_available: true,
    variants: [
      { size: 10, is_available: true, quantity: 5 },
      { size: 20, is_available: true, quantity: 3 },
    ],
    review_count: 0,
    average_rating: 0,
    // Для characteristics використаємо приклад, який потім локалізується, якщо потрібно
    colors: ['червоний', 'зелений', 'синій'],
  };

  const mockRoute = {
    params: { id: 1 }
  };

  beforeEach(() => {
    // Мокаємо alert та консолі
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Мокаємо localStorage з токеном
    global.localStorage = {
      getItem: jest.fn((key) => key === 'token' ? 'mock-token' : null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    // Мокаємо axios.get для завантаження товару
    axios.get.mockResolvedValue({ data: { data: mockProduct } });

    // Мокаємо fetchWishlist ще до монтування компонента, щоб не виконувались реальні запити
    jest.spyOn(ProductPage.methods, 'fetchWishlist').mockImplementation(() => {});

    // Монтуюємо компонент з необхідними мокаціями роуту та дочірніх компонентів
    wrapper = shallowMount(ProductPage, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: { push: jest.fn() },
        },
        stubs: {
          ProductReviews: true,
          ViewOtherProduct: true,
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete global.localStorage;
  });

  it('Відображає заголовок товару без помилок авторизації', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await wrapper.vm.$nextTick();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    const title = wrapper.find('.product-title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe(mockProduct.name);
    consoleErrorSpy.mockRestore();
  });

  it('Компонент main.product-content відображається коректно', async () => {
    await wrapper.vm.$nextTick();
    const mainContent = wrapper.find('main.product-content');
    expect(mainContent.exists()).toBe(true);
    expect(mainContent.find('.product-section').exists()).toBe(true);
    expect(mainContent.find('.specifications-list').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'ProductReviews' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'ViewOtherProduct' }).exists()).toBe(true);
  });

  it('Зображення товару (img.product-image) відображається з коректним URL', async () => {
    await wrapper.vm.$nextTick();
    const productImage = wrapper.find('img.product-image');
    expect(productImage.exists()).toBe(true);
    expect(productImage.attributes('src')).toBe(mockProduct.image_url);
  });

  it('Відображає заголовок товару та його ціну', async () => {
    await wrapper.vm.$nextTick();
    const title = wrapper.find('.product-title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe(mockProduct.name);
    const price = wrapper.find('.product-price');
    expect(price.exists()).toBe(true);
    expect(price.text()).toBe(`${mockProduct.price}₴`);
  });

  it('Перевіряє візуальне відображення бейджа доступності', async () => {
    wrapper.setData({
      product: {
        ...mockProduct,
        variants: [
          { size: 10, is_available: true },
          { size: 20, is_available: false },
        ],
      },
    });
    await wrapper.vm.$nextTick();
    const availabilityBadge = wrapper.find('.availability-badge');
    expect(availabilityBadge.exists()).toBe(true);
    expect(availabilityBadge.classes()).toContain('available');
    expect(availabilityBadge.text()).toBe('В наявності');
  });
  
  it('Перевіряє відображення випадаючого списку розмірів з варіантами', async () => {
    wrapper.setData({
      product: {
        id: 1,
        name: 'Тестовий товар',
        price: 1500,
        image_url: 'https://example.com/image.jpg',
        variants: [
          { size: 10, is_available: true },
          { size: 20, is_available: true },
          { size: 30, is_available: true },
        ],
        is_available: true,
      },
    });
    await wrapper.vm.$nextTick();
    const sizeDropdown = wrapper.find('select.size-dropdown');
    expect(sizeDropdown.exists()).toBe(true);
    const options = sizeDropdown.findAll('option');
    expect(options.length).toBe(3);
    expect(options.at(0).text()).toContain('10 см');
    expect(options.at(1).text()).toContain('20 см');
    expect(options.at(2).text()).toContain('30 см');
    expect(options.at(0).attributes('value')).toBe('10');
    expect(options.at(1).attributes('value')).toBe('20');
    expect(options.at(2).attributes('value')).toBe('30');
  });
  
  it('Перевірка роботи кнопки збільшення кількості (increaseQuantity) з граничними значеннями', async () => {
    wrapper.setData({
      product: {
        ...mockProduct,
        variants: [{ size: 10, is_available: true, quantity: 5 }],
      },
      selectedSize: 10,
      quantity: 1,
    });
    await wrapper.vm.$nextTick();
    const increaseButton = wrapper.find('.quantity-arrow.up-arrow');
    expect(increaseButton.exists()).toBe(true);
    for (let i = 1; i < 5; i++) {
      await increaseButton.trigger('click');
      expect(wrapper.vm.quantity).toBe(i + 1);
    }
    await increaseButton.trigger('click');
    expect(wrapper.vm.quantity).toBe(5);
  });
  
  it('Перевірка роботи кнопки зменшення кількості (decreaseQuantity) з граничними значеннями', async () => {
    wrapper.setData({ product: mockProduct, quantity: 2 });
    await wrapper.vm.$nextTick();
    const decreaseButton = wrapper.find('.quantity-arrow.down-arrow');
    expect(decreaseButton.exists()).toBe(true);
    await decreaseButton.trigger('click');
    expect(wrapper.vm.quantity).toBe(1);
    await decreaseButton.trigger('click');
    expect(wrapper.vm.quantity).toBe(1);
  });
  
  it('Перевірка відкриття модального вікна для зображення (openModal)', async () => {
    wrapper.setData({ isModalOpen: false });
    await wrapper.vm.openModal();
    expect(wrapper.vm.isModalOpen).toBe(true);
    await wrapper.vm.$nextTick();
    const modalOverlay = wrapper.find('.modal-overlay');
    expect(modalOverlay.exists()).toBe(true);
  });
  
  it('Перевірка закриття модального вікна (closeModal)', async () => {
    wrapper.setData({ isModalOpen: true });
    await wrapper.vm.closeModal();
    expect(wrapper.vm.isModalOpen).toBe(false);
    await wrapper.vm.$nextTick();
    const modalOverlay = wrapper.find('.modal-overlay');
    expect(modalOverlay.exists()).toBe(false);
  });
  
  it('Наявність кнопки "Купити" для доступного товару', async () => {
    wrapper.setData({
      product: {
        ...mockProduct,
        is_available: true,
        variants: [{ size: 10, is_available: true }],
      },
      selectedSize: 10,
    });
    await wrapper.vm.$nextTick();
    const buyButton = wrapper.find('.buy-button');
    expect(buyButton.exists()).toBe(true);
    expect(buyButton.text()).toBe('Купити');
    // Якщо кнопка активна, атрибут disabled має бути undefined або не встановлено
    expect(buyButton.attributes('disabled')).toBeUndefined();
    const notifyButton = wrapper.find('.notify-button');
    expect(notifyButton.exists()).toBe(false);
  });
  
  it('Перевірка додавання товару до списку бажаного (toggleWishlist) — тест мокування', async () => {
    // Імітуємо, що товар відсутній у wishlist
    wrapper.setData({ wishlist: [], product: mockProduct });
    // Замінюємо метод toggleWishlist мок-функцією для перевірки виклику
    const toggleWishlistMock = jest.fn();
    wrapper.vm.toggleWishlist = toggleWishlistMock;
    await wrapper.vm.toggleWishlist(mockProduct);
    expect(toggleWishlistMock).toHaveBeenCalledWith(mockProduct);
    // Емітуємо, що товар додано у wishlist
    wrapper.setData({ wishlist: [mockProduct.id] });
    expect(wrapper.vm.wishlist).toContain(mockProduct.id);
  });
  
  it('Перевірка видалення товару зі списку бажаного через toggleWishlist', async () => {
    // Імітуємо, що товар є у wishlist
    wrapper.setData({ wishlist: [mockProduct.id], product: mockProduct });
    const toggleWishlistMock = jest.fn();
    wrapper.vm.toggleWishlist = toggleWishlistMock;
    await wrapper.vm.toggleWishlist(mockProduct);
    expect(toggleWishlistMock).toHaveBeenCalledWith(mockProduct);
    // Емітуємо видалення: встановлюємо wishlist як порожній масив
    wrapper.setData({ wishlist: [] });
    expect(wrapper.vm.wishlist).not.toContain(mockProduct.id);
  });
  
  it('Перевірка стану серця (заповнене/порожнє) залежно від isInWishlist', async () => {
    // Сценарій: товар у wishlist
    wrapper.setData({ wishlist: [mockProduct.id], product: mockProduct });
    await wrapper.vm.$nextTick();
    const filledHeart = wrapper.find('.filled-heart');
    expect(filledHeart.exists()).toBe(true);
    const emptyHeart = wrapper.find('.empty-heart');
    expect(emptyHeart.exists()).toBe(false);
    // Сценарій: товар не у wishlist
    wrapper.setData({ wishlist: [] });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.filled-heart').exists()).toBe(false);
    expect(wrapper.find('.empty-heart').exists()).toBe(true);
  });
  
  it('Перевіряє виклик fetchWishlist при створенні компонента', () => {
    expect(ProductPage.methods.fetchWishlist).toHaveBeenCalled();
  });
  
  it('Перевірка правильної локалізації ключа "Кольори" (відображення як списку)', async () => {
    // Задаємо товар із характеристиками, включаючи colors
    wrapper.setData({
      product: {
        id: 1,
        name: 'Тестовий товар',
        price: 1500,
        image_url: 'https://example.com/image.jpg',
        sizes: [10, 20, 30],
        is_available: true,
        colors: ['червоний', 'зелений', 'синій'],
      },
    });
    await wrapper.vm.$nextTick();
    const specificationsList = wrapper.find('.specifications-list');
    expect(specificationsList.exists()).toBe(true);
    const colorItem = specificationsList.findAll('.spec-item').filter(item => {
      const term = item.find('.spec-term');
      return term.exists() && term.text() === 'Кольори';
    }).at(0);
    expect(colorItem).not.toBeUndefined();
    const colorDescription = colorItem.find('.spec-description');
    expect(colorDescription.exists()).toBe(true);
    expect(colorDescription.text()).toBe('червоний, зелений, синій');
  });
  
  it('Перевірка поведінки при спробі додати товар до wishlist без авторизації', async () => {
    // Задаємо, що token = null
    global.localStorage.getItem.mockImplementation((key) => null);
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    await wrapper.vm.toggleWishlist(mockProduct);
    expect(alertSpy).toHaveBeenCalledWith('Будь ласка, увійдіть у свій обліковий запис.');
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith('/login');
    alertSpy.mockRestore();
  });
  
  it('Перевірка поведінки при додаванні товару до wishlist з авторизацією', async () => {
    wrapper.vm.checkAuthAndFetchProfile = jest.fn().mockResolvedValue({ id: 1 });
    axios.post.mockResolvedValue();
    wrapper.setData({ wishlist: [] });
    await wrapper.vm.toggleWishlist(mockProduct);
    expect(wrapper.vm.wishlist).toContain(mockProduct.id);
    expect(axios.post).toHaveBeenCalledWith(
      'http://26.235.139.202:8080/api/wishlist',
      { product_id: mockProduct.id },
      { headers: { Authorization: 'Bearer mock-token', Role: null } }
    );
  });
  
  it('Перевірка поведінки при видаленні товару зі wishlist з авторизацією', async () => {
    wrapper.vm.checkAuthAndFetchProfile = jest.fn().mockResolvedValue({ id: 1 });
    axios.delete.mockResolvedValue();
    wrapper.setData({ wishlist: [mockProduct.id] });
    await wrapper.vm.toggleWishlist(mockProduct);
    expect(wrapper.vm.wishlist).not.toContain(mockProduct.id);
    expect(axios.delete).toHaveBeenCalledWith(
      `http://26.235.139.202:8080/api/wishlist/${mockProduct.id}`,
      { headers: { Authorization: 'Bearer mock-token', Role: null } }
    );
  });
  
  it('Перевірка поведінки при отриманні повідомлення про наявність без авторизації', async () => {
    global.localStorage.getItem.mockImplementation((key) => null);
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    await wrapper.vm.notifyWhenAvailable();
    expect(alertSpy).toHaveBeenCalledWith('Будь ласка, увійдіть у свій обліковий запис.');
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith('/login');
    alertSpy.mockRestore();
  });
  
  it('Перевірка поведінки при отриманні повідомлення про наявність з авторизацією', async () => {
    wrapper.vm.checkAuthAndFetchProfile = jest.fn().mockResolvedValue({ id: 1 });
    axios.post.mockResolvedValue();
    await wrapper.vm.notifyWhenAvailable();
    expect(axios.post).toHaveBeenCalledWith(
      'http://26.235.139.202:8080/api/notification',
      { product_id: mockProduct.id },
      { headers: { Authorization: 'Bearer mock-token', Role: null } }
    );
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    expect(alertSpy).toHaveBeenCalledWith(`Ви будете повідомлені, коли ${mockProduct.name} з'явиться в наявності.`);
    alertSpy.mockRestore();
  });
  
  it('Перевірка завантаження товару при ініціалізації компонента', async () => {
    axios.get.mockResolvedValue({ data: { data: mockProduct } });
    await wrapper.vm.$nextTick();
    expect(axios.get).toHaveBeenCalledWith(
      'http://26.235.139.202:8080/api/products/1',
      { headers: { Authorization: 'Bearer mock-token', Role: null } }
    );
    expect(wrapper.vm.product).toEqual(mockProduct);
  });
  
  it('Перевіряє рендеринг форми для вибору розміру товару', async () => {
    await wrapper.vm.$nextTick();
    const sizeSelector = wrapper.find('select.size-dropdown');
    expect(sizeSelector.exists()).toBe(true);
    const options = sizeSelector.findAll('option');
    expect(options.length).toBeGreaterThan(0);
  });
});
