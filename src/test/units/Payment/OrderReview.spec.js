// describe.skip('Тести для MyComponent', () => {
//     it('цей тест не виконається', () => {
//       expect(true).toBe(false)
//     })
//   })
  
  //Протестовано головні аспекти
  
import { shallowMount } from '@vue/test-utils';
import OrderReview from '@/components/Payment/OrderReview.vue';
import axios from 'axios';

// Перед усіма тестами перевизначаємо window.alert, щоб уникнути помилок у jsdom
beforeAll(() => {
  window.alert = jest.fn();
});

// Допоміжна функція для очікування завершення всіх промісів
function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Мокаємо axios для уникнення реальних HTTP‑запитів
jest.mock('axios', () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: { products: [] },
    })
  ),
}));

// Загальний мок для $router
const globalMocks = {
  $router: {
    push: jest.fn(),
  },
};

// Створюємо стаб для $store (якщо потрібен)
const storeMock = {
  _modulesNamespaceMap: {
    "order/": {}
  },
  getters: {
    "order/cartItems": () => [],
    "order/deliveryCost": () => 30,
    "order/customerData": () => {}
  }
};

// Stub для PaymentSummary з явно вказаними пропсами
const PaymentSummaryStub = {
  name: 'PaymentSummary',
  props: {
    cartItems: {
      type: Array,
      default: () => []
    },
    deliveryCost: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    cityRef: {
      type: String,
      default: ''
    },
    deliveryType: {
      type: String,
      default: ''
    }
  },
  template: `<div class="payment-summary-stub"></div>`,
};

