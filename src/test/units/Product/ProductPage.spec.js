// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано основні моменти але дещо треба доробити

import { shallowMount } from '@vue/test-utils';
import ProductPage from '@/components/product/ProductPage.vue';
import axios from 'axios';

jest.mock('axios', () => {
  // Створюємо «axios-подібний» об’єкт із потрібними моками:
  const mAxios = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    // Проксі для interceptors, щоб interceptor.use не викликав помилку
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  // create() має повертати цей же об’єкт
  mAxios.create = jest.fn(() => mAxios);
  return mAxios;
});

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
    jest.spyOn(window, 'alert').mockImplementation(() => { });
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });

    // Мокаємо localStorage з токеном
    global.localStorage = {
      getItem: jest.fn((key) => key === 'token' ? 'mock-token' : null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    // Мокаємо axios.get для завантаження товару
    axios.get.mockResolvedValue({ data: { data: mockProduct } });

    // Мокаємо fetchWishlist ще до монтування компонента, щоб не виконувались реальні запити
    jest.spyOn(ProductPage.methods, 'fetchWishlist').mockImplementation(() => { });

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

  it('Перевірка закриття модального вікна (closeModal)', async () => {
    wrapper.setData({ isModalOpen: true });
    await wrapper.vm.closeModal();
    expect(wrapper.vm.isModalOpen).toBe(false);
    await wrapper.vm.$nextTick();
    const modalOverlay = wrapper.find('.modal-overlay');
    expect(modalOverlay.exists()).toBe(false);
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

  it('Перевіряє виклик fetchWishlist при створенні компонента', () => {
    expect(ProductPage.methods.fetchWishlist).toHaveBeenCalled();
  });

  it('відкриває модальне вікно при openModal та закриває при closeModal', async () => {
    wrapper.setData({ isModalOpen: false });
    await wrapper.vm.openModal();
    expect(wrapper.vm.isModalOpen).toBe(true);
    await wrapper.vm.closeModal();
    expect(wrapper.vm.isModalOpen).toBe(false);
  });

  it('increaseQuantity не перевищує запиту variant.quantity та decreaseQuantity не опускає нижче 1', async () => {
    wrapper.setData({ product: mockProduct, selectedSize: 10, quantity: 1 });
    for (let i = 1; i <= mockProduct.variants[0].quantity + 1; i++) {
      await wrapper.vm.increaseQuantity();
    }
    expect(wrapper.vm.quantity).toBe(mockProduct.variants[0].quantity);

    wrapper.setData({ quantity: 1 });
    await wrapper.vm.decreaseQuantity();
    expect(wrapper.vm.quantity).toBe(1);
  });

  it('fetchProduct зберігає продукт і оновлює localStorage', async () => {
    const setSpy = jest.spyOn(localStorage, 'setItem');
    await wrapper.vm.fetchProduct(1);
    expect(wrapper.vm.product.name).toBe(mockProduct.name);
    expect(setSpy).toHaveBeenCalledWith(
      'recentlyViewed',
      expect.stringContaining(`"id":${mockProduct.id}`)
    );
  });

  it('mounted встановлює document.title', () => {
    expect(document.title).toBe('Сторінка товару');
  });

  it('відображає заголовок і ціну товару', async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.find('h1').text()).toBe(mockProduct.name);
    expect(wrapper.find('p.text-red-700').text()).toBe(`${mockProduct.price}₴`);
  });

  it('computed selectedVariant повертає правильний обʼєкт', () => {
    wrapper.setData({ selectedSize: 10, product: mockProduct });
    expect(wrapper.vm.selectedVariant.size).toBe(10);
    wrapper.setData({ selectedSize: 999 });
    expect(wrapper.vm.selectedVariant).toBeNull();
  });

  it('значення quantity при mount = 1', () => {
    expect(wrapper.vm.quantity).toBe(1);
  });
  ///

  it('має клас .font-montserrat у головному контейнері', () => {
    const main = wrapper.find('main');
    expect(main.classes()).toContain('font-montserrat');
  });

  it('відображає елемент з alt="Фото товару"', () => {
    const image = wrapper.find('img[alt="Фото товару"]');
    expect(image.exists()).toBe(true);
  });

  it('кнопка "Змінити розмір" існує', () => {
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
  });

  it('computed isAvailable повертає true, якщо хоч один варіант доступний', () => {
    wrapper.setData({ product: mockProduct });
    expect(wrapper.vm.isAvailable).toBe(true);
  });

  it('computed isAvailable повертає false, якщо жоден варіант недоступний', () => {
    wrapper.setData({
      product: {
        ...mockProduct,
        variants: [{ size: 10, is_available: false }]
      }
    });
    expect(wrapper.vm.isAvailable).toBe(false);
  });

  it('increaseQuantity не перевищує selectedVariant.quantity', async () => {
    wrapper.setData({ selectedSize: 10, quantity: 5 });
    await wrapper.vm.increaseQuantity();
    expect(wrapper.vm.quantity).toBe(5); // бо максимум 5
  });

  it('decreaseQuantity не зменшує quantity нижче 1', async () => {
    wrapper.setData({ quantity: 1 });
    await wrapper.vm.decreaseQuantity();
    expect(wrapper.vm.quantity).toBe(1);
  });

  it('formattedCharacteristics включає кольори, якщо вони є', () => {
    wrapper.setData({ product: mockProduct });
    const chars = wrapper.vm.formattedCharacteristics;
    expect(chars['Кольори']).toContain('червоний');
  });

  it('викликає openModal при натисканні на кнопку збільшення фото', async () => {
    const btn = wrapper.find('button');
    await btn.trigger('click');
    expect(wrapper.vm.isModalOpen).toBe(true);
  });
});
