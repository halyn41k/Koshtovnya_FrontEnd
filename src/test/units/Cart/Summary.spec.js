// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти

import { shallowMount } from '@vue/test-utils';
import Summary from '@/components/cart/CartSummary.vue';

describe('CartSummary.vue - базовий рендеринг', () => {
  let wrapper;
  const cartItems = [];

  beforeEach(() => {
    wrapper = shallowMount(Summary, {
      props: { cartItems },
      global: {
        mocks: {
          $router: { push: jest.fn() }
        }
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('має клас "order-summary"', () => {
    expect(wrapper.classes()).toContain('order-summary');
  });

  it('рендерить заголовок з текстом "Сума до оплати"', () => {
    const header = wrapper.find('h2');
    expect(header.exists()).toBe(true);
    expect(header.text()).toBe('Сума до оплати');
  });

  it('відображає "0₴" якщо cartItems порожній', () => {
    const amount = wrapper.find('span.text-xl');
    expect(amount.exists()).toBe(true);
    expect(amount.text()).toBe('0₴');
  });
});

describe('CartSummary.vue - обчислення totalSum', () => {
  it('коректно обчислює суму', () => {
    const cartItems = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 }
    ];
    const expectedTotal = 250;

    const wrapper = shallowMount(Summary, {
      props: { cartItems },
      global: {
        mocks: {
          $router: { push: jest.fn() }
        }
      }
    });

    expect(wrapper.vm.totalSum).toBe(expectedTotal);
    const sumText = wrapper.find('span.text-xl').text();
    expect(sumText).toBe(`${expectedTotal}₴`);
    wrapper.unmount();
  });
});

describe('CartSummary.vue - кнопка переходу до оплати', () => {
  it('викликає this.$router.push("/payment") при натисканні', async () => {
    const mockRouter = { push: jest.fn() };
    const wrapper = shallowMount(Summary, {
      props: { cartItems: [{ price: 100, quantity: 1 }] },
      global: {
        mocks: {
          $router: mockRouter
        }
      }
    });

    const button = wrapper.find('button');
    await button.trigger('click');

    expect(mockRouter.push).toHaveBeenCalledWith('/payment');
    wrapper.unmount();
  });
});

describe('Summary - Рендеринг кнопки для оплати', () => {
  let wrapper;
  const cartItems = [];

  beforeEach(() => {
    wrapper = shallowMount(Summary, {
      props: { cartItems },
      global: {
        mocks: {
          $router: { push: jest.fn() }
        }
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('повинен відображати кнопку для переходу до оплати', () => {
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
  });

  it('повинен містити всередині кнопки текст "Перейти до оплати"', () => {
    const button = wrapper.find('button');
    expect(button.text()).toContain('Перейти до оплати');
  });

  it('повинен містити SVG-іконку (стрілку) всередині кнопки', () => {
    const svg = wrapper.find('button svg');
    expect(svg.exists()).toBe(true);
    const path = svg.find('path');
    expect(path.exists()).toBe(true);
    expect(path.attributes('d')).toBe('M9 5l7 7-7 7');
  });
});

describe('Summary - Функціональність переходу до оплати', () => {
  let wrapper;
  const cartItems = [];
  const routerPushMock = jest.fn();

  beforeEach(() => {
    wrapper = shallowMount(Summary, {
      props: { cartItems },
      global: {
        mocks: {
          $router: { push: routerPushMock }
        }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.unmount();
  });

  it('повинен викликати метод goToPayment при кліку на кнопку', async () => {
    const spy = jest.spyOn(wrapper.vm, 'goToPayment');
    await wrapper.find('button').trigger('click');
    expect(spy).toHaveBeenCalled();
  });

  it('метод goToPayment повинен викликати $router.push з шляхом "/payment"', () => {
    wrapper.vm.goToPayment();
    expect(routerPushMock).toHaveBeenCalledWith('/payment');
  });
});

describe('Summary - Стан компонента при різних даних', () => {
  it('повинен повертати totalSum = 0, якщо cartItems є порожнім масивом', () => {
    const cartItems = [];
    const wrapper = shallowMount(Summary, { props: { cartItems } });
    expect(wrapper.vm.totalSum).toBe(0);
    wrapper.unmount();
  });

  it('повинен правильно обчислювати totalSum для різних значень price та quantity', () => {
    const cartItems = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 3 },
      { price: 200, quantity: 1 }
    ];
    const expectedTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const wrapper = shallowMount(Summary, { props: { cartItems } });
    expect(wrapper.vm.totalSum).toBe(expectedTotal);
    wrapper.unmount();
  });
});

describe('Summary - Перевірка основних класів у DOM', () => {
  let wrapper;
  const cartItems = [
    { price: 100, quantity: 1 },
    { price: 50, quantity: 2 },
  ];

  beforeEach(() => {
    wrapper = shallowMount(Summary, { props: { cartItems } });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('повинен містити основні класи на кореневому елементі', () => {
    expect(wrapper.classes()).toContain('order-summary');

    const heading = wrapper.find('h2');
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toBe('Сума до оплати');

    const amount = wrapper.find('span.text-xl');
    expect(amount.exists()).toBe(true);

    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
  });

  it('перевіряє структуру DOM: span із сумою та кнопку з іконкою', () => {
    const amount = wrapper.find('span.text-xl');
    expect(amount.text()).toMatch(/₴/);

    const button = wrapper.find('button');
    expect(button.text()).toContain('Перейти до оплати');

    const svg = button.find('svg');
    expect(svg.exists()).toBe(true);
    expect(svg.find('path').exists()).toBe(true);
  });
});