describe('OrderReview.vue', () => {
  describe('Рендеринг базових елементів', () => {
    it('повинен відображати повідомлення про оплату', () => {
      const wrapper = shallowMount(OrderReview, {
        global: { mocks: globalMocks },
        stubs: { PaymentSummary: true },
        data() {
          return { localCartItems: [] };
        },
      });
      const paymentNotice = wrapper.find('.payment-notice');
      expect(paymentNotice.exists()).toBe(true);
      expect(paymentNotice.text()).toContain('Будь ласка, перевірте своє замовлення перед оплатою.');
    });

    it('повинен рендерити список товарів з даними', () => {
      const cartItems = [
        { id: 1, image: 'image1.png', title: 'Product 1', price: 100, quantity: 1 },
        { id: 2, image: 'image2.png', title: 'Product 2', price: 200, quantity: 2 },
      ];
      const wrapper = shallowMount(OrderReview, {
        global: { mocks: globalMocks },
        stubs: { PaymentSummary: true },
        data() {
          return { localCartItems: cartItems };
        },
      });
      const items = wrapper.findAll('.item');
      expect(items.length).toBe(cartItems.length);
      const firstItem = items.at(0);
      expect(firstItem.find('.item-image').attributes('src')).toBe('image1.png');
      expect(firstItem.find('.item-title').text()).toBe('Product 1');
      expect(firstItem.find('.item-price').text()).toContain('100');
      expect(firstItem.find('.item-quantity').text()).toContain('1');
    });

    it('повинен відображати повідомлення "Ваш кошик порожній", якщо localCartItems порожній', () => {
      const wrapper = shallowMount(OrderReview, {
        global: { mocks: globalMocks },
        stubs: { PaymentSummary: true },
        data() {
          return { localCartItems: [] };
        },
      });
      expect(wrapper.text()).toContain('Ваш кошик порожній.');
    });
  });

  describe('Обчислення загальної суми (calculatedTotalAmount)', () => {
    it('повинен коректно обчислювати загальну суму', () => {
      const cartItems = [
        { id: 1, image: 'image1.png', title: 'Product 1', price: 100, quantity: 2 },
        { id: 2, image: 'image2.png', title: 'Product 2', price: 50, quantity: 3 },
      ];
      const deliveryCost = 20;
      const wrapper = shallowMount(OrderReview, {
        global: { mocks: globalMocks },
        stubs: { PaymentSummary: true },
        data() {
          return { localCartItems: cartItems, deliveryCost };
        },
      });
      // (100 * 2) + (50 * 3) + 20 = 200 + 150 + 20 = 370
      expect(wrapper.vm.calculatedTotalAmount).toBe(370);
    });
  });

  describe('Метод submitOrder', () => {
    beforeEach(() => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('valid-token');
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('повинен викликати alert з текстом "Ваше замовлення успішно оформлено!" при виклику submitOrder', () => {
      const wrapper = shallowMount(OrderReview, {
        global: { mocks: globalMocks },
        stubs: { PaymentSummary: true },
      });
      wrapper.vm.submitOrder();
      expect(window.alert).toHaveBeenCalledWith("Ваше замовлення успішно оформлено!");
    });
  });

  describe('Метод validateAndProceed', () => {
    beforeEach(() => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('valid-token');
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('якщо обов’язкові дані відсутні, errors повинен містити повідомлення, а currentStep не змінюється', () => {
      const wrapper = shallowMount(OrderReview, {
        global: { mocks: globalMocks },
        stubs: { PaymentSummary: true },
      });
      wrapper.setData({
        currentStep: 0,
        formData: { firstName: '', lastName: '', phone: '' },
        errors: {},
      });
      wrapper.vm.validateAndProceed();
      expect(wrapper.vm.errors).toEqual({
        firstName: "Ім'я є обов'язковим",
        lastName: "Прізвище є обов'язковим",
        phone: "Телефон є обов'язковим",
      });
      expect(wrapper.vm.currentStep).toBe(0);
    });
    it('якщо поточний крок є останнім, має бути викликано alert і currentStep не змінюється', () => {
      const wrapper = shallowMount(OrderReview, {
        global: { mocks: globalMocks },
        stubs: { PaymentSummary: true },
      });
      wrapper.setData({
        currentStep: 2,
        formData: { firstName: 'Іван', lastName: 'Іванов', phone: '123456789' },
        errors: {},
        steps: [
          { title: "Особиста інформація", completed: true, isExpanded: false },
          { title: "Поштове відділення", completed: true, isExpanded: false },
          { title: "Оплата", completed: false, isExpanded: true },
        ],
      });
      wrapper.vm.validateAndProceed();
      expect(window.alert).toHaveBeenCalledWith("Замовлення успішно підтверджене!");
      expect(wrapper.vm.currentStep).toBe(2);
    });
  });

  describe('Перевірка mounted хуку', () => {
    it('автоматично викликає метод fetchCartItems при монтуванні', () => {
      const fetchSpy = jest.spyOn(OrderReview.methods, 'fetchCartItems');
      shallowMount(OrderReview, {
        global: { mocks: globalMocks },
        stubs: { PaymentSummary: true },
      });
      expect(fetchSpy).toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  });
});

describe('Асинхронне завантаження даних (fetchCartItems)', () => {
  beforeEach(() => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('valid-token');
    axios.get.mockClear();
    globalMocks.$router.push.mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    window.alert = jest.fn();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('повинен викликатися при монтуванні компонента та завантажувати дані', async () => {
    let promiseResolve;
    const dummyPromise = new Promise(resolve => {
      promiseResolve = resolve;
    });
    axios.get.mockReturnValueOnce(dummyPromise);
    const wrapper = shallowMount(OrderReview, {
      global: { mocks: globalMocks },
      stubs: { PaymentSummary: true },
    });
    expect(wrapper.vm.loading).toBe(true);
    promiseResolve({
      data: {
        products: [
          { id: 1, image_url: 'apiImage1.png', name: 'API Product 1', price: 120, quantity: 1 },
          { id: 2, image_url: 'apiImage2.png', name: 'API Product 2', price: 80, quantity: 4 },
        ],
      },
    });
    await flushPromises();
    expect(axios.get).toHaveBeenCalledWith("http://26.235.139.202:8080/api/cart", {
      headers: { Authorization: `Bearer valid-token` },
    });
    expect(wrapper.vm.localCartItems).toEqual([
      { id: 1, image: 'apiImage1.png', title: 'API Product 1', price: 120, quantity: 1 },
      { id: 2, image: 'apiImage2.png', title: 'API Product 2', price: 80, quantity: 4 },
    ]);
    expect(wrapper.vm.loading).toBe(false);
  });
  it('повинен обробляти помилку завантаження (axios.reject) і викликати alert з "Не вдалося завантажити кошик."', async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));
    const wrapper = shallowMount(OrderReview, {
      global: { mocks: globalMocks },
      stubs: { PaymentSummary: true },
    });
    await flushPromises();
    expect(window.alert).toHaveBeenCalledWith("Не вдалося завантажити кошик.");
    expect(wrapper.vm.loading).toBe(false);
  });
  it('повинен перенаправляти користувача, якщо токен відсутній', async () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);
    const wrapper = shallowMount(OrderReview, {
      global: { mocks: globalMocks },
      stubs: { PaymentSummary: true },
    });
    await flushPromises();
    expect(window.alert).toHaveBeenCalledWith("Будь ласка, увійдіть у свій обліковий запис.");
    expect(globalMocks.$router.push).toHaveBeenCalledWith("/login");
  });
});
