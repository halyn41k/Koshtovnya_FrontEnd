// describe.skip('Тести для MyComponent', () => {
//     it('цей тест не виконається', () => {
//       expect(true).toBe(false)
//     })
//   })

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
      deliveryType: "Кур'єр",
      warehouse: '№5',
    },
  };

  let wrapper;
  const mountComponent = (props = defaultProps) => {
    wrapper = shallowMount(DeliveryAddress, { props });
  };

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  it('має кореневий контейнер із класом .delivery-address-card', () => {
    mountComponent();
    expect(wrapper.find('.delivery-address-card').exists()).toBe(true);
  });

  it('рендерить заголовок "Підсумкова інформація"', () => {
    mountComponent();
    const h2 = wrapper.find('h2');
    expect(h2.exists()).toBe(true);
    expect(h2.text()).toBe('Підсумкова інформація');
  });

  it('computed fullName повертає правильно зібране ПІБ', () => {
    mountComponent();
    expect(wrapper.vm.fullName).toBe('Іванов Іван Петрович');
    // також перевіримо в DOM
    const nameP = wrapper.findAll('.flex.items-center.space-x-4').at(0).find('p.font-medium');
    expect(nameP.text()).toBe('Іванов Іван Петрович');
  });

  it('коли дані ПІБ відсутні, fullName = "Не вказано"', () => {
    mountComponent({ customerData: {} });
    expect(wrapper.vm.fullName).toBe('Не вказано');
    const nameP = wrapper.findAll('.flex.items-center.space-x-4').at(0).find('p.font-medium');
    expect(nameP.text()).toBe('Не вказано');
  });

  it('відображає телефон зі значенням з props або "Не вказано"', () => {
    // з телефоном
    mountComponent();
    const phoneP = wrapper.findAll('.flex.items-center.space-x-4').at(1).find('p.font-medium');
    expect(phoneP.text()).toBe('123456789');

    // без телефону
    mountComponent({ customerData: { ...defaultProps.customerData, phone: '' } });
    const missingPhoneP = wrapper.findAll('.flex.items-center.space-x-4').at(1).find('p.font-medium');
    expect(missingPhoneP.text()).toBe('Не вказано');
  });

  it('має контейнер із класом .delivery-address-card', () => {
    const wrapper = shallowMount(DeliveryAddress, { props: defaultProps });
    expect(wrapper.find('.delivery-address-card').exists()).toBe(true);
  });

  it('computed fullName збирає ПІБ з lastName, firstName, secondName', () => {
    const wrapper = shallowMount(DeliveryAddress, { props: defaultProps });
    expect(wrapper.vm.fullName).toBe('Іванов Іван Петрович');
  });

  it('computed fullName = "Не вказано", коли ПІБ відсутні', () => {
    const wrapper = shallowMount(DeliveryAddress, { props: { customerData: {} } });
    expect(wrapper.vm.fullName).toBe('Не вказано');
  });

  it('відображає коректний текст іконки користувача та ПІБ', () => {
    const wrapper = shallowMount(DeliveryAddress, { props: defaultProps });
    const userBlock = wrapper.findAll('.flex.items-center.space-x-4').at(0);
    expect(userBlock.find('div.text-red-600').text()).toBe('👤');
    expect(userBlock.find('p.font-medium').text()).toBe('Іванов Іван Петрович');
  });

  it('відображає телефон або "Не вказано", якщо телефон не задано', () => {
    const withPhone = shallowMount(DeliveryAddress, { props: defaultProps });
    const phoneBlock = withPhone.findAll('.flex.items-center.space-x-4').at(1);
    expect(phoneBlock.find('p.font-medium').text()).toBe('123456789');

    const noPhone = shallowMount(DeliveryAddress, { props: { customerData: { ...defaultProps.customerData, phone: '' } } });
    const phoneBlock2 = noPhone.findAll('.flex.items-center.space-x-4').at(1);
    expect(phoneBlock2.find('p.font-medium').text()).toBe('Не вказано');
  });

  it('має секцію "Деталі доставки" з іконкою та заголовком', () => {
    const wrapper = shallowMount(DeliveryAddress, { props: defaultProps });
    const h3 = wrapper.find('h3');
    expect(h3.text()).toContain('🚚 Деталі доставки');
  });

  it('відображає місто, вулицю+номер, тип доставки, відділення у grid порядку', () => {
    const wrapper = shallowMount(DeliveryAddress, { props: defaultProps });
    const spans = wrapper.find('div.border-t').findAll('span.text-gray-700');
    expect(spans.at(0).text()).toBe('Київ');
    expect(spans.at(1).text()).toBe('Хрещатик 10');
    expect(spans.at(2).text()).toBe("Кур'єр");
    expect(spans.at(3).text()).toBe('№5');
  });

  it('контейнер має класи градієнта та rounded-2xl', () => {
    const wrapper = shallowMount(DeliveryAddress, { props: defaultProps });
    const card = wrapper.find('.delivery-address-card');
    expect(card.classes()).toEqual(expect.arrayContaining(['bg-gradient-to-br', 'rounded-2xl']));
  });

  it('всі <p> у секції User Info мають correct класи', () => {
    const wrapper = shallowMount(DeliveryAddress, { props: defaultProps });
    const ps = wrapper.findAll('.flex.items-center.space-x-4 p');
    expect(ps.at(0).classes()).toEqual(expect.arrayContaining(['text-gray-700', 'font-medium']));
    expect(ps.at(1).classes()).toEqual(expect.arrayContaining(['text-gray-500', 'text-sm']));
  });

  it('props передаються без змін', () => {
    const wrapper = shallowMount(DeliveryAddress, { props: defaultProps });
    expect(wrapper.props('customerData')).toEqual(defaultProps.customerData);
  });

  it('fullName реагує на зміну props', async () => {
    const wrapper = shallowMount(DeliveryAddress, { props: defaultProps });
    await wrapper.setProps({ customerData: { lastName: 'Петренко', firstName: 'Олег' } });
    expect(wrapper.vm.fullName).toBe('Петренко Олег');
  });

  it('houseNumber без пробілу, якщо порожній', async () => {
    const wrapper = shallowMount(DeliveryAddress, { props: defaultProps });
    await wrapper.setProps({ customerData: { ...defaultProps.customerData, houseNumber: '' } });
    const addr = wrapper.findAll('span.text-gray-700').at(1).text();
    expect(addr).toBe('Хрещатик');
  });

  it('ретельно рендерить 2 блоки User Info та 1 блок Delivery Details', () => {
    const wrapper = shallowMount(DeliveryAddress, { props: defaultProps });
    expect(wrapper.findAll('.flex.items-center.space-x-4').length).toBe(2);
    expect(wrapper.find('div.border-t').exists()).toBe(true);
  });
});
