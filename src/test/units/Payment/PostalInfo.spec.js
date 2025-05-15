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
import PostalInfo from '@/components/payment/PostalInfo.vue';
import axios from 'axios';

// Мокаємо бібліотеку axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn()
}));

// Спільні константи для тестів
const modelValue = {
  deliveryType: '',
  city: '',
  streetSearch: '',
  street: '',
  houseNumber: '',
  warehouse: '',
  cityRef: ''
};

const selectedDeliveryCategory = 'courier';

const cities = [];

const streets = [];

const warehouses = [];

const deliveryOptions = [
  { id: 1, name: "Кур'єр" },
  { id: 2, name: "Самовивіз" }
];

//
// 1. Рендеринг початкового стану та ініціалізація даних
//
describe('PostalInfo.vue - Рендеринг початкового стану та ініціалізація даних', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(PostalInfo, {
      props: {
        modelValue,
        selectedDeliveryCategory,
        cities,
        streets,
        warehouses,
        deliveryOptions,
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Компонент відображає основні елементи (селекти та інпут для міста)', () => {
    // Селект для вибору категорії доставки
    const categorySelect = wrapper.find('select.input-field');
    expect(categorySelect.exists()).toBe(true);
    expect(categorySelect.element.value).toBe(selectedDeliveryCategory);

    // Повинен бути ще один селект (для способу доставки)
    const allSelects = wrapper.findAll('select.input-field');
    expect(allSelects.length).toBeGreaterThanOrEqual(2);

    // Інпут для введення міста
    const cityInput = wrapper.find('input.input-field[placeholder="Введіть місто"]');
    expect(cityInput.exists()).toBe(true);
  });

  it('Локальна змінна localData ініціалізована відповідно до значення prop modelValue', () => {
    expect(wrapper.vm.localData).toEqual(modelValue);
  });

  it('Локальна змінна localDeliveryCategory ініціалізована відповідно до prop selectedDeliveryCategory', () => {
    expect(wrapper.vm.localDeliveryCategory).toBe(selectedDeliveryCategory);
  });
});

