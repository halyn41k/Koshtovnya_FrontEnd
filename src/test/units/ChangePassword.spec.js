import { shallowMount } from '@vue/test-utils';
import ChangePassword from '../../components/ChangePassword.vue';

describe('ChangePassword.vue', () => {
  let wrapper;
  const mockRouter = {
    push: jest.fn(), // Мок для $router.push
  };

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    global.alert = jest.fn(); // Мок для alert

    // Монтуючи компонент, передаємо мок для $router
    wrapper = shallowMount(ChangePassword, {
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    jest.clearAllMocks(); // Очищення моків після кожного тесту
  });

  it('відтворює всі необхідні елементи', () => {
    // Заголовки
    expect(wrapper.find('.password-change-title').text()).toBe('Зміна паролю');

    // Поля для введення паролів
    expect(wrapper.find('#currentPassword').exists()).toBe(true);
    expect(wrapper.find('#newPassword').exists()).toBe(true);
    expect(wrapper.find('#confirmPassword').exists()).toBe(true);

    // Кнопки видимості паролів
    expect(wrapper.findAll('.toggle-password-button').length).toBe(3);

    // Кнопка для зміни пароля
    const submitButton = wrapper.find('.password-change-button');
    expect(submitButton.exists()).toBe(true);
    expect(submitButton.text()).toContain('Змінити пароль');
  });

  it('правильно обробляє введення', async () => {
    const currentPasswordInput = wrapper.find('#currentPassword');
    const newPasswordInput = wrapper.find('#newPassword');
    const confirmPasswordInput = wrapper.find('#confirmPassword');

    // Симулюємо введення тексту
    await currentPasswordInput.setValue('current_password');
    await newPasswordInput.setValue('new_password');
    await confirmPasswordInput.setValue('new_password_confirm');

    // Перевіряємо дані в моделі
    expect(wrapper.vm.currentPassword).toBe('current_password');
    expect(wrapper.vm.newPassword).toBe('new_password');
    expect(wrapper.vm.confirmPassword).toBe('new_password_confirm');
  });

  it('правильно перемикає видимість паролів', async () => {
    const toggleButtons = wrapper.findAll('.toggle-password-button');

    // Перевіряємо початковий стан видимості
    expect(wrapper.vm.showCurrentPassword).toBe(false);
    expect(wrapper.vm.showNewPassword).toBe(false);
    expect(wrapper.vm.showConfirmPassword).toBe(false);

    // Натискаємо кнопки видимості
    await toggleButtons.at(0).trigger('click');
    expect(wrapper.vm.showCurrentPassword).toBe(true);

    await toggleButtons.at(1).trigger('click');
    expect(wrapper.vm.showNewPassword).toBe(true);

    await toggleButtons.at(2).trigger('click');
    expect(wrapper.vm.showConfirmPassword).toBe(true);
  });

  it('Функціональність кнопок відображення/приховування пароля', async () => {
    const toggleButtons = wrapper.findAll('button.toggle-password-button');

    // Перевірка видимості для кожного поля
    const checkPasswordVisibility = async (index, field, initialType, toggledType, initialIcon, toggledIcon) => {
      const passwordInput = wrapper.find(`#${field}`);
      const toggleButton = toggleButtons.at(index);
      
      // Отримуємо HTML SVG-елемента
      const getCurrentIconSVG = () => toggleButton.find('span').html();

      // Початковий стан
      expect(passwordInput.attributes('type')).toBe(initialType);
      expect(getCurrentIconSVG()).toContain(initialIcon);

      // Клік для зміни видимості
      await toggleButton.trigger('click');

      // Після кліку: перевірка зміни типу та іконки
      expect(passwordInput.attributes('type')).toBe(toggledType);
      expect(getCurrentIconSVG()).toContain(toggledIcon);

      // Повторний клік
      await toggleButton.trigger('click');

      // Повернення до початкового стану
      expect(passwordInput.attributes('type')).toBe(initialType);
      expect(getCurrentIconSVG()).toContain(initialIcon);
    };

    const expectedEyeOpenPath = 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5';
    const expectedEyeClosedPath = 'M2 2L22 22M12 4.5C7 4.5 2.73 7.61 1 12c1.23 2.9 3.37 5.15 6.13 6.3';

    // Перевірка для поля currentPassword
    await checkPasswordVisibility(0, 'currentPassword', 'password', 'text', expectedEyeClosedPath, expectedEyeOpenPath);

    // Перевірка для поля newPassword
    await checkPasswordVisibility(1, 'newPassword', 'password', 'text', expectedEyeClosedPath, expectedEyeOpenPath);

    // Перевірка для поля confirmPassword
    await checkPasswordVisibility(2, 'confirmPassword', 'password', 'text', expectedEyeClosedPath, expectedEyeOpenPath);
  });

  it('Поля currentPassword, newPassword і confirmPassword є обов’язковими', async () => {
    const currentPasswordInput = wrapper.find('#currentPassword');
    const newPasswordInput = wrapper.find('#newPassword');
    const confirmPasswordInput = wrapper.find('#confirmPassword');

    // Перевірка наявності атрибута "required"
    expect(currentPasswordInput.attributes('required')).toBeDefined();
    expect(newPasswordInput.attributes('required')).toBeDefined();
    expect(confirmPasswordInput.attributes('required')).toBeDefined();
  });

  it('newPassword і confirmPassword повинні збігатися', async () => {
    const form = wrapper.find('form.password-change-form');
    const newPasswordInput = wrapper.find('#newPassword');
    const confirmPasswordInput = wrapper.find('#confirmPassword');

    // Встановлення різних значень для newPassword і confirmPassword
    await newPasswordInput.setValue('password123');
    await confirmPasswordInput.setValue('password456');

    // Симуляція відправлення форми
    await form.trigger('submit.prevent');

    // Очікуємо виклику alert з повідомленням про розбіжність паролів
    expect(global.alert).toHaveBeenCalledWith('Новий пароль і підтвердження пароля не збігаються.');
  });

  it('Форма відправляється, якщо всі дані валідні', async () => {
    const form = wrapper.find('form.password-change-form');
    const currentPasswordInput = wrapper.find('#currentPassword');
    const newPasswordInput = wrapper.find('#newPassword');
    const confirmPasswordInput = wrapper.find('#confirmPassword');

    // Встановлення коректних значень
    await currentPasswordInput.setValue('current_password');
    await newPasswordInput.setValue('password123');
    await confirmPasswordInput.setValue('password123');

    // Симуляція відправлення форми
    await form.trigger('submit.prevent');

    // Очікуємо виклику fetch
    expect(fetch).toHaveBeenCalledWith('https://koshtovnya.api-dev.bmax-edu.website/api/change-password', expect.any(Object));

    // Очікуємо, що alert викликається з повідомленням про успіх
    expect(global.alert).toHaveBeenCalledWith('Пароль успішно змінено!');

    // Очікуємо виклику $router.push
    expect(mockRouter.push).toHaveBeenCalledWith('/account');
  });

  it('Елемент заголовку має правильний клас', () => {
    const titleElement = wrapper.find('.password-change-title');
    expect(titleElement.exists()).toBe(true);
    expect(titleElement.classes()).toContain('password-change-title');
  });

  it('Форма має правильний клас', () => {
    const formElement = wrapper.find('.password-change-form');
    expect(formElement.exists()).toBe(true);
    expect(formElement.classes()).toContain('password-change-form');
  });

  it('Кнопка "Змінити пароль" має правильний клас', () => {
    const buttonElement = wrapper.find('.password-change-button');
    expect(buttonElement.exists()).toBe(true);
    expect(buttonElement.classes()).toContain('password-change-button');
  });

  it('Кнопки видимості паролів мають правильний клас', () => {
    const toggleButtons = wrapper.findAll('.toggle-password-button');
    expect(toggleButtons.length).toBe(3);

    toggleButtons.forEach((button) => {
      expect(button.classes()).toContain('toggle-password-button');
    });
  });

  it('Показує помилку, якщо токен авторизації недійсний', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Недійсний токен!' }),
      })
    );
  
    const form = wrapper.find('.password-change-form');
    await form.trigger('submit.prevent');
  
    expect(global.alert).toHaveBeenCalledWith('Помилка: Недійсний токен!');
  });

  it('Показує загальне повідомлення про помилку при невдалій відповіді сервера', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })
    );
  
    const form = wrapper.find('.password-change-form');
    await form.trigger('submit.prevent');
  
    expect(global.alert).toHaveBeenCalledWith('Помилка: Щось пішло не так.');
  });

  it('Надсилає коректні дані до сервера', async () => {
    const currentPassword = 'current_password';
    const newPassword = 'new_password';
  
    await wrapper.find('#currentPassword').setValue(currentPassword);
    await wrapper.find('#newPassword').setValue(newPassword);
    await wrapper.find('#confirmPassword').setValue(newPassword);
  
    const form = wrapper.find('.password-change-form');
    await form.trigger('submit.prevent');
  
    expect(fetch).toHaveBeenCalledWith(
      'https://koshtovnya.api-dev.bmax-edu.website/api/change-password',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: newPassword,
        }),
      })
    );
  });
});
