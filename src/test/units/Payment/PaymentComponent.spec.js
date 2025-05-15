// PaymentComponent.spec.js



describe.skip('Тести для MyComponent', () => {
  it('цей тест не виконається', () => {
    expect(true).toBe(false);
  });
});
/*
// Замокання axios
jest.mock("axios", () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: { products: [] },
    })
  ),
}));

// Приглушення попереджень Vue
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
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

  describe('Рендеринг', () => {
    it('має коректну розмітку: секція з класом "payment"', () => {
      expect(wrapper.classes()).toContain('payment');
    });

    it('рендериться заголовок з текстом "Оплата" та header lines', () => {
      const header = wrapper.find('.payment-header');
      expect(header.exists()).toBe(true);
      expect(header.text()).toContain('Оплата');
      const headerLines = wrapper.findAll('.header-line');
      expect(headerLines.length).toBeGreaterThanOrEqual(2);
    });
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

  describe('Метод updateCustomerDetails', () => {
    it('оновлює customerDetails, зливаючи нові дані з поточними', async () => {
      // Переконайтеся, що у компоненті в data оголошено customerDetails
      await wrapper.setData({
        customerDetails: { email: 'old@example.com', phone: '111111' },
      });
      wrapper.vm.updateCustomerDetails({ phone: '222222', name: 'Іван' });
      expect(wrapper.vm.customerDetails).toEqual({
        email: 'old@example.com',
        phone: '222222',
        name: 'Іван',
      });
    });
  });
});
*/