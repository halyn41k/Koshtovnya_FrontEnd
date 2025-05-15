
describe.skip('Тести для MyComponent', () => {
  it('цей тест не виконається', () => {
    expect(true).toBe(false)
  })
})
/*
//Протестовано головні аспекти

import { shallowMount } from '@vue/test-utils';
import Summary from '@/components/cart/Summary.vue';

describe('Summary - Рендеринг базової структури', () => {
  let wrapper;
  const cartItems = []; // Можна передати порожній масив для базового рендерингу

  beforeEach(() => {
    wrapper = shallowMount(Summary, {
      props: { cartItems }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('повинен рендерити контейнер з класом "order-summary"', () => {
    expect(wrapper.classes()).toContain('order-summary');
  });

  it('повинен рендерити заголовок з класом "summary-title" з текстом "Сума до оплати"', () => {
    const header = wrapper.find('.summary-title');
    expect(header.exists()).toBe(true);
    expect(header.text()).toBe('Сума до оплати');
  });
});

describe('Summary - Відображення деталей замовлення', () => {
  let wrapper;
  const sampleCartItems = [
    { price: 100, quantity: 2 },
    { price: 50, quantity: 1 }
  ];
  const expectedTotal = sampleCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  beforeEach(() => {
    wrapper = shallowMount(Summary, {
      props: { cartItems: sampleCartItems }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('повинен містити блок з класом "summary-details", який містить два рядки з відповідними позначками', () => {
    const details = wrapper.find('.summary-details');
    expect(details.exists()).toBe(true);

    const rows = details.findAll('.summary-row');
    expect(rows.length).toBe(2);
    expect(rows.at(0).text()).toContain('Проміжний підсумок');
    expect(rows.at(1).text()).toContain('Загальна сума');
  });

  it('повинен відображати правильну суму з валютою ₴ для обох рядків', () => {
    const rows = wrapper.findAll('.summary-row');
    const firstRowPrice = rows.at(0).find('.price').text();
    const secondRowPrice = rows.at(1).find('.price').text();

    expect(firstRowPrice).toBe(`${expectedTotal}₴`);
    expect(secondRowPrice).toBe(`${expectedTotal}₴`);
  });
});

describe('Summary - Обчислення суми замовлення (computed totalSum)', () => {
  it('повинен правильно обчислювати totalSum для масиву з декількома об\'єктами', () => {
    const cartItems = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 },
      { price: 200, quantity: 3 }
    ];
    const expectedTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const wrapper = shallowMount(Summary, { props: { cartItems } });
    expect(wrapper.vm.totalSum).toBe(expectedTotal);
    wrapper.unmount();
  });

  it('повинен повертати 0, якщо cartItems порожній', () => {
    const cartItems = [];
    const expectedTotal = 0;
    const wrapper = shallowMount(Summary, { props: { cartItems } });
    expect(wrapper.vm.totalSum).toBe(expectedTotal);
    wrapper.unmount();
  });
});

describe('Summary - Рендеринг кнопки для оплати', () => {
  let wrapper;
  const cartItems = []; // Порожній масив для базового рендерингу

  beforeEach(() => {
    wrapper = shallowMount(Summary, {
      props: { cartItems }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('повинен відображати кнопку з класом "payment-button"', () => {
    const paymentButton = wrapper.find('.payment-button');
    expect(paymentButton.exists()).toBe(true);
  });

  it('повинен містити всередині кнопки текст "Перейти до оплати"', () => {
    const paymentButton = wrapper.find('.payment-button');
    expect(paymentButton.text()).toContain('Перейти до оплати');
  });

  it('повинен містити зображення (іконку) з вказаними атрибутами src, alt та класом "login-icon"', () => {
    const paymentButton = wrapper.find('.payment-button');
    const img = paymentButton.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('https://cdn.builder.io/api/v1/image/assets/TEMP/436b738744905f60c6a542e2cd314f5694db20045d36b8991f8dab9a31b316a0?placeholderIfAbsent=true&apiKey=c3e46d0a629546c7a48302a5db3297d5');
    expect(img.attributes('alt')).toBe('');
    expect(img.classes()).toContain('login-icon');
  });
});

describe('Summary - Функціональність переходу до оплати', () => {
  let wrapper;
  const cartItems = []; // Порожній масив для базового рендерингу
  const routerPushMock = jest.fn();

  beforeEach(() => {
    wrapper = shallowMount(Summary, {
      props: { cartItems },
      global: {
        mocks: {
          $router: {
            push: routerPushMock
          }
        }
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.unmount();
  });

  it('повинен викликати метод goToPayment при кліку на кнопку', async () => {
    // Призначаємо мок-функцію для методу goToPayment
    wrapper.vm.goToPayment = jest.fn();
    const paymentButton = wrapper.find('.payment-button');
    await paymentButton.trigger('click');
    expect(wrapper.vm.goToPayment).toHaveBeenCalled();
  });

  it('метод goToPayment повинен викликати $router.push з шляхом "/payment"', () => {
    // Викликаємо метод без кліку на кнопку
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

  it('повинен містити основні класи на кореневому елементі та основних дочірніх елементах', () => {
    expect(wrapper.classes()).toContain('order-summary');
    expect(wrapper.find('.summary-title').exists()).toBe(true);
    expect(wrapper.find('.summary-details').exists()).toBe(true);
    expect(wrapper.find('.payment-button').exists()).toBe(true);
  });

  it('елементи всередині компоненту мають відповідні класи: summary-title, summary-details, summary-row та price', () => {
    const title = wrapper.find('.summary-title');
    const details = wrapper.find('.summary-details');
    const rows = details.findAll('.summary-row');
    const priceElements = details.findAll('.price');

    expect(title.exists()).toBe(true);
    expect(details.exists()).toBe(true);
    // Маємо два рядки: "Проміжний підсумок" та "Загальна сума"
    expect(rows.length).toBe(2);
    // Перевірка, що є елементи з класом "price"
    expect(priceElements.length).toBeGreaterThan(0);
  });
});*/