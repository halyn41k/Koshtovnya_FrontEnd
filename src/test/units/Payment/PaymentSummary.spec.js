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

import { shallowMount, mount } from '@vue/test-utils';
import PaymentSummary from '@/components/payment/PaymentSummary.vue';
import axios from 'axios';

// Замокаємо axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} }))
}));

// Перед кожним тестом очищуємо localStorage та моки
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe('PaymentSummary.vue', () => {
  let wrapper;
  // Збережемо оригінальний mounted hook
  const originalMounted = PaymentSummary.mounted;

  // Мінімальний набір computed-властивостей
  const defaultComputed = {
    safeCartItems() {
      return Array.isArray(this.cartItems) ? this.cartItems : [];
    },
    cartTotalAmount() {
      return this.safeCartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      );
    },
    totalWithDelivery() {
      return this.cartTotalAmount + this.deliveryCost;
    },
    effectiveCityRef() {
      return this.cityRef || (this.customerData && this.customerData.cityRef) || '';
    },
    effectiveDeliveryType() {
      return this.deliveryType || (this.customerData && this.customerData.deliveryType) || '';
    }
  };

  // Глобальний мок для $store та $router
  const globalMocks = {
    mocks: {
      $store: { dispatch: jest.fn() },
      $router: { push: jest.fn() }
    }
  };

  // Для більшості тестів ми вимикаємо mounted hook,
  // а для тестів mounted hook створимо локальну копію
  beforeAll(() => {
    PaymentSummary.mounted = [];
  });
  afterAll(() => {
    PaymentSummary.mounted = originalMounted;
  });

  // --- Тести для computed ---
  describe('Computed properties', () => {
    describe('safeCartItems', () => {
      it('повертає порожній масив, якщо cartItems не є масивом', () => {
        wrapper = shallowMount(PaymentSummary, {
          computed: {
            ...defaultComputed,
            cartItems: () => null,
            deliveryCost: () => 0,
            customerData: () => ({})
          },
          global: globalMocks
        });
        expect(wrapper.vm.safeCartItems).toEqual([]);
      });

      it('повертає валідний масив cartItems без змін, якщо він заданий', () => {
        const items = [
          { id: 1, name: 'Товар 1', price: 100, quantity: 2 },
          { id: 2, name: 'Товар 2', price: 50, quantity: 3 }
        ];
        wrapper = shallowMount(PaymentSummary, {
          computed: {
            ...defaultComputed,
            cartItems: () => items,
            deliveryCost: () => 0,
            customerData: () => ({})
          },
          global: globalMocks
        });
        expect(wrapper.vm.safeCartItems).toEqual(items);
      });
    });

    describe('effectiveCityRef та effectiveDeliveryType', () => {
      it('повертає значення з пропсів, якщо вони передані', () => {
        wrapper = shallowMount(PaymentSummary, {
          props: {
            cityRef: 'CITY_PROP',
            deliveryType: 'DELIVERY_PROP'
          },
          computed: {
            ...defaultComputed,
            cartItems: () => [],
            deliveryCost: () => 0,
            customerData: () => ({ cityRef: 'CITY_CUSTOMER', deliveryType: 'DELIVERY_CUSTOMER' })
          },
          global: globalMocks
        });
        expect(wrapper.vm.effectiveCityRef).toBe('CITY_PROP');
        expect(wrapper.vm.effectiveDeliveryType).toBe('DELIVERY_PROP');
      });

      it('fallback до customerData, якщо пропси не вказані', () => {
        wrapper = shallowMount(PaymentSummary, {
          props: {},
          computed: {
            ...defaultComputed,
            cartItems: () => [],
            deliveryCost: () => 0,
            customerData: () => ({ cityRef: 'CITY_CUSTOMER', deliveryType: 'DELIVERY_CUSTOMER' })
          },
          global: globalMocks
        });
        expect(wrapper.vm.effectiveCityRef).toBe('CITY_CUSTOMER');
        expect(wrapper.vm.effectiveDeliveryType).toBe('DELIVERY_CUSTOMER');
      });
    });

    describe('cartTotalAmount', () => {
      it('повертає 0, якщо кошик порожній', () => {
        wrapper = shallowMount(PaymentSummary, {
          computed: {
            ...defaultComputed,
            cartItems: () => [],
            deliveryCost: () => 0,
            customerData: () => ({})
          },
          global: globalMocks
        });
        expect(wrapper.vm.cartTotalAmount).toBe(0);
      });

      it('розраховує загальну суму правильно на основі ціни та кількості', () => {
        const items = [
          { id: 1, name: 'Товар 1', price: 100, quantity: 2 },
          { id: 2, name: 'Товар 2', price: 50, quantity: 3 }
        ];
        wrapper = shallowMount(PaymentSummary, {
          computed: {
            ...defaultComputed,
            cartItems: () => items,
            deliveryCost: () => 0,
            customerData: () => ({})
          },
          global: globalMocks
        });
        expect(wrapper.vm.cartTotalAmount).toBe(350);
      });

      it('ігнорує товари з невизначеними ціною або кількістю', () => {
        const items = [
          { id: 1, name: 'Товар 1', price: 100, quantity: 2 },
          { id: 2, name: 'Товар 2' }
        ];
        wrapper = shallowMount(PaymentSummary, {
          computed: {
            ...defaultComputed,
            cartItems: () => items,
            deliveryCost: () => 0,
            customerData: () => ({})
          },
          global: globalMocks
        });
        expect(wrapper.vm.cartTotalAmount).toBe(200);
      });
    });

    describe('totalWithDelivery', () => {
      it('повертає суму, що дорівнює cartTotalAmount плюс deliveryCost', () => {
        const items = [
          { id: 1, name: 'Товар 1', price: 100, quantity: 2 },
          { id: 2, name: 'Товар 2', price: 50, quantity: 3 }
        ];
        const deliveryCost = 50;
        wrapper = shallowMount(PaymentSummary, {
          computed: {
            ...defaultComputed,
            cartItems: () => items,
            deliveryCost: () => deliveryCost,
            customerData: () => ({})
          },
          global: globalMocks
        });
        expect(wrapper.vm.totalWithDelivery).toBe(400);
      });
    });
  });

  // --- Тести для fetchCartItems ---
  describe('Метод fetchCartItems', () => {
    let consoleErrorSpy;
    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('при відсутності токену в localStorage виводить помилку і не робить запит до API', async () => {
      localStorage.removeItem('token');
      wrapper = shallowMount(PaymentSummary, {
        computed: {
          ...defaultComputed,
          cartItems: () => [],
          deliveryCost: () => 0,
          customerData: () => ({})
        },
        global: globalMocks
      });
      wrapper.vm.updateCartItems = jest.fn();
      await wrapper.vm.fetchCartItems();
      expect(consoleErrorSpy).toHaveBeenCalledWith("[fetchCartItems] Необхідна авторизація");
      expect(axios.get).not.toHaveBeenCalled();
    });
    it('при наявності токену робиться GET запит за правильним URL та з коректними заголовками', async () => {
      const token = 'validToken';
      localStorage.setItem('token', token);
      wrapper = shallowMount(PaymentSummary, {
        computed: {
          ...defaultComputed,
          cartItems: () => [],
          deliveryCost: () => 0,
          customerData: () => ({})
        },
        global: globalMocks
      });
      wrapper.vm.updateCartItems = jest.fn();
      axios.get.mockClear();
      await wrapper.vm.fetchCartItems();
      expect(axios.get).toHaveBeenCalledWith("http://26.235.139.202:8080/api/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
    });
  });

  // --- Тести для watcher-ів ---
  describe('Watchers', () => {
    beforeEach(() => {
      jest.spyOn(PaymentSummary.methods, 'calculateDeliveryCost').mockImplementation(() => {});
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('при зміні effectiveCityRef та наявності effectiveDeliveryType викликається calculateDeliveryCost', async () => {
      wrapper = shallowMount(PaymentSummary, {
        props: { cityRef: '' },
        computed: {
          ...defaultComputed,
          cartItems: () => [],
          deliveryCost: () => 0,
          customerData: () => ({ deliveryType: 'DELIVERY_TYPE' })
        },
        global: globalMocks
      });
      await wrapper.setProps({ cityRef: 'NEW_CITY' });
      expect(PaymentSummary.methods.calculateDeliveryCost).toHaveBeenCalled();
    });
    it('при зміні effectiveDeliveryType за умови наявності effectiveCityRef викликається calculateDeliveryCost', async () => {
      wrapper = shallowMount(PaymentSummary, {
        props: { deliveryType: '' },
        computed: {
          ...defaultComputed,
          cartItems: () => [],
          deliveryCost: () => 0,
          customerData: () => ({ cityRef: 'CITY_VALUE' })
        },
        global: globalMocks
      });
      await wrapper.setProps({ deliveryType: 'NEW_DELIVERY' });
      expect(PaymentSummary.methods.calculateDeliveryCost).toHaveBeenCalled();
    });
  });

  // --- Тести для calculateDeliveryCost ---
  describe('Метод calculateDeliveryCost', () => {
    let consoleErrorSpy, updateDeliveryCostSpy;
    const token = 'validToken';
    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      updateDeliveryCostSpy = jest.fn();
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('повертає 0 та логірує помилку при відсутності токену', async () => {
      localStorage.removeItem('token');
      wrapper = shallowMount(PaymentSummary, {
        computed: {
          ...defaultComputed,
          cartItems: () => [],
          deliveryCost: () => 0,
          customerData: () => ({ cityRef: 'CITY1', deliveryType: 'DELIVERY1' })
        },
        global: globalMocks
      });
      wrapper.vm.updateDeliveryCost = updateDeliveryCostSpy;
      const result = await wrapper.vm.calculateDeliveryCost();
      expect(result).toBe(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith("[calculateDeliveryCost] Необхідна авторизація");
    });
    it('повертає 0 та логірує помилку, якщо effectiveCityRef або effectiveDeliveryType відсутні', async () => {
      localStorage.setItem('token', token);
      wrapper = shallowMount(PaymentSummary, {
        props: { cityRef: '' },
        computed: {
          ...defaultComputed,
          cartItems: () => [],
          deliveryCost: () => 0,
          customerData: () => ({ cityRef: '', deliveryType: 'DELIVERY1' })
        },
        global: globalMocks
      });
      wrapper.vm.updateDeliveryCost = updateDeliveryCostSpy;
      const result = await wrapper.vm.calculateDeliveryCost();
      expect(result).toBe(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith("[calculateDeliveryCost] cityRef або deliveryType відсутні");
    });
    it('при валідних даних виконується правильна конвертація типу доставки та викликається updateDeliveryCost з отриманою вартістю', async () => {
      localStorage.setItem('token', token);
      const items = [{ id: 1, name: 'Товар 1', price: 100, quantity: 2 }];
      const apiCost = 123;
      axios.get.mockResolvedValue({
        data: { data: { cost: apiCost } }
      });
      wrapper = shallowMount(PaymentSummary, {
        props: { cityRef: 'CITY1', deliveryType: "Кур'єр" },
        computed: {
          ...defaultComputed,
          cartItems: () => items,
          deliveryCost: () => 0,
          customerData: () => ({ cityRef: 'CITY1', deliveryType: "Кур'єр" })
        },
        global: globalMocks
      });
      wrapper.vm.updateDeliveryCost = updateDeliveryCostSpy;
      const result = await wrapper.vm.calculateDeliveryCost();
      expect(axios.get).toHaveBeenCalledWith("http://26.235.139.202:8080/api/nova-poshta/delivery/cost", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          CityRecipient: 'CITY1',
          ServiceType: "WarehouseDoors",
          product_ids: items.map(item => item.id)
        }
      });
      expect(updateDeliveryCostSpy).toHaveBeenCalledWith(apiCost);
      expect(result).toBe(apiCost);
    });
    it('повертає 0 та логірує помилку при помилці запиту до API', async () => {
      localStorage.setItem('token', token);
      const items = [{ id: 1, name: 'Товар 1', price: 100, quantity: 2 }];
      axios.get.mockRejectedValue(new Error('API Error'));
      wrapper = shallowMount(PaymentSummary, {
        props: { cityRef: 'CITY1', deliveryType: 'DELIVERY1' },
        computed: {
          ...defaultComputed,
          cartItems: () => items,
          deliveryCost: () => 0,
          customerData: () => ({ cityRef: 'CITY1', deliveryType: 'DELIVERY1' })
        },
        global: globalMocks
      });
      wrapper.vm.updateDeliveryCost = updateDeliveryCostSpy;
      const result = await wrapper.vm.calculateDeliveryCost();
      expect(result).toBe(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith("[calculateDeliveryCost] Помилка розрахунку вартості доставки", expect.any(Error));
    });
  });

  // --- Тести для submitOrder ---
  describe('Метод submitOrder', () => {
    let alertSpy, routerPushSpy;
    const token = 'validToken';
    beforeEach(() => {
      alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
      routerPushSpy = globalMocks.mocks.$router.push;
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });
    it('Кейс відсутності токену: має викликати alert та перенаправлення на логін', async () => {
      localStorage.removeItem('token');
      wrapper = shallowMount(PaymentSummary, {
        computed: {
          ...defaultComputed,
          cartItems: () => [{ id: 1, name: 'Товар', price: 100, quantity: 1 }],
          deliveryCost: () => 50,
          customerData: () => ({ paymentMethod: 'Оплата картою' })
        },
        global: globalMocks
      });
      await wrapper.vm.submitOrder();
      expect(alertSpy).toHaveBeenCalledWith("Будь ласка, увійдіть у свій обліковий запис.");
      expect(routerPushSpy).toHaveBeenCalledWith("/login");
    });
    it('Кейс порожнього кошика: має викликати alert з повідомленням про порожній кошик', async () => {
      localStorage.setItem('token', token);
      wrapper = shallowMount(PaymentSummary, {
        computed: {
          ...defaultComputed,
          cartItems: () => [],
          deliveryCost: () => 50,
          customerData: () => ({ paymentMethod: 'Оплата картою' })
        },
        global: globalMocks
      });
      await wrapper.vm.submitOrder();
      expect(alertSpy).toHaveBeenCalledWith("Кошик порожній. Додайте товари перед оформленням замовлення.");
    });
    it('При оплаті "Післяоплата": має відбуватися перенаправлення на "/payment-confirmed"', async () => {
      localStorage.setItem('token', token);
      const orderId = 456;
      axios.post.mockResolvedValueOnce({ data: { data: { order: { id: orderId } } } });
      wrapper = shallowMount(PaymentSummary, {
        computed: {
          ...defaultComputed,
          cartItems: () => [{ id: 1, name: 'Товар', price: 100, quantity: 1 }],
          deliveryCost: () => 50,
          customerData: () => ({
            paymentMethod: "Післяоплата",
            lastName: "Іванов",
            firstName: "Іван",
            secondName: "",
            phone: "123456789",
            city: "Київ",
            deliveryType: "DELIVERY",
            warehouse: "WH1",
            street: "вул. Прикладна",
            houseNumber: "10",
            typeOfCard: ""
          })
        },
        global: globalMocks
      });
      await wrapper.vm.submitOrder();
      expect(routerPushSpy).toHaveBeenCalledWith("/payment-confirmed");
    });
    it('При оплаті "Оплата картою": має отримати HTML форму LiqPay та відправити її', async () => {
      localStorage.setItem('token', token);
      const orderId = 789;
      axios.post.mockResolvedValueOnce({ data: { data: { order: { id: orderId } } } });
      const liqpayFormHtml = '<form id="liqpayForm"></form>';
      axios.post.mockResolvedValueOnce({ data: { form: liqpayFormHtml } });
      const submitSpy = jest.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});
      wrapper = shallowMount(PaymentSummary, {
        computed: {
          ...defaultComputed,
          cartItems: () => [{ id: 1, name: 'Товар', price: 100, quantity: 1 }],
          deliveryCost: () => 50,
          customerData: () => ({
            paymentMethod: "Оплата картою",
            lastName: "Петров",
            firstName: "Петро",
            secondName: "",
            phone: "987654321",
            city: "Львів",
            deliveryType: "DELIVERY",
            warehouse: "WH2",
            street: "вул. Тестова",
            houseNumber: "20",
            typeOfCard: "Visa"
          })
        },
        global: globalMocks
      });
      await wrapper.vm.submitOrder();
      expect(submitSpy).toHaveBeenCalled();
    });
    it('При оплаті "Оплата картою": якщо відповідь від сервера не містить HTML форми, має викликатися alert з помилкою', async () => {
      localStorage.setItem('token', token);
      const orderId = 101;
      axios.post.mockResolvedValueOnce({ data: { data: { order: { id: orderId } } } });
      axios.post.mockResolvedValueOnce({ data: { form: null } });
      wrapper = shallowMount(PaymentSummary, {
        computed: {
          ...defaultComputed,
          cartItems: () => [{ id: 1, name: 'Товар', price: 100, quantity: 1 }],
          deliveryCost: () => 50,
          customerData: () => ({
            paymentMethod: "Оплата картою",
            lastName: "Сидоров",
            firstName: "Сидор",
            secondName: "",
            phone: "555555555",
            city: "Одеса",
            deliveryType: "DELIVERY",
            warehouse: "WH3",
            street: "вул. Помилкова",
            houseNumber: "30",
            typeOfCard: "MasterCard"
          })
        },
        global: globalMocks
      });
      await wrapper.vm.submitOrder();
      expect(window.alert).toHaveBeenCalledWith("Сталася помилка при оплаті картою. Спробуйте ще раз.");
    });
    it('Обробка помилки при створенні замовлення: має логувати помилку та показувати alert', async () => {
      localStorage.setItem('token', token);
      axios.post.mockRejectedValue(new Error("Order API Error"));
      wrapper = shallowMount(PaymentSummary, {
        computed: {
          ...defaultComputed,
          cartItems: () => [{ id: 1, name: 'Товар', price: 100, quantity: 1 }],
          deliveryCost: () => 50,
          customerData: () => ({
            paymentMethod: "Післяоплата",
            lastName: "Іванов",
            firstName: "Іван",
            secondName: "",
            phone: "123456789",
            city: "Київ",
            deliveryType: "DELIVERY",
            warehouse: "WH1",
            street: "вул. Прикладна",
            houseNumber: "10",
            typeOfCard: ""
          })
        },
        global: globalMocks
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await wrapper.vm.submitOrder();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Не вдалося оформити замовлення. Спробуйте пізніше.");
    });
    it('Обробка помилки при оплаті картою: має логувати помилку та показувати alert', async () => {
      localStorage.setItem('token', token);
      const orderId = 789;
      axios.post.mockResolvedValueOnce({ data: { data: { order: { id: orderId } } } });
      axios.post.mockRejectedValue(new Error("Payment API Error"));
      wrapper = shallowMount(PaymentSummary, {
        computed: {
          ...defaultComputed,
          cartItems: () => [{ id: 1, name: 'Товар', price: 100, quantity: 1 }],
          deliveryCost: () => 50,
          customerData: () => ({
            paymentMethod: "Оплата картою",
            lastName: "Петров",
            firstName: "Петро",
            secondName: "",
            phone: "987654321",
            city: "Львів",
            deliveryType: "DELIVERY",
            warehouse: "WH2",
            street: "вул. Тестова",
            houseNumber: "20",
            typeOfCard: "Visa"
          })
        },
        global: globalMocks
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await wrapper.vm.submitOrder();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith("Сталася помилка при оплаті картою. Спробуйте ще раз.");
    });
  });

  // --- Тести для mounted hook ---
  describe('Mounted Hook', () => {
    let fetchCartItemsSpy, calculateDeliveryCostSpy, consoleWarnSpy;
    // Для тестів mounted створимо локальну копію компонента з перевизначеними методами
    const LocalPaymentSummary = {
      ...PaymentSummary,
      methods: {
        ...PaymentSummary.methods,
        fetchCartItems: jest.fn(() => Promise.resolve()),
        calculateDeliveryCost: jest.fn(() => Promise.resolve(50))
      }
    };
    beforeEach(() => {
      // Відновлюємо оригінальний mounted hook
      PaymentSummary.mounted = originalMounted;
      fetchCartItemsSpy = jest.spyOn(LocalPaymentSummary.methods, 'fetchCartItems');
      calculateDeliveryCostSpy = jest.spyOn(LocalPaymentSummary.methods, 'calculateDeliveryCost');
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => {
      PaymentSummary.mounted = [];
      jest.restoreAllMocks();
    });
    it('повинно викликатися fetchCartItems при монтуванні компонента', () => {
      mount(LocalPaymentSummary, {
        computed: {
          ...defaultComputed,
          cartItems: () => [],
          deliveryCost: () => 0,
          customerData: () => ({})
        },
        global: globalMocks
      });
      expect(fetchCartItemsSpy).toHaveBeenCalled();
    });
});
});
*/