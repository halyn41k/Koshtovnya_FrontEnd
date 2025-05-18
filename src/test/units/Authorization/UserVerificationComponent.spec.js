// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти

import { shallowMount } from '@vue/test-utils'
import UserVerificationComponent from '@/components/authorization/UserVerificationComponent.vue'

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { data: [] } })),
  post: jest.fn(),
  delete: jest.fn()
}))

const routerLinkStub = {
  name: 'router-link',
  template: '<a><slot /></a>',
  props: ['to']
}

let wrapper
let alertSpy
let consoleErrorSpy

beforeEach(() => {
  global.fetch = jest.fn()
  alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
  consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

  wrapper = shallowMount(UserVerificationComponent, {
    global: {
      mocks: {
        $route: { query: {} },
        $router: { push: jest.fn() }
      },
      stubs: {
        'router-link': routerLinkStub
      }
    }
  })
})

afterEach(() => {
  jest.restoreAllMocks()
  wrapper.unmount()
})

describe('UserVerificationComponent – Рендеринг структури', () => {
  it('має головний контейнер з класами flex і flex-col', () => {
    const rootDiv = wrapper.find('div');
    expect(rootDiv.classes()).toContain('flex');
    expect(rootDiv.classes()).toContain('flex-col');
  });

  it('рендерить <h1> з класом title-kyiv і текстом "Підтвердження акаунту"', () => {
    const title = wrapper.find('h1.title-kyiv');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Підтвердження акаунту');
  });

  it('рендерить <main> з класами для контейнера', () => {
    const main = wrapper.find('main');
    expect(main.exists()).toBe(true);
    expect(main.classes()).toContain('bg-white');
    expect(main.classes()).toContain('rounded-2xl');
  });

  it('містить форму з @submit.prevent', () => {
    const form = wrapper.find('form');
    expect(form.exists()).toBe(true);
    expect(form.attributes('class')).toContain('space-y-5');
  });

  it('має кнопку типу submit з текстом "Підтвердити"', () => {
    const button = wrapper.find('button[type="submit"]');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Підтвердити');
  });

  it('використовує router-link до /registration', () => {
    const routerLink = wrapper.findComponent({ name: 'router-link' });
    expect(routerLink.exists()).toBe(true);
    expect(routerLink.props('to')).toBe('/registration');
  });

  it('встановлює email з $route.query.email', () => {
    const testEmail = 'test@example.com';
    const localWrapper = shallowMount(UserVerificationComponent, {
      global: {
        mocks: {
          $route: { query: { email: testEmail } },
          $router: { push: jest.fn() }
        },
        stubs: {
          'router-link': routerLinkStub
        }
      }
    });

    expect(localWrapper.vm.email).toBe(testEmail);
    localWrapper.unmount();
  });
});

describe('Інтерактивність input полів', () => {
  it('повинен викликати метод validateEmail при введенні даних в поле email', async () => {
    const originalValidateEmail = wrapper.vm.validateEmail;
    wrapper.vm.validateEmail = jest.fn(originalValidateEmail.bind(wrapper.vm));

    const emailInput = wrapper.find('#email');
    await emailInput.setValue('newuser@example.com');

    expect(wrapper.vm.validateEmail).toHaveBeenCalled();

    // Повертаємо оригінальну функцію
    wrapper.vm.validateEmail = originalValidateEmail;
  });

  it('повинен викликати метод validateCode при введенні даних в поле коду підтвердження', async () => {
    const originalValidateCode = wrapper.vm.validateCode;
    wrapper.vm.validateCode = jest.fn(originalValidateCode.bind(wrapper.vm));

    const codeInput = wrapper.find('#code'); // 🔧 правильний селектор
    await codeInput.setValue('654321');

    expect(wrapper.vm.validateCode).toHaveBeenCalled();

    wrapper.vm.validateCode = originalValidateCode;
  });

  it('повинні відображатись правильні placeholder-и в input полях', () => {
    const emailInput = wrapper.find('#email');
    const codeInput = wrapper.find('#code'); // 🔧 правильний селектор

    expect(emailInput.attributes('placeholder')).toBe('Введіть ваш email');
    expect(codeInput.attributes('placeholder')).toBe('Введіть код');
  });

  // Валідація email
it('відображає повідомлення про помилку при некоректному email і прибирає його при правильному', async () => {
  const emailInput = wrapper.find('#email')
  await emailInput.setValue('test@')
  await wrapper.vm.validateEmail()
  await wrapper.vm.$nextTick()

  expect(wrapper.vm.emailError).toBe('Введіть дійсний email.')
  const emailErrorSpan = wrapper.find('span.text-red-600')
  expect(emailErrorSpan.exists()).toBe(true)
  expect(emailErrorSpan.text()).toBe('Введіть дійсний email.')

  await emailInput.setValue('user@example.com')
  await wrapper.vm.validateEmail()
  await wrapper.vm.$nextTick()

  expect(wrapper.vm.emailError).toBe('')
  const noError = wrapper.find('span.text-red-600')
  expect(noError.exists()).toBe(false)
})

// Валідація коду — порожнє поле
it('відображає помилку, якщо поле коду порожнє', async () => {
  const codeInput = wrapper.find('#code')
  await codeInput.setValue('')
  await wrapper.vm.validateCode()
  await wrapper.vm.$nextTick()

  expect(wrapper.vm.codeError).toBe('Код не може бути порожнім.')
  const codeError = wrapper.find('span.text-red-600')
  expect(codeError.exists()).toBe(true)
  expect(codeError.text()).toBe('Код не може бути порожнім.')
})

// Валідація коду — пробіли
it('відображає помилку, якщо код складається лише з пробілів', async () => {
  const codeInput = wrapper.find('#code')
  await codeInput.setValue('   ')
  await wrapper.vm.validateCode()
  await wrapper.vm.$nextTick()

  expect(wrapper.vm.codeError).toBe('Код не може бути порожнім.')
  const codeError = wrapper.find('span.text-red-600')
  expect(codeError.exists()).toBe(true)
  expect(codeError.text()).toBe('Код не може бути порожнім.')
})

});

