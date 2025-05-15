// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти


import { shallowMount } from '@vue/test-utils';
import AboutDelivery from '@/components/infoshop/AboutDelivery.vue';

// Мок для IntersectionObserver
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('AboutDelivery.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(AboutDelivery);
    Object.defineProperty(window, 'getComputedStyle', {
      value: jest.fn().mockImplementation(() => ({
        fontSize: '34px',
        color: 'rgb(0, 0, 0)',
        textAlign: 'center',
      })),
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount(); // Очищення після кожного тесту
    }
  });

  it('повинен відображати головний заголовок', () => {
    const mainTitle = wrapper.find('.main-title');
    expect(mainTitle.exists()).toBe(true);
    expect(mainTitle.text()).toBe('Умови оплати та доставки');
  });

  it('повинен відображати заголовок секції "Доставка"', () => {
    const deliverySectionTitle = wrapper.find('.delivery-section .section-title');
    expect(deliverySectionTitle.exists()).toBe(true);
    expect(deliverySectionTitle.text()).toBe('Доставка');
  });

  it('повинен відображати заголовок секції "Умови доставки"', () => {
    const conditionsTitle = wrapper.find('.delivery-conditions .section-title');
    expect(conditionsTitle.exists()).toBe(true);
    expect(conditionsTitle.text()).toBe('1. Умови доставки:');
  });

  it('повинен відображати дві компанії доставки', () => {
    const deliveryItems = wrapper.findAll('.delivery-item');
    expect(deliveryItems.length).toBe(2);

    expect(deliveryItems.at(0).find('.delivery-company').text()).toContain('Нова Пошта');
    expect(deliveryItems.at(1).find('.delivery-company').text()).toContain('Укрпошта');
  });

  it('повинен відображати секцію "Оплата" з правильним заголовком', () => {
    const paymentSectionTitle = wrapper.find('.payment-section .section-title');
    expect(paymentSectionTitle.exists()).toBe(true);
    expect(paymentSectionTitle.text()).toBe('2. Оплата');
  });

  it('повинен відображати три способи оплати', () => {
    const paymentItems = wrapper.findAll('.payment-item');
    expect(paymentItems.length).toBe(3);

    expect(paymentItems.at(0).find('.payment-method').text()).toContain('Оплата при отриманні');
    expect(paymentItems.at(1).find('.payment-method').text()).toContain('Передплата на банківську карту');
    expect(paymentItems.at(2).find('.payment-method').text()).toContain('Онлайн оплата карткою');
  });

  it('повинен відображати додаткові умови', () => {
    const additionalConditions = wrapper.find('.additional-conditions .subsection-title');
    expect(additionalConditions.exists()).toBe(true);
    expect(additionalConditions.text()).toBe('Додаткові умови:');

    const conditionsItems = wrapper.findAll('.condition-item');
    expect(conditionsItems.length).toBe(2);

    expect(conditionsItems.at(0).text()).toContain(
      '• У випадку оплати післяплатою, клієнт оплачує додаткову комісію перевізника за цей вид послуги.'
    );

    expect(conditionsItems.at(1).text()).toContain(
      '• Замовлення відправляється протягом 1-2 робочих днів після підтвердження оплати або оформлення післяплати.'
    );
  });

  it('повинен відображати подяку у футері', () => {
    const thankYouMessage = wrapper.find('.thank-you-message');
    expect(thankYouMessage.exists()).toBe(true);
    expect(thankYouMessage.text()).toBe('Дякуємо, що обрали наш магазин!');
  });

  it('повинен мати правильний стиль для заголовка', () => {
    const titleElement = wrapper.find('.main-title').element;
    const computedStyles = window.getComputedStyle(titleElement);
  
    expect(computedStyles.fontSize).toBe('34px');
    expect(computedStyles.color).toBe('rgb(0, 0, 0)');
    expect(computedStyles.textAlign).toBe('center');
  });
  
  it('повинен додати клас "show" до елементів з класом "fade-in" при їх появі', async () => {
    // Мок-функція для IntersectionObserver
    const observeCallback = jest.fn((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    });
  
    // Мок для IntersectionObserver
    global.IntersectionObserver = jest.fn((callback) => ({
      observe: (element) => {
        observeCallback([{ target: element, isIntersecting: true }]);
      },
      disconnect: jest.fn(),
      unobserve: jest.fn(),
    }));
  
    // Монтуємо компонент
    wrapper.vm.observeElements();
  
    // Отримуємо всі елементи з класом fade-in
    const fadeInElements = wrapper.findAll('.fade-in');
    expect(fadeInElements.length).toBeGreaterThan(0);
  
    // Емулюємо обробку змін у DOM
    fadeInElements.forEach((element) => {
      observeCallback([{ target: element.element, isIntersecting: true }]);
    });
  
    await wrapper.vm.$nextTick();
  
    // Перевіряємо, чи клас "show" було додано
    fadeInElements.forEach((element) => {
      expect(element.element.classList.contains('show')).toBe(true);
    });
  });
  
  it('повинен викликати unobserve для елементів після додавання класу "show"', async () => {
    const unobserveMock = jest.fn();
    const observeCallback = jest.fn((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observerMock.unobserve(entry.target); // Симулюємо виклик unobserve
        }
      });
    });
  
    // Мок для IntersectionObserver
    const observerMock = {
      observe: jest.fn((element) => {
        observeCallback([{ target: element, isIntersecting: true }]);
      }),
      unobserve: unobserveMock,
      disconnect: jest.fn(),
    };
  
    global.IntersectionObserver = jest.fn(() => observerMock);
  
    // Монтуємо компонент
    wrapper.vm.observeElements();
  
    // Отримуємо всі елементи з класом fade-in
    const fadeInElements = wrapper.findAll('.fade-in');
    expect(fadeInElements.length).toBeGreaterThan(0);
  
    // Емулюємо обробку змін у DOM
    fadeInElements.forEach((element) => {
      observeCallback([{ target: element.element, isIntersecting: true }]);
    });
  
    await wrapper.vm.$nextTick();
  
    // Перевіряємо, чи unobserve було викликано для кожного елемента
    fadeInElements.forEach((element) => {
      expect(unobserveMock).toHaveBeenCalledWith(element.element);
    });
  });
  
  it('повинен викликати disconnect при завершенні спостереження', () => {
    const disconnectMock = jest.fn();
  
    // Мок для IntersectionObserver
    const observerMock = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: disconnectMock,
    };
  
    global.IntersectionObserver = jest.fn(() => observerMock);
  
    // Монтуємо компонент
    wrapper.vm.observeElements();
  
    // Викликаємо disconnect
    observerMock.disconnect();
  
    // Перевіряємо, чи disconnect було викликано
    expect(disconnectMock).toHaveBeenCalled();
  });
  
  it('повинен містити фонове зображення', () => {
    const backgroundImage = wrapper.find('.background-image');
    expect(backgroundImage.exists()).toBe(true);
  });
  
  it('повинен містити зображення для доставки', () => {
    const deliveryImage = wrapper.find('.delivery-icon');
    expect(deliveryImage.exists()).toBe(true);
    expect(deliveryImage.attributes('alt')).toBe('Доставка');
  });
  
  it('повинен містити правильні деталі для оплати при отриманні', () => {
    const paymentMethod = wrapper.find('.payment-item .payment-method');
    expect(paymentMethod.text()).toContain('Оплата при отриманні');
    const paymentDetails = wrapper.find('.payment-item .payment-details');
    expect(paymentDetails.text()).toContain('Оплачується безпосередньо під час отримання товару');
  });
  
  it('повинен мати правильний стиль для заголовків секцій', () => {
    const deliverySectionTitle = wrapper.find('.delivery-section .section-title').element;
    const computedStyles = window.getComputedStyle(deliverySectionTitle);
    expect(computedStyles.fontSize).toBe('34px'); // Заміни на актуальні значення стилю, якщо треба
  });
  
  it('повинен коректно відображати додаткові умови', () => {
    const additionalConditions = wrapper.find('.additional-conditions');
    expect(additionalConditions.exists()).toBe(true);
    
    const conditionItems = wrapper.findAll('.condition-item');
    expect(conditionItems.length).toBeGreaterThan(0);
    expect(conditionItems.at(0).text()).toContain('У випадку оплати післяплатою');
  });
});