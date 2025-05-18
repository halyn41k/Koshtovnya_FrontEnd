// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти

import { shallowMount } from '@vue/test-utils';
import ChangePassword from '@/components/authorization/ChangePassword.vue';

describe('ChangePassword.vue', () => {
  let wrapper;
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );
    global.alert = jest.fn();

    wrapper = shallowMount(ChangePassword, {
      global: {
        mocks: {
          $router: mockRouter,
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    wrapper.unmount();
  });

  it('відображає заголовок', () => {
    const title = wrapper.find('h1');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Зміна паролю');
  });

  it('відображає поле поточного паролю', () => {
    expect(wrapper.find('#currentPassword').exists()).toBe(true);
  });

  it('відображає поле нового паролю', () => {
    expect(wrapper.find('#newPassword').exists()).toBe(true);
  });

  it('відображає поле підтвердження паролю', () => {
    expect(wrapper.find('#confirmPassword').exists()).toBe(true);
  });

  it('відображає кнопку "Змінити пароль"', () => {
    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.exists()).toBe(true);
    expect(submitButton.text()).toContain('Змінити пароль');
  });

  it('оновлює currentPassword при введенні', async () => {
    await wrapper.find('#currentPassword').setValue('old');
    expect(wrapper.vm.currentPassword).toBe('old');
  });

  it('оновлює newPassword при введенні', async () => {
    await wrapper.find('#newPassword').setValue('new');
    expect(wrapper.vm.newPassword).toBe('new');
  });

  it('оновлює confirmPassword при введенні', async () => {
    await wrapper.find('#confirmPassword').setValue('confirm');
    expect(wrapper.vm.confirmPassword).toBe('confirm');
  });

  it('перемикає видимість currentPassword', async () => {
    const button = wrapper.findAll('button[type="button"]').at(0);
    await button.trigger('click');
    expect(wrapper.vm.showCurrentPassword).toBe(true);
  });

  it('перемикає видимість newPassword', async () => {
    const button = wrapper.findAll('button[type="button"]').at(1);
    await button.trigger('click');
    expect(wrapper.vm.showNewPassword).toBe(true);
  });

  it('перемикає видимість confirmPassword', async () => {
    const button = wrapper.findAll('button[type="button"]').at(2);
    await button.trigger('click');
    expect(wrapper.vm.showConfirmPassword).toBe(true);
  });

  it('перевіряє що поля є обовʼязковими (required)', () => {
    expect(wrapper.find('#currentPassword').attributes('required')).toBeDefined();
    expect(wrapper.find('#newPassword').attributes('required')).toBeDefined();
    expect(wrapper.find('#confirmPassword').attributes('required')).toBeDefined();
  });

  it('не надсилає форму, якщо паролі не збігаються', async () => {
    await wrapper.find('#newPassword').setValue('abc');
    await wrapper.find('#confirmPassword').setValue('xyz');
    await wrapper.find('form').trigger('submit.prevent');

    expect(global.alert).toHaveBeenCalledWith('Новий пароль і підтвердження не збігаються.');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('надсилає форму, якщо дані валідні', async () => {
    localStorage.setItem('token', 'token123');
    await wrapper.find('#currentPassword').setValue('old');
    await wrapper.find('#newPassword').setValue('new');
    await wrapper.find('#confirmPassword').setValue('new');

    await wrapper.find('form').trigger('submit.prevent');

    expect(fetch).toHaveBeenCalled();
    expect(global.alert).toHaveBeenCalledWith('Пароль успішно змінено!');
    expect(mockRouter.push).toHaveBeenCalledWith('/account');
  });

  it('відображає повідомлення про помилку з сервера (message)', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Помилка!' }),
      })
    );

    await wrapper.find('#currentPassword').setValue('a');
    await wrapper.find('#newPassword').setValue('b');
    await wrapper.find('#confirmPassword').setValue('b');
    await wrapper.find('form').trigger('submit.prevent');

    expect(global.alert).toHaveBeenCalledWith('Помилка: Помилка!');
  });

  it('відображає повідомлення за замовчуванням, якщо message не передано', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      })
    );

    await wrapper.find('#currentPassword').setValue('a');
    await wrapper.find('#newPassword').setValue('b');
    await wrapper.find('#confirmPassword').setValue('b');
    await wrapper.find('form').trigger('submit.prevent');

    expect(global.alert).toHaveBeenCalledWith('Помилка: Спробуйте ще раз.');
  });

  it('відображає повідомлення при помилці зʼєднання', async () => {
    console.error = jest.fn();
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

    await wrapper.find('#currentPassword').setValue('a');
    await wrapper.find('#newPassword').setValue('b');
    await wrapper.find('#confirmPassword').setValue('b');
    await wrapper.find('form').trigger('submit.prevent');

    expect(global.alert).toHaveBeenCalledWith("Помилка з'єднання з сервером.");
    console.error.mockRestore();
  });

  it('надсилає правильні дані в fetch', async () => {
    localStorage.setItem('token', 'token123');
    await wrapper.find('#currentPassword').setValue('123');
    await wrapper.find('#newPassword').setValue('abc');
    await wrapper.find('#confirmPassword').setValue('abc');
    await wrapper.find('form').trigger('submit.prevent');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/change-password$/),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer token123',
        }),
        body: JSON.stringify({
          current_password: '123',
          new_password: 'abc',
          new_password_confirmation: 'abc',
        }),
      })
    );
  });
});
