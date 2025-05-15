// describe.skip('Тести для MyComponent', () => {
//     it('цей тест не виконається', () => {
//       expect(true).toBe(false)
//     })
//   })
   
  //Протестовано головні аспекти
   
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

import { shallowMount } from '@vue/test-utils';
import AccountInfo from '@/components/user/AccountInfo.vue';

// Функція для очікування завершення усіх асинхронних операцій
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

// Мокування імпортів файлів іконок
jest.mock('@/assets/user.png', () => 'user.png', { virtual: true });
jest.mock('@/assets/location.png', () => 'location.png', { virtual: true });
jest.mock('@/assets/history.png', () => 'history.png', { virtual: true });
jest.mock('@/assets/heart.png', () => 'heart.png', { virtual: true });
jest.mock('@/assets/exit.png', () => 'exit.png', { virtual: true });
jest.mock('@/assets/logo1.webp', () => 'logo1.webp', { virtual: true });

// Мокування axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { data: [] } }))
}));

// Тести для рендерингу заголовка та меню навігації
describe('AccountInfo.vue - Рендеринг заголовка та меню навігації', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(AccountInfo, {
      global: {
        mocks: {
          $route: { query: {} },
          $router: { push: jest.fn() },
        },
        stubs: {
          'router-link': true,
        },
      },
    });
  });

  afterEach(() => {
    if (wrapper && wrapper.unmount) {
      wrapper.unmount();
    } else if (wrapper && wrapper.destroy) {
      wrapper.destroy();
    }
    jest.clearAllMocks();
  });

  it('повинен містити заголовок "Ваш аккаунт"', () => {
    const headerTitle = wrapper.find('.account-title');
    expect(headerTitle.exists()).toBe(true);
    expect(headerTitle.text()).toBe('Ваш аккаунт');
  });

  it('у menu-list має бути 5 пунктів меню', () => {
    const menuList = wrapper.find('.menu-list');
    expect(menuList.exists()).toBe(true);
    const menuItems = menuList.findAll('.menu-item');
    expect(menuItems.length).toBe(5);
  });

  it('кожен пункт меню має правильну назву', () => {
    const expectedTitles = [
      'Інформація',
      'Адреси',
      'Історія замовлень',
      'Список бажаного',
      'Вийти',
    ];
    const menuList = wrapper.find('.menu-list');
    const menuItems = menuList.findAll('.menu-item');

    menuItems.forEach((itemWrapper, index) => {
      const titleEl = itemWrapper.find('.section-title');
      expect(titleEl.exists()).toBe(true);
      expect(titleEl.text()).toBe(expectedTitles[index]);
    });
  });

  it('кожен пункт меню має коректну іконку', () => {
    const expectedIconPaths = [
      'user.png',
      'location.png',
      'history.png',
      'heart.png',
      'exit.png',
    ];
    const menuList = wrapper.find('.menu-list');
    const menuItems = menuList.findAll('.menu-item');

    menuItems.forEach((itemWrapper, index) => {
      const imgEl = itemWrapper.find('img.menu-icon');
      expect(imgEl.exists()).toBe(true);
      expect(imgEl.attributes('src')).toContain(expectedIconPaths[index]);
    });
  });
});

// Тести для перевірки відображення вмісту активної вкладки
import PersonalInfo from '@/components/User/PersonalInfo.vue';
import Addresses from '@/components/User/UserAddresses.vue';
import OrderHistory from '@/components/User/OrderHistory.vue';
import Wishlist from '@/components/User/UserWishlist.vue';

describe('AccountInfo.vue - Вміст активної вкладки', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(AccountInfo, {
      global: {
        mocks: {
          $route: { query: {} },
          $router: { push: jest.fn() },
        },
        stubs: {
          'router-link': true,
        },
      },
    });
  });

  afterEach(() => {
    if (wrapper && wrapper.unmount) {
      wrapper.unmount();
    } else if (wrapper && wrapper.destroy) {
      wrapper.destroy();
    }
  });

  it('За замовчуванням має бути активною вкладка "Інформація" (PersonalInfo)', () => {
    expect(wrapper.vm.activeTab).toBe(0);
    const dynamicComp = wrapper.findComponent({ name: 'PersonalInfo' });
    expect(dynamicComp.exists()).toBe(true);
  });

  it('Після вибору іншої вкладки має рендеритися відповідний компонент', async () => {
    // Вибираємо вкладку з індексом 1, що відповідає Addresses
    await wrapper.vm.selectTab(1);
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.activeTab).toBe(1);
    const dynamicComp = wrapper.findComponent({ name: 'Addresses' });
    expect(dynamicComp.exists()).toBe(true);
  });
});

