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

jest.mock('vue-select', () => ({
  __esModule: true,
  default: { name: 'vSelect', render: () => null }
}), { virtual: true });

jest.mock('vue-select/dist/vue-select.css', () => '', { virtual: true });

jest.mock('vue-multiselect', () => ({
  __esModule: true,
  default: { name: 'Multiselect', render: () => null }
}), { virtual: true });

jest.mock('@/components/home/Loader.vue', () => ({
  __esModule: true,
  default: { name: 'Loader', render: () => null }
}));

jest.mock('@/services/api', () => ({
  getProfile: jest.fn()
}));

import { shallowMount } from '@vue/test-utils';
import UserAddresses from '@/components/user/UserAddresses.vue';
import axios from 'axios';

// Мокаємо методи axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

// Мокаємо зображення
jest.mock('@/assets/logo1.webp', () => '');

// Мокаємо виклик window.alert, щоб уникнути помилок під час тестування
window.alert = jest.fn();

// Замокаємо метод fetchUserAddress, щоб created hook не викликав його під час тестування
UserAddresses.methods.fetchUserAddress = jest.fn();

describe('UserAddresses.vue - Рендеринг компонентів та взаємодія з формою', () => {
  let wrapper;
  const routerPushMock = jest.fn();

  beforeEach(() => {
    wrapper = shallowMount(UserAddresses, {
      stubs: ['Loader'],
      // Встановлюємо початкові дані, які необхідні для тестування рендерингу
      data() {
        return {
          loading: false,
          addressAvailable: false,
          showForm: false,
          phoneNumber: '1234567890',
          formData: {
            city: "",
            deliveryType: "",
            streetSearch: "",
            selectedDeliveryMethod: null,
            deliveryName: ""
          },
          deliveryAddress: {
            street: "",
            number: "",
            branch: "",
            postomat: ""
          },
          errors: {},
          cities: [],
          warehouses: [],
          showCityDropdown: false
        };
      },
      global: {
        mocks: {
          $router: { push: routerPushMock },
        },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    jest.clearAllMocks();
  });

  it('відображається компонент Loader, коли loading встановлено в true', async () => {
    await wrapper.setData({ loading: true });
    const loader = wrapper.findComponent({ name: 'Loader' });
    expect(loader.exists()).toBe(true);
  });
});

describe('UserAddresses.vue - API methods', () => {
  let wrapper;
  const token = 'fake-token';

  beforeEach(() => {
    localStorage.setItem('token', token);
    wrapper = shallowMount(UserAddresses, {
      global: {
        mocks: {
          $router: { push: jest.fn() }
        }
      }
      // Видалено опцію methods щодо debounce, адже вона вже не використовується у цьому варіанті
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    wrapper.unmount();
    localStorage.clear();
  });

  describe('fetchUserPhoneNumber', () => {
    it('оновлює phoneNumber при успішному запиті', async () => {
      // Виправлено структуру відповіді, що повертається, щоб метод отримав response.data.phone
      const responseData = { data: { phone: "1234567890" } };
      axios.get.mockResolvedValue(responseData);
      await wrapper.vm.fetchUserPhoneNumber();
      expect(wrapper.vm.phoneNumber).toBe("1234567890");
    });

    it('логування помилки при невдалому запиті', async () => {
      const error = new Error("Phone error");
      axios.get.mockRejectedValue(error);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      await wrapper.vm.fetchUserPhoneNumber();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('fetchDeliveryTypes', () => {
    it('перенаправляє користувача на /login при відсутності токена', async () => {
      localStorage.clear();
      const routerPushSpy = jest.spyOn(wrapper.vm.$router, 'push');
      await wrapper.vm.fetchDeliveryTypes();
      expect(routerPushSpy).toHaveBeenCalledWith("/login");
    });
  });

  describe('fetchCities', () => {
    it('оновлює cities при успішному запиті', async () => {
      const responseData = { data: { success: true, data: [{ Ref: "1", city: "City1" }] } };
      axios.get.mockResolvedValue(responseData);
      wrapper.vm.formData.deliveryType = "courier";
      wrapper.vm.formData.city = "Ci";
      await wrapper.vm.fetchCities();
      expect(wrapper.vm.cities).toEqual(responseData.data.data);
    });

    it('очищує cities при некоректному форматі відповіді', async () => {
      const responseData = { data: { success: false } };
      axios.get.mockResolvedValue(responseData);
      wrapper.vm.formData.deliveryType = "courier";
      wrapper.vm.formData.city = "Ci";
      await wrapper.vm.fetchCities();
      expect(wrapper.vm.cities).toEqual([]);
    });
  });

  describe('fetchWarehouses', () => {
    it('оновлює warehouses при успішному запиті', async () => {
      wrapper.vm.formData.city = "TestCity";
      wrapper.vm.formData.cityRef = "ref123";
      const responseData = {
        status: 200,
        data: { data: [{ warehouse: "Warehouse1" }, { warehouse: "Warehouse2" }] }
      };
      axios.get.mockResolvedValue(responseData);
      await wrapper.vm.fetchWarehouses();
      expect(wrapper.vm.warehouses).toEqual([
        { id: 1, name: "Warehouse1" },
        { id: 2, name: "Warehouse2" }
      ]);
    });

    it('очищує warehouses при невдалому запиті', async () => {
      wrapper.vm.formData.city = "TestCity";
      wrapper.vm.formData.cityRef = "ref123";
      const error = new Error("Warehouse error");
      axios.get.mockRejectedValue(error);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      await wrapper.vm.fetchWarehouses();
      expect(wrapper.vm.warehouses).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  describe('fetchStreets', () => {
    it('оновлює streets при успішному запиті', async () => {
      wrapper.vm.formData.city = "TestCity";
      wrapper.vm.formData.cityRef = "ref123";
      wrapper.vm.formData.streetSearch = "Main";
      const responseData = {
        status: 200,
        data: { data: [{ street: "Main Street" }, { street: "Main Ave" }] }
      };
      axios.get.mockResolvedValue(responseData);
      await wrapper.vm.fetchStreets();
      expect(wrapper.vm.streets).toEqual(responseData.data.data);
    });

    it('очищує streets при невдалому запиті', async () => {
      wrapper.vm.formData.city = "TestCity";
      wrapper.vm.formData.cityRef = "ref123";
      wrapper.vm.formData.streetSearch = "Main";
      const error = new Error("Street error");
      axios.get.mockRejectedValue(error);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      await wrapper.vm.fetchStreets();
      expect(wrapper.vm.streets).toEqual([]);
      consoleErrorSpy.mockRestore();
    });
  });

  it('компонент успішно монтується', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(wrapper.exists()).toBe(true);
  });

  it('початкове значення addressAvailable — false', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(wrapper.vm.addressAvailable).toBe(false);
  });

  it('початкове значення showForm — false', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(wrapper.vm.showForm).toBe(false);
  });

  it('початковий номер телефону заповнений', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(wrapper.vm.phoneNumber).toBeDefined();
  });

  it('formData має поле city з початковим значенням ""', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(wrapper.vm.formData.city).toBe("");
  });

  it('deliveryAddress має поле street з початковим значенням ""', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(wrapper.vm.deliveryAddress.street).toBe("");
  });

  it('errors — обʼєкт', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(typeof wrapper.vm.errors).toBe("object");
  });

  it('cities — масив', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(Array.isArray(wrapper.vm.cities)).toBe(true);
  });

  it('warehouses — масив', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(Array.isArray(wrapper.vm.warehouses)).toBe(true);
  });

  it('showCityDropdown — false за замовчуванням', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(wrapper.vm.showCityDropdown).toBe(false);
  });

  it('компонент має метод fetchUserPhoneNumber', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(typeof wrapper.vm.fetchUserPhoneNumber).toBe('function');
  });

  it('компонент має метод fetchDeliveryTypes', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(typeof wrapper.vm.fetchDeliveryTypes).toBe('function');
  });

  it('компонент має метод fetchCities', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(typeof wrapper.vm.fetchCities).toBe('function');
  });

  it('компонент має метод fetchWarehouses', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(typeof wrapper.vm.fetchWarehouses).toBe('function');
  });

  it('компонент має метод fetchStreets', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(typeof wrapper.vm.fetchStreets).toBe('function');
  });

  it('компонент має method validateForm', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(typeof wrapper.vm.validateForm).toBe('function');
  });

  it('компонент має data formData.selectedDeliveryMethod', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(wrapper.vm.formData).toHaveProperty('selectedDeliveryMethod');
  });

  it('компонент має поле deliveryName у formData', () => {
    const wrapper = shallowMount(UserAddresses);
    expect(wrapper.vm.formData).toHaveProperty('deliveryName');
  });
});