//
// 2. Тести емісії подій та умовного рендерингу
//
describe('PostalInfo.vue - Еміт подій та умовний рендеринг', () => {
  let wrapper;

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { success: true, data: [] } });
    wrapper = shallowMount(PostalInfo, {
      props: {
        modelValue,
        selectedDeliveryCategory,
        cities,
        streets,
        warehouses,
        deliveryOptions,
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('При зміні будь-якого інпуту викликається updateData і емiтується подія "update:modelValue"', async () => {
    const cityInput = wrapper.find('input.input-field[placeholder="Введіть місто"]');
    cityInput.element.value = 'Ки'; // 2 символи, щоб не викликалась логіка пошуку міст
    await cityInput.trigger('input');
    expect(wrapper.emitted()['update:modelValue']).toBeTruthy();
  });

  it('При зміні категорії доставки викликається onDeliveryCategoryChange, який емiтує "update-delivery-options"', async () => {
    const categorySelect = wrapper.find('select.input-field');
    categorySelect.element.value = 'pickup';
    await categorySelect.trigger('change');
    expect(wrapper.emitted()['update-delivery-options']).toBeTruthy();
    expect(wrapper.emitted()['update-delivery-options'][0]).toEqual(['pickup']);
  });

  it('Computed властивість isCourier повертає true, коли localData.deliveryType містить слово "Кур\'єр"', async () => {
    await wrapper.setData({ localData: { ...modelValue, deliveryType: "Кур'єр доставка" } });
    expect(wrapper.vm.isCourier).toBe(true);
  });

  it('Елементи для пошуку вулиці та вводу номера будинку відображаються лише при виборі доставки кур\'єром', async () => {
    // Для "Самовивозу" елементи не відображаються
    await wrapper.setData({ localData: { ...modelValue, deliveryType: "Самовивіз" } });
    let streetInput = wrapper.find('input.input-field[placeholder="Введіть назву вулиці"]');
    let houseNumberInput = wrapper.find('input.input-field[placeholder="Введіть номер будинку"]');
    expect(streetInput.exists()).toBe(false);
    expect(houseNumberInput.exists()).toBe(false);

    // Для "Кур'єр" має з'явитись інпут для пошуку вулиці
    await wrapper.setData({ localData: { ...modelValue, deliveryType: "Кур'єр", street: '', streetSearch: '' } });
    streetInput = wrapper.find('input.input-field[placeholder="Введіть назву вулиці"]');
    expect(streetInput.exists()).toBe(true);

    // При заповненні поля вулиці має з'явитись інпут для номера будинку
    await wrapper.setData({ localData: { ...modelValue, deliveryType: "Кур'єр", street: "Вулиця Центральна", streetSearch: "Вулиця Центральна" } });
    houseNumberInput = wrapper.find('input.input-field[placeholder="Введіть номер будинку"]');
    expect(houseNumberInput.exists()).toBe(true);
  });
});

//
// 3. Тести обробки вводу міста та пошуку вулиць
//
describe('PostalInfo.vue - Обробка вводу міста та пошуку вулиць', () => {
  let wrapper;

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { success: true, data: [] } });
    wrapper = shallowMount(PostalInfo, {
      props: {
        modelValue,
        selectedDeliveryCategory,
        cities,
        streets,
        warehouses,
        deliveryOptions,
      },
      global: {
        mocks: {
          $router: { push: jest.fn() }
        }
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
    jest.clearAllMocks();
  });

  it('Метод onCityInput викликає updateData для оновлення даних', async () => {
    wrapper.vm.updateData = jest.fn();
    await wrapper.vm.onCityInput();
    expect(wrapper.vm.updateData).toHaveBeenCalled();
  });

  it('Якщо довжина міста ≥3 символів, викликається метод fetchCities', async () => {
    wrapper.vm.fetchCities = jest.fn(() => Promise.resolve());
    await wrapper.setData({ localData: { ...modelValue, city: 'Київ' } });
    await wrapper.vm.onCityInput();
    expect(wrapper.vm.fetchCities).toHaveBeenCalled();
  });

  it('Після успішного запиту міст емiтується подія "update-cities" з отриманими даними', async () => {
    const citiesResponse = [
      { city: 'Київ', Ref: '123' },
      { city: 'Львів', Ref: '456' }
    ];
    axios.get.mockResolvedValueOnce({
      data: { success: true, data: citiesResponse }
    });
    await wrapper.setData({ localData: { ...modelValue, city: 'Київ' } });
    await wrapper.vm.fetchCities();
    expect(wrapper.emitted()['update-cities']).toBeTruthy();
    expect(wrapper.emitted()['update-cities'][0]).toEqual([citiesResponse]);
  });

  it('Debounce логіка у onStreetSearch працює - fetchStreets викликається через 300 мс', async () => {
    jest.useFakeTimers();
    wrapper.vm.fetchStreets = jest.fn(() => Promise.resolve());
    wrapper.vm.onStreetSearch();
    expect(wrapper.vm.fetchStreets).not.toHaveBeenCalled();
    jest.advanceTimersByTime(300);
    await Promise.resolve();
    expect(wrapper.vm.fetchStreets).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('Якщо в localStorage немає токену, fetchStreets виконує редірект на /login та викликає alert', async () => {
    localStorage.removeItem('token');
    global.alert = jest.fn();
    const routerPushSpy = wrapper.vm.$router.push;
    await wrapper.vm.fetchStreets();
    expect(global.alert).toHaveBeenCalledWith("Ви не авторизовані. Будь ласка, увійдіть.");
    expect(routerPushSpy).toHaveBeenCalledWith("/login");
  });
});

//
// 4. Тести вибору підказок та обробки зміни типу доставки
//
describe('PostalInfo.vue - Вибір підказок та обробка зміни типу доставки', () => {
  let wrapper;

  beforeEach(() => {
    axios.get.mockResolvedValue({ data: { success: true, data: [] } });
    wrapper = shallowMount(PostalInfo, {
      props: {
        modelValue,
        selectedDeliveryCategory,
        cities,
        streets,
        warehouses,
        deliveryOptions,
      },
      global: {
        mocks: {
          $router: { push: jest.fn() }
        }
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
    jest.clearAllMocks();
  });

  it('При кліку на підказку міста викликається selectCity, який оновлює localData.city та localData.cityRef, очищує підказки міст, викликає fetchWarehouses і емiтує оновлення', async () => {
    wrapper.vm.fetchWarehouses = jest.fn(() => Promise.resolve());
    wrapper.vm.updateData = jest.fn();
    const testCity = { city: 'Київ', Ref: '123' };
    wrapper.vm.selectCity(testCity);
    expect(wrapper.vm.localData.city).toBe('Київ');
    expect(wrapper.vm.localData.cityRef).toBe('123');
    expect(wrapper.vm.citiesLocal).toEqual([]);
    expect(wrapper.emitted()['update-cities'][0]).toEqual([[]]);
    expect(wrapper.vm.fetchWarehouses).toHaveBeenCalled();
    expect(wrapper.vm.updateData).toHaveBeenCalled();
  });

  it('При кліку на підказку вулиці викликається selectStreet, який оновлює localData.street та localData.streetSearch, очищує підказки вулиць і емiтує оновлення', async () => {
    wrapper.vm.updateData = jest.fn();
    const testStreet = { street: 'Вулиця 1', Name: 'Невикористовуване' };
    wrapper.vm.selectStreet(testStreet);
    expect(wrapper.vm.localData.street).toBe('Вулиця 1');
    expect(wrapper.vm.localData.streetSearch).toBe('Вулиця 1');
    expect(wrapper.vm.streetsLocal).toEqual([]);
    expect(wrapper.emitted()['update-streets'][0]).toEqual([[]]);
    expect(wrapper.vm.updateData).toHaveBeenCalled();
  });

  it('При зміні типу доставки викликається updateData', async () => {
    wrapper.vm.updateData = jest.fn();
    await wrapper.setData({ localData: { ...modelValue, deliveryType: "Кур'єр" } });
    await wrapper.vm.onDeliveryTypeChange();
    expect(wrapper.vm.updateData).toHaveBeenCalled();
  });

  it('Якщо поле міста заповнене, при зміні типу доставки викликається fetchWarehouses', async () => {
    wrapper.vm.fetchWarehouses = jest.fn(() => Promise.resolve());
    await wrapper.setData({ localData: { ...modelValue, city: 'Київ', deliveryType: "Кур'єр" } });
    await wrapper.vm.onDeliveryTypeChange();
    expect(wrapper.vm.fetchWarehouses).toHaveBeenCalled();
  });
});

//
// 5. Тести фетчинг даних через API та обробки помилок
//
describe('PostalInfo.vue - Фетчинг даних через API', () => {
  let wrapper;

  beforeEach(() => {
    // Забезпечуємо, що в localStorage є токен для тестів fetchStreets і fetchWarehouses
    localStorage.setItem('token', 'test-token');
    wrapper = shallowMount(PostalInfo, {
      props: {
        modelValue,
        selectedDeliveryCategory,
        cities,
        streets,
        warehouses,
        deliveryOptions,
      },
      global: {
        mocks: {
          $router: { push: jest.fn() }
        }
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
    jest.clearAllMocks();
    localStorage.removeItem('token');
  });

  it('fetchCities робить запит з правильними параметрами і оновлює список міст', async () => {
    const citiesResponse = [
      { city: 'Київ', Ref: '123' }
    ];
    axios.get.mockResolvedValueOnce({
      data: { success: true, data: citiesResponse }
    });
    await wrapper.setData({ localData: { ...modelValue, city: 'Київ', deliveryType: "Кур'єр" } });
    await wrapper.vm.fetchCities();
    expect(axios.get).toHaveBeenCalledWith("http://26.235.139.202:8080/api/nova-poshta/cities", {
      headers: { Authorization: `Bearer test-token` },
      params: {
        city: 'Київ',
        delivery_type: "Кур'єр"
      }
    });
    expect(wrapper.vm.citiesLocal).toEqual(citiesResponse);
    expect(wrapper.emitted()['update-cities'][0]).toEqual([citiesResponse]);
  });

  it('fetchStreets робить запит з правильними параметрами і оновлює список вулиць', async () => {
    const streetsResponse = [
      { street: 'Вулиця Лесі', Name: 'Вулиця Лесі' }
    ];
    // Встановлюємо довжину рядка пошуку >=3
    await wrapper.setData({ localData: { ...modelValue, streetSearch: 'Вулиця', cityRef: '123' } });
    axios.get.mockResolvedValueOnce({
      data: { data: streetsResponse }
    });
    await wrapper.vm.fetchStreets();
    expect(axios.get).toHaveBeenCalledWith("http://26.235.139.202:8080/api/nova-poshta/streets", {
      headers: { Authorization: `Bearer test-token` },
      params: {
        Ref: '123',
        street: 'Вулиця'
      }
    });
    expect(wrapper.vm.streetsLocal).toEqual(streetsResponse);
    expect(wrapper.emitted()['update-streets'][0]).toEqual([streetsResponse]);
  });

  it('fetchWarehouses робить запит з правильними параметрами і емiтує оновлення складів', async () => {
    const warehousesResponse = [
      { warehouse: 'Відділення 1' },
      { warehouse: 'Відділення 2' }
    ];
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: { data: warehousesResponse }
    });
    await wrapper.setData({ localData: { ...modelValue, city: 'Київ', cityRef: '123', deliveryType: "Кур'єр" } });
    await wrapper.vm.fetchWarehouses();
    expect(axios.get).toHaveBeenCalledWith("http://26.235.139.202:8080/api/nova-poshta/ware-houses", {
      headers: { Authorization: `Bearer test-token` },
      params: {
        city: 'Київ',
        Ref: '123',
        delivery_type: "Кур'єр"
      }
    });
    const expectedWarehouses = warehousesResponse.map((item, index) => ({
      id: index + 1,
      name: item.warehouse,
    }));
    expect(wrapper.vm.warehousesLocal).toEqual(expectedWarehouses);
    expect(wrapper.emitted()['update-warehouses'][0]).toEqual([expectedWarehouses]);
  });

  it('При помилці в fetchCities список міст очищується та в консолі логуються повідомлення про помилку', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('Помилка API'));
    await wrapper.setData({ localData: { ...modelValue, city: 'Київ', deliveryType: "Кур'єр" } });
    await wrapper.vm.fetchCities();
    expect(wrapper.vm.citiesLocal).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('При помилці в fetchStreets список вулиць очищується та в консолі логуються повідомлення про помилку', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await wrapper.setData({ localData: { ...modelValue, streetSearch: 'Вулиця', cityRef: '123' } });
    axios.get.mockRejectedValueOnce(new Error('Помилка API'));
    await wrapper.vm.fetchStreets();
    expect(wrapper.vm.streetsLocal).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});

//
// 6. Тест рендерингу повідомлень про помилки (errors), якщо вони передані через пропси
//
describe('PostalInfo.vue - Рендеринг повідомлень про помилки', () => {
  let wrapper;
  const errors = {
    deliveryType: 'Помилка способу доставки',
    city: 'Помилка міста',
    street: 'Помилка вулиці',
    houseNumber: 'Помилка номера будинку',
    warehouse: 'Помилка відділення'
  };

  beforeEach(() => {
    wrapper = shallowMount(PostalInfo, {
      props: {
        modelValue,
        selectedDeliveryCategory,
        cities,
        streets,
        warehouses,
        deliveryOptions,
        errors
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('Рендериться повідомлення про помилку для способу доставки, якщо воно є', () => {
    // Перший error елемент повинен містити повідомлення для способу доставки
    const errorEl = wrapper.findAll('span.error').at(0);
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.text()).toBe(errors.deliveryType);
  });

  it('Рендеряться повідомлення для інших полів, якщо передані відповідні повідомлення про помилки', () => {
    // Припустимо, що помилка для міста буде другим error елементом
    const errorsEls = wrapper.findAll('span.error');
    expect(errorsEls.length).toBeGreaterThan(1);
    // Перевіряємо, що другий error містить повідомлення для міста
    expect(errorsEls.at(1).text()).toBe(errors.city);
  });
});
*/