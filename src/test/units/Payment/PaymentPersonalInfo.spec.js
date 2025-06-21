// describe.skip('Тести для MyComponent', () => {
//     it('цей тест не виконається', () => {
//       expect(true).toBe(false)
//     })
//   })

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

  it('локальна змінна localData ініціалізована згідно з пропсом modelValue', () => {
    expect(wrapper.vm.localData).toEqual(modelValue);
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

  it('якщо errors порожній, повідомлення про помилки не рендеряться', () => {
    const errorSpans = wrapper.findAll('span.error');
    // Якщо повідомлень немає, error елементи не повинні відображатися
    expect(errorSpans).toHaveLength(0);
  });

  it('рендерить чотири поля вводу з правильними типами та плейсхолдерами', () => {
    const inputs = wrapper.findAll('input');
    expect(inputs.length).toBe(4);
    expect(inputs.at(0).attributes('type')).toBe('text');
    expect(inputs.at(0).attributes('placeholder')).toBe("Ім'я");
    expect(inputs.at(1).attributes('type')).toBe('text');
    expect(inputs.at(1).attributes('placeholder')).toBe('Прізвище');
    expect(inputs.at(2).attributes('type')).toBe('text');
    expect(inputs.at(2).attributes('placeholder')).toBe('По батькові');
    expect(inputs.at(3).attributes('type')).toBe('tel');
    expect(inputs.at(3).attributes('placeholder')).toBe('Номер телефону');
  });

  it('updateData емiтує "update:modelValue" при введенні в будь-яке поле', async () => {
    const spy = jest.spyOn(wrapper.vm, 'updateData');
    const first = wrapper.find('input[placeholder="Ім\'я"]');
    await first.setValue('Тест');
    expect(spy).toHaveBeenCalled();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    spy.mockRestore();
  });

  it('v-model синхронізує localData при введенні в поле', async () => {
    const last = wrapper.find('input[placeholder="Прізвище"]');
    await last.setValue('Коваль');
    expect(wrapper.vm.localData.lastName).toBe('Коваль');
  });

  it('відображає повідомлення про помилку під полем, якщо props.errors містить ключ', async () => {
    const errs = { phone: 'Невірний формат номера' };
    await wrapper.setProps({ errors: errs });
    await wrapper.vm.$nextTick();
    const span = wrapper.find('span.text-red-500');
    expect(span.exists()).toBe(true);
    expect(span.text()).toBe('Невірний формат номера');
  });

  it('не відображає жодного спан з помилками, якщо props.errors порожній', () => {
    expect(wrapper.findAll('span.text-red-500').length).toBe(0);
  });

  it('watch оновлює localData навіть при глибоких змінах modelValue', async () => {
    const val = { firstName: 'Олена', lastName: '', secondName: '', phone: '' };
    await wrapper.setProps({ modelValue: val });
    expect(wrapper.vm.localData.firstName).toBe('Олена');
  });

  it('root елемент має клас personal-info', () => {
    expect(wrapper.classes()).toContain('personal-info');
  });

  it('відповідні v-model binding оновлюють правильні властивості localData', async () => {
    const sec = wrapper.find('input[placeholder="По батькові"]');
    await sec.setValue('Іванівна');
    expect(wrapper.vm.localData.secondName).toBe('Іванівна');
  });

  it('при повторних input подіях emit передає весь об’єкт localData', async () => {
    await wrapper.setData({ localData: { ...modelValue, phone: '0123456789' } });
    const inp = wrapper.find('input[placeholder="Номер телефону"]');
    await inp.trigger('input');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted.pop()[0]).toEqual(wrapper.vm.localData);
  });
});
