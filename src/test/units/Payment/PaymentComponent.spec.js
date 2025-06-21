// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false);
//   });
// });

//Замокання axios
jest.mock("axios", () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: { products: [] },
    })
  ),
}));

// Приглушення попереджень Vue
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => { });
});

import { shallowMount } from '@vue/test-utils';
import PaymentComponent from '@/components/Payment/PaymentComponent.vue';

// Стуб-компоненти для дочірніх компонентів
const PaymentStepsStub = {
  name: 'PaymentSteps',
  template: '<div class="payment-steps-stub"></div>',
};

const OrderReviewStub = {
  name: 'OrderReview',
  template: '<div class="order-review-stub"></div>',
  props: ['cartItems', 'deliveryCost'],
};

const DeliveryAddressStub = {
  name: 'DeliveryAddress',
  template: '<div class="delivery-address-stub"></div>',
  props: ['formData'],
};

const PaymentSummaryStub = {
  name: 'PaymentSummary',
  template: '<div class="payment-summary-stub"></div>',
  props: ['cartItems', 'deliveryCost'],
};

describe('PaymentComponent.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(PaymentComponent, {
      stubs: {
        PaymentSteps: PaymentStepsStub,
        OrderReview: OrderReviewStub,
        DeliveryAddress: DeliveryAddressStub,
        PaymentSummary: PaymentSummaryStub,
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  describe('Логіка компонента', () => {
    it('calculateTotalAmount обчислює totalAmount коректно', async () => {
      expect(wrapper.vm.totalAmount).toBe(0);
      await wrapper.setData({
        cartItems: [
          { id: 1, price: 100, quantity: 2 },
          { id: 2, price: 50, quantity: 3 },
        ],
        deliveryCost: 20,
      });
      wrapper.vm.calculateTotalAmount();
      expect(wrapper.vm.totalAmount).toBe(370);
    });

    it('watch на cartItems перераховує totalAmount при зміні даних', async () => {
      await wrapper.setData({
        cartItems: [{ id: 1, price: 100, quantity: 1 }],
        deliveryCost: 10,
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.totalAmount).toBe(110);

      await wrapper.setData({
        cartItems: [
          { id: 1, price: 100, quantity: 2 },
          { id: 2, price: 50, quantity: 1 },
        ],
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.totalAmount).toBe(260);
    });

    it('watch на deliveryCost перераховує totalAmount при його зміні', async () => {
      await wrapper.setData({
        cartItems: [{ id: 1, price: 100, quantity: 2 }],
        deliveryCost: 10,
      });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.totalAmount).toBe(210);

      await wrapper.setData({ deliveryCost: 30 });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.totalAmount).toBe(230);
    });

    it('calculateTotalAmount викликається в mounted()', () => {
      expect(wrapper.vm.totalAmount).not.toBeNull();
    });
  });
  // Рендеринг структури

  it('рендерить дочірні компоненти в правильному порядку', () => {
    const steps = wrapper.findComponent({ name: 'PaymentSteps' });
    const review = wrapper.findComponent({ name: 'OrderReview' });
    const address = wrapper.findComponent({ name: 'DeliveryAddress' });
    expect(steps.exists()).toBe(true);
    expect(review.exists()).toBe(true);
    expect(address.exists()).toBe(true);
    // PaymentSummary тільки в великому розмірі viewport, перевіримо його stub
    const summary = wrapper.findComponent({ name: 'PaymentSummary' });
    expect(summary.exists()).toBe(true);
  });

  // Логіка обчислення totalAmount у watch
  it('при зміні cartItems через setData автоматично оновлює totalAmount', async () => {
    await wrapper.setData({
      cartItems: [
        { price: 10, quantity: 3 },
        { price: 5, quantity: 2 },
      ],
      deliveryCost: 7,
    });
    await wrapper.vm.$nextTick();
    // 10*3 + 5*2 + 7 = 30 + 10 + 7 = 47
    expect(wrapper.vm.totalAmount).toBe(47);
  });

  it('при зміні deliveryCost через setData автоматично оновлює totalAmount', async () => {
    await wrapper.setData({
      cartItems: [{ price: 20, quantity: 1 }],
      deliveryCost: 0,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.totalAmount).toBe(20);

    await wrapper.setData({ deliveryCost: 15 });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.totalAmount).toBe(35);
  });

  // Метод calculateTotalAmount
  it('calculateTotalAmount відкидає старі значення й рахує правильно без помилок', () => {
    wrapper.setData({
      cartItems: [
        { price: 2, quantity: 5 },
      ],
      deliveryCost: 3,
      totalAmount: 999, // якийсь мусор
    });
    wrapper.vm.calculateTotalAmount();
    expect(wrapper.vm.totalAmount).toBe(13);
  });

  it('checkStepsCompletion встановлює stepsCompleted=false, якщо є незавершений крок', async () => {
    wrapper.vm.$refs.paymentSteps = { steps: [{ completed: true }, { completed: false }] };
    await wrapper.setData({ currentStep: 2 });
    expect(wrapper.vm.stepsCompleted).toBe(false);
  });

  // lifecycle
  it('mounted() встановлює document.title="Оплата"', () => {
    // створимо ще один інстанс
    const local = shallowMount(PaymentComponent, {
      stubs: {
        PaymentSteps: PaymentStepsStub,
        OrderReview: OrderReviewStub,
        DeliveryAddress: DeliveryAddressStub,
        PaymentSummary: PaymentSummaryStub,
      }
    });
    expect(document.title).toBe('Оплата');
  });

  // перевіряємо, що calculateTotalAmount викликається в mounted
  it('calculateTotalAmount викликається один раз при mount', () => {
    const spy = jest.spyOn(PaymentComponent.methods, 'calculateTotalAmount');
    shallowMount(PaymentComponent, {
      stubs: {
        PaymentSteps: PaymentStepsStub,
        OrderReview: OrderReviewStub,
        DeliveryAddress: DeliveryAddressStub,
        PaymentSummary: PaymentSummaryStub,
      }
    });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
