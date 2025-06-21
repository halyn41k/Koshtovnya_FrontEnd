// describe.skip('Тести для MyComponent', () => {
//     it('цей тест не виконається', () => {
//       expect(true).toBe(false)
//     })
//   })

//Протестовано головні аспекти

import { shallowMount } from '@vue/test-utils';
import OrderReview from '@/components/Payment/OrderReview.vue';
import axios from 'axios';

// Замокати alert і router
beforeAll(() => {
  window.alert = jest.fn();
});
const routerPush = jest.fn();
const globalMocks = { $router: { push: routerPush } };

// Утиліта для чекання промісів
function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Мокаємо axios.get
jest.mock('axios', () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: { products: [] },
    })
  ),
}));

describe('OrderReview.vue', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('рендерить повідомлення перед списком замовлення', () => {
    const wrapper = shallowMount(OrderReview, {
      global: { mocks: globalMocks },
    });
    const notice = wrapper.find('p.text-gray-700.font-semibold');
    expect(notice.exists()).toBe(true);
    expect(notice.text()).toBe('Будь ласка, перевірте своє замовлення перед оплатою.');
  });

  it('показує "Ваш кошик порожній.", коли localCartItems пустий', () => {
    const wrapper = shallowMount(OrderReview, {
      global: { mocks: globalMocks },
      data() { return { localCartItems: [] }; },
    });
    const emptyMsg = wrapper.find('section div.text-center.text-gray-500');
    expect(emptyMsg.exists()).toBe(true);
    expect(emptyMsg.text()).toBe('Ваш кошик порожній.');
  });

  it('calculatedTotalAmount рахує суму + deliveryCost', () => {
    const wrapper = shallowMount(OrderReview, {
      global: { mocks: globalMocks },
      data() {
        return {
          localCartItems: [
            { price: 10, quantity: 3 },
            { price: 5, quantity: 2 },
          ],
          deliveryCost: 7,
        };
      },
    });
    // 10*3 + 5*2 + 7 = 30 + 10 + 7 = 47
    expect(wrapper.vm.calculatedTotalAmount).toBe(47);
  });

  it('mounted викликає fetchCartItems', () => {
    const spy = jest.spyOn(OrderReview.methods, 'fetchCartItems');
    shallowMount(OrderReview, {
      global: { mocks: globalMocks },
    });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  describe('fetchCartItems', () => {
    it('завантажує дані та заповнює localCartItems', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('tok');
      const apiResponse = {
        data: {
          products: [
            { id: 1, image_url: 'u1.png', name: 'N1', price: 20, quantity: 2 },
          ],
        },
      };
      axios.get.mockResolvedValueOnce(apiResponse);

      const wrapper = shallowMount(OrderReview, {
        global: { mocks: globalMocks },
      });
      await flushPromises();

      expect(axios.get).toHaveBeenCalledWith(
        'https://koshtovnya.api-dev.bmax-edu.website/api/cart',
        { headers: { Authorization: 'Bearer tok' } }
      );
      expect(wrapper.vm.localCartItems).toEqual([
        { id: 1, image: 'u1.png', title: 'N1', price: 20, quantity: 2 },
      ]);
      expect(wrapper.vm.loading).toBe(false);
    });

    it('перенаправляє на /login, якщо токена немає', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);
      shallowMount(OrderReview, {
        global: { mocks: globalMocks },
      });
      await flushPromises();
      expect(routerPush).toHaveBeenCalledWith('/login');
    });

    it('показує alert при помилці мережі', async () => {
      jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('tok');
      axios.get.mockRejectedValueOnce(new Error('err'));
      const wrapper = shallowMount(OrderReview, {
        global: { mocks: globalMocks },
      });
      await flushPromises();
      expect(window.alert).toHaveBeenCalledWith('Не вдалося завантажити кошик.');
      expect(wrapper.vm.loading).toBe(false);
    });
  });

  it('submitOrder викликає alert з підтвердженням', () => {
    const wrapper = shallowMount(OrderReview, {
      global: { mocks: globalMocks },
    });
    wrapper.vm.submitOrder();
    expect(window.alert).toHaveBeenCalledWith('Ваше замовлення успішно оформлено!');
  });


  it('перемикає loading у вірне значення під час fetchCartItems', async () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('tok');
    // створюємо «затримку» у відповіді
    let resolveFetch;
    const pending = new Promise(res => { resolveFetch = res; });
    axios.get.mockReturnValueOnce(pending);

    const wrapper = shallowMount(OrderReview, { global: { mocks: globalMocks } });
    // одразу після mount — loading має бути true
    expect(wrapper.vm.loading).toBe(true);

    resolveFetch({ data: { products: [] } });
    await flushPromises();
    expect(wrapper.vm.loading).toBe(false);
  });

  it('не показує порожній контейнер, коли є товари', () => {
    const wrapper = shallowMount(OrderReview, {
      global: { mocks: globalMocks },
      data() { return { localCartItems: [{ id: 1, image: 'i', title: 't', price: 1, quantity: 1 }] }; }
    });
    expect(wrapper.find('section div.text-center').exists()).toBe(false);
  });

  it('після успішного fetchCartItems повторно не викидає помилок в консолі', async () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('tok');
    jest.spyOn(console, 'error').mockImplementation(() => { });
    axios.get.mockResolvedValueOnce({ data: { products: [] } });

    const wrapper = shallowMount(OrderReview, { global: { mocks: globalMocks } });
    await flushPromises();
    // повторний виклик не помилиться
    await wrapper.vm.fetchCartItems();
    expect(console.error).not.toHaveBeenCalled();
    console.error.mockRestore();
  });
});