// Тести для перевірки рендерингу повідомлень
describe('AccountInfo.vue - Рендеринг повідомлень', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(AccountInfo, {
      global: {
        mocks: {
          $route: { query: {} },
          $router: { push: jest.fn() },
        },
        stubs: {
          'router-link': true,
        },
      },
    });
  });

  afterEach(() => {
    if (wrapper && wrapper.unmount) {
      wrapper.unmount();
    } else if (wrapper && wrapper.destroy) {
      wrapper.destroy();
    }
    jest.clearAllMocks();
  });

  it('якщо є повідомлення message, воно має з’являтися на сторінці', async () => {
    const testMessage = 'Test message';
    await wrapper.setData({ message: testMessage });
    const messageEl = wrapper.find('.message-container');
    expect(messageEl.exists()).toBe(true);
    expect(messageEl.text()).toContain(testMessage);
  });

  it('клас повідомлення має відповідати типу (error або success)', async () => {
    const testMessage = 'Error occurred';
    const messageType = 'error';
    await wrapper.setData({ message: testMessage, messageType });
    const messageEl = wrapper.find('.message-container');
    expect(messageEl.exists()).toBe(true);
    expect(messageEl.classes()).toContain(messageType);

    // Тест для типу success
    const successMessage = 'Operation successful';
    const successType = 'success';
    await wrapper.setData({ message: successMessage, messageType: successType });
    const successEl = wrapper.find('.message-container');
    expect(successEl.exists()).toBe(true);
    expect(successEl.classes()).toContain(successType);
  });
});

// Тести для перевірки зміни активної вкладки
describe('AccountInfo.vue - Перевірка зміни активної вкладки', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(AccountInfo, {
      global: {
        mocks: {
          $route: { query: {} },
          $router: { push: jest.fn() },
        },
        stubs: {
          'router-link': true,
        },
      },
    });
  });

  afterEach(() => {
    if (wrapper && wrapper.unmount) {
      wrapper.unmount();
    } else if (wrapper && wrapper.destroy) {
      wrapper.destroy();
    }
    jest.clearAllMocks();
  });

  it('при кліку на вкладку меню змінюється значення activeTab', async () => {
    const menuList = wrapper.find('.menu-list');
    const menuItems = menuList.findAll('.menu-item');
    // Імітуємо клік на третю вкладку (індекс 2)
    await menuItems.at(2).trigger('click');
    expect(wrapper.vm.activeTab).toBe(2);
  });

  it('при кліку на вкладку меню до неї додається клас active', async () => {
    const menuList = wrapper.find('.menu-list');
    const menuItems = menuList.findAll('.menu-item');
    // Клік на другу вкладку (індекс 1)
    await menuItems.at(1).trigger('click');
    expect(menuItems.at(1).classes()).toContain('active');
  });

  it('відповідний компонент відображається у account-details після зміни активної вкладки', async () => {
    // Припустимо, індекс 3 відповідає компоненту Wishlist
    const menuList = wrapper.find('.menu-list');
    const menuItems = menuList.findAll('.menu-item');
    await menuItems.at(3).trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.activeTab).toBe(3);
    const dynamicComp = wrapper.findComponent({ name: 'Wishlist' });
    expect(dynamicComp.exists()).toBe(true);
  });
});

// Додаткові тести для функціональності "Вийти"
describe('AccountInfo.vue - Функціональність виходу', () => {
  let wrapper;
  let routerPushMock;

  beforeEach(() => {
    // Визначаємо глобальну fetch як мок-функцію
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    });
    localStorage.setItem('token', 'dummy-token');
    const routerPush = jest.fn();
    wrapper = shallowMount(AccountInfo, {
      global: {
        mocks: {
          $route: { query: {} },
          $router: { push: routerPush },
        },
        stubs: {
          'router-link': true,
        },
      },
    });
    routerPushMock = routerPush;
  });

  afterEach(() => {
    if (wrapper && wrapper.unmount) {
      wrapper.unmount();
    } else if (wrapper && wrapper.destroy) {
      wrapper.destroy();
    }
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('при кліку на "Вийти" виконується fetch-запит на logout URL', async () => {
    const menuList = wrapper.find('.menu-list');
    const menuItems = menuList.findAll('.menu-item');
    // Імітуємо клік на "Вийти" (індекс 4)
    await menuItems.at(4).trigger('click');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://26.235.139.202:8080/api/logout',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: expect.stringContaining('Bearer'),
        }),
      })
    );
  });

  it('після успішного виходу localStorage очищається', async () => {
    expect(localStorage.getItem('token')).toBe('dummy-token');
    const menuList = wrapper.find('.menu-list');
    const menuItems = menuList.findAll('.menu-item');
    await menuItems.at(4).trigger('click');
    expect(localStorage.getItem('token')).toBe(null);
  });

  it('користувач перенаправляється на сторінку Login', async () => {
    const menuList = wrapper.find('.menu-list');
    const menuItems = menuList.findAll('.menu-item');
    await menuItems.at(4).trigger('click');
    expect(routerPushMock).toHaveBeenCalledWith({ name: 'Login' });
  });

  it('відображається повідомлення "Вихід успішний"', async () => {
    const menuList = wrapper.find('.menu-list');
    const menuItems = menuList.findAll('.menu-item');
    await menuItems.at(4).trigger('click');
    await wrapper.vm.$nextTick();
    const messageEl = wrapper.find('.message-container');
    expect(messageEl.exists()).toBe(true);
    expect(messageEl.text()).toContain('Вихід успішний');
  });
});

