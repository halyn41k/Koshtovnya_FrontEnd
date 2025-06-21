// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => { });
  jest.spyOn(console, 'error').mockImplementation(() => { });
  jest.spyOn(console, 'log').mockImplementation(() => { });
});

import { mount, shallowMount, RouterLinkStub } from '@vue/test-utils';
import UserWishlist from '@/components/User/UserWishlist.vue';
import Loader from '@/components/Home/Loader.vue';
import axios from 'axios';

jest.mock('@/assets/logo1.webp', () => 'test-file-stub', { virtual: true });

jest.mock('axios', () => {
  const axios = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
  };
  axios.create = jest.fn(() => axios);
  return axios;
});

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

describe('UserWishlist.vue', () => {
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

  it('встановлює document.title у "Список бажаного" при монтуванні', () => {
    shallowMount(UserWishlist, {
      global: {
        mocks: { $router: { push: jest.fn() } },
        stubs: { Loader: true, 'router-link': RouterLinkStub },
      },
    });
    expect(document.title).toBe('Список бажаного');
  });

  it('показує повідомлення про порожній список, якщо items === [] та loading === false', async () => {
    const w = shallowMount(UserWishlist, {
      global: { stubs: { Loader: true, 'router-link': RouterLinkStub } }
    });
    await w.setData({ loading: false, items: [] });
    expect(w.text()).toContain('Ваш список бажаного порожній');
  });

  it('рендерить правильну кількість елементів у списку, коли items не порожній', async () => {
    const items = [
      { id: 1, title: 'A', price: 10, imageSrc: 'a.png', has_available_variant: true },
      { id: 2, title: 'B', price: 20, imageSrc: 'b.png', has_available_variant: false },
    ];
    const w = shallowMount(UserWishlist, {
      global: { stubs: { Loader: true, 'router-link': RouterLinkStub } }
    });
    await w.setData({ loading: false, items });
    expect(w.findAll('div.relative.bg-white').length).toBe(2);
  });

  it('відображає індекс елемента (1., 2., …)', async () => {
    const items = [{ id: 1, title: 'A', price: 10, imageSrc: 'a.png', has_available_variant: true }];
    const w = shallowMount(UserWishlist, {
      global: { stubs: { Loader: true, 'router-link': RouterLinkStub } }
    });
    await w.setData({ loading: false, items });
    expect(w.find('span.text-gray-600').text()).toBe('1.');
  });

  it('якщо item.has_available_variant === false, рендерить disabled кнопку "Немає в наявності"', async () => {
    const items = [{ id: 1, title: 'A', price: 10, imageSrc: 'a.png', has_available_variant: false }];
    const w = shallowMount(UserWishlist, {
      global: { stubs: { Loader: true, 'router-link': RouterLinkStub } }
    });
    await w.setData({ loading: false, items });
    expect(w.find('button.cursor-not-allowed').exists()).toBe(true);
  });

  it('при кліку на кнопку видалення викликає removeItem з правильним індексом', async () => {
    const item = { id: 1, title: 'A', price: 10, imageSrc: 'a.png', has_available_variant: true };
    const w = shallowMount(UserWishlistNoMounted, {
      global: { stubs: { Loader: true, 'router-link': RouterLinkStub } }
    });
    await w.setData({ loading: false, items: [item] });
    w.vm.removeItem = jest.fn();
    await w.find('button[aria-label="Remove item"]').trigger('click');
    expect(w.vm.removeItem).toHaveBeenCalledWith(0);
  });

  it('показує спіннер в кнопці "Купити", коли item.loading === true', async () => {
    const item = { id: 1, title: 'A', price: 10, imageSrc: 'a.png', has_available_variant: true, loading: true };
    const w = shallowMount(UserWishlist, {
      global: { stubs: { Loader: true, 'router-link': RouterLinkStub } }
    });
    await w.setData({ loading: false, items: [item] });
    expect(w.find('svg.animate-spin').exists()).toBe(true);
  });

  it('має правильний клас-контейнер кореневого елементу', () => {
    const w = shallowMount(UserWishlist, { global: { stubs: { Loader: true, 'router-link': RouterLinkStub } } });
    expect(w.classes()).toContain('max-w-3xl');
    expect(w.classes()).toContain('font-sans');
  });

  it('рендерить заголовок "Список бажаного"', () => {
    const w = shallowMount(UserWishlist, { global: { stubs: { Loader: true, 'router-link': RouterLinkStub } } });
    expect(w.find('h2').text()).toBe('Список бажаного');
  });

  it('не показує спіннер в кнопці, якщо item.loading === false', async () => {
    const item = { id: 1, title: 'A', price: 10, imageSrc: 'a.png', has_available_variant: true, loading: false };
    const w = shallowMount(UserWishlist, { global: { stubs: { Loader: true, 'router-link': RouterLinkStub } } });
    await w.setData({ loading: false, items: [item] });
    expect(w.find('svg.animate-spin').exists()).toBe(false);
  });

  it('кнопка Remove завжди enabled', async () => {
    const item = { id: 1, title: 'A', price: 10, imageSrc: 'a.png', has_available_variant: true };
    const w = shallowMount(UserWishlistNoMounted, { global: { stubs: { Loader: true, 'router-link': RouterLinkStub } } });
    await w.setData({ loading: false, items: [item] });
    const btn = w.find('button[aria-label="Remove item"]');
    expect(btn.attributes('disabled')).toBeUndefined();
  });

  it('router-link веде на правильний шлях `/productpage/:id`', async () => {
    const item = { id: 42, title: 'X', price: 5, imageSrc: 'x.png', has_available_variant: true };
    const w = shallowMount(UserWishlist, { global: { stubs: { Loader: true, 'router-link': RouterLinkStub } } });
    await w.setData({ loading: false, items: [item] });
    const link = w.findComponent(RouterLinkStub);
    expect(link.props('to')).toBe(`/productpage/42`);
  });

  it('не викликає addToCart для кнопки "Немає в наявності"', async () => {
    const item = { id: 1, title: 'A', price: 10, imageSrc: 'a.png', has_available_variant: false };
    const w = shallowMount(UserWishlistNoMounted, { global: { stubs: { Loader: true, 'router-link': RouterLinkStub } } });
    await w.setData({ loading: false, items: [item] });
    w.vm.addToCart = jest.fn();
    const btn = w.find('button.cursor-not-allowed');
    await btn.trigger('click');
    expect(w.vm.addToCart).not.toHaveBeenCalled();
  });
});

