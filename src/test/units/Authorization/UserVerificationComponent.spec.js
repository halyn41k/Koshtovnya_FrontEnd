
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
import UserVerificationComponent from '@/components/authorization/UserVerificationComponent.vue';

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { data: [] } })),
  post: jest.fn(),
  delete: jest.fn()
}));

// Створюємо кастомний stub для router-link із зазначенням name
const routerLinkStub = {
  name: 'router-link',
  template: '<a><slot /></a>',
  props: ['to'],
};

describe('UserVerificationComponent - Рендеринг базової структури, валідація, обробка подій форми та функціональність submitVerification', () => {
  let wrapper;
  let alertSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    global.fetch = jest.fn();
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    // Мокаємо console.error, щоб помилки не виводилися в консоль під час тестування
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    wrapper = shallowMount(UserVerificationComponent, {
      global: {
        mocks: {
          $route: { query: {} },
          $router: { push: jest.fn() },
        },
        stubs: {
          'router-link': routerLinkStub,
        },
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  // Рендеринг базової структури
  it('повинен рендерити контейнер з класом "verification-container"', () => {
    expect(wrapper.classes()).toContain('verification-container');
  });

  it('повинен рендерити header з класом "verification-header"', () => {
    const header = wrapper.find('.verification-header');
    expect(header.exists()).toBe(true);
  });

  it('повинен рендерити заголовок з класом "verification-title"', () => {
    const title = wrapper.find('.verification-title');
    expect(title.exists()).toBe(true);
  });

  it('повинен рендерити головну частину з класом "verification-main"', () => {
    const main = wrapper.find('.verification-main');
    expect(main.exists()).toBe(true);
  });

  it('повинен рендерити форму з класом "verification-form"', () => {
    const form = wrapper.find('.verification-form');
    expect(form.exists()).toBe(true);
  });

  it('повинен рендерити кнопку з класом "verification-button"', () => {
    const button = wrapper.find('.verification-button');
    expect(button.exists()).toBe(true);
  });

  it('повинен встановити email з $route.query.email', () => {
    const testEmail = 'test@example.com';
    const localWrapper = shallowMount(UserVerificationComponent, {
      global: {
        mocks: {
          $route: { query: { email: testEmail } },
          $router: { push: jest.fn() },
        },
        stubs: {
          'router-link': routerLinkStub,
        },
      },
    });
    expect(localWrapper.vm.email).toBe(testEmail);
    localWrapper.unmount();
  });

  // Перевірка наявності посилань
  it('повинен містити router-link для зміни email з класом "action-link" та посиланням на /registration', () => {
    const routerLink = wrapper.findComponent({ name: 'router-link' });
    expect(routerLink.exists()).toBe(true);
    // Завдяки кастомному stub, властивість "to" доступна через props
    expect(routerLink.props().to).toBe('/registration');
  });

  // Перевірка інтерактивності input полів
  describe('Інтерактивність input полів', () => {
    it('повинен викликати метод validateEmail при введенні даних в поле email', async () => {
      const originalValidateEmail = wrapper.vm.validateEmail;
      wrapper.vm.validateEmail = jest.fn(originalValidateEmail.bind(wrapper.vm));
      const emailInput = wrapper.find('#email');
      await emailInput.setValue('newuser@example.com');
      expect(wrapper.vm.validateEmail).toHaveBeenCalled();
      wrapper.vm.validateEmail = originalValidateEmail;
    });

    it('повинен викликати метод validateCode при введенні даних в поле коду підтвердження', async () => {
      const originalValidateCode = wrapper.vm.validateCode;
      wrapper.vm.validateCode = jest.fn(originalValidateCode.bind(wrapper.vm));
      const codeInput = wrapper.find('#verification-code');
      await codeInput.setValue('654321');
      expect(wrapper.vm.validateCode).toHaveBeenCalled();
      wrapper.vm.validateCode = originalValidateCode;
    });

    it('повинні відображатись правильні placeholder-и в input полях', () => {
      const emailInput = wrapper.find('#email');
      const codeInput = wrapper.find('#verification-code');
      expect(emailInput.attributes('placeholder')).toBe('Введіть ваш email');
      expect(codeInput.attributes('placeholder')).toBe('Введіть код підтвердження');
    });
  });

  // Валідація email
  it('повинен відображати повідомлення про помилку при некоректному email та прибрати його при коректному email', async () => {
    const emailInput = wrapper.find('#email');
    await emailInput.setValue('test@');
    await wrapper.vm.validateEmail();
    await wrapper.vm.$nextTick();
    let errorMessage = wrapper.find('.error-message');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe('Введіть дійсний email.');
    await emailInput.setValue('user@example.com');
    await wrapper.vm.validateEmail();
    await wrapper.vm.$nextTick();
    errorMessage = wrapper.find('.error-message');
    expect(errorMessage.exists()).toBe(false);
  });

  // Перевірка роботи transition
  it('повинен відображати елементи з помилками валідації з transition ефектом "fade"', async () => {
    const emailInput = wrapper.find('#email');
    await emailInput.setValue('invalid-email');
    await wrapper.vm.validateEmail();
    await wrapper.vm.$nextTick();
    const errorMessage = wrapper.find('.error-message');
    expect(errorMessage.exists()).toBe(true);
    const transitionWrapper = errorMessage.element.parentElement;
    expect(transitionWrapper.tagName.toLowerCase()).toBe('transition-stub');
    expect(transitionWrapper.getAttribute('name')).toBe('fade');
  });

  // Валідація коду підтвердження
  it('повинен відображати повідомлення про помилку при порожньому полі для коду підтвердження', async () => {
    const codeInput = wrapper.find('#verification-code');
    await codeInput.setValue('');
    await wrapper.vm.validateCode();
    await wrapper.vm.$nextTick();
    const errorMessage = wrapper.find('.error-message');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe('Код підтвердження не може бути порожнім.');
  });

  it('повинен відображати повідомлення про помилку при введенні коду з пробілами на початку чи в кінці', async () => {
    const codeInput = wrapper.find('#verification-code');
    await codeInput.setValue('   ');
    await wrapper.vm.validateCode();
    await wrapper.vm.$nextTick();
    const errorMessage = wrapper.find('.error-message');
    expect(errorMessage.exists()).toBe(true);
    expect(errorMessage.text()).toBe('Код підтвердження не може бути порожнім.');
  });

  // Функціональність submitVerification
  describe('Функціональність submitVerification', () => {
    let fetchSpy;
    let routerPushSpy;

    beforeEach(() => {
      fetchSpy = jest.spyOn(global, 'fetch');
      routerPushSpy = wrapper.vm.$router.push;
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it('якщо дані форми невірні, викликається валідація та показується alert з проханням виправити помилки', async () => {
      const emailInput = wrapper.find('#email');
      const codeInput = wrapper.find('#verification-code');
      await emailInput.setValue('test@');
      await codeInput.setValue('');
      const originalValidateEmail = wrapper.vm.validateEmail;
      const originalValidateCode = wrapper.vm.validateCode;
      const validateEmailSpy = jest.fn(originalValidateEmail.bind(wrapper.vm));
      const validateCodeSpy = jest.fn(originalValidateCode.bind(wrapper.vm));
      wrapper.vm.validateEmail = validateEmailSpy;
      wrapper.vm.validateCode = validateCodeSpy;
      await wrapper.vm.submitVerification();
      expect(validateEmailSpy).toHaveBeenCalled();
      expect(validateCodeSpy).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Будь ласка, виправте помилки.');
      expect(fetchSpy).not.toHaveBeenCalled();
      wrapper.vm.validateEmail = originalValidateEmail;
      wrapper.vm.validateCode = originalValidateCode;
    });

    it('при валідних даних має бути викликаний fetch з правильними параметрами, показується повідомлення про успіх та викликається $router.push', async () => {
      const emailInput = wrapper.find('#email');
      const codeInput = wrapper.find('#verification-code');
      await emailInput.setValue('user@example.com');
      await codeInput.setValue('123456');
      const fakeResponse = {
        ok: true,
        json: () => Promise.resolve({ message: 'Успіх' }),
      };
      fetchSpy.mockResolvedValueOnce(fakeResponse);
      await wrapper.vm.submitVerification();
      expect(fetchSpy).toHaveBeenCalledWith("http://26.235.139.202:8080/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: 'user@example.com', code: '123456' }),
      });
      expect(window.alert).toHaveBeenCalledWith('Реєстрація успішна! Тепер ви можете увійти.');
      expect(routerPushSpy).toHaveBeenCalledWith({ name: "Login" });
    });

    it('при невдалому запиті має з\'являтися alert із повідомленням про помилку', async () => {
      const emailInput = wrapper.find('#email');
      const codeInput = wrapper.find('#verification-code');
      await emailInput.setValue('user@example.com');
      await codeInput.setValue('123456');
      const fakeResponse = {
        ok: false,
        json: () => Promise.resolve({ message: 'Неправильний код підтвердження.' }),
      };
      fetchSpy.mockResolvedValueOnce(fakeResponse);
      await wrapper.vm.submitVerification();
      expect(fetchSpy).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Помилка верифікації: Неправильний код підтвердження.');
    });
  });

  // Функціональність resendCode
  describe('Функціональність resendCode', () => {
    let fetchSpy;
    beforeEach(() => {
      fetchSpy = jest.spyOn(global, 'fetch');
    });
    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it('якщо поле email порожнє, викликається alert із повідомленням "Будь ласка, введіть email перед повторним надсиланням коду."', async () => {
      wrapper.setData({ email: '' });
      await wrapper.vm.resendCode();
      expect(window.alert).toHaveBeenCalledWith("Будь ласка, введіть email перед повторним надсиланням коду.");
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('якщо email заповнений, викликається fetch з правильними параметрами та при успіху показується повідомлення про успіх', async () => {
      const testEmail = 'user@example.com';
      wrapper.setData({ email: testEmail });
      const fakeResponse = {
        ok: true,
        json: () => Promise.resolve({ message: "Новий код підтвердження надіслано на вашу пошту." }),
      };
      fetchSpy.mockResolvedValueOnce(fakeResponse);
      await wrapper.vm.resendCode();
      expect(fetchSpy).toHaveBeenCalledWith("http://26.235.139.202:8080/api/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      expect(window.alert).toHaveBeenCalledWith("Новий код підтвердження надіслано на вашу пошту.");
    });

    it('якщо email заповнений, але запит повертає помилку, показується відповідне повідомлення про помилку', async () => {
      const testEmail = 'user@example.com';
      wrapper.setData({ email: testEmail });
      const errorMessage = "Не вдалося надіслати код.";
      const fakeResponse = {
        ok: false,
        json: () => Promise.resolve({ message: errorMessage }),
      };
      fetchSpy.mockResolvedValueOnce(fakeResponse);
      await wrapper.vm.resendCode();
      expect(window.alert).toHaveBeenCalledWith(`Помилка надсилання коду: ${errorMessage}`);
    });
  });
});
*/