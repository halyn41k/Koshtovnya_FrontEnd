describe.skip('Тести для MyComponent', () => {
    it('цей тест не виконається', () => {
      expect(true).toBe(false)
    })
  })
  /*
  //Протестовано головні аспекти
  
  
import { shallowMount } from '@vue/test-utils';
import PersonalInfo from '@/components/payment/PersonalInfo.vue';

const modelValue = {
  firstName: '',
  lastName: '',
  secondName: '',
  phone: ''
};

describe('PersonalInfo.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(PersonalInfo, {
      props: {
        modelValue,
        errors: {}
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('рендерить усі поля вводу з відповідними placeholder', () => {
    const inputs = wrapper.findAll('input.input-field');
    expect(inputs).toHaveLength(4);
    expect(inputs[0].attributes('placeholder')).toBe("Ім'я");
    expect(inputs[1].attributes('placeholder')).toBe("Прізвище");
    expect(inputs[2].attributes('placeholder')).toBe("По батькові");
    expect(inputs[3].attributes('placeholder')).toBe("Номер телефону");
  });

  it('локальна змінна localData ініціалізована згідно з пропсом modelValue', () => {
    expect(wrapper.vm.localData).toEqual(modelValue);
  });

  it('при вводі даних викликається updateData та емiтується подія "update:modelValue" для поля firstName', async () => {
    const firstNameInput = wrapper.find('input.input-field[placeholder="Ім\'я"]');
    firstNameInput.element.value = 'Іван';
    await firstNameInput.trigger('input');

    expect(wrapper.emitted()['update:modelValue']).toBeTruthy();
    expect(wrapper.emitted()['update:modelValue'][0][0]).toMatchObject({
      ...modelValue,
      firstName: 'Іван'
    });
  });

  it('при вводі даних у інші поля, updateData емiтує подію з оновленими даними', async () => {
    // Симулюємо введення в поле "Прізвище"
    const lastNameInput = wrapper.find('input.input-field[placeholder="Прізвище"]');
    lastNameInput.element.value = 'Петренко';
    await lastNameInput.trigger('input');

    // Симулюємо введення в поле "По батькові"
    const secondNameInput = wrapper.find('input.input-field[placeholder="По батькові"]');
    secondNameInput.element.value = 'Петрович';
    await secondNameInput.trigger('input');

    // Симулюємо введення в поле "Номер телефону"
    const phoneInput = wrapper.find('input.input-field[placeholder="Номер телефону"]');
    phoneInput.element.value = '123456789';
    await phoneInput.trigger('input');

    const emittedEvents = wrapper.emitted()['update:modelValue'];
    expect(emittedEvents).toBeTruthy();
    // Остання емiтована подія повинна містити всі введені значення
    expect(emittedEvents[emittedEvents.length - 1][0]).toMatchObject({
      firstName: '',
      lastName: 'Петренко',
      secondName: 'Петрович',
      phone: '123456789'
    });
  });

  it('watch оновлює localData при зміні prop modelValue', async () => {
    const newModelValue = {
      firstName: 'Петро',
      lastName: 'Петренко',
      secondName: 'Петрович',
      phone: '987654321'
    };
    await wrapper.setProps({ modelValue: newModelValue });
    expect(wrapper.vm.localData).toEqual(newModelValue);
  });

  it('рендеряться повідомлення про помилки, якщо вони передані через пропси', async () => {
    const errors = {
      firstName: 'Некоректне ім’я',
      lastName: 'Некоректне прізвище',
      secondName: 'Некоректне по батькові',
      phone: 'Некоректний номер'
    };
    // Перемонтуємо компонент із заданими повідомленнями про помилки
    wrapper.unmount();
    wrapper = shallowMount(PersonalInfo, {
      props: {
        modelValue,
        errors
      }
    });
    const errorSpans = wrapper.findAll('span.error');
    // Перевірка для кожного поля за відповідними індексами
    expect(errorSpans.at(0).text()).toBe(errors.firstName);
    expect(errorSpans.at(1).text()).toBe(errors.lastName);
    expect(errorSpans.at(2).text()).toBe(errors.secondName);
    expect(errorSpans.at(3).text()).toBe(errors.phone);
  });

  it('якщо errors порожній, повідомлення про помилки не рендеряться', () => {
    const errorSpans = wrapper.findAll('span.error');
    // Якщо повідомлень немає, error елементи не повинні відображатися
    expect(errorSpans).toHaveLength(0);
  });

  it('відповідно оновлюються значення полів вводу після зміни localData', async () => {
    // Присвоюємо нові значення локальним даним через setData
    const newData = {
      firstName: 'Олег',
      lastName: 'Олегов',
      secondName: 'Олегович',
      phone: '555555555'
    };
    await wrapper.setData({ localData: newData });

    // Перевіряємо, що значення в полях відповідають новим даним
    expect(wrapper.find('input.input-field[placeholder="Ім\'я"]').element.value).toBe(newData.firstName);
    expect(wrapper.find('input.input-field[placeholder="Прізвище"]').element.value).toBe(newData.lastName);
    expect(wrapper.find('input.input-field[placeholder="По батькові"]').element.value).toBe(newData.secondName);
    expect(wrapper.find('input.input-field[placeholder="Номер телефону"]').element.value).toBe(newData.phone);
  });
});
*/