describe('Функціональність submitVerification', () => {
  let fetchSpy
  let routerPushSpy

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch')
    routerPushSpy = wrapper.vm.$router.push
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('якщо дані форми невірні, не викликає fetch і не викликає alert', async () => {
    await wrapper.setData({ email: 'invalidemail', code: '' })

    // запуск
    await wrapper.vm.submitVerification()

    // перевірка
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(window.alert).not.toHaveBeenCalled() // бо в компоненті немає alert при невірних полях
  })

  it('при валідних даних викликає fetch, alert і push', async () => {
    const testEmail = 'user@example.com'
    const testCode = '123456'
    await wrapper.setData({ email: testEmail, code: testCode })

    const fakeResponse = {
      ok: true,
      json: () => Promise.resolve({ message: 'Success' })
    }

    fetchSpy.mockResolvedValueOnce(fakeResponse)

    await wrapper.vm.submitVerification()

    expect(fetchSpy).toHaveBeenCalledWith('https://koshtovnya.api-dev.bmax-edu.website/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, code: testCode })
    })

    expect(window.alert).toHaveBeenCalledWith('Акаунт успішно підтверджено!')
    expect(routerPushSpy).toHaveBeenCalledWith('/login')
  })
})

describe('UserVerificationComponent - базовий рендеринг', () => {
  it('має контейнер з класами flex flex-col', () => {
    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('flex-col')
  })

  it('рендерить заголовок h1 з класом title-kyiv і правильним текстом', () => {
    const title = wrapper.find('h1.title-kyiv')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('Підтвердження акаунту')
  })

  it('має форму всередині main', () => {
    const main = wrapper.find('main')
    const form = main.find('form')
    expect(main.exists()).toBe(true)
    expect(form.exists()).toBe(true)
  })
})

describe('Функціональність resendCode', () => {
  let fetchSpy

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('якщо поле email порожнє, встановлює помилку в emailError, але не викликає alert', async () => {
    await wrapper.setData({ email: '' })
    await wrapper.vm.resendCode()
    expect(wrapper.vm.emailError).toBe('Введіть email.')
    expect(window.alert).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('якщо email є, надсилає запит і показує повідомлення про успіх', async () => {
    const testEmail = 'user@example.com'
    await wrapper.setData({ email: testEmail })
    const fakeResponse = {
      ok: true,
      json: () => Promise.resolve({ message: "Новий код підтвердження надіслано на вашу пошту." }),
    }
    fetchSpy.mockResolvedValueOnce(fakeResponse)

    await wrapper.vm.resendCode()

    expect(fetchSpy).toHaveBeenCalledWith("https://koshtovnya.api-dev.bmax-edu.website/api/resend-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    })
    expect(window.alert).toHaveBeenCalledWith("Код надіслано ще раз.")
  })
})
