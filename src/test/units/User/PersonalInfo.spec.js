// describe.skip('Тести для MyComponent', () => {
//     it('цей тест не виконається', () => {
//       expect(true).toBe(false)
//     })
//   })

//Протестовано головні аспекти

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => { });
  jest.spyOn(console, 'error').mockImplementation(() => { });
  jest.spyOn(console, 'log').mockImplementation(() => { });
});

import { shallowMount } from '@vue/test-utils';
import PersonalInfo from '@/components/user/PersonalInfo.vue';

// Зберігаємо оригінальні значення для alert та console.error
const originalAlert = window.alert;
const originalConsoleError = console.error;

describe('PersonalInfo.vue', () => {
  it('оновлює локальні дані при введенні тексту в input', async () => {
    const propsData = {
      userId: 1,
      first_name: "Іван",
      last_name: "Петренко",
      second_name: "Іванович",
      email: "ivan@example.com"
    };
    const wrapper = shallowMount(PersonalInfo, { props: propsData });
    const firstNameInput = wrapper.find('input#first_name');

    firstNameInput.element.value = "Олександр";
    await firstNameInput.trigger('input');

    expect(wrapper.vm.localFirstName).toBe("Олександр");
  });


  it('ініціалізує поля форми значеннями з пропсів', () => {
    const propsData = {
      userId: 1,
      first_name: "Іван",
      last_name: "Петренко",
      second_name: "Іванович",
      email: "ivan@example.com"
    };
    const wrapper = shallowMount(PersonalInfo, { props: propsData });

    expect(wrapper.find('input#first_name').element.value).toBe(propsData.first_name);
    expect(wrapper.find('input#last_name').element.value).toBe(propsData.last_name);
    expect(wrapper.find('input#second_name').element.value).toBe(propsData.second_name);
    expect(wrapper.find('input#email').element.value).toBe(propsData.email);
  });

  it('оновлює локальні дані при зміні пропсів', async () => {
    const initialProps = {
      userId: 1,
      first_name: "Іван",
      last_name: "Петренко",
      second_name: "Іванович",
      email: "ivan@example.com"
    };
    const wrapper = shallowMount(PersonalInfo, { props: initialProps });

    const newProps = {
      first_name: "Олексій",
      last_name: "Коваленко",
      second_name: "Сергійович",
      email: "oleksii@example.com"
    };
    await wrapper.setProps(newProps);

    expect(wrapper.vm.localFirstName).toBe(newProps.first_name);
    expect(wrapper.vm.localLastName).toBe(newProps.last_name);
    expect(wrapper.vm.localSecondName).toBe(newProps.second_name);
    expect(wrapper.vm.localEmail).toBe(newProps.email);

    expect(wrapper.find('input#first_name').element.value).toBe(newProps.first_name);
    expect(wrapper.find('input#last_name').element.value).toBe(newProps.last_name);
    expect(wrapper.find('input#second_name').element.value).toBe(newProps.second_name);
    expect(wrapper.find('input#email').element.value).toBe(newProps.email);
  });

  it('computed isDisabled повертає true, якщо будь-яке із трьох полів пусте', async () => {
    const wrapper = shallowMount(PersonalInfo, {
      props: { userId: 1, first_name: '', last_name: 'A', second_name: 'B', email: 'e@e' }
    });
    expect(wrapper.vm.isDisabled).toBe(true);
    await wrapper.setData({ localFirstName: 'A', localLastName: '', localSecondName: 'B' });
    expect(wrapper.vm.isDisabled).toBe(true);
    await wrapper.setData({ localLastName: 'A', localSecondName: '' });
    expect(wrapper.vm.isDisabled).toBe(true);
  });

  it('computed isDisabled повертає false, коли всі три поля непусті', () => {
    const wrapper = shallowMount(PersonalInfo, {
      props: { userId: 1, first_name: 'A', last_name: 'B', second_name: 'C', email: 'e@e' }
    });
    expect(wrapper.vm.isDisabled).toBe(false);
  });

  it('кнопка "Оновити інформацію" має атрибут disabled згідно isDisabled', async () => {
    const wrapper = shallowMount(PersonalInfo, {
      props: { userId: 1, first_name: '', last_name: 'B', second_name: 'C', email: 'e@e' }
    });
    const btn = wrapper.find('button').element;
    expect(btn.disabled).toBe(true);
    await wrapper.setData({ localFirstName: 'A' });
    expect(wrapper.find('button').element.disabled).toBe(false);
  });

  it('tooltip відображається тільки коли кнопка disabled', async () => {
    const wrapper = shallowMount(PersonalInfo, {
      props: { userId: 1, first_name: '', last_name: '', second_name: '', email: 'e@e' }
    });
    expect(wrapper.find('.group > div').exists()).toBe(true);
    await wrapper.setData({ localFirstName: 'A', localLastName: 'B', localSecondName: 'C' });
    expect(wrapper.find('.group > div').exists()).toBe(false);
  });

  it('click changePassword викликає $router.push("/changepassword")', () => {
    const push = jest.fn();
    const wrapper = shallowMount(PersonalInfo, {
      props: { userId: 1 },
      global: { mocks: { $router: { push } } }
    });
    wrapper.findAll('button')[1].trigger('click');
    expect(push).toHaveBeenCalledWith('/changepassword');
  });

  it('document.title встановлюється у "Ваша особиста інформація" при mount', () => {
    shallowMount(PersonalInfo, { props: { userId: 1 } });
    expect(document.title).toBe('Ваша особиста інформація');
  });

  it('mounted читає роль із localStorage і записує в data.role', () => {
    window.localStorage.setItem('user', JSON.stringify({ role: 'manager' }));
    const wrapper = shallowMount(PersonalInfo, { props: { userId: 1 } });
    expect(wrapper.vm.role).toBe('manager');
  });

  it('має правильну назву компонента', () => {
    const wrapper = shallowMount(PersonalInfo, { props: { userId: 1 } });
    expect(wrapper.vm.$options.name).toBe('PersonalInfoCard');
  });

  it('правильно зчитує пропс email у readonly input', () => {
    const wrapper = shallowMount(PersonalInfo, {
      props: { userId: 1, email: 'test@example.com' }
    });
    const input = wrapper.find('input#email');
    expect(input.attributes('readonly')).toBeDefined();
    expect(input.element.value).toBe('test@example.com');
  });

  it('input поля мають правильні id', () => {
    const wrapper = shallowMount(PersonalInfo, {
      props: { userId: 1 }
    });
    expect(wrapper.find('#first_name').exists()).toBe(true);
    expect(wrapper.find('#last_name').exists()).toBe(true);
    expect(wrapper.find('#second_name').exists()).toBe(true);
    expect(wrapper.find('#email').exists()).toBe(true);
  });

  it('рендериться кнопка "Оновити інформацію" з правильним текстом', () => {
    const wrapper = shallowMount(PersonalInfo, { props: { userId: 1 } });
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('Оновити інформацію');
  });

  it('рендериться кнопка "Змінити пароль"', () => {
    const wrapper = shallowMount(PersonalInfo, { props: { userId: 1 } });
    const buttons = wrapper.findAll('button');
    const changeBtn = buttons.filter(b => b.text() === 'Змінити пароль');
    expect(changeBtn.length).toBe(1);
  });

  it('всі текстові input мають клас .rounded-lg', () => {
    const wrapper = shallowMount(PersonalInfo, { props: { userId: 1 } });
    const inputs = wrapper.findAll('input[type="text"]');
    inputs.forEach(input => {
      expect(input.classes()).toContain('rounded-lg');
    });
  });

  it('email input має клас .cursor-not-allowed', () => {
    const wrapper = shallowMount(PersonalInfo, { props: { userId: 1 } });
    const input = wrapper.find('input#email');
    expect(input.classes()).toContain('cursor-not-allowed');
  });

  it('при наявності непорожнього localStorage role === null не показується router-link', () => {
    window.localStorage.setItem('user', JSON.stringify({ role: null }));
    const wrapper = shallowMount(PersonalInfo, { props: { userId: 1 } });
    const link = wrapper.findComponent({ name: 'RouterLink' });
    expect(link.exists()).toBe(false);
  });

  it('v-model правильно повʼязаний з input прізвища', async () => {
    const wrapper = shallowMount(PersonalInfo, {
      props: {
        userId: 1,
        first_name: 'Іван',
        last_name: 'Сидоренко',
        second_name: 'Іванович',
        email: 'ivan@example.com',
      },
    });
    const input = wrapper.find('input#last_name');
    await input.setValue('НовеПрізвище');
    expect(wrapper.vm.localLastName).toBe('НовеПрізвище');
  });

  it('watch оновлює local* змінні при зміні пропсів', async () => {
    const wrapper = shallowMount(PersonalInfo, {
      props: {
        userId: 1,
        first_name: 'Іван',
        last_name: 'Сидоренко',
        second_name: 'Іванович',
        email: 'ivan@example.com',
      },
    });
    await wrapper.setProps({
      first_name: 'Олег',
      last_name: 'Мельник',
      second_name: 'Петрович',
      email: 'oleg@example.com',
    });
    expect(wrapper.vm.localFirstName).toBe('Олег');
    expect(wrapper.vm.localLastName).toBe('Мельник');
    expect(wrapper.vm.localSecondName).toBe('Петрович');
    expect(wrapper.vm.localEmail).toBe('oleg@example.com');
  });
});