// Додаткові тести для перевірки fetchProfile при mounted
describe('AccountInfo.vue - Перевірка fetchProfile при mounted', () => {
  let wrapper;
  let routerPushMock;

  afterEach(() => {
    if (wrapper && wrapper.unmount) {
      wrapper.unmount();
    } else if (wrapper && wrapper.destroy) {
      wrapper.destroy();
    }
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('має виконуватися запит до http://26.235.139.202:8080/api/profile при наявному токені', async () => {
    localStorage.setItem('token', 'dummy-token');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: {} })
    });
    const routerPush = jest.fn();
    wrapper = shallowMount(AccountInfo, {
      global: {
        mocks: {
          $route: { query: {} },
          $router: { push: routerPush }
        },
        stubs: {
          'router-link': true,
        },
      },
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://26.235.139.202:8080/api/profile',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer dummy-token'
        }),
      })
    );
  });

  it('якщо токен не знайдено, має з\'явитися повідомлення "Ви не авторизовані. Увійдіть у систему."', async () => {
    localStorage.clear();
    global.fetch = jest.fn(); // fetch не має викликатись, адже токен відсутній
    const routerPush = jest.fn();
    wrapper = shallowMount(AccountInfo, {
      global: {
        mocks: {
          $route: { query: {} },
          $router: { push: routerPush }
        },
        stubs: {
          'router-link': true,
        },
      },
    });
    // Очікуємо асинхронних операцій
    await flushPromises();
    expect(wrapper.vm.message).toBe('Ви не авторизовані. Увійдіть у систему.');
    // fetch не викликано
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('якщо відповідь успішна, дані користувача мають оновитися', async () => {
    const userData = {
      id: 123,
      first_name: 'Іван',
      last_name: 'Іванов',
      second_name: 'Іванович',
      email: 'ivan@example.com'
    };
    localStorage.setItem('token', 'dummy-token');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: userData })
    });
    const routerPush = jest.fn();
    wrapper = shallowMount(AccountInfo, {
      global: {
        mocks: {
          $route: { query: {} },
          $router: { push: routerPush }
        },
        stubs: {
          'router-link': true,
        },
      },
    });
    await flushPromises();
    expect(wrapper.vm.userId).toBe(userData.id);
    expect(wrapper.vm.first_name).toBe(userData.first_name);
    expect(wrapper.vm.last_name).toBe(userData.last_name);
    expect(wrapper.vm.second_name).toBe(userData.second_name);
    expect(wrapper.vm.email).toBe(userData.email);
  });

  it('якщо сервер повертає помилку (401), має відбутися вихід з аккаунта', async () => {
    localStorage.setItem('token', 'dummy-token');
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized'
    });
    const routerPush = jest.fn();
    wrapper = shallowMount(AccountInfo, {
      global: {
        mocks: {
          $route: { query: {} },
          $router: { push: routerPush }
        },
        stubs: {
          'router-link': true,
        },
      },
    });
    await flushPromises();
    expect(wrapper.vm.message).toBe('Токен недійсний. Увійдіть знову.');
    expect(localStorage.getItem('token')).toBe(null);
    expect(routerPush).toHaveBeenCalledWith({ name: 'Login' });
  });

  it('якщо відповідь не є валідним JSON, має виводитися повідомлення про помилку', async () => {
    localStorage.setItem('token', 'dummy-token');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => { throw new Error('Invalid JSON'); },
      text: async () => 'Some error text'
    });
    const routerPush = jest.fn();
    wrapper = shallowMount(AccountInfo, {
      global: {
        mocks: {
          $route: { query: {} },
          $router: { push: routerPush }
        },
        stubs: {
          'router-link': true,
        },
      },
    });
    // Очікуємо завершення всіх асинхронних операцій (наприклад, за допомогою flushPromises)
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(wrapper.vm.message).toBe('Не вдалося розпарсити відповідь від сервера.');
    expect(wrapper.vm.messageType).toBe('error');
  });
});

// Додаткові тести для перевірки стилів активного пункту меню та адаптивності
describe('AccountInfo.vue - Стилі активного пункту меню та адаптивність', () => {
    let wrapper;
  
    afterEach(() => {
      if (wrapper && wrapper.unmount) {
        wrapper.unmount();
      } else if (wrapper && wrapper.destroy) {
        wrapper.destroy();
      }
      jest.clearAllMocks();
    });
  
    it('Перевірка стилів активного пункту меню: menu-item.active має відповідний клас', async () => {
      wrapper = shallowMount(AccountInfo, {
        global: {
          mocks: {
            $route: { query: {} },
            $router: { push: jest.fn() },
          },
          stubs: { 'router-link': true },
        },
      });
  
      // Імітуємо активацію вкладки
      await wrapper.setData({ activeTab: 1 });
  
      const activeMenuItem = wrapper.find('.menu-item.active');
      expect(activeMenuItem.exists()).toBe(true);
    });
  });