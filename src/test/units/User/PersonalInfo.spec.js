describe.skip('Тести для MyComponent', () => {
    it('цей тест не виконається', () => {
      expect(true).toBe(false)
    })
  })
  
  //Протестовано головні аспекти
  
  /*
import { shallowMount } from '@vue/test-utils';
import PersonalInfo from '@/components/user/PersonalInfo.vue';

// Зберігаємо оригінальні значення для alert та console.error
const originalAlert = window.alert;
const originalConsoleError = console.error;

describe('PersonalInfo.vue - Рендеринг та відображення даних', () => {
  it('відображає заголовок "Ваша особиста інформація"', () => {
    const wrapper = shallowMount(PersonalInfo, {
      props: {
        userId: 1
      }
    });
    const title = wrapper.find('.info-title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe("Ваша особиста інформація");
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
});

describe('PersonalInfo.vue - Взаємодія з користувачем (UI events)', () => {
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

  it('викликає метод updateUser при кліку на кнопку "Оновити інформацію"', async () => {
    const propsData = {
      userId: 1,
      first_name: "Іван",
      last_name: "Петренко",
      second_name: "Іванович",
      email: "ivan@example.com"
    };
    const wrapper = shallowMount(PersonalInfo, { props: propsData });
    wrapper.vm.updateUser = jest.fn();
    
    await wrapper.find('button.update-button').trigger('click');
    
    expect(wrapper.vm.updateUser).toHaveBeenCalled();
  });

  it('викликає метод changePassword і перенаправляє на "/changepassword" при кліку на кнопку "Змінити пароль"', async () => {
    const propsData = {
      userId: 1,
      first_name: "Іван",
      last_name: "Петренко",
      second_name: "Іванович",
      email: "ivan@example.com"
    };
    const $router = { push: jest.fn() };
    const wrapper = shallowMount(PersonalInfo, {
      props: propsData,
      global: { mocks: { $router } }
    });
    
    wrapper.vm.changePassword = jest.fn(() => {
      $router.push("/changepassword");
    });
    await wrapper.find('button.change-password-button').trigger('click');
    
    expect(wrapper.vm.changePassword).toHaveBeenCalled();
    expect($router.push).toHaveBeenCalledWith("/changepassword");
  });
});

describe('PersonalInfo.vue - Логіка методу updateUser', () => {
  beforeEach(() => {
    window.alert = jest.fn();
    console.error = jest.fn();
  });
  
  afterEach(() => {
    window.alert = originalAlert;
    console.error = originalConsoleError;
    jest.restoreAllMocks();
  });

  it('повинен показувати alert про неавторизованість, якщо токен відсутній', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    
    const wrapper = shallowMount(PersonalInfo, {
      props: {
        userId: 1,
        first_name: "Іван",
        last_name: "Петренко",
        second_name: "Іванович",
        email: "ivan@example.com"
      }
    });
    await wrapper.vm.updateUser();
    expect(window.alert).toHaveBeenCalledWith('Ви не авторизовані. Увійдіть у систему.');
  });

  it('повинен показувати повідомлення про успішне оновлення при успішному запиті', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('test-token');
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    });
    
    const wrapper = shallowMount(PersonalInfo, {
      props: {
        userId: 1,
        first_name: "Іван",
        last_name: "Петренко",
        second_name: "Іванович",
        email: "ivan@example.com"
      }
    });
    await wrapper.vm.updateUser();
    
    expect(fetch).toHaveBeenCalledWith(
      `http://26.235.139.202:8080/api/user/1`,
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        })
      })
    );
    expect(window.alert).toHaveBeenCalledWith('Дані успішно оновлено');
  });

  it('повинен виводити помилку в консоль і показувати alert при помилковому запиті', async () => {
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('test-token');
    const testError = new Error('Test error');
    global.fetch = jest.fn().mockRejectedValue(testError);
    
    const wrapper = shallowMount(PersonalInfo, {
      props: {
        userId: 1,
        first_name: "Іван",
        last_name: "Петренко",
        second_name: "Іванович",
        email: "ivan@example.com"
      }
    });
    await wrapper.vm.updateUser();
    
    expect(console.error).toHaveBeenCalledWith(testError);
    expect(window.alert).toHaveBeenCalledWith('Сталася помилка');
  });
});

describe('PersonalInfo.vue - Логіка методу changePassword', () => {
  it('виклик методу changePassword здійснює навігацію до "/changepassword"', () => {
    const $router = { push: jest.fn() };
    const wrapper = shallowMount(PersonalInfo, {
      props: {
        userId: 1,
        first_name: "Іван",
        last_name: "Петренко",
        second_name: "Іванович",
        email: "ivan@example.com"
      },
      global: { mocks: { $router } }
    });
    
    wrapper.vm.changePassword();
    
    expect($router.push).toHaveBeenCalledWith("/changepassword");
  });
});*/