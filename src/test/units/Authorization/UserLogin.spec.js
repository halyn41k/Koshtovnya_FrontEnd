// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти

import { mount } from '@vue/test-utils';
import UserLogin from '@/components/authorization/UserLogin.vue';

// Мок для глобального fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    headers: { get: jest.fn().mockReturnValue('application/json') },
    json: () => Promise.resolve({ token: 'mock-token' }),
  })
);

Storage.prototype.setItem = jest.fn();
Storage.prototype.getItem = jest.fn(() => 'mock-token');

// Моки для імпортованих SVG-іконок
jest.mock('@/assets/eye-hide-svgrepo-com.svg', () => 'mock-eye-hide-icon.svg');
jest.mock('@/assets/eye-1-svgrepo-com.svg', () => 'mock-eye-closed-icon.svg');

// Мок для window.alert
global.alert = jest.fn();

// Мок для router.push
const mockRouterPush = jest.fn();

describe('UserLogin.vue', () => {
  let wrapper;

  // Визначення допоміжних гетерів для поширених селекторів
  const page = {
    get loginContainer() {
      return wrapper.find('.login-container');
    },
    get sectionTitle() {
      return wrapper.find('span.section-title');
    },
    get loginForm() {
      return wrapper.find('form.login-form');
    },
    get emailInput() {
      return wrapper.find('input#email');
    },
    get passwordInput() {
      return wrapper.find('input#password');
    },
    get loginButton() {
      return wrapper.find('button.login-button');
    },
    get registrationLink() {
      return wrapper.find('a.signup-link');
    },
    get backgroundImage() {
      return wrapper.find('.login-background-image');
    },
    get togglePasswordButton() {
      return wrapper.find('button.toggle-password-button');
    },
    get signupPrompt() {
      return wrapper.find('p.signup-prompt');
    },
    get loginIcon() {
      return wrapper.find('.login-icon');
    },
  };

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  beforeEach(() => {
    wrapper = mount(UserLogin, {
      global: {
        mocks: {
          $router: {
            push: mockRouterPush,
          },
        },
        stubs: {
          'router-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  // --- Тести розмітки та класів ---
  it('Контейнер має правильний клас', () => {
    expect(page.loginContainer.exists()).toBe(true);
    expect(page.loginContainer.classes()).toContain('login-container');
  });

  it('Заголовок секції має правильний текст і клас', () => {
    expect(page.sectionTitle.exists()).toBe(true);
    expect(page.sectionTitle.text()).toBe('Вхід');
    expect(page.sectionTitle.classes()).toContain('section-title');
  });

  it('Форма має правильний клас', () => {
    expect(page.loginForm.exists()).toBe(true);
    expect(page.loginForm.classes()).toContain('login-form');
  });

  it('Поле Email має правильні атрибути і класи', () => {
    expect(page.emailInput.exists()).toBe(true);
    expect(page.emailInput.attributes('type')).toBe('email');
    expect(page.emailInput.attributes('placeholder')).toBe('Введіть ваш email');
    expect(page.emailInput.classes()).toContain('form-input');
  });

  it('Поле Password має правильні атрибути і класи', () => {
    expect(page.passwordInput.exists()).toBe(true);
    expect(page.passwordInput.attributes('type')).toBe('password');
    expect(page.passwordInput.attributes('placeholder')).toBe('Введіть пароль');
    expect(page.passwordInput.classes()).toContain('form-input');
  });

  it('Кнопка "Увійти" має правильні атрибути і класи', () => {
    expect(page.loginButton.exists()).toBe(true);
    expect(page.loginButton.classes()).toContain('login-button');
    expect(page.loginButton.attributes('type')).toBe('submit');
    expect(page.loginButton.text()).toContain('Увійти');
  });

  it('Посилання на реєстрацію має правильний текст і клас', () => {
    expect(page.registrationLink.exists()).toBe(true);
    expect(page.registrationLink.text()).toBe('Створіть його тут');
    expect(page.registrationLink.classes()).toContain('signup-link');
  });

  it('Фонова картинка рендериться з правильним класом', () => {
    expect(page.backgroundImage.exists()).toBe(true);
    expect(page.backgroundImage.classes()).toContain('login-background-image');
  });

  it('Кнопка показу/приховування пароля рендериться з правильним класом', () => {
    expect(page.togglePasswordButton.exists()).toBe(true);
    expect(page.togglePasswordButton.classes()).toContain('toggle-password-button');
  });

  // --- Тести функціоналу форми ---
  it('Перевірка валідації форми: обов’язковість полів Email і Пароль', async () => {
    // Сабміт без введених даних
    await page.loginForm.trigger('submit.prevent');

    expect(page.emailInput.element.validity.valueMissing).toBe(true);
    expect(page.passwordInput.element.validity.valueMissing).toBe(true);

    // Вводимо коректні значення
    await page.emailInput.setValue('test@example.com');
    await page.passwordInput.setValue('password123');
    await page.loginForm.trigger('submit.prevent');

    expect(page.emailInput.element.validity.valid).toBe(true);
    expect(page.passwordInput.element.validity.valid).toBe(true);
  });

  it('Викликає alert при помилці входу', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    await page.loginForm.trigger('submit.prevent');
    expect(global.alert).toHaveBeenCalledWith('Сталася помилка. Спробуйте ще раз.');
  });

  it('Перенаправляє після успішного входу', async () => {
    await page.emailInput.setValue('test@example.com');
    await page.passwordInput.setValue('password123');
    await page.loginForm.trigger('submit.prevent');
    expect(mockRouterPush).toHaveBeenCalledWith("/account");
  });

  it('Функціональність кнопки відображення/приховування пароля', async () => {
    const getCurrentIconSrc = () => page.togglePasswordButton.find('img').attributes('src');
    const expectedEyeClosedIcon = 'mock-eye-closed-icon.svg';
    const expectedEyeOpenIcon = 'mock-eye-hide-icon.svg';

    expect(page.passwordInput.attributes('type')).toBe('password');
    expect(getCurrentIconSrc()).toBe(expectedEyeClosedIcon);

    await page.togglePasswordButton.trigger('click');

    expect(page.passwordInput.attributes('type')).toBe('text');
    expect(getCurrentIconSrc()).toBe(expectedEyeOpenIcon);

    await page.togglePasswordButton.trigger('click');

    expect(page.passwordInput.attributes('type')).toBe('password');
    expect(getCurrentIconSrc()).toBe(expectedEyeClosedIcon);
  });

  it('Перевіряє, що всі тексти відповідають українській локалізації', () => {
    expect(page.sectionTitle.text()).toBe('Вхід');

    const emailLabel = wrapper.find('label[for="email"]');
    expect(emailLabel.text()).toBe('Email:');

    const passwordLabel = wrapper.find('label[for="password"]');
    expect(passwordLabel.text()).toBe('Пароль:');

    expect(page.loginButton.text()).toContain('Увійти');

    expect(page.signupPrompt.text()).toContain('Немає облікового запису?');
    expect(page.registrationLink.text()).toBe('Створіть його тут');

    const alertMessage = 'Не вдалося увійти. Перевірте ваші дані.';
    global.alert(alertMessage);
    expect(global.alert).toHaveBeenCalledWith(alertMessage);

    expect(page.loginIcon.attributes('alt')).toBe('');
  });

  it('Відображає повідомлення про помилку при невірних даних', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Не вдалося увійти. Перевірте ваші дані.' }),
      })
    );

    await page.emailInput.setValue('wrong@example.com');
    await page.passwordInput.setValue('wrongpassword');
    await page.loginForm.trigger('submit.prevent');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://26.235.139.202:8080/api/login',
      expect.any(Object)
    );
    expect(global.alert).toHaveBeenCalledWith('Не вдалося увійти. Перевірте ваші дані.');
  });

  it('Відображає повідомлення про помилку при проблемах із сервером', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Server is down')));

    await page.emailInput.setValue('test@example.com');
    await page.passwordInput.setValue('password123');
    await page.loginForm.trigger('submit.prevent');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://26.235.139.202:8080/api/login',
      expect.any(Object)
    );
    expect(global.alert).toHaveBeenCalledWith('Сталася помилка. Спробуйте ще раз.');
  });

  it('Зберігає токен у localStorage після успішного входу', async () => {
    await page.emailInput.setValue('test@example.com');
    await page.passwordInput.setValue('password123');
    await page.loginForm.trigger('submit.prevent');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://26.235.139.202:8080/api/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      })
    );
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
  });

  it('Перенаправляє після успішного збереження токена', async () => {
    await page.loginForm.trigger('submit.prevent');
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith("/account");
  });

  it('Викликає метод submitLogin при сабміті форми', async () => {
    const submitLoginMock = jest.fn();
    wrapper.vm.submitLogin = submitLoginMock;
    await page.loginForm.trigger('submit.prevent');
    expect(submitLoginMock).toHaveBeenCalled();
  });

  it('Надсилає правильні дані у запиті до API', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ token: 'mock-token' }),
    });

    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    await page.emailInput.setValue(testEmail);
    await page.passwordInput.setValue(testPassword);
    await page.loginForm.trigger('submit.prevent');

    expect(fetchMock).toHaveBeenCalledWith('http://26.235.139.202:8080/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    fetchMock.mockRestore();
  });

  it('Посилання "Створіть його тут" веде на коректний роут /registration', () => {
    expect(page.registrationLink.exists()).toBe(true);
    expect(page.registrationLink.attributes('href')).toBe('/registration');
  });

  // --- Тести доступності (aria-label) ---
  it('Перевіряє, що всі елементи мають коректний aria-label', () => {
    expect(page.emailInput.attributes('aria-label')).toBe('Email');
    expect(page.passwordInput.attributes('aria-label')).toBe('Пароль');
  });

  it('Перевіряє, що aria-label не порожній на інпут елементах', () => {
    wrapper.findAll('input').forEach(input => {
      const ariaLabel = input.attributes('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel.trim().length).toBeGreaterThan(0);
    });
  });

  it('Іконки для пароля відображаються правильно', () => {
    const iconImg = page.togglePasswordButton.find('img');
    expect(iconImg.exists()).toBe(true);
    expect(iconImg.attributes('src')).toBe('mock-eye-closed-icon.svg');
  });

  it('Кнопка входу має правильний клас', () => {
    expect(page.loginButton.exists()).toBe(true);
    expect(page.loginButton.classes()).toContain('login-button');
  });

  it('Інпути мають правильні класи', () => {
    const inputs = wrapper.findAll('.form-input');
    expect(inputs).toHaveLength(2);
    inputs.forEach(input => {
      expect(input.classes()).toContain('form-input');
    });
  });

  it('Текст має правильний клас та текст', () => {
    expect(page.sectionTitle.exists()).toBe(true);
    expect(page.sectionTitle.text()).toBe('Вхід');
    expect(page.sectionTitle.classes()).toContain('section-title');
  });

  it('Форма входу має правильний клас', () => {
    const form = wrapper.find('.login-form');
    expect(form.exists()).toBe(true);
    expect(form.classes()).toContain('login-form');
  });

  // --- Тести валідації полів ---
  it('Поле email не має бути порожнім', async () => {
    await page.emailInput.setValue('');
    await page.loginForm.trigger('submit.prevent');
    const emailError = wrapper.find('.email-error');
    expect(emailError.exists()).toBe(true);
    expect(emailError.text()).toBe('Введіть дійсний email.');
  });

  it('Пароль не повинен містити пробілів', async () => {
    await page.passwordInput.setValue('password with space');
    await page.loginForm.trigger('submit.prevent');
    const passwordError = wrapper.find('.password-error');
    expect(passwordError.exists()).toBe(true);
    expect(passwordError.text()).toBe('Пароль не повинен містити пробілів.');
  });

  it('Форма правильно обробляє введення після очищення полів', async () => {
    await page.emailInput.setValue('test@example.com');
    await page.passwordInput.setValue('password123');
    await page.emailInput.setValue('');
    await page.passwordInput.setValue('');
    expect(page.emailInput.element.value).toBe('');
    expect(page.passwordInput.element.value).toBe('');
  });

  it('Не редіректить користувача після неправильного пароля', async () => {
    await page.emailInput.setValue('wrong@example.com');
    await page.passwordInput.setValue('wrongpassword');
    await page.loginForm.trigger('submit.prevent');
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it('Показує помилку при неправильному форматі email', async () => {
    await page.emailInput.setValue('invalidemail.com');
    await page.loginForm.trigger('submit.prevent');
    const emailError = wrapper.find('.email-error');
    expect(emailError.exists()).toBe(true);
    expect(emailError.text()).toBe('Введіть дійсний email.');
  });
});
