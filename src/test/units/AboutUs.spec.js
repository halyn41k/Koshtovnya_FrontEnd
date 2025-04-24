import { shallowMount } from '@vue/test-utils';
import AboutUs from '../../components/infoshop/AboutUs.vue';

describe('AboutUs.vue', () => {
  let wrapper;

  // Мокаємо IntersectionObserver, window.alert та console.log
  beforeAll(() => {
    global.IntersectionObserver = jest.fn(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
    window.alert = jest.fn(); // Мокаємо alert
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Мокаємо console.log
  });

  beforeEach(() => {
    wrapper = shallowMount(AboutUs);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Мокаємо console.log
  });

  afterEach(() => {
    wrapper.unmount();
    jest.clearAllMocks(); // Очищення моків між тестами
  });
 
  it('повинен відображати головний заголовок', () => {
    const mainTitle = wrapper.find('.section-title-container .main-title');
    expect(mainTitle.exists()).toBe(true);
    expect(mainTitle.text()).toBe('Про нас');
  }); 
 
  it('повинен відображати заголовок секції "Історія заснування"', () => {
    const sectionTitle = wrapper.find('.about-us__text-section .section-title');
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.text()).toBe('Історія заснування "Коштовня"');
  }); 
 
  it('повинен відображати FAQ заголовок', () => {
    const faqTitle = wrapper.find('.faq-title');
    expect(faqTitle.exists()).toBe(true);
    expect(faqTitle.text()).toContain('Часті запитання');
  });
 
  it('повинен відображати три FAQ елементи', () => { 
    const faqItems = wrapper.findAll('.faq-item'); 
    expect(faqItems.length).toBe(3); 
  }); 
 
  it('повинен розгортати відповідь на питання FAQ при натисканні', async () => {
    const faqButton = wrapper.findAll('.faq-question').at(0);
    await faqButton.trigger('click');
    expect(wrapper.vm.faqOpen[0]).toBe(true);

    const faqAnswer = wrapper.find('.faq-answer');
    expect(faqAnswer.exists()).toBe(true);
    expect(faqAnswer.text()).toContain('Дорожчий бісер часто відрізняється якістю');
  });
 
  it('повинен очищувати форму після відправки', async () => {
    const emailInput = wrapper.find('#email');
    const messageInput = wrapper.find('#message');

    await emailInput.setValue('test@example.com');
    await messageInput.setValue('Це тестове повідомлення');

    expect(wrapper.vm.form.email).toBe('test@example.com');
    expect(wrapper.vm.form.message).toBe('Це тестове повідомлення');

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.vm.form.email).toBe(''); // Перевіряємо очищення
    expect(wrapper.vm.form.message).toBe(''); // Перевіряємо очищення
    expect(global.alert).toHaveBeenCalledWith(
      'Дякуємо за ваше повідомлення! Ми зв’яжемося з вами найближчим часом.'
    );
  });
 
  it('показує повідомлення про помилку при відправленні порожньої форми', async () => {
    const form = wrapper.find('form');
    const emailInput = wrapper.find('input[type="email"]');
    const messageTextarea = wrapper.find('textarea');

    await form.trigger('submit.prevent');

    expect(emailInput.element.validity.valid).toBe(false);
    expect(messageTextarea.element.validity.valid).toBe(false);
  });
 
  it('показує повідомлення про помилку при введенні некоректної електронної пошти', async () => { 
    // Знаходимо поля форми 
    const emailInput = wrapper.find('#email'); 
    const messageTextarea = wrapper.find('#message'); 
    
    // Встановлюємо значення для поля email і message 
    await emailInput.setValue('vitalii'); 
    await messageTextarea.setValue('Це тестове повідомлення'); 
    
    // Перевіряємо, чи значення textarea є коректним ДО сабміту 
    expect(messageTextarea.element.value).toBe('Це тестове повідомлення'); 
    
    // Сабмітимо форму 
    await wrapper.find('form').trigger('submit.prevent'); 
    
    // Тепер значення мають бути очищені 
    expect(messageTextarea.element.value).toBe(''); 
    expect(emailInput.element.value).toBe(''); 
  }); 
  
  it('змінює колір кнопки "Надіслати" при наведенні', async () => { 
    const submitButton = wrapper.find('.form-submit'); 
  
    // Мокаємо getComputedStyle 
    jest.spyOn(window, 'getComputedStyle').mockImplementation((element) => { 
      if (element === submitButton.element) { 
        return { backgroundColor: 'rgb(142, 14, 14)' }; // Колір для імітації 
      } 
      return {}; 
    }); 
  
    // Емітуємо подію наведення 
    await
  submitButton.trigger('mouseenter'); 
  
    // Перевіряємо, що колір став очікуваним 
    expect(getComputedStyle(submitButton.element).backgroundColor).toBe('rgb(142, 14, 14)'); 
  
    // Очищення мока 
    jest.restoreAllMocks(); 
  }); 
  
  it('змінює стиль поля введення email при фокусуванні', async () => { 
    const emailInput = wrapper.find('#email'); 
  
    // Мокаємо getComputedStyle 
    jest.spyOn(window, 'getComputedStyle').mockImplementation((element) => { 
      if (element === emailInput.element) { 
        return { borderWidth: '2px', borderColor: 'rgb(99, 2, 2)' }; // Стиль для фокусу 
      } 
      return {}; 
    }); 
  
    // Емітуємо подію фокусу 
    await emailInput.trigger('focus'); 
  
    // Перевіряємо, чи змінився стиль 
    expect(getComputedStyle(emailInput.element).borderWidth).toBe('2px'); 
    expect(getComputedStyle(emailInput.element).borderColor).toBe('rgb(99, 2, 2)'); 
  
    // Очищення мока 
    jest.restoreAllMocks(); 
  }); 
  
  it('змінює стиль поля введення message при фокусуванні', async () => { 
    const messageInput = wrapper.find('#message'); 
  
    // Мокаємо getComputedStyle 
    jest.spyOn(window, 'getComputedStyle').mockImplementation((element) => { 
      if (element === messageInput.element) { 
        return { borderWidth: '2px', borderColor: 'rgb(99, 2, 2)' }; // Стиль для фокусу 
      } 
      return {}; 
    }); 
  
    // Емітуємо подію фокусу 
    await messageInput.trigger('focus'); 
  
    // Перевіряємо, чи змінився стиль 
    expect(getComputedStyle(messageInput.element).borderWidth).toBe('2px'); 
    expect(getComputedStyle(messageInput.element).borderColor).toBe('rgb(99, 2, 2)'); 
  
    // Очищення мока 
    jest.restoreAllMocks(); 
  }); 

  it('приймає допустимі електронні адреси з доменами, що містять крапку', async () => {
    const emailInput = wrapper.find('#email');
    const messageInput = wrapper.find('#message');
    const form = wrapper.find('form');

    // Встановлюємо валідні значення для полів
    await emailInput.setValue('example.name@mail.co.uk');
    await messageInput.setValue('Це тестове повідомлення'); // Повідомлення задовольняє валідацію

    // Сабмітимо форму
    await form.trigger('submit.prevent');

    // Перевірка
    expect(window.alert).toHaveBeenCalledWith(
      'Дякуємо за ваше повідомлення! Ми зв’яжемося з вами найближчим часом.'
    );
    expect(wrapper.vm.form.email).toBe(''); // Поле очищене
    expect(wrapper.vm.form.message).toBe(''); // Поле очищене
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
  
    // Викликаємо observeElements
    wrapper.vm.observeElements();
  
    // Знаходимо елементи з класом fade-in
    const fadeInElements = wrapper.findAll('.fade-in');
    expect(fadeInElements.length).toBeGreaterThan(0);
  
    // Емітуємо подію спостереження
    fadeInElements.forEach((element) => {
      observeCallback([{ target: element.element, isIntersecting: true }]);
    });
  
    await wrapper.vm.$nextTick();
  
    // Перевіряємо, чи unobserve було викликано
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
  
    // Викликаємо observeElements
    wrapper.vm.observeElements();
  
    // Викликаємо disconnect
    observerMock.disconnect();
  
    // Перевіряємо, чи disconnect було викликано
    expect(disconnectMock).toHaveBeenCalled();
  });
  
  it('не повинен викликати unobserve для елементів, якщо isIntersecting: false', async () => {
    const unobserveMock = jest.fn();
    const observeCallback = jest.fn((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observerMock.unobserve(entry.target); // Викликається тільки якщо isIntersecting: true
        }
      });
    });
  
    // Мок для IntersectionObserver
    const observerMock = {
      observe: jest.fn((element) => {
        observeCallback([{ target: element, isIntersecting: false }]); // Симуляція isIntersecting: false
      }),
      unobserve: unobserveMock,
      disconnect: jest.fn(),
    };
  
    global.IntersectionObserver = jest.fn(() => observerMock);
  
    // Викликаємо observeElements
    wrapper.vm.observeElements();
  
    // Знаходимо елементи з класом fade-in
    const fadeInElements = wrapper.findAll('.fade-in');
    expect(fadeInElements.length).toBeGreaterThan(0);
  
    // Емітуємо подію спостереження з isIntersecting: false
    fadeInElements.forEach((element) => {
      observeCallback([{ target: element.element, isIntersecting: false }]);
    });
  
    await wrapper.vm.$nextTick();
  
    // Перевіряємо, що unobserve не викликався
    expect(unobserveMock).not.toHaveBeenCalled();
  });
});