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

  it('локальна змінна localData ініціалізована згідно з prop modelValue', () => {
    expect(wrapper.vm.localData).toEqual(modelValue);
  });

  it('якщо спосіб оплати не вибраний, виклик validateAndProceed емiтує подію "update-errors"', () => {
    // Гарантуємо, що paymentMethod порожній
    wrapper.setData({ localData: { paymentMethod: "" } });
    // Викликаємо validateAndProceed напряму, оскільки кнопка disabled не реагує на кліки
    wrapper.vm.validateAndProceed();
    expect(wrapper.emitted()['update-errors']).toBeTruthy();
    expect(wrapper.emitted()['update-errors'][0][0]).toEqual({ paymentOption: "Оберіть спосіб оплати" });
  });

  it('watch оновлює localData при зміні prop modelValue', async () => {
    const newModelValue = { paymentMethod: "Оплата картою" };
    await wrapper.setProps({ modelValue: newModelValue });
    expect(wrapper.vm.localData).toEqual(newModelValue);
  });

  it('не емiтує подію validate, якщо paymentMethod не вибраний', async () => {
    wrapper.setData({ localData: { paymentMethod: "" } });
    wrapper.vm.validateAndProceed();
    expect(wrapper.emitted()['validate']).toBeFalsy();
  });

  it('не емiтує "update:modelValue" при кліку на "Далі", якщо paymentMethod порожній', async () => {
    wrapper.setData({ localData: { paymentMethod: "" } });
    wrapper.vm.validateAndProceed();
    expect(wrapper.emitted()['update:modelValue']).toBeFalsy();
  });

  it('рендерить дві опції оплати як радіокнопки', () => {
    const radios = wrapper.findAll('input[type="radio"]');
    expect(radios.length).toBe(2);
    expect(radios.at(0).element.value).toBe('Післяоплата');
    expect(radios.at(1).element.value).toBe('Оплата картою');
  });

  it('має відповідні id та for атрибути для label/input зв’язку', () => {
    const radio0 = wrapper.find('input#payment-0');
    const label0 = wrapper.find('label[for="payment-0"]');
    expect(radio0.exists()).toBe(true);
    expect(label0.exists()).toBe(true);
  });

  it('при зміні радіокнопки викликає updateData і емiтує "update:modelValue"', async () => {
    const spy = jest.spyOn(wrapper.vm, 'updateData');
    const radio1 = wrapper.find('input#payment-1');
    await radio1.setChecked();
    expect(spy).toHaveBeenCalled();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    spy.mockRestore();
  });

  it('кнопка "Далі" має клас disabled, коли метод оплати не вибраний', () => {
    const btn = wrapper.find('button');
    expect(btn.attributes('disabled')).toBeDefined();
    expect(btn.classes()).toContain('disabled:cursor-not-allowed');
  });

  it('кнопка "Далі" розблоковується після вибору paymentMethod', async () => {
    await wrapper.setData({ localData: { paymentMethod: 'Післяоплата' } });
    await wrapper.vm.$nextTick();
    const btn = wrapper.find('button');
    expect(btn.attributes('disabled')).toBeUndefined();
  });

  it('validateAndProceed емiтує "validate" після успішної валідації', async () => {
    await wrapper.setData({ localData: { paymentMethod: 'Оплата картою' } });
    wrapper.vm.validateAndProceed();
    expect(wrapper.emitted('validate')).toBeTruthy();
  });

  it('відображає текст помилки, коли props.errors.paymentOption задано', async () => {
    await wrapper.setProps({ errors: { paymentOption: 'Обрати потрібно' } });
    await wrapper.vm.$nextTick();
    const err = wrapper.find('span.text-red-500');
    expect(err.exists()).toBe(true);
    expect(err.text()).toBe('Обрати потрібно');
  });

  it('не відображає елемент помилки, коли props.errors порожній', () => {
    expect(wrapper.find('span.text-red-500').exists()).toBe(false);
  });

  it('має коректні базові CSS-класи на root елементі', () => {
    expect(wrapper.classes()).toContain('payment-info');
    expect(wrapper.classes()).toContain('montserrat');
  });

  it('при повторному встановленні modelValue через watch оновлює localData', async () => {
    const newVal = { paymentMethod: 'Післяоплата' };
    await wrapper.setProps({ modelValue: newVal });
    expect(wrapper.vm.localData.paymentMethod).toBe('Післяоплата');
  });
});