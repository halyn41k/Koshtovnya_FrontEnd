// describe.skip('Тести для MyComponent', () => {
//     it('цей тест не виконається', () => {
//       expect(true).toBe(false)
//     })
//   })

//Протестовано головні аспекти

import { shallowMount } from '@vue/test-utils';
import PaymentInfo from '@/components/Payment/PaymentInfo.vue';

const modelValue = {
  paymentMethod: ''
};

describe('PaymentInfo.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(PaymentInfo, {
      props: {
        modelValue,
        errors: {}
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  // Базові тести
  it('локальна змінна localData ініціалізована згідно з prop modelValue', () => {
    expect(wrapper.vm.localData).toEqual(modelValue);
  });

  it('якщо спосіб оплати не вибраний, виклик validateAndProceed емiтує подію "update-errors"', () => {
    // Оскільки кнопка в цьому випадку disabled, викликаємо метод напряму
    wrapper.setData({ localData: { paymentMethod: "" } });
    wrapper.vm.validateAndProceed();
    expect(wrapper.emitted()['update-errors']).toBeTruthy();
    expect(wrapper.emitted()['update-errors'][0][0]).toEqual({ paymentOption: "Оберіть спосіб оплати" });
  });

  it('watch оновлює localData при зміні prop modelValue', async () => {
    const newModelValue = { paymentMethod: "Оплата картою" };
    await wrapper.setProps({ modelValue: newModelValue });
    expect(wrapper.vm.localData).toEqual(newModelValue);
  });

  it('не емiтує подію "validate", якщо paymentMethod не вибраний', () => {
    wrapper.setData({ localData: { paymentMethod: "" } });
    wrapper.vm.validateAndProceed();
    expect(wrapper.emitted()['validate']).toBeFalsy();
  });

  it('не емiтує "update:modelValue" при виклику validateAndProceed, якщо paymentMethod порожній', () => {
    wrapper.setData({ localData: { paymentMethod: "" } });
    wrapper.vm.validateAndProceed();
    // Якщо платіж не вибраний, не повинно бути оновлення моделі
    expect(wrapper.emitted()['update:modelValue']).toBeFalsy();
  });

  it('при повторному виклику validateAndProceed очищає помилки після успішної валідації', async () => {
    await wrapper.setProps({ errors: { paymentOption: 'Error' } });
    await wrapper.setData({ localData: { paymentMethod: 'cash' } });
    wrapper.vm.validateAndProceed();
    expect(wrapper.emitted('update-errors')).toBeFalsy();
    expect(wrapper.emitted('validate')).toBeTruthy();
  });
});
