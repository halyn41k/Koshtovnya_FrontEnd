describe.skip('Тести для MyComponent', () => {
    it('цей тест не виконається', () => {
      expect(true).toBe(false)
    })
  })
  /*
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

  it('рендерить варіанти оплати згідно з paymentOptions', () => {
    // paymentOptions визначені в компоненті як ["Післяоплата", "Оплата картою"]
    const radioInputs = wrapper.findAll('input.radio-input');
    const labels = wrapper.findAll('label.payment-label');
    expect(radioInputs.length).toBe(2);
    expect(labels.length).toBe(2);
    expect(labels.at(0).text()).toBe("Післяоплата");
    expect(labels.at(1).text()).toBe("Оплата картою");
  });

  it('локальна змінна localData ініціалізована згідно з prop modelValue', () => {
    expect(wrapper.vm.localData).toEqual(modelValue);
  });

  it('при зміні вибору способу оплати викликається updateData і емiтується подія "update:modelValue"', async () => {
    // Отримуємо перший радіо input
    const firstRadio = wrapper.find('input.radio-input');
    // Симулюємо вибір першого варіанту оплати (value="Післяоплата")
    await firstRadio.setChecked();
    // Після зміни має викликатися updateData і емiтуватися подія
    expect(wrapper.emitted()['update:modelValue']).toBeTruthy();
    expect(wrapper.emitted()['update:modelValue'][0][0]).toMatchObject({
      paymentMethod: "Післяоплата"
    });
  });

  it('кнопка "Далі" відключена, якщо спосіб оплати не вибраний', () => {
    const nextButton = wrapper.find('button.next-button');
    expect(nextButton.attributes('disabled')).toBeDefined();
  });

  it('кнопка "Далі" активна, якщо спосіб оплати вибраний', async () => {
    // Оновлюємо дані, вибираючи спосіб оплати
    await wrapper.setData({ localData: { paymentMethod: "Оплата картою" } });
    const nextButton = wrapper.find('button.next-button');
    expect(nextButton.attributes('disabled')).toBeUndefined();
  });

  it('при кліку на кнопку "Далі", якщо спосіб оплати вибраний, викликається validateAndProceed: оновлюється модель і емiтується подія "validate"', async () => {
    await wrapper.setData({ localData: { paymentMethod: "Післяоплата" } });
    const nextButton = wrapper.find('button.next-button');
    await nextButton.trigger('click');
    // Перевіряємо, що оновлення даних емiтується
    expect(wrapper.emitted()['update:modelValue']).toBeTruthy();
    // Перевіряємо, що подія "validate" емiтується
    expect(wrapper.emitted()['validate']).toBeTruthy();
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

  it('рендериться повідомлення про помилку, якщо воно передане через проп errors', async () => {
    const errors = { paymentOption: "Оберіть спосіб оплати" };
    wrapper.unmount();
    wrapper = shallowMount(PaymentInfo, {
      props: {
        modelValue,
        errors
      }
    });
    const errorSpan = wrapper.find('span.error');
    expect(errorSpan.exists()).toBe(true);
    expect(errorSpan.text()).toBe(errors.paymentOption);
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
  
  it('правильно відображає вибраний спосіб оплати у v-model (radio checked)', async () => {
    await wrapper.setData({ localData: { paymentMethod: "Оплата картою" } });
    const checkedRadio = wrapper.find('input.radio-input:checked');
    expect(checkedRadio.element.value).toBe("Оплата картою");
  });
  
  it('при повторному виборі іншого способу оплати подія "update:modelValue" емiтується з новим значенням', async () => {
    const radios = wrapper.findAll('input.radio-input');
    await radios.at(0).setChecked(); // Післяоплата
    await radios.at(1).setChecked(); // Оплата картою
    const emitted = wrapper.emitted()['update:modelValue'];
    expect(emitted.length).toBe(2);
    expect(emitted[1][0].paymentMethod).toBe("Оплата картою");
  });
  
});
*/