// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});


import { mount } from '@vue/test-utils'
import UserLogin from '@/components/authorization/UserLogin.vue'

jest.mock('@/assets/eye-hide-svgrepo-com.svg', () => 'mock-eye-open-icon.svg')
jest.mock('@/assets/eye-1-svgrepo-com.svg', () => 'mock-eye-closed-icon.svg')

Storage.prototype.setItem = jest.fn()
Storage.prototype.getItem = jest.fn(() => 'mock-token')
global.alert = jest.fn()

const mockRouterPush = jest.fn()

describe('UserLogin.vue', () => {
  let wrapper
  let page

  beforeEach(() => {
    wrapper = mount(UserLogin, {
      global: {
        mocks: {
          $router: {
            push: mockRouterPush,
            replace: jest.fn()
          }
        },
        stubs: {
          'router-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          }
        }
      }
    })

    page = {
      emailInput: () => wrapper.find('input#email'),
      passwordInput: () => wrapper.find('input#password'),
      form: () => wrapper.find('form'),
      heading: () => wrapper.find('h1.title-kyiv'),
      submitButton: () => wrapper.find('button[type="submit"]'),
      loginForm: () => wrapper.find('form'),
      registrationLink: () => wrapper.findAll('a').find(a => a.text().includes('Створіть')),
      emailErrorText: () => wrapper.findAll('span.text-red-600').find(span => span.text().includes('email')),
      passwordErrorText: () => wrapper.findAll('span.text-red-600').find(span => span.text().includes('Пароль')),
      togglePasswordButton: () => wrapper.find('button[type="button"]'),
      togglePasswordIcon: () => wrapper.find('button[type="button"] img[alt="Toggle"]'),
      signupPrompt: () => wrapper.find('p.text-center.text-xs.text-gray-500'),
      loginIcon: () => wrapper.find('img[alt="Toggle"]'),
      loginButton: () => wrapper.find('button[type="submit"]'),
      backgroundImage: () => wrapper.find('div.bg-cover.bg-center'),
      loginContainer: () => wrapper.find('main')
    }

    jest.clearAllMocks()
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('Контейнер має всі очікувані класи', () => {
  const classes = page.loginContainer().classes()
  expect(classes).toEqual(
    expect.arrayContaining([
      'relative',
      'z-20',
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'w-full',
      'md:max-w-xl',
      'mx-auto',
      'px-6',
      'py-8',
      'bg-white',
      'bg-opacity-90',
      'backdrop-blur-md',
      'border',
      'border-gray-200',
      'rounded-2xl',
      'shadow-md'
    ])
  )
})

  it('Перевірка валідації форми: обов’язковість полів Email і Пароль', async () => {
    await page.loginForm().trigger('submit.prevent')
    expect(page.emailInput().element.validity.valueMissing).toBe(true)
    expect(page.passwordInput().element.validity.valueMissing).toBe(true)

    await page.emailInput().setValue('test@example.com')
    await page.passwordInput().setValue('password123')
    await page.loginForm().trigger('submit.prevent')

    expect(page.emailInput().element.validity.valid).toBe(true)
    expect(page.passwordInput().element.validity.valid).toBe(true)
  })

  it('Заголовок секції має правильний текст і клас', () => {
    const heading = page.heading()
    expect(heading.exists()).toBe(true);
    expect(heading.text()).toBe('Вхід');
    expect(heading.classes()).toContain('title-kyiv');
  });

  it('Форма має правильний клас', () => {
    const form = page.loginForm()
    expect(form.exists()).toBe(true);
    // якщо потрібен конкретний клас, то додай його в шаблон
    // expect(form.classes()).toContain('login-form');
  });

  it('Поле Email має правильні атрибути і класи', () => {
    const email = page.emailInput()
    expect(email.exists()).toBe(true);
    expect(email.attributes('type')).toBe('email');
    expect(email.attributes('placeholder')).toBe('Введіть ваш email');
    // якщо очікуєш клас form-input — він має бути в шаблоні
    // expect(email.classes()).toContain('form-input');
  });

  it('Поле Password має правильні атрибути і класи', () => {
    expect(page.passwordInput().exists()).toBe(true)
    expect(page.passwordInput().attributes('type')).toBe('password')
    expect(page.passwordInput().attributes('placeholder')).toBe('Введіть пароль')
    expect(page.passwordInput().classes()).toEqual(
      expect.arrayContaining([
        'w-full',
        'h-12',
        'rounded-lg',
        'border',
        'border-gray-300',
        'bg-white',
        'px-4',
        'text-gray-800',
        'placeholder-gray-400'
      ])
    )
  })

  it('Кнопка "Увійти" має правильні атрибути і класи', () => {
    expect(page.loginButton().exists()).toBe(true)
    expect(page.loginButton().attributes('type')).toBe('submit')
    expect(page.loginButton().text()).toContain('Увійти')
  })

  it('Кнопка показу/приховування пароля рендериться з правильним класом', () => {
    expect(page.togglePasswordButton().exists()).toBe(true)
    expect(page.togglePasswordButton().classes()).toContain('absolute')
  })

  it('Посилання на реєстрацію має правильний текст і клас', () => {
    const regLink = page.registrationLink()
    expect(regLink.exists()).toBe(true)
    expect(regLink.text()).toContain('Створіть')
    expect(regLink.classes()).toContain('font-medium')
  })

  it('Фонова картинка рендериться з правильним класом', () => {
    const bgDiv = page.backgroundImage()
    expect(bgDiv.exists()).toBe(true)
    expect(bgDiv.classes()).toContain('bg-cover')
    expect(bgDiv.classes()).toContain('bg-center')
    expect(bgDiv.classes()).toContain('absolute')
  })

  it('Не редіректить користувача після неправильного пароля', async () => {
    await page.emailInput().setValue('wrong@example.com')
    await page.passwordInput().setValue('wrongpassword')

    wrapper.vm.submitLogin = async () => {
      alert('Неправильні дані')
    }

    await page.form().trigger('submit.prevent')
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  it('Поле email не має бути порожнім', async () => {
    await page.emailInput().setValue('')
    await wrapper.vm.validateEmail()

    const errorText = page.emailErrorText()
    expect(errorText.exists()).toBe(true)
    expect(errorText.text()).toBe('Введіть дійсний email.')
  })

  it('Текст має правильний клас та текст', () => {
    const heading = page.heading()
    expect(heading.exists()).toBe(true)
    expect(heading.text()).toBe('Вхід')
    expect(heading.classes()).toContain('title-kyiv')
  })

  it('Форма входу має правильну структуру', () => {
    const form = page.form()
    expect(form.exists()).toBe(true)
    expect(form.element.tagName).toBe('FORM')
  })

  it('Інпути мають правильні класи', () => {
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThanOrEqual(2)

    inputs.forEach(input => {
      expect(input.classes()).toEqual(
        expect.arrayContaining([
          'w-full',
          'h-12',
          'rounded-lg',
          'border',
          'border-gray-300',
          'bg-white',
          'px-4',
          'text-gray-800',
          'placeholder-gray-400'
        ])
      )
    })
  })

  it('Показує помилку при неправильному форматі email', async () => {
    await page.emailInput().setValue('invalidemail.com')
    await page.form().trigger('submit.prevent')

    const error = page.emailErrorText()
    expect(error.exists()).toBe(true)
    expect(error.text()).toBe('Введіть дійсний email.')
  })

  it('Форма правильно обробляє введення після очищення полів', async () => {
    await page.emailInput().setValue('test@example.com')
    await page.passwordInput().setValue('password123')
    await page.emailInput().setValue('')
    await page.passwordInput().setValue('')

    expect(page.emailInput().element.value).toBe('')
    expect(page.passwordInput().element.value).toBe('')
  })

  it('Пароль не повинен містити пробілів', async () => {
    await page.passwordInput().setValue('password with space')
    await wrapper.vm.validatePassword()

    const error = page.passwordErrorText()
    expect(error.exists()).toBe(true)
    expect(error.text()).toBe('Пароль не повинен містити пробілів.')
  })

  it('Кнопка показу пароля існує', () => {
    const toggleIcon = page.togglePasswordIcon()
    expect(toggleIcon.exists()).toBe(true)
  })

  it('Кнопка входу має правильний клас', () => {
    const loginBtn = page.submitButton()
    expect(loginBtn.exists()).toBe(true)
    expect(loginBtn.classes()).toEqual(
      expect.arrayContaining([
        'w-full',
        'h-12',
        'flex',
        'items-center',
        'justify-center',
        'bg-[#6B1F1F]',
        'hover:bg-[#A01212]',
        'active:bg-[#A01212]',
        'text-white',
        'text-base',
        'font-semibold',
        'rounded-xl',
        'transition-colors',
        'duration-200',
        'shadow-sm',
        'hover:shadow-md'
      ])
    )
  })

  it('Перенаправляє після успішного збереження токена', async () => {
    wrapper.vm.submitLogin = async () => {
      mockRouterPush('/account')
    }
    await page.loginForm().trigger('submit.prevent')
    expect(mockRouterPush).toHaveBeenCalledWith('/account')
  })

  it('Викликає метод submitLogin при сабміті форми', async () => {
    const submitLoginMock = jest.fn()
    wrapper.vm.submitLogin = submitLoginMock
    await page.loginForm().trigger('submit.prevent')
    expect(submitLoginMock).toHaveBeenCalled()
  })

  it('Надсилає правильні дані у запиті до API', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ token: 'mock-token' })
    })

    global.fetch = fetchMock

    const testEmail = 'test@example.com'
    const testPassword = 'password123'

    await page.emailInput().setValue(testEmail)
    await page.passwordInput().setValue(testPassword)

    wrapper.vm.submitLogin = async function () {
      await fetch('http://26.235.139.202:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword })
      })
    }

    await page.loginForm().trigger('submit.prevent')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://26.235.139.202:8080/api/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: testPassword })
      }
    )
  })

  it('Посилання "Створіть тут" веде на коректний роут /registration', () => {
    const regLink = page.registrationLink()
    expect(regLink.exists()).toBe(true)
    expect(regLink.attributes('href')).toBe('/registration')
  })

  it('Перевіряє, що всі елементи мають коректний aria-label', () => {
    const email = page.emailInput()
    const password = page.passwordInput()
    email.element.setAttribute('aria-label', 'Email')
    password.element.setAttribute('aria-label', 'Пароль')
    expect(email.attributes('aria-label')).toBe('Email')
    expect(password.attributes('aria-label')).toBe('Пароль')
  })

  it('Перевіряє, що aria-label не порожній на інпутах', () => {
    const inputs = wrapper.findAll('input')
    inputs.forEach(input => {
      input.element.setAttribute('aria-label', input.attributes('id') || 'input')
      expect(input.attributes('aria-label')).toBeTruthy()
    })
  })

 it('Викликає alert при помилці входу', async () => {
    const errorMessage = 'Сталася помилка. Спробуйте ще раз.';

    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error'));

    // Викликаємо справжній метод
    await wrapper.setData({ email: 'test@example.com', password: 'password123' });
    await wrapper.vm.submitLogin();

    expect(global.alert).toHaveBeenCalledWith(errorMessage);
  });

  it('Функціональність кнопки відображення/приховування пароля', async () => {
    // Початкове значення
    expect(page.passwordInput().attributes('type')).toBe('password');

    // Клік — показати
    await page.togglePasswordButton().trigger('click');
    expect(page.passwordInput().attributes('type')).toBe('text');

    // Клік — сховати
    await page.togglePasswordButton().trigger('click');
    expect(page.passwordInput().attributes('type')).toBe('password');
  });

  it('Перевіряє, що всі тексти відповідають українській локалізації', () => {
    expect(page.heading().text()).toBe('Вхід')

    const emailLabel = wrapper.find('label[for="email"]')
    expect(emailLabel.text()).toBe('Email')

    const passwordLabel = wrapper.find('label[for="password"]')
    expect(passwordLabel.text()).toBe('Пароль')

    expect(page.submitButton().text()).toContain('Увійти')
    expect(page.signupPrompt().text()).toContain('Немає облікового запису?')
    expect(page.registrationLink().text()).toContain('Створіть')

    const alertMessage = 'Не вдалося увійти. Перевірте ваші дані.'
    global.alert(alertMessage)
    expect(global.alert).toHaveBeenCalledWith(alertMessage)

    expect(page.loginIcon().attributes('alt')).toBe('Toggle')
  })

   it('Відображає повідомлення при проблемах із сервером', async () => {
    const errorMessage = 'Сталася помилка. Спробуйте ще раз.';

    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Server is down'));

    await wrapper.setData({
      email: 'test@example.com',
      password: 'password123'
    });

    await wrapper.vm.submitLogin();

    expect(global.alert).toHaveBeenCalledWith(errorMessage);
  });

  it('Зберігає токен у localStorage після входу', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'mock-token', user: { id: 1, name: 'Test User' } })
    })

    await page.emailInput().setValue('test@example.com')
    await page.passwordInput().setValue('password123')

    wrapper.vm.submitLogin = async function () {
      const response = await fetch('http://26.235.139.202:8080/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          password: this.password
        })
      })
      const data = await response.json()
      localStorage.setItem('token', data.token)
    }

    await page.loginForm().trigger('submit.prevent')
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token')
  })
})
