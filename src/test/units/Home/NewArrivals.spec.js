describe.skip('Тести для MyComponent', () => {
    it('цей тест не виконається', () => {
      expect(true).toBe(false)
    })
  })
  /*
  //Протестовано головні аспекти
  
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

import { shallowMount } from '@vue/test-utils';
import NewArrivals from '@/components/Home/NewArrivals.vue';
import axios from 'axios';

// Мокаємо axios, як було вказано (додаємо методи post та delete)
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { data: [] } })),
  post: jest.fn(),
  delete: jest.fn()
}));

// Дані для тестування (щоб не дублювати опис товарів у кожному тесті)
const testProductData = [
  {
    id: 1,
    name: 'Product 1',
    image_url: 'http://example.com/product1.png',
    price: 100,
    bead_producer_name: 'Producer 1',
    is_in_wishlist: false,
  },
  {
    id: 2,
    name: 'Product 2',
    image_url: 'http://example.com/product2.png',
    price: 200,
    bead_producer_name: 'Producer 2',
    is_in_wishlist: false,
  },
  {
    id: 3,
    name: 'Product 3',
    image_url: 'http://example.com/product3.png',
    price: 300,
    bead_producer_name: 'Producer 3',
    is_in_wishlist: false,
  },
  {
    id: 4,
    name: 'Product 4',
    image_url: 'http://example.com/product4.png',
    price: 400,
    bead_producer_name: 'Producer 4',
    is_in_wishlist: false,
  },
];

// Об’єкт з тестовими даними, який містить totalPages
const testDataWithTotalPages = {
  data: testProductData,
  totalPages: 2,
};

describe('NewArrivals.vue - Ініціалізація та відображення компонента', () => {
  let wrapper;
  let warnSpy;
  let routerMock;

  beforeEach(() => {
    // Мок для localStorage
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
        removeItem: (key) => { delete store[key]; },
      };
    })();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Мок для роутера
    routerMock = { push: jest.fn() };

    // Мок для локалізації ($t)
    const $t = (key) => (key === 'newArrivals' ? 'Новинки' : key);

    // Мок для fetch - повертаємо порожній список продуктів і totalPages=0 за замовчуванням
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [], totalPages: 0 }),
      })
    );

    // Заглушення console.warn
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Монтуємо компонент із глобальними моками та кастомним stub-ом для router-link
    wrapper = shallowMount(NewArrivals, {
      global: {
        mocks: { $router: routerMock, $t },
        stubs: {
          // Stub з заданим name для router-link, що емулює навігацію при кліку
          'router-link': {
            name: 'router-link',
            template: '<a @click="handleClick" :to="to"><slot /></a>',
            props: ['to'],
            methods: {
              handleClick() {
                this.$router.push(this.to);
              }
            }
          },
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    if (wrapper) wrapper.unmount();
  });

  // Базова ініціалізація та відображення
  it('повинен відображати базову структуру компонента (section з класом new-arrivals)', () => {
    expect(wrapper.find('section.new-arrivals').exists()).toBe(true);
  });

  it('повинен коректно рендерити заголовок секції з використанням локалізації (переклад для newArrivals)', () => {
    const sectionTitle = wrapper.find('h2.section-title');
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.text()).toBe('Новинки');
  });

  it('повинен оновлювати масив products після успішного виклику fetchProducts', async () => {
    const simpleTestData = {
      data: testProductData.slice(0, 2),
      totalPages: 1,
    };

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(simpleTestData),
      })
    );

    await wrapper.vm.fetchProducts();

    expect(wrapper.vm.products).toEqual(simpleTestData.data);
    expect(wrapper.vm.totalPages).toBe(simpleTestData.totalPages);
  });

  it('повинен коректно визначати totalPages та викликати updateVisibleProducts після fetchProducts', async () => {
    const updateVisibleProductsSpy = jest.fn();
    wrapper.vm.updateVisibleProducts = updateVisibleProductsSpy;

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(testDataWithTotalPages),
      })
    );

    await wrapper.vm.fetchProducts();

    expect(wrapper.vm.products).toEqual(testDataWithTotalPages.data);
    expect(wrapper.vm.totalPages).toBe(testDataWithTotalPages.totalPages);
    expect(updateVisibleProductsSpy).toHaveBeenCalled();
  });

  it('повинен додавати нові продукти до масиву products при виклику fetchAdditionalProducts', async () => {
    wrapper.vm.products = [
      {
        id: 1,
        name: 'Existing Product',
        image_url: 'http://example.com/existing.png',
        price: 50,
        bead_producer_name: 'Existing Producer',
        is_in_wishlist: false,
      },
    ];

    const newProducts = [
      {
        id: 2,
        name: 'New Product 1',
        image_url: 'http://example.com/new1.png',
        price: 150,
        bead_producer_name: 'New Producer 1',
        is_in_wishlist: false,
      },
      {
        id: 3,
        name: 'New Product 2',
        image_url: 'http://example.com/new2.png',
        price: 250,
        bead_producer_name: 'New Producer 2',
        is_in_wishlist: false,
      },
    ];
    const additionalData = { data: newProducts };

    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(additionalData),
      })
    );

    await wrapper.vm.fetchAdditionalProducts(2);

    expect(wrapper.vm.products).toEqual([
      {
        id: 1,
        name: 'Existing Product',
        image_url: 'http://example.com/existing.png',
        price: 50,
        bead_producer_name: 'Existing Producer',
        is_in_wishlist: false,
      },
      ...newProducts,
    ]);
  });

  it('повинен коректно рендерити продукт-картки згідно з visibleProducts', async () => {
    wrapper.vm.visibleProducts = testProductData;
    await wrapper.vm.$nextTick();

    const productCards = wrapper.findAll('article.product-card');
    expect(productCards.length).toBe(testProductData.length);

    productCards.forEach((cardWrapper, index) => {
      const product = testProductData[index];

      const img = cardWrapper.find('img.product-image');
      expect(img.exists()).toBe(true);
      expect(img.attributes('src')).toBe(product.image_url);
      expect(img.attributes('alt')).toBe(product.name);

      const productName = cardWrapper.find('.product-name');
      expect(productName.exists()).toBe(true);
      expect(productName.text()).toBe(product.name);

      const productPrice = cardWrapper.find('.product-price');
      expect(productPrice.exists()).toBe(true);
      expect(productPrice.text()).toContain(`${product.price} грн`);

      const routerLink = cardWrapper.find('a');
      expect(routerLink.exists()).toBe(true);
      expect(routerLink.attributes('to')).toBe(`/productpage/${product.id}`);
    });
  });

  it('повинен оновлювати visibleProducts при зміні currentPage згідно з productsPerPage', async () => {
    wrapper.vm.products = testProductData;
    wrapper.vm.productsPerPage = 2;
    wrapper.vm.currentPage = 1;
    wrapper.vm.updateVisibleProducts();

    const expectedVisibleProducts = testProductData.slice(2, 4);
    expect(wrapper.vm.visibleProducts).toEqual(expectedVisibleProducts);
  });

  it('повинен змінювати currentPage та оновлювати visibleProducts при виклику showPreviousProducts', async () => {
    wrapper.vm.currentPage = 2;
    wrapper.vm.updateVisibleProducts = jest.fn();
    await wrapper.vm.showPreviousProducts();
    expect(wrapper.vm.currentPage).toBe(1);
    expect(wrapper.vm.updateVisibleProducts).toHaveBeenCalled();
  });

  it('повинен відображати правильну кількість точок пагінації та активна точка відображається класом dark', async () => {
    wrapper.vm.totalPages = 4;
    wrapper.vm.currentPage = 2;
    await wrapper.vm.$nextTick();

    const dots = wrapper.findAll('.dots-container .dot');
    expect(dots.length).toBe(4);

    dots.forEach((dotWrapper, index) => {
      if (index === 2) {
        expect(dotWrapper.classes()).toContain('dark');
      } else {
        expect(dotWrapper.classes()).toContain('light');
      }
    });
  });

  it('повинен повертати правильне значення для методу isInWishlist', () => {
    wrapper.vm.wishlist = [1, 3, 5];
    expect(wrapper.vm.isInWishlist(3)).toBe(true);
    expect(wrapper.vm.isInWishlist(2)).toBe(false);
  });

  // Тестування методу toggleWishlist
  describe('toggleWishlist', () => {
    let alertSpy;
    let setItemSpy;

    beforeEach(() => {
      alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      setItemSpy = jest.spyOn(window.localStorage, 'setItem');
    });

    afterEach(() => {
      alertSpy.mockRestore();
      setItemSpy.mockRestore();
    });

    it('повинен показувати alert і перенаправляти на сторінку авторизації, якщо користувач не авторизований', async () => {
      localStorage.removeItem('token');
      const testProduct = { id: 10, is_in_wishlist: false };
      await wrapper.vm.toggleWishlist(testProduct);

      expect(alertSpy).toHaveBeenCalledWith('Будь ласка, увійдіть у свій обліковий запис.');
      expect(routerMock.push).toHaveBeenCalledWith('/login');
    });
  });

  // Обробка кліків та подій
  describe('Обробка кліків та подій', () => {
    beforeEach(() => {
      // Встановлюємо visibleProducts з одним тестовим продуктом
      wrapper.setData({ visibleProducts: [testProductData[0]] });
      // Замінюємо методи для перевірки викликів
      wrapper.vm.showPreviousProducts = jest.fn();
      wrapper.vm.showNextProducts = jest.fn();
      wrapper.vm.toggleWishlist = jest.fn();
    });

    it('повинен викликати метод showPreviousProducts при кліку на ліву стрілку', async () => {
      const leftArrow = wrapper.find('img.left-arrow');
      await leftArrow.trigger('click');
      expect(wrapper.vm.showPreviousProducts).toHaveBeenCalled();
    });

    it('повинен викликати метод showNextProducts при кліку на праву стрілку', async () => {
      const rightArrow = wrapper.find('img.right-arrow');
      await rightArrow.trigger('click');
      expect(wrapper.vm.showNextProducts).toHaveBeenCalled();
    });

    it('повинен викликати метод toggleWishlist при кліку на іконку wishlist, зупиняючи спливання події', async () => {
      const wishlistIcon = wrapper.find('.wishlist-icon');
      const event = { stopPropagation: jest.fn() };
      await wishlistIcon.trigger('click', event);
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(wrapper.vm.toggleWishlist).toHaveBeenCalled();
    });

    it('повинен реагувати на клік по кнопці buy-button', async () => {
      const buyButton = wrapper.find('.buy-button');
      await buyButton.trigger('click');
      expect(buyButton.exists()).toBe(true);
    });
  });

  // Взаємодія з дочірніми компонентами та роутером
  describe('Взаємодія з дочірніми компонентами та роутером', () => {
    let wrapperWithRouter;

    beforeEach(() => {
      // Використовуємо кастомний stub для router-link із заданим name
      wrapperWithRouter = shallowMount(NewArrivals, {
        global: {
          mocks: {
            $router: routerMock,
            $t: (key) => (key === 'newArrivals' ? 'Новинки' : key)
          },
          stubs: {
            'router-link': {
              name: 'router-link',
              template: '<a @click="handleClick" :to="to"><slot /></a>',
              props: ['to'],
              methods: {
                handleClick() {
                  this.$router.push(this.to);
                }
              }
            },
          },
        },
        data() {
          return { visibleProducts: testProductData };
        }
      });
    });

    afterEach(() => {
      wrapperWithRouter.unmount();
    });

  // Асинхронні операції та побічні ефекти
  describe('Асинхронні операції та побічні ефекти', () => {
    it('метод fetchProducts викликається в хуку mounted', () => {
      // Створюємо шпигуна на метод fetchProducts компонента
      const fetchProductsSpy = jest.spyOn(NewArrivals.methods, 'fetchProducts');
      shallowMount(NewArrivals, {
        global: {
          mocks: { $router: routerMock, $t: (key) => (key === 'newArrivals' ? 'Новинки' : key) },
          stubs: { 'router-link': true }
        }
      });
      expect(fetchProductsSpy).toHaveBeenCalled();
      fetchProductsSpy.mockRestore();
    });

    it('після отримання даних виконується виклик fetchWishlist та оновлюються прапорці is_in_wishlist у кожного продукту', async () => {
      // Симулюємо авторизацію
      localStorage.setItem('token', 'valid-token');

      // Мокаємо fetch для повернення тестових даних
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: testProductData, totalPages: 1 }),
        })
      );

      // Мокаємо axios.get для fetchWishlist
      axios.get.mockResolvedValueOnce({
        data: { products: [{ id: 1 }, { id: 3 }] }
      });

      await wrapper.vm.fetchProducts();

      // Перевіряємо, що для кожного продукту прапорець is_in_wishlist оновлено згідно з отриманим wishlist ([1, 3])
      testProductData.forEach(product => {
        if ([1, 3].includes(product.id)) {
          expect(product.is_in_wishlist).toBe(true);
        } else {
          expect(product.is_in_wishlist).toBe(false);
        }
      });
    });
  });
});
});
*/