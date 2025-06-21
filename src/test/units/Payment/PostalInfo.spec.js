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

  it('Локальна змінна localData ініціалізована відповідно до значення prop modelValue', () => {
    expect(wrapper.vm.localData).toEqual(modelValue);
  });

  it('Локальна змінна localDeliveryCategory ініціалізована відповідно до prop selectedDeliveryCategory', () => {
    expect(wrapper.vm.localDeliveryCategory).toBe(selectedDeliveryCategory);
  });
});

//
//  Тести обробки вводу міста та пошуку вулиць
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

  it('При помилці в fetchCities список міст очищується та в консолі логуються повідомлення про помилку', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    axios.get.mockRejectedValueOnce(new Error('Помилка API'));
    await wrapper.setData({ localData: { ...modelValue, city: 'Київ', deliveryType: "Кур'єр" } });
    await wrapper.vm.fetchCities();
    expect(wrapper.vm.citiesLocal).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('При помилці в fetchStreets список вулиць очищується та в консолі логуються повідомлення про помилку', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    await wrapper.setData({ localData: { ...modelValue, streetSearch: 'Вулиця', cityRef: '123' } });
    axios.get.mockRejectedValueOnce(new Error('Помилка API'));
    await wrapper.vm.fetchStreets();
    expect(wrapper.vm.streetsLocal).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('відображає поле вводу вулиці тільки коли isCourier true', async () => {
    await wrapper.setData({ localDeliveryCategory: 'courier', localData: { ...modelValue, deliveryType: 'Кур\'єр' } });
    expect(wrapper.find('input[placeholder="Введіть назву вулиці"]').exists()).toBe(true);
    await wrapper.setData({ localDeliveryCategory: 'pickup' });
    expect(wrapper.find('input[placeholder="Введіть назву вулиці"]').exists()).toBe(false);
  });

  // --- updateData and change events ---
  it('updateData емiтує "update:modelValue" при зміні будь-якого поля localData', async () => {
    wrapper.vm.localData.city = 'Львів';
    wrapper.vm.updateData();
    expect(wrapper.emitted('update:modelValue')[0][0].city).toBe('Львів');
  });

  it('onDeliveryCategoryChange емiтує "update-delivery-options" з новою категорією', async () => {
    wrapper.vm.localDeliveryCategory = 'pickup';
    await wrapper.vm.onDeliveryCategoryChange();
    expect(wrapper.emitted('update-delivery-options')[0][0]).toBe('pickup');
  });

  it('onDeliveryCategoryChange також викликає updateData()', async () => {
    wrapper.vm.updateData = jest.fn();
    wrapper.vm.localDeliveryCategory = 'pickup';
    await wrapper.vm.onDeliveryCategoryChange();
    expect(wrapper.vm.updateData).toHaveBeenCalled();
  });

  // --- Watchers for props updates ---
  it('watcher на cities оновлює citiesLocal при зміні prop cities', async () => {
    const newCities = [{ city: 'Одеса', Ref: '789' }];
    await wrapper.setProps({ cities: newCities });
    expect(wrapper.vm.citiesLocal).toEqual(newCities);
  });

  it('watcher на streets оновлює streetsLocal при зміні prop streets', async () => {
    const newStreets = [{ street: 'Левандівська' }];
    await wrapper.setProps({ streets: newStreets });
    expect(wrapper.vm.streetsLocal).toEqual(newStreets);
  });

  it('watcher на warehouses оновлює warehousesLocal при зміні prop warehouses', async () => {
    const newWare = [{ id: 5, name: 'Відділення 5' }];
    await wrapper.setProps({ warehouses: newWare });
    expect(wrapper.vm.warehousesLocal).toEqual(newWare);
  });

  // --- fetchWarehouses happy path ---
  it('fetchWarehouses емiтує "update-warehouses" з відфільтрованими даними після успіху', async () => {
    const apiData = { data: { data: [{ warehouse: 'A' }, { warehouse: 'B' }] } };
    axios.get.mockResolvedValueOnce({ status: 200, data: apiData.data });
    await wrapper.setData({ localData: { ...modelValue, city: 'Харків', cityRef: '321', deliveryType: 'Кур\'єр' } });
    await wrapper.vm.fetchWarehouses();
    expect(wrapper.emitted('update-warehouses')[0][0]).toEqual([
      { id: 1, name: 'A' },
      { id: 2, name: 'B' }
    ]);
  });

  // --- fetchWarehouses error path ---
  it('fetchWarehouses при помилці логить помилку в консоль', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => { });
    axios.get.mockRejectedValueOnce(new Error('ERR'));
    await wrapper.vm.fetchWarehouses();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Помилка отримання відділень'), expect.any(Error));
    spy.mockRestore();
  });

  // --- selectCity clears suggestions and triggers events ---
  it('selectCity очищує citiesLocal, емiтує порожній масив і викликає fetchWarehouses', async () => {
    wrapper.vm.fetchWarehouses = jest.fn();
    wrapper.vm.selectCity({ city: 'Тест', Ref: '999' });
    expect(wrapper.vm.citiesLocal).toEqual([]);
    expect(wrapper.emitted('update-cities')[0][0]).toEqual([]);
    expect(wrapper.vm.fetchWarehouses).toHaveBeenCalled();
  });

  // --- selectStreet clears streetsLocal and triggers event ---
  it('selectStreet очищує streetsLocal і емiтує порожній масив', async () => {
    wrapper.vm.selectStreet({ Name: 'Вулиця Тест' });
    expect(wrapper.vm.streetsLocal).toEqual([]);
    expect(wrapper.emitted('update-streets')[0][0]).toEqual([]);
  });

  // --- ensure no duplicate events ---
  it('кількість емiтів "update:modelValue" дорівнює кількості викликів updateData()', () => {
    wrapper.vm.updateData();
    wrapper.vm.updateData();
    expect(wrapper.emitted('update:modelValue').length).toBe(2);
  });

});
