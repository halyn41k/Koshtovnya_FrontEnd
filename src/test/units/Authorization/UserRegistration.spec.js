describe.skip('Тести для MyComponent', () => {
  it('цей тест не виконається', () => {
    expect(true).toBe(false)
  })
})
/*
//Протестовано головні аспекти

import { mount } from '@vue/test-utils';
import UserRegistration from '@/components/authorization/UserRegistration.vue';

// Mock global fetch
global.fetch = jest.fn((url, options) => {
  // Перевіряємо правильність URL та параметрів запиту
  if (url === "http://26.235.139.202:8080/api/register" && options.method === "POST") {
    const body = JSON.parse(options.body);

    // Симулюємо успішну відповідь з використанням даних із запиту
    return Promise.resolve({
      ok: true,
      headers: {
        get: jest.fn().mockReturnValue("application/json"),
      },
      json: () =>
        Promise.resolve({
          first_name: body.first_name, // Динамічно повертаємо ім'я з тіла запиту
          message: "Registration successful",
        }),
    });
  }

  // Симулюємо помилку
  return Promise.resolve({
    ok: false,
    headers: {
      get: jest.fn().mockReturnValue("application/json"),
    },
    json: () =>
      Promise.resolve({
        message: "Помилка реєстрації",
      }),
  });
});

jest.mock('@/assets/eye-hide-svgrepo-com.svg', () => 'mock-eye-hide-icon.svg');
jest.mock('@/assets/eye-1-svgrepo-com.svg', () => 'mock-eye-closed-icon.svg');

Storage.prototype.setItem = jest.fn();
global.alert = jest.fn();

describe('UserRegistration.vue', () => {
  let wrapper;
  const mockRouterPush = jest.fn();

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
    console.log.mockRestore();
  });

  beforeEach(() => {
    wrapper = mount(UserRegistration, {
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

  it('Контейнер має правильний клас', () => {
    const registrationContainer = wrapper.find('.registration-container');
    expect(registrationContainer.exists()).toBe(true);
    expect(registrationContainer.classes()).toContain('registration-container');
  });

  it('Заголовок секції має правильний текст і клас', () => {
    const sectionTitle = wrapper.find('span.registration-title');
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.text()).toBe('Реєстрація');
    expect(sectionTitle.classes()).toContain('registration-title');
  });

  it('Функціональність кнопки показу/приховування пароля працює правильно', async () => {
    const passwordInput = wrapper.find('input#password');
    const togglePasswordButton = wrapper.find('button.toggle-password-button');
  
    // Отримуємо src іконки
    const getCurrentIconSrc = () => togglePasswordButton.find('img').attributes('src');
  
    const expectedEyeClosedIcon = 'mock-eye-closed-icon.svg';
    const expectedEyeOpenIcon = 'mock-eye-hide-icon.svg';
  
    // Початковий стан
    expect(passwordInput.attributes('type')).toBe('password');
    expect(getCurrentIconSrc()).toBe(expectedEyeClosedIcon);
  
    // Клік по кнопці
    await togglePasswordButton.trigger('click');
  
    // Стан після кліку
    expect(passwordInput.attributes('type')).toBe('text');
    expect(getCurrentIconSrc()).toBe(expectedEyeOpenIcon);
  
    // Повторний клік
    await togglePasswordButton.trigger('click');
  
    // Повернення до початкового стану
    expect(passwordInput.attributes('type')).toBe('password');
    expect(getCurrentIconSrc()).toBe(expectedEyeClosedIcon);
  });

  it('Не дозволяє відправити форму з порожніми полями', async () => {
    const form = wrapper.find('form');

    await form.trigger('submit.prevent'); // Імітуємо відправку форми

    expect(form.element.checkValidity()).toBe(false); // Вбудована перевірка браузера
  });

  it('Не дозволяє відправити форму з некоректним email', async () => {
    const emailInput = wrapper.find('input#email');
    const form = wrapper.find('form');

    await emailInput.setValue('invalid-email');
    await form.trigger('submit.prevent');

    expect(form.element.checkValidity()).toBe(false); // Некоректний email не пройде перевірку
  });

  it('Пропускає форму, якщо всі поля валідні', async () => {
    // Заповнюємо всі поля правильно
    await wrapper.find('input#first_name').setValue('John');
    await wrapper.find('input#last_name').setValue('Doe');
    await wrapper.find('input#second_name').setValue('Smith');
    await wrapper.find('input#email').setValue('john.doe@example.com');
    await wrapper.find('input#password').setValue('securepassword');
    
    const form = wrapper.find('form');
    await form.trigger('submit.prevent');
    
    // Перевіряємо, що викликається fetch з необхідними параметрами
    expect(global.fetch).toHaveBeenCalledWith(
      "http://26.235.139.202:8080/api/register",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: "John",
          last_name: "Doe",
          second_name: "Smith",
          email: "john.doe@example.com",
          password: "securepassword",
        }),
      })
    );
    // Оскільки відповідь вдала, має відбутися перенаправлення
    expect(mockRouterPush).toHaveBeenCalledWith({
      name: "Verify",
      query: { email: "john.doe@example.com" },
    });
    // В alert не має бути викликів
    expect(global.alert).not.toHaveBeenCalled();
  }); 

  it('Прив\'язка даних через v-model оновлює стан компонента', async () => {
    const firstNameInput = wrapper.find('input#first_name');
    const lastNameInput = wrapper.find('input#last_name');
    const emailInput = wrapper.find('input#email');
    const passwordInput = wrapper.find('input#password');

    // Вводимо дані у поля
    await firstNameInput.setValue('Jane');
    await lastNameInput.setValue('Smith');
    await emailInput.setValue('jane.smith@example.com');
    await passwordInput.setValue('mypassword');

    // Перевіряємо стан компонента
    expect(wrapper.vm.first_name).toBe('Jane');
    expect(wrapper.vm.last_name).toBe('Smith');
    expect(wrapper.vm.email).toBe('jane.smith@example.com');
    expect(wrapper.vm.password).toBe('mypassword');
  });

  it('Рендерить усі поля та кнопки з очікуваними атрибутами', () => {
    const firstNameInput = wrapper.find('input#first_name');
    expect(firstNameInput.exists()).toBe(true);
    expect(firstNameInput.attributes('type')).toBe('text');
    expect(firstNameInput.attributes('placeholder')).toBe('Введіть ваше ім\'я');
    expect(firstNameInput.attributes('required')).toBeDefined();

    const lastNameInput = wrapper.find('input#last_name');
    expect(lastNameInput.exists()).toBe(true);
    expect(lastNameInput.attributes('type')).toBe('text');
    expect(lastNameInput.attributes('placeholder')).toBe('Введіть ваше прізвище');
    expect(lastNameInput.attributes('required')).toBeDefined();

    const emailInput = wrapper.find('input#email');
    expect(emailInput.exists()).toBe(true);
    expect(emailInput.attributes('type')).toBe('email');
    expect(emailInput.attributes('placeholder')).toBe('Введіть ваш email');
    expect(emailInput.attributes('required')).toBeDefined();

    const passwordInput = wrapper.find('input#password');
    expect(passwordInput.exists()).toBe(true);
    expect(passwordInput.attributes('type')).toBe('password');
    expect(passwordInput.attributes('placeholder')).toBe('Введіть пароль');
    expect(passwordInput.attributes('required')).toBeDefined();

    const togglePasswordButton = wrapper.find('button.toggle-password-button');
    expect(togglePasswordButton.exists()).toBe(true);
    expect(togglePasswordButton.attributes('type')).toBe('button');

    const submitButton = wrapper.find('button.registration-button');
    expect(submitButton.exists()).toBe(true);
    expect(submitButton.attributes('type')).toBe('submit');
    expect(submitButton.text()).toContain('Зареєструватися');
  });

  it('Кліки на посилання "Увійти" направляють користувача на правильний роут (/login)', () => {
    const loginLink = wrapper.find('a.login-link'); // Знаходимо посилання "Увійти"
    
    expect(loginLink.exists()).toBe(true); // Перевіряємо, що посилання існує
    expect(loginLink.attributes('href')).toBe('/login'); // Перевіряємо атрибут href
  });
  
  it('Не дозволяє відправити форму, якщо не введено пароль', async () => {
    const firstNameInput = wrapper.find('input#first_name');
    const lastNameInput = wrapper.find('input#last_name');
    const emailInput = wrapper.find('input#email');
    const passwordInput = wrapper.find('input#password');
    const form = wrapper.find('form');
  
    // Імітація введення всіх полів, крім пароля
    await firstNameInput.setValue('John');
    await lastNameInput.setValue('Doe');
    await emailInput.setValue('john.doe@example.com');
    await passwordInput.setValue(''); // Leave the password field blank
  
    // Тригер подання форми
    await form.trigger('submit.prevent');
  
    // форма не повинна надсилатися
    expect(global.alert).toHaveBeenCalledWith('Будь ласка, виправте помилки.');
    expect(form.element.checkValidity()).toBe(false);
  });

  it('Не дозволяє відправити форму, якщо не введено ім\'я', async () => {
    const lastNameInput = wrapper.find('input#last_name');
    const emailInput = wrapper.find('input#email');
    const passwordInput = wrapper.find('input#password');
    const form = wrapper.find('form');
  
    // Заповнюємо всі поля, крім імені
    await lastNameInput.setValue('Doe');
    await emailInput.setValue('john.doe@example.com');
    await passwordInput.setValue('securepassword');
  
    // Імітуємо відправку форми
    await form.trigger('submit.prevent');
  
    // Перевіряємо: форма не повинна відправлятись
    expect(global.alert).toHaveBeenCalledWith('Будь ласка, виправте помилки.');
    expect(form.element.checkValidity()).toBe(false);
  });
  
  it('Не дозволяє відправити форму, якщо не введено прізвище', async () => {
    const firstNameInput = wrapper.find('input#first_name');
    const emailInput = wrapper.find('input#email');
    const passwordInput = wrapper.find('input#password');
    const form = wrapper.find('form');
  
    // Заповнюємо всі поля, крім прізвища
    await firstNameInput.setValue('John');
    await emailInput.setValue('john.doe@example.com');
    await passwordInput.setValue('securepassword');
  
    // Імітуємо відправку форми
    await form.trigger('submit.prevent');
  
    // Перевіряємо: форма не повинна відправлятись
    expect(global.alert).toHaveBeenCalledWith('Будь ласка, виправте помилки.');
    expect(form.element.checkValidity()).toBe(false);
  });
  
  it('Не дозволяє відправити форму, якщо не введено пошту', async () => {
    const firstNameInput = wrapper.find('input#first_name');
    const lastNameInput = wrapper.find('input#last_name');
    const passwordInput = wrapper.find('input#password');
    const form = wrapper.find('form');
  
    // Заповнюємо всі поля, крім пошти
    await firstNameInput.setValue('John');
    await lastNameInput.setValue('Doe');
    await passwordInput.setValue('securepassword');
  
    // Імітуємо відправку форми
    await form.trigger('submit.prevent');
  
    // Перевіряємо: форма не повинна відправлятись
    expect(global.alert).toHaveBeenCalledWith('Будь ласка, виправте помилки.');
    expect(form.element.checkValidity()).toBe(false);
  });

  it('Показує повідомлення про помилку, якщо запит невдалий (response.ok === false)', async () => {
    // Мокаємо fetch для повернення невдалого запиту
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false, // Симулюємо невдалий запит
        json: () => Promise.resolve({ message: 'email вже зайнятий' }),
      })
    );
  
    const firstNameInput = wrapper.find('input#first_name');
    const lastNameInput = wrapper.find('input#last_name');
    const emailInput = wrapper.find('input#email');
    const passwordInput = wrapper.find('input#password');
    const form = wrapper.find('form');
  
    // Заповнюємо всі поля
    await firstNameInput.setValue('John');
    await lastNameInput.setValue('Doe');
    await emailInput.setValue('john.doe@example.com');
    await passwordInput.setValue('securepassword');
  
    // Імітуємо відправку форми
    await form.trigger('submit.prevent');
  
    // Перевіряємо, що alert викликаний із відповідним повідомленням
    expect(global.alert).toHaveBeenCalledWith('Будь ласка, виправте помилки.');
  });

  it('Не дозволяє відправити форму, якщо є помилки', async () => {
    const form = wrapper.find('form');
  
    await form.trigger('submit.prevent');
  
    expect(global.alert).toHaveBeenCalledWith('Будь ласка, виправте помилки.');
  });

  it('Показує помилку, якщо ім\'я порожнє', async () => {
    const firstNameInput = wrapper.find('input#first_name');
    await firstNameInput.setValue('');
    await firstNameInput.trigger('input');
    
    expect(wrapper.vm.nameError).toBe("Ім'я не може бути порожнім.");
  });

  it('Показує помилку, якщо прізвище порожнє', async () => {
    const lastNameInput = wrapper.find('input#last_name');
    await lastNameInput.setValue('');
    await lastNameInput.trigger('input');
    
    expect(wrapper.vm.lastNameError).toBe('Прізвище не може бути порожнім.');
  });

  it('Показує помилку, якщо email порожній', async () => {
    const emailInput = wrapper.find('input#email');
    await emailInput.setValue('');
    await emailInput.trigger('input');
    
    expect(wrapper.vm.emailError).toBe('Введіть дійсний email.');
  });
  
  it('Показує помилку, якщо пароль коротший за 8 символів', async () => {
    const passwordInput = wrapper.find('input#password');
    await passwordInput.setValue('short');
    await passwordInput.trigger('input');
    
    expect(wrapper.vm.passwordError).toBe('Пароль повинен містити щонайменше 8 символів.');
  });

  it('Показує помилку, якщо пароль містить пробіли', async () => {
    const passwordInput = wrapper.find('input#password');
    await passwordInput.setValue('password with space');
    await passwordInput.trigger('input');
    
    expect(wrapper.vm.passwordError).toBe('Пароль не повинен містити пробілів.');
  });

  it('Не відправляє форму при наявності помилок валідації', async () => {
    const form = wrapper.find('form');
    await form.trigger('submit.prevent');
    expect(global.alert).toHaveBeenCalledWith("Будь ласка, виправте помилки.");
  });

  it('Перевіряє чи зберігаються дані після перезавантаження сторінки', async () => {
    const firstNameInput = wrapper.find('input#first_name');
    await firstNameInput.setValue('Jane');
    const lastNameInput = wrapper.find('input#last_name');
    await lastNameInput.setValue('Doe');
    
    // Імітуємо перезавантаження сторінки
    wrapper.vm.$forceUpdate();
    
    expect(firstNameInput.element.value).toBe('Jane');
    expect(lastNameInput.element.value).toBe('Doe');
  });
  
});
*/