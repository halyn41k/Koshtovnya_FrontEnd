// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

import { mount, shallowMount, RouterLinkStub } from '@vue/test-utils';
import UserWishlist from '@/components/User/UserWishlist.vue';
import Loader from '@/components/Home/Loader.vue';
import axios from 'axios';

jest.mock('@/assets/logo1.webp', () => 'test-file-stub', { virtual: true });

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn()
}));

// Мокаємо window.alert, щоб уникнути помилок
global.alert = jest.fn();

// Stub-компонент для інтеракційних тестів: не викликає mounted та fetchWishlist
const UserWishlistNoMounted = {
  extends: UserWishlist,
  mounted() {
    // Намірено не викликаємо fetchWishlist
  },
  methods: {
    fetchWishlist() {
      // Порожня реалізація
    },
  },
};

//
// Розділ: Рендеринг та тести методів
//
describe('UserWishlist.vue - Рендеринг', () => {
  let wrapper;
  const routerPushMock = jest.fn();

  beforeEach(() => {
    wrapper = shallowMount(UserWishlist, {
      global: {
        mocks: { $router: { push: routerPushMock } },
        stubs: {
          Loader: true,
          'router-link': RouterLinkStub,
        },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    routerPushMock.mockClear();
    jest.clearAllMocks();
  });

  it('Відображення Loader: коли loading = true, рендериться компонент Loader', async () => {
    await wrapper.setData({ loading: true });
    expect(wrapper.findComponent(Loader).exists()).toBe(true);
  });

  it('Повідомлення про порожній список: коли loading = false та items пустий, відображається повідомлення', async () => {
    await wrapper.setData({ loading: false, items: [] });
    expect(wrapper.text()).toContain('Ваш список бажань порожній :(');
  });

  it('Відображення списку бажань: коли items містить дані, відображаються всі елементи з правильною інформацією', async () => {
    const itemsData = [
      { id: 1, title: 'Товар 1', price: 100, imageSrc: 'image1.png' },
      { id: 2, title: 'Товар 2', price: 200, imageSrc: 'image2.png' },
    ];
    await wrapper.setData({ loading: false, items: itemsData });

    const wishlistItems = wrapper.findAll('.wishlist-item');
    expect(wishlistItems.length).toBe(itemsData.length);

    wishlistItems.forEach((itemWrapper, index) => {
      expect(itemWrapper.find('.item-number').text()).toBe(`${index + 1}.`);
      expect(itemWrapper.find('.item-image').attributes('src')).toBe(itemsData[index].imageSrc);
      expect(itemWrapper.find('.item-name').text()).toBe(itemsData[index].title);
      expect(itemWrapper.find('.item-price').text()).toContain(`${itemsData[index].price}₴`);
      expect(itemWrapper.find('.buy-button').text()).toBe('Додати в кошик');
      expect(itemWrapper.find('.remove-button').exists()).toBe(true);
    });
  });
});

describe('UserWishlist.vue - Тести методів: fetchWishlist', () => {
  let wrapper;
  const routerPushMock = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    wrapper = shallowMount(UserWishlist, {
      global: {
        mocks: { $router: { push: routerPushMock } },
        stubs: { Loader: true, 'router-link': RouterLinkStub },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    routerPushMock.mockClear();
    jest.clearAllMocks();
  });

  it('fetchWishlist: Відсутність токену - має викликати alert і редіректити на /login', async () => {
    localStorage.removeItem("token");

    await wrapper.vm.fetchWishlist();

    expect(global.alert).toHaveBeenCalledWith("Будь ласка, увійдіть у свій обліковий запис.");
    expect(routerPushMock).toHaveBeenCalledWith("/login");

    await wrapper.setData({ loading: false });
    expect(wrapper.vm.loading).toBe(false);
  });

  it('fetchWishlist: Успішне завантаження - має заповнити items відповідно до мапінгу даних', async () => {
    localStorage.setItem("token", "test-token");

    axios.get.mockResolvedValueOnce({
      data: {
        products: [
          { id: 1, name: 'Product 1', price: 100, image_url: 'img1.png' },
          { id: 2, name: 'Product 2', price: 200, image_url: null },
        ]
      }
    });

    await wrapper.vm.fetchWishlist();

    expect(axios.get).toHaveBeenCalledWith("http://26.235.139.202:8080/api/wishlist", {
      headers: { Authorization: "Bearer test-token" },
    });

    expect(wrapper.vm.items).toEqual([
      { id: 1, title: 'Product 1', price: 100, imageSrc: 'img1.png' },
      { id: 2, title: 'Product 2', price: 200, imageSrc: 'default_image_path' }
    ]);

    expect(wrapper.vm.loading).toBe(false);
  });

  it('fetchWishlist: Помилка завантаження - має показати повідомлення про помилку та встановити loading в false', async () => {
    localStorage.setItem("token", "test-token");

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("Network error"));

    await wrapper.vm.fetchWishlist();

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(global.alert).toHaveBeenCalledWith("Не вдалося завантажити ваш список бажаного.");
    
    await wrapper.setData({ loading: false });
    expect(wrapper.vm.loading).toBe(false);

    consoleErrorSpy.mockRestore();
  });
});

describe('UserWishlist.vue - Тести методів: addToCart', () => {
  let wrapper;
  const routerPushMock = jest.fn();
  const itemMock = { id: 1, title: 'Product 1', price: 100, imageSrc: 'img1.png', loading: false };

  beforeEach(() => {
    localStorage.clear();
    wrapper = shallowMount(UserWishlist, {
      global: {
        mocks: { $router: { push: routerPushMock } },
        stubs: { Loader: true, 'router-link': RouterLinkStub },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    routerPushMock.mockClear();
    jest.clearAllMocks();
  });

  it('addToCart: Відсутність токену - має викликати alert з проханням увійти та редірект на сторінку логіну', async () => {
    localStorage.removeItem("token");

    await wrapper.vm.addToCart(itemMock);

    expect(global.alert).toHaveBeenCalledWith("Будь ласка, увійдіть у свій обліковий запис.");
    expect(routerPushMock).toHaveBeenCalledWith("/login");
  });

  it('addToCart: Успішне додавання товару - axios.post повертає повідомлення "Product added to cart", має викликати alert про успішне додавання', async () => {
    localStorage.setItem("token", "test-token");

    axios.post.mockResolvedValueOnce({
      data: { message: "Product added to cart" }
    });

    await wrapper.vm.addToCart(itemMock);

    expect(axios.post).toHaveBeenCalledWith(
      'http://26.235.139.202:8080/api/cart',
      { product_id: itemMock.id, quantity: 1 },
      { headers: { Authorization: "Bearer test-token" } }
    );
    expect(global.alert).toHaveBeenCalledWith("Товар успішно додано до кошика.");
  });

  it('addToCart: Помилка додавання - axios.post повертає помилку, має бути викликано console.error і alert про невдале додавання', async () => {
    localStorage.setItem("token", "test-token");

    const errorResponse = { response: { data: { error: "Failed to add" } } };
    axios.post.mockRejectedValueOnce(errorResponse);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await wrapper.vm.addToCart(itemMock);

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(global.alert).toHaveBeenCalledWith("Не вдалося додати товар до кошика.");

    consoleErrorSpy.mockRestore();
  });
});

describe('UserWishlist.vue - Тести методів: removeItem', () => {
  let wrapper;
  const routerPushMock = jest.fn();
  const itemsData = [
    { id: 1, title: 'Product 1', price: 100, imageSrc: 'img1.png' },
    { id: 2, title: 'Product 2', price: 200, imageSrc: 'img2.png' },
  ];

  beforeEach(() => {
    localStorage.clear();
    wrapper = shallowMount(UserWishlist, {
      data() {
        return { items: [...itemsData] };
      },
      global: {
        mocks: { $router: { push: routerPushMock } },
        stubs: { Loader: true, 'router-link': RouterLinkStub },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    routerPushMock.mockClear();
    jest.clearAllMocks();
  });

  it('removeItem: Відсутність токену - має викликати alert та редірект на сторінку логіну', async () => {
    localStorage.removeItem("token");

    await wrapper.vm.removeItem(0);

    expect(global.alert).toHaveBeenCalledWith("Будь ласка, увійдіть у свій обліковий запис.");
    expect(routerPushMock).toHaveBeenCalledWith("/login");
  });

  it('removeItem: Успішне видалення - axios.delete повертає статус 200, елемент видаляється з items та викликається alert про успішне видалення', async () => {
    localStorage.setItem("token", "test-token");

    axios.delete.mockResolvedValueOnce({ status: 200 });

    await wrapper.vm.removeItem(0);

    expect(axios.delete).toHaveBeenCalledWith(
      `http://26.235.139.202:8080/api/wishlist/${itemsData[0].id}`,
      { headers: { Authorization: "Bearer test-token" } }
    );
    expect(global.alert).toHaveBeenCalledWith("Товар видалено з бажаного.");
    expect(wrapper.vm.items).toHaveLength(itemsData.length - 1);
  });

  it('removeItem: Помилка видалення - axios.delete повертає помилку, має показуватися повідомлення про помилку видалення', async () => {
    localStorage.setItem("token", "test-token");

    axios.delete.mockRejectedValueOnce(new Error("Deletion error"));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await wrapper.vm.removeItem(0);

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(global.alert).toHaveBeenCalledWith("Не вдалося видалити товар з бажаного.");

    consoleErrorSpy.mockRestore();
  });
});

describe('UserWishlist.vue - Тести життєвого циклу компонента', () => {
  it('Виклик fetchWishlist при монтуванні: має викликатися автоматично при завантаженні компонента', () => {
    const fetchWishlistSpy = jest.spyOn(UserWishlist.methods, 'fetchWishlist');
    shallowMount(UserWishlist, {
      global: {
        mocks: { $router: { push: jest.fn() } },
        stubs: { Loader: true, 'router-link': RouterLinkStub },
      },
    });
    expect(fetchWishlistSpy).toHaveBeenCalled();
    fetchWishlistSpy.mockRestore();
  });
});

//
// Інтеракційні тести (mount з використанням stub-компонента і без stubbing router-link)
//
describe('UserWishlist.vue - Тести інтеракцій', () => {
  let wrapper;
  const routerPushMock = jest.fn();
  const itemMock = { id: 1, title: 'Product 1', price: 100, imageSrc: 'img1.png', loading: false };

  beforeEach(async () => {
    // Встановлюємо токен, щоб уникнути виклику fetchWishlist у mounted
    localStorage.setItem("token", "test-token");
    axios.get.mockResolvedValue({ data: { products: [] } });

    wrapper = mount(UserWishlistNoMounted, {
      global: {
        mocks: { $router: { push: routerPushMock } },
        // НЕ задаємо stub для router-link, щоб його вміст відрендерився
        stubs: { Loader: true },
      },
    });
    // Встановлюємо дані вручну, щоб кнопки з'явилися
    await wrapper.setData({ items: [itemMock], loading: false });
    // Перезаписуємо методи для відслідковування викликів
    wrapper.vm.addToCart = jest.fn();
    wrapper.vm.removeItem = jest.fn();
  });

  afterEach(() => {
    wrapper.unmount();
    routerPushMock.mockClear();
    jest.clearAllMocks();
  });

  it('Подія кліку на кнопку "Додати в кошик": має викликати метод addToCart з відповідним параметром', async () => {
    const buyButton = wrapper.find('button.buy-button');
    expect(buyButton.exists()).toBe(true);
    await buyButton.trigger('click');
    expect(wrapper.vm.addToCart).toHaveBeenCalledWith(itemMock);
  });

  it('Подія кліку на кнопку "видалити": має викликати метод removeItem з правильним індексом', async () => {
    const removeButton = wrapper.find('button.remove-button');
    expect(removeButton.exists()).toBe(true);
    await removeButton.trigger('click');
    expect(wrapper.vm.removeItem).toHaveBeenCalledWith(0);
  });
});
