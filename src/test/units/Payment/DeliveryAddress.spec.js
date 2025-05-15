describe.skip('Тести для MyComponent', () => {
    it('цей тест не виконається', () => {
      expect(true).toBe(false)
    })
  })
/*  
  //Протестовано головні аспекти
  

import { shallowMount } from '@vue/test-utils';
import DeliveryAddress from '@/components/payment/DeliveryAddress.vue';

describe('DeliveryAddress.vue', () => {
  const defaultProps = {
    customerData: {
      lastName: 'Іванов',
      firstName: 'Іван',
      secondName: 'Петрович',
      phone: '123456789',
      city: 'Київ',
      street: 'Хрещатик',
      houseNumber: '10',
      deliveryType: 'Кур\'єр',
      warehouse: '№5',
    },
  };

  it('повинен рендерити заголовок "Підсумкова інформація"', () => {
    const wrapper = shallowMount(DeliveryAddress, { propsData: defaultProps });
    expect(wrapper.find('h2.title').text()).toBe('Підсумкова інформація');
  });

  it('коректно обчислює fullName коли всі дані присутні', () => {
    const wrapper = shallowMount(DeliveryAddress, { propsData: defaultProps });
    expect(wrapper.vm.fullName).toBe('Іванов Іван Петрович');
    expect(wrapper.find('p').text()).toContain('Іванов Іван Петрович');
  });

  it('повинен показувати "Не вказано" для відсутнього повного імені', () => {
    const props = { customerData: {} };
    const wrapper = shallowMount(DeliveryAddress, { propsData: props });
    expect(wrapper.vm.fullName).toBe('Не вказано');
    expect(wrapper.find('p').text()).toContain('Не вказано');
  });

  it('повинен відображати номер телефону або "Не вказано", якщо телефон не задано', () => {
    // Випадок, коли телефон задано
    const wrapperWithPhone = shallowMount(DeliveryAddress, { propsData: defaultProps });
    expect(wrapperWithPhone.find('.info-section').text()).toContain('123456789');

    // Випадок, коли телефон не задано
    const props = { customerData: { ...defaultProps.customerData, phone: null } };
    const wrapperWithoutPhone = shallowMount(DeliveryAddress, { propsData: props });
    expect(wrapperWithoutPhone.find('.info-section').text()).toContain('Не вказано');
  });

  it('повинен правильно відображати дані доставки або "Не вказано" для відсутніх даних', () => {
    const incompleteData = {
      customerData: {
        // дані основної інформації відсутні
        city: '', 
        street: null,
        houseNumber: undefined,
        deliveryType: 'Пошта',
        warehouse: '',
        // номер телефону також відсутній
        phone: null,
        lastName: '',
        firstName: '',
        secondName: '',
      },
    };
    const wrapper = shallowMount(DeliveryAddress, { propsData: incompleteData });
    
    // Перевірка першого info-section (ПІБ та Телефон)
    const basicInfoText = wrapper.findAll('.info-section').at(0).text();
    expect(basicInfoText).toContain('👤 ПІБ: Не вказано');
    expect(basicInfoText).toContain('📞 Телефон: Не вказано');
    
    // Перевірка другого info-section (інформація доставки)
    const deliveryInfoText = wrapper.findAll('.info-section').at(1).text();
    // Для всіх полів, крім типу доставки, значення має бути "Не вказано"
    expect(deliveryInfoText).toContain('🏙️ Місто: Не вказано');
    expect(deliveryInfoText).toContain('🏠 Вулиця: Не вказано');
    expect(deliveryInfoText).toContain('🔢 Номер будинку: Не вказано');
    expect(deliveryInfoText).toContain('🏤 Відділення: Не вказано');
    // Для поля deliveryType перевіряємо, що відображається саме "Пошта"
    expect(deliveryInfoText).toContain('📦 Спосіб доставки: Пошта');
  });
    

  it('перевіряє правильну структуру DOM', () => {
    const wrapper = shallowMount(DeliveryAddress, { propsData: defaultProps });
    expect(wrapper.find('.delivery-address-card').exists()).toBe(true);
    expect(wrapper.find('.info-section').exists()).toBe(true);
    expect(wrapper.findAll('li').length).toBe(5); // 5 пунктів у списку доставки
  });
});
*/