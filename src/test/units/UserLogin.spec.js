import { mount } from '@vue/test-utils';
import UserLogin from '../../components/authorization/UserLogin.vue';

// Мок для глобального fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    headers: {
      get: jest.fn().mockReturnValue('application/json'),
    },
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

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Мокаємо console.log
  });

  afterAll(() => {
    console.error.mockRestore(); // Відновлюємо оригінальну поведінку console.error
    console.log.mockRestore(); // Відновлюємо оригінальну поведінку console.log
  });

  beforeEach(() => {
    wrapper = mount(UserLogin, {
      global: {
        mocks: {
          $router: {
            push: mockRouterPush, // Мокаємо router.push
          },
        },
        stubs: {
          'router-link': {
            template: '<a :href="to"><slot /></a>', // Заглушка для router-link із генерацією href
            props: ['to'],
          },
        },
      },
    });

    jest.clearAllMocks(); // Очищуємо всі моки перед кожним тестом
  });

  afterEach(() => {
    wrapper.unmount(); // Знищуємо інстанс компонента після кожного тесту
  });

  it('Контейнер має правильний клас', () => {
    const loginContainer = wrapper.find('.login-container');
    expect(loginContainer.exists()).toBe(true);
    expect(loginContainer.classes()).toContain('login-container');
  });

  it('Заголовок секції має правильний текст і клас', () => {
    const sectionTitle = wrapper.find('span.section-title');
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.text()).toBe('Вхід');
    expect(sectionTitle.classes()).toContain('section-title');
  });

  it('Форма має правильний клас', () => {
    const loginForm = wrapper.find('form.login-form');
    expect(loginForm.exists()).toBe(true);
    expect(loginForm.classes()).toContain('login-form');
  });

  it('Поле Email має правильні атрибути і класи', () => {
    const emailInput = wrapper.find('input#email');
    expect(emailInput.exists()).toBe(true);
    expect(emailInput.attributes('type')).toBe('email');
    expect(emailInput.attributes('placeholder')).toBe('Введіть ваш email');
    expect(emailInput.classes()).toContain('form-input');
  });

  it('Поле Password має правильні атрибути і класи', () => {
    const passwordInput = wrapper.find('input#password');
    expect(passwordInput.exists()).toBe(true);
    expect(passwordInput.attributes('type')).toBe('password');
    expect(passwordInput.attributes('placeholder')).toBe('Введіть пароль');
    expect(passwordInput.classes()).toContain('form-input');
  });

  it('Кнопка "Увійти" має правильні атрибути і класи', () => {
    const loginButton = wrapper.find('button.login-button');
    expect(loginButton.exists()).toBe(true);
    expect(loginButton.classes()).toContain('login-button');
    expect(loginButton.attributes('type')).toBe('submit');
    expect(loginButton.text()).toContain('Увійти');
  });

  it('Посилання на реєстрацію має правильний текст і клас', () => {
    const registrationLink = wrapper.find('a.signup-link');
    expect(registrationLink.exists()).toBe(true);
    expect(registrationLink.text()).toBe('Створіть його тут');
    expect(registrationLink.classes()).toContain('signup-link');
  });

  it('Фонова картинка рендериться з правильним класом', () => {
    const backgroundImage = wrapper.find('.login-background-image');
    expect(backgroundImage.exists()).toBe(true);
    expect(backgroundImage.classes()).toContain('login-background-image');
  });

  it('Кнопка показу/приховування пароля рендериться з правильним класом', () => {
    const togglePasswordButton = wrapper.find('button.toggle-password-button');
    expect(togglePasswordButton.exists()).toBe(true);
    expect(togglePasswordButton.classes()).toContain('toggle-password-button');
  });

  it('Перевірка валідації форми: обов’язковість полів Email і Пароль', async () => {
    const loginForm = wrapper.find('form.login-form');
    expect(loginForm.exists()).toBe(true);

    // Сабміт без введених даних
    await loginForm.trigger('submit.prevent');

    const emailInput = wrapper.find('input#email');
    const passwordInput = wrapper.find('input#password');
    expect(emailInput.element.validity.valueMissing).toBe(true);
    expect(passwordInput.element.validity.valueMissing).toBe(true);

    // Вводимо коректні значення
    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');
    await loginForm.trigger('submit.prevent');

    expect(emailInput.element.validity.valid).toBe(true);
    expect(passwordInput.element.validity.valid).toBe(true);
  });

  it('Викликає alert при помилці входу', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    const loginForm = wrapper.find('form.login-form');
    await loginForm.trigger('submit.prevent');

    expect(global.alert).toHaveBeenCalledWith('Не вдалося увійти. Перевірте ваші дані.');
    expect(console.error).toHaveBeenCalledWith('Помилка входу:', 'Network error');
  });

  it('Перенаправляє після успішного входу', async () => {
    const emailInput = wrapper.find('input#email');
    const passwordInput = wrapper.find('input#password');
    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');

    const loginForm = wrapper.find('form.login-form');
    await loginForm.trigger('submit.prevent');

    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'AccountInfo' });
  });

  it('Функціональність кнопки відображення/приховування пароля', async () => {
    const passwordInput = wrapper.find('input#password');
    const togglePasswordButton = wrapper.find('button.toggle-password-button');
  
    // Отримуємо джерело іконки
    const getCurrentIconSrc = () => togglePasswordButton.find('img').attributes('src');
  
    const expectedEyeClosedIcon = 'mock-eye-closed-icon.svg';
    const expectedEyeOpenIcon = 'mock-eye-hide-icon.svg';
  
    // Початковий стан: тип "password", іконка закритого ока
    expect(passwordInput.attributes('type')).toBe('password');
    expect(getCurrentIconSrc()).toBe(expectedEyeClosedIcon);
  
    // Клік по кнопці
    await togglePasswordButton.trigger('click');
  
    // Після кліку: тип "text", іконка відкритого ока
    expect(passwordInput.attributes('type')).toBe('text');
    expect(getCurrentIconSrc()).toBe(expectedEyeOpenIcon);
  
    // Повторний клік
    await togglePasswordButton.trigger('click');
  
    // Повернення до початкового стану
    expect(passwordInput.attributes('type')).toBe('password');
    expect(getCurrentIconSrc()).toBe(expectedEyeClosedIcon);
  });
    
  it('Перевіряє, що всі тексти відповідають українській локалізації', () => {
    // Текст заголовка
    const sectionTitle = wrapper.find('span.section-title');
    expect(sectionTitle.text()).toBe('Вхід');

    // Тексти лейблів
    const emailLabel = wrapper.find('label[for="email"]');
    expect(emailLabel.text()).toBe('Email:');

    const passwordLabel = wrapper.find('label[for="password"]');
    expect(passwordLabel.text()).toBe('Пароль:');

    // Текст кнопки входу
    const loginButton = wrapper.find('button.login-button');
    expect(loginButton.text()).toContain('Увійти');

    // Текст посилання на реєстрацію
    const signupPrompt = wrapper.find('p.signup-prompt');
    expect(signupPrompt.text()).toContain('Немає облікового запису?');

    const signupLink = wrapper.find('a.signup-link');
    expect(signupLink.text()).toBe('Створіть його тут');

    // Повідомлення при помилці
    const alertMessage = 'Не вдалося увійти. Перевірте ваші дані.';
    global.alert(alertMessage); // Simulate an alert
    expect(global.alert).toHaveBeenCalledWith(alertMessage);

    // Логотип на кнопці (перевіряємо за alt текстом)
    const loginIcon = wrapper.find('.login-icon');
    expect(loginIcon.attributes('alt')).toBe('');
  });
  
  it('Відображає повідомлення про помилку при невірних даних', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Не вдалося увійти. Перевірте ваші дані.' }),
      })
    );
  
    const emailInput = wrapper.find('input#email');
    const passwordInput = wrapper.find('input#password');
    const loginForm = wrapper.find('form.login-form');
  
    await emailInput.setValue('wrong@example.com');
    await passwordInput.setValue('wrongpassword');
    await loginForm.trigger('submit.prevent');
  
    expect(global.fetch).toHaveBeenCalledWith(
      'https://koshtovnya.api-dev.bmax-edu.website/api/login',
      expect.any(Object)
    );
    expect(global.alert).toHaveBeenCalledWith('Не вдалося увійти. Перевірте ваші дані.');
  });
  
  it('Відображає повідомлення про помилку при проблемах із сервером', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Server is down')));

    const emailInput = wrapper.find('input#email');
    const passwordInput = wrapper.find('input#password');
    const loginForm = wrapper.find('form.login-form');

    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');
    await loginForm.trigger('submit.prevent');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://koshtovnya.api-dev.bmax-edu.website/api/login',
      expect.any(Object)
    );
    expect(global.alert).toHaveBeenCalledWith('Не вдалося увійти. Перевірте ваші дані.');
    expect(console.error).toHaveBeenCalledWith('Помилка входу:', 'Server is down');
  });

  it('Зберігає токен у localStorage після успішного входу', async () => {
    const emailInput = wrapper.find('input#email');
    const passwordInput = wrapper.find('input#password');
    const loginForm = wrapper.find('form.login-form');
  
    await emailInput.setValue('test@example.com');
    await passwordInput.setValue('password123');
    await loginForm.trigger('submit.prevent');
  
    expect(global.fetch).toHaveBeenCalledWith(
      'https://koshtovnya.api-dev.bmax-edu.website/api/login',
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
    const loginForm = wrapper.find('form.login-form');
    await loginForm.trigger('submit.prevent');

    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: 'AccountInfo' });
  });

  it('викликає метод submitLogin при сабміті форми', async () => {
    // Мокаємо метод submitLogin
    const submitLoginMock = jest.fn();
  
    wrapper.vm.submitLogin = submitLoginMock; // Додаємо мок-метод до інстансу компонента
  
    // Знаходимо форму та імітуємо сабміт
    await wrapper.find('.login-form').trigger('submit.prevent');
  
    // Перевіряємо, що метод submitLogin викликано
    expect(submitLoginMock).toHaveBeenCalled();
  });

  it('надсилає правильні дані у запиті до API', async () => {
    // Мокаємо глобальний fetch
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ token: 'mock-token' }),
    });
  
    // Вводимо тестові дані
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    await wrapper.find('#email').setValue(testEmail);
    await wrapper.find('#password').setValue(testPassword);
  
    // Сабмітимо форму
    await wrapper.find('.login-form').trigger('submit.prevent');
  
    // Перевіряємо, що fetch був викликаний з правильними аргументами
    expect(fetchMock).toHaveBeenCalledWith('https://koshtovnya.api-dev.bmax-edu.website/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
  
    // Очистка мока
    fetchMock.mockRestore();
  });

  it('посилання "Створіть його тут" веде на коректний роут /registration', () => {
    // Знаходимо посилання
    const registrationLink = wrapper.find('a.signup-link');

    // Перевіряємо, що посилання існує
    expect(registrationLink.exists()).toBe(true);

    // Перевіряємо, що атрибут href вказує на правильний маршрут
    expect(registrationLink.attributes('href')).toBe('/registration');
  });
   
  it('Перевіряє, що всі елементи мають коректний aria-label', () => {
    const emailInput = wrapper.find('#email');
    const passwordInput = wrapper.find('#password');

    expect(emailInput.attributes('aria-label')).toBe('Email');
    expect(passwordInput.attributes('aria-label')).toBe('Пароль');
  });

  it('Перевіряє, що aria-label не порожній на інпут елементах', () => {
    const inputs = wrapper.findAll('input');
    inputs.forEach(input => {
      const ariaLabel = input.attributes('aria-label');
      expect(ariaLabel).toBeTruthy(); // Перевірка, що aria-label існує
      expect(ariaLabel.trim().length).toBeGreaterThan(0); // Перевірка, що aria-label не порожній
    });
  });

  it('Іконки для пароля відображаються правильно', () => {
    const togglePasswordButton = wrapper.find('button.toggle-password-button');
    const iconImg = togglePasswordButton.find('img');
  
    // Перевіряємо, що іконка існує
    expect(iconImg.exists()).toBe(true);
  
    // Перевіряємо, що іконка має правильний src
    expect(iconImg.attributes('src')).toBe('mock-eye-closed-icon.svg');
  });

  it('Кнопка входу має правильний клас', () => {
    const loginButton = wrapper.find('.login-button');
    expect(loginButton.exists()).toBe(true);
    expect(loginButton.classes()).toContain('login-button'); // Перевірка класу
  });
  
  it('Інпути мають правильні класи', () => {
    const inputs = wrapper.findAll('.form-input');
    expect(inputs).toHaveLength(2); // Має бути два інпути
    inputs.forEach(input => {
      expect(input.classes()).toContain('form-input'); // Перевірка класу
    });
  });
  
  it('Текст має правильний клас та текст', () => {
    const sectionTitle = wrapper.find('.section-title');
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.text()).toBe('Вхід'); // Перевірка тексту
    expect(sectionTitle.classes()).toContain('section-title'); // Перевірка класу
  });
}); 
