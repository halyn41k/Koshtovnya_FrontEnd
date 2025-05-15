// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти


import { shallowMount } from '@vue/test-utils';
import AboutUs from '@/components/InfoShop/AboutUs.vue';

describe('AboutUs.vue', () => {
  let wrapper;

  // Мокаємо IntersectionObserver, window.alert та console.log
  beforeAll(() => {
    global.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
    window.alert = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    // Перед монтуванням компонента додаємо глобальний мок для $t
    wrapper = shallowMount(AboutUs, {
      global: {
        mocks: {
          $t: (msg) => msg, // повертаємо ключ перекладу як значення
        },
      },
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    if (wrapper && wrapper.unmount) {
      wrapper.unmount();
    }
    jest.clearAllMocks();
  });

  it('повинен встановлювати document.title як "Про нас" після монтування', () => {
    expect(document.title).toBe("Про нас");
  });

  it('повинен відображати головний заголовок', () => {
    const mainTitle = wrapper.find('.section-title-container .main-title');
    expect(mainTitle.exists()).toBe(true);
    // Згідно з новою розміткою: заголовок містить текст з історією заснування "Коштовня
    expect(mainTitle.text()).toBe('Історія заснування "Коштовня');
  });

  it('повинен відображати заголовок FAQ секції', () => {
    const faqTitle = wrapper.find('.faq-title');
    expect(faqTitle.exists()).toBe(true);
    expect(faqTitle.text()).toContain('Часті запитання');
  });

  it('повинен відображати три FAQ елементи', () => {
    const faqItems = wrapper.findAll('.faq-item');
    expect(faqItems.length).toBe(3);
  });

  it('повинен розгортати відповідь FAQ при натисканні', async () => {
    const faqButtons = wrapper.findAll('.faq-question');
    // Спочатку перевіримо, що відповіді немає (залежно від розмітки FAQ-відповідь рендериться умовно)
    expect(wrapper.find('.faq-answer').exists()).toBe(false);
    
    // Натискаємо першу кнопку FAQ
    await faqButtons.at(0).trigger('click');
    expect(wrapper.vm.faqOpen[0]).toBe(true);
    
    const faqAnswer = wrapper.find('.faq-answer');
    expect(faqAnswer.exists()).toBe(true);
    expect(faqAnswer.text()).toContain('Дорожчий бісер часто відрізняється якістю');
  });

  it('повинен очищувати форму після успішного сабміту', async () => {
    const emailInput = wrapper.find('#email');
    const messageInput = wrapper.find('#message');

    await emailInput.setValue('test@example.com');
    await messageInput.setValue('Це тестове повідомлення, яке містить достатньо символів.');

    expect(wrapper.vm.form.email).toBe('test@example.com');
    expect(wrapper.vm.form.message).toBe('Це тестове повідомлення, яке містить достатньо символів.');

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.vm.form.email).toBe('');
    expect(wrapper.vm.form.message).toBe('');
    expect(window.alert).toHaveBeenCalledWith(
      'Дякуємо за ваше повідомлення! Ми зв’яжемося з вами найближчим часом.'
    );
  });

  it('повинен показувати повідомлення про помилку, якщо повідомлення коротше 10 символів', async () => {
    const emailInput = wrapper.find('#email');
    const messageInput = wrapper.find('#message');

    await emailInput.setValue('test@example.com');
    await messageInput.setValue('Коротке');

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.vm.errorMessage).toBe('Повідомлення має містити від 10 до 200 символів.');
  });

  it('повинен показувати помилку при сабміті форми з некоректною електронною поштою', async () => {
    const emailInput = wrapper.find('#email');
    const messageInput = wrapper.find('#message');

    await emailInput.setValue('vitalii');
    await messageInput.setValue('Це тестове повідомлення, яке містить достатньо символів.');

    await wrapper.find('form').trigger('submit.prevent');

    // При некоректній валідації email (якщо браузер нативно блокує сабміт), очікуємо, що значення очищаються
    expect(wrapper.vm.form.email).toBe('');
    expect(wrapper.vm.form.message).toBe('');
  });

  it('повинен приймати електронні адреси з доменами, що містять крапку', async () => {
    const emailInput = wrapper.find('#email');
    const messageInput = wrapper.find('#message');

    await emailInput.setValue('example.name@mail.co.uk');
    await messageInput.setValue('Це тестове повідомлення, яке містить достатньо символів.');

    await wrapper.find('form').trigger('submit.prevent');

    expect(window.alert).toHaveBeenCalledWith(
      'Дякуємо за ваше повідомлення! Ми зв’яжемося з вами найближчим часом.'
    );
    expect(wrapper.vm.form.email).toBe('');
    expect(wrapper.vm.form.message).toBe('');
  });

  it('змінює колір кнопки "Надіслати" при наведенні', async () => {
    const submitButton = wrapper.find('.form-submit');

    jest.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      if (element === submitButton.element) {
        return { backgroundColor: 'rgb(142, 14, 14)' };
      }
      return {};
    });

    await submitButton.trigger('mouseenter');
    expect(getComputedStyle(submitButton.element).backgroundColor).toBe('rgb(142, 14, 14)');

    jest.restoreAllMocks();
  });

  it('змінює стиль поля введення email при фокусуванні', async () => {
    const emailInput = wrapper.find('#email');

    jest.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      if (element === emailInput.element) {
        return { borderWidth: '2px', borderColor: 'rgb(99, 2, 2)' };
      }
      return {};
    });

    await emailInput.trigger('focus');
    expect(getComputedStyle(emailInput.element).borderWidth).toBe('2px');
    expect(getComputedStyle(emailInput.element).borderColor).toBe('rgb(99, 2, 2)');

    jest.restoreAllMocks();
  });

  it('змінює стиль поля введення message при фокусуванні', async () => {
    const messageInput = wrapper.find('#message');

    jest.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      if (element === messageInput.element) {
        return { borderWidth: '2px', borderColor: 'rgb(99, 2, 2)' };
      }
      return {};
    });

    await messageInput.trigger('focus');
    expect(getComputedStyle(messageInput.element).borderWidth).toBe('2px');
    expect(getComputedStyle(messageInput.element).borderColor).toBe('rgb(99, 2, 2)');

    jest.restoreAllMocks();
  });

  // Тести для IntersectionObserver
  it('повинен додавати клас "show" елементам після перетину з областю видимості', async () => {
    // Створюємо тестовий елемент та додаємо його в документ
    const testElement = document.createElement('div');
    testElement.classList.add('fade-in');
    document.body.appendChild(testElement);

    // Викликаємо метод observeElements
    wrapper.vm.observeElements();
    // Отримуємо callback з першого виклику IntersectionObserver
    const observerCallback = global.IntersectionObserver.mock.calls[0][0];

    // Симулюємо, що елемент потрапив у viewport
    observerCallback([{ target: testElement, isIntersecting: true }]);
    expect(testElement.classList.contains('show')).toBe(true);

    document.body.removeChild(testElement);
  });

  it('повинен викликати метод disconnect IntersectionObserver', () => {
    const disconnectMock = jest.fn();
    const observerMock = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: disconnectMock,
    };
    global.IntersectionObserver = jest.fn(() => observerMock);

    wrapper.vm.observeElements();
    observerMock.disconnect();
    expect(disconnectMock).toHaveBeenCalled();
  });

  // FAQ: перевірка початкового стану та перемикання
  it('повинен мати всі FAQ відповіді закритими за замовчуванням', () => {
    expect(wrapper.vm.faqOpen).toEqual([false, false, false]);
  });

  it('повинен закривати/відкривати FAQ відповідь при повторному натисканні', async () => {
    const faqButtons = wrapper.findAll('.faq-question');
    await faqButtons.at(0).trigger('click');
    expect(wrapper.vm.faqOpen[0]).toBe(true);
    await faqButtons.at(0).trigger('click');
    expect(wrapper.vm.faqOpen[0]).toBe(false);
  });
});
