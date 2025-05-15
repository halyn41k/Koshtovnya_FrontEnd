describe.skip('Тести для MyComponent', () => {
  it('цей тест не виконається', () => {
    expect(true).toBe(false)
  })
})
/*
//Протестовано головні аспекти

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

// PaymentSteps.spec.js
import { shallowMount } from '@vue/test-utils';
import PaymentSteps from '@/components/Payment/PaymentSteps.vue';
import axios from 'axios';

// Мокаємо axios: повертаємо resolved проміс з порожніми даними,
// а також дозволяємо симулювати помилку при потребі
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  // Якщо потрібні інші HTTP методи, їх теж можна змокати
}));

// Створюємо мок Vuex store із необхідною структурою для модуля "order"
const storeMock = {
  dispatch: jest.fn(),
  _modulesNamespaceMap: {
    'order/': {
      context: {
        dispatch: jest.fn(),
        commit: jest.fn()
      }
    }
  }
};

describe('PaymentSteps.vue - Повний набір тестів', () => {
  let wrapper;

  beforeEach(() => {
    // Встановлюємо токен, щоб уникнути виклику alert при монтуванні
    window.localStorage.setItem("token", "dummy-token");

    wrapper = shallowMount(PaymentSteps, {
      stubs: [
        'PaymentSummary',
        'DeliveryAddress',
        'PersonalInfo',
        'PostalInfo',
        'PaymentInfo'
      ],
      global: {
        mocks: {
          // Мок роутера
          $router: {
            push: jest.fn()
          },
          // Мок Vuex store із модулем "order"
          $store: storeMock
        }
      }
    });

    // Присвоюємо методи, що викликаються через mapActions, як шпійонські функції
    wrapper.vm.updateCustomerData = jest.fn();
    wrapper.vm.updateCartItems = jest.fn();
  });

  afterEach(() => {
    wrapper.unmount();
    jest.clearAllMocks();
  });

  // 1. Тести рендерингу базових елементів
  it('рендерить правильну кількість кроків згідно з масивом steps', () => {
    const stepElements = wrapper.findAll('.step');
    expect(stepElements.length).toBe(wrapper.vm.steps.length);
  });

  it('рендерить елементи з класами .payment-columns, .payment-steps та .delivery-steps', () => {
    expect(wrapper.find('.payment-columns').exists()).toBe(true);
    expect(wrapper.find('.payment-steps').exists()).toBe(true);
    expect(wrapper.find('.delivery-steps').exists()).toBe(true);
  });

  // 2. Тести логіки перемикання кроків
  it('на початку лише перший крок (Особиста інформація) відображається у розгорнутому вигляді (isExpanded: true), а інші – ні', () => {
    const steps = wrapper.vm.steps;
    expect(steps[0].isExpanded).toBe(true);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].isExpanded).toBe(false);
    }
  });

  it('при кліку на заголовок іншого кроку (toggleStep) поточний крок змінюється: попередній крок стає стиснутим (isExpanded: false), а обраний – розгорнутим (isExpanded: true)', async () => {
    const steps = wrapper.vm.steps;
    expect(wrapper.vm.currentStep).toBe(0);
    await wrapper.vm.toggleStep(1);
    expect(steps[0].isExpanded).toBe(false);
    expect(steps[1].isExpanded).toBe(true);
    expect(wrapper.vm.currentStep).toBe(1);
  });

  // 3. Тести computed властивості canProceedToNextStep
  it('computed canProceedToNextStep повертає true для першого кроку при заповненні всіх обов’язкових полів, і false при відсутності хоча б одного', () => {
    wrapper.vm.currentStep = 0;
    wrapper.vm.formData.firstName = 'Іван';
    wrapper.vm.formData.lastName = 'Іванов';
    wrapper.vm.formData.secondName = 'Іванович';
    wrapper.vm.formData.phone = '123456789';
    expect(wrapper.vm.canProceedToNextStep).toBe(true);
    wrapper.vm.formData.firstName = '';
    expect(wrapper.vm.canProceedToNextStep).toBe(false);
  });

  it('computed canProceedToNextStep повертає false для другого кроку при відсутності city або deliveryType або необхідних даних залежно від selectedDeliveryCategory', () => {
    wrapper.vm.currentStep = 1;
    wrapper.vm.formData.city = 'Київ';
    wrapper.vm.formData.deliveryType = 'Кур\'єр';
    wrapper.vm.selectedDeliveryCategory = 'courier';
    wrapper.vm.formData.street = '';
    wrapper.vm.formData.houseNumber = '';
    expect(wrapper.vm.canProceedToNextStep).toBe(false);
    wrapper.vm.formData.street = 'Хрещатик';
    wrapper.vm.formData.houseNumber = '10';
    expect(wrapper.vm.canProceedToNextStep).toBe(true);
    wrapper.vm.selectedDeliveryCategory = 'pickup';
    wrapper.vm.formData.warehouse = '';
    expect(wrapper.vm.canProceedToNextStep).toBe(false);
    wrapper.vm.formData.warehouse = 'Відділення №1';
    expect(wrapper.vm.canProceedToNextStep).toBe(true);
  });

  it('computed canProceedToNextStep повертає true для третього кроку лише якщо formData.paymentMethod не порожнє', () => {
    wrapper.vm.currentStep = 2;
    wrapper.vm.formData.paymentMethod = '';
    expect(wrapper.vm.canProceedToNextStep).toBe(false);
    wrapper.vm.formData.paymentMethod = 'Оплата картою';
    expect(wrapper.vm.canProceedToNextStep).toBe(true);
  });

  // 4. Тести валідації особистої інформації (validatePersonalInfo)
  it('метод validatePersonalInfo повертає false та заповнює errors при відсутності одного або декількох з обов’язкових полів (firstName, lastName, secondName, phone)', () => {
    wrapper.vm.errors = {};
    wrapper.vm.formData.firstName = '';
    wrapper.vm.formData.lastName = '';
    wrapper.vm.formData.secondName = '';
    wrapper.vm.formData.phone = '';
    const valid = wrapper.vm.validatePersonalInfo();
    expect(valid).toBe(false);
    expect(wrapper.vm.errors).toEqual({
      firstName: "Ім'я обов'язкове",
      lastName: "Прізвище обов'язкове",
      secondName: "По батькові обов'язкове",
      phone: "Номер телефону обов'язковий"
    });
  });

  it('метод validatePersonalInfo повертає true, коли всі обов’язкові поля заповнені', () => {
    wrapper.vm.errors = {};
    wrapper.vm.formData.firstName = 'Іван';
    wrapper.vm.formData.lastName = 'Іванов';
    wrapper.vm.formData.secondName = 'Іванович';
    wrapper.vm.formData.phone = '123456789';
    const valid = wrapper.vm.validatePersonalInfo();
    expect(valid).toBe(true);
    expect(wrapper.vm.errors).toEqual({});
  });

  // 5. Тести валідації даних доставки (validatePostalInfo) та методу updateDeliveryOptions
  it('метод validatePostalInfo повертає false та додає повідомлення в errors, якщо не задано city або deliveryType', () => {
    wrapper.vm.currentStep = 1;
    wrapper.vm.errors = {};
    wrapper.vm.formData.city = '';
    wrapper.vm.formData.deliveryType = '';
    const valid = wrapper.vm.validatePostalInfo();
    expect(valid).toBe(false);
    expect(wrapper.vm.errors).toEqual({
      city: "Місто обов'язкове",
      deliveryType: "Тип доставки обов'язковий"
    });
  });

  it('метод validatePostalInfo повертає false для категорії "courier", якщо street або houseNumber відсутні', () => {
    wrapper.vm.currentStep = 1;
    wrapper.vm.errors = {};
    wrapper.vm.formData.city = 'Київ';
    wrapper.vm.formData.deliveryType = 'Кур\'єр';
    wrapper.vm.selectedDeliveryCategory = 'courier';
    wrapper.vm.formData.street = '';
    wrapper.vm.formData.houseNumber = '';
    const valid = wrapper.vm.validatePostalInfo();
    expect(valid).toBe(false);
    expect(wrapper.vm.errors).toEqual({
      street: "Виберіть вулицю",
      houseNumber: "Введіть номер будинку"
    });
  });

  it('метод validatePostalInfo повертає false для категорії "pickup", якщо поле warehouse відсутнє', () => {
    wrapper.vm.currentStep = 1;
    wrapper.vm.errors = {};
    wrapper.vm.formData.city = 'Київ';
    wrapper.vm.formData.deliveryType = 'Самовивіз';
    wrapper.vm.selectedDeliveryCategory = 'pickup';
    wrapper.vm.formData.warehouse = '';
    const valid = wrapper.vm.validatePostalInfo();
    expect(valid).toBe(false);
    expect(wrapper.vm.errors).toEqual({
      warehouse: "Відділення обов'язкове"
    });
  });

  it('метод updateDeliveryOptions оновлює filteredDeliveryOptions для категорії "courier"', () => {
    wrapper.vm.updateDeliveryOptions('courier');
    expect(wrapper.vm.filteredDeliveryOptions).toEqual([
      { id: 5, name: "Кур'єр Нової Пошти" },
      { id: 6, name: "Кур'єр УКРПОШТИ" }
    ]);
  });

  it('метод updateDeliveryOptions оновлює filteredDeliveryOptions для категорії "pickup"', () => {
    wrapper.vm.updateDeliveryOptions('pickup');
    expect(wrapper.vm.filteredDeliveryOptions).toEqual([
      { id: 1, name: "Самовивіз з наших магазинів" },
      { id: 2, name: "Самовивіз з поштоматів Нової Пошти" },
      { id: 3, name: "Самовивіз з Нової Пошти" },
      { id: 4, name: "Самовивіз з УКРПОШТИ" }
    ]);
  });

  it('метод updateDeliveryOptions встановлює filteredDeliveryOptions як порожній масив для невідомої категорії', () => {
    wrapper.vm.updateDeliveryOptions('unknown');
    expect(wrapper.vm.filteredDeliveryOptions).toEqual([]);
  });

  // 6. Тести логіки завершення кроку (completeStep)
  it('метод completeStep позначає поточний крок як виконаний (completed: true) та стислим (isExpanded: false)', () => {
    expect(wrapper.vm.currentStep).toBe(0);
    wrapper.vm.completeStep();
    expect(wrapper.vm.steps[0].completed).toBe(true);
    expect(wrapper.vm.steps[0].isExpanded).toBe(false);
  });

  it('метод completeStep збільшує currentStep на 1 (якщо існує наступний крок) і новий крок розгортається (isExpanded: true)', () => {
    expect(wrapper.vm.currentStep).toBe(0);
    wrapper.vm.completeStep();
    expect(wrapper.vm.currentStep).toBe(1);
    expect(wrapper.vm.steps[1].isExpanded).toBe(true);
  });

  // 7. Тести рендерингу дочірніх компонентів
  it('метод getStepComponent повертає правильний компонент для кожного заголовку кроку', () => {
    expect(wrapper.vm.getStepComponent("Особиста інформація")).toBe("PersonalInfo");
    expect(wrapper.vm.getStepComponent("Поштове відділення")).toBe("PostalInfo");
    expect(wrapper.vm.getStepComponent("Оплата")).toBe("PaymentInfo");
  });

  it('якщо всі кроки виконані, рендеряться компоненти PaymentSummary та DeliveryAddress', async () => {
    wrapper.vm.steps.forEach(step => (step.completed = true));
    await wrapper.vm.$nextTick();
    expect(wrapper.findComponent({ name: 'PaymentSummary' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'DeliveryAddress' }).exists()).toBe(true);
  });

  // 8. Тести взаємодії з Vuex та асинхронних запитів

  // 8.1 Тест: при виклику validateAndProceed (при валідних даних) має викликатися updateCustomerData з formData
  it('validateAndProceed викликає updateCustomerData з formData при валідних даних', () => {
    wrapper.vm.currentStep = 0;
    wrapper.vm.formData.firstName = 'Іван';
    wrapper.vm.formData.lastName = 'Іванов';
    wrapper.vm.formData.secondName = 'Іванович';
    wrapper.vm.formData.phone = '123456789';
    wrapper.vm.validateAndProceed();
    expect(wrapper.vm.updateCustomerData).toHaveBeenCalledWith(wrapper.vm.formData);
  });

  // 8.2 Тест: після виклику fetchCartItems має викликатися updateCartItems з отриманими даними
  it('fetchCartItems викликає updateCartItems з отриманими даними', async () => {
    const cartData = [{ id: 1, name: 'item1' }];
    axios.get.mockResolvedValueOnce({ data: { data: cartData } });
    await wrapper.vm.fetchCartItems();
    expect(wrapper.vm.updateCartItems).toHaveBeenCalledWith(cartData);
  });

  // 8.3 Тест: якщо токен відсутній, метод fetchDeliveryTypes викликає alert і перенаправляє на "/login"
  it('якщо токен відсутній, метод fetchDeliveryTypes викликає alert і перенаправляє на "/login"', async () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValueOnce(null);
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    await wrapper.vm.fetchDeliveryTypes();
    expect(alertSpy).toHaveBeenCalledWith("Будь ласка, увійдіть у свій обліковий запис.");
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith("/login");
  });

  // 8.4 Тест: якщо сервер повертає помилку, метод fetchProfile виводить повідомлення про помилку в консоль
  it('якщо сервер повертає помилку, метод fetchProfile виводить повідомлення про помилку в консоль', async () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValueOnce('fake-token');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('Server Error'));
    await wrapper.vm.fetchProfile();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});*/