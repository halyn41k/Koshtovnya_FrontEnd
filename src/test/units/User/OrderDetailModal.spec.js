// describe.skip('Тести для MyComponent', () => {
//     it('цей тест не виконається', () => {
//       expect(true).toBe(false)
//     })
//   })

//Протестовано головні аспекти

import { shallowMount } from '@vue/test-utils';
import OrderDetailModal from '@/components/user/OrderDetailModal.vue';

describe('OrderDetailModal', () => {
  let wrapper;
  const order = {
    id: 123,
    status: 'Очікується',
    items: [
      {
        image_url: 'https://example.com/image1.jpg',
        title: 'Продукт 1',
        quantity: 2,
        price: 100,
        is_deleted: false,
      },
      {
        image_url: 'https://example.com/image2.jpg',
        title: 'Продукт 2',
        quantity: 1,
        price: 200,
        is_deleted: true,
      },
    ],
  };

  beforeEach(() => {
    wrapper = shallowMount(OrderDetailModal, {
      props: { order },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('повинен відображати правильний заголовок', () => {
    const title = wrapper.find('h3');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe(`Деталі замовлення №${order.id}`);
  });

  it('повинен відображати статус замовлення', () => {
    const status = wrapper.find('p');
    expect(status.exists()).toBe(true);
    expect(status.text()).toBe(`Статус: ${order.status}`);
  });

  it('відображає правильну кількість рядків з товарами', () => {
    const rows = wrapper.findAll('div.border-b')
    expect(rows.length).toBe(order.items.length)
  })

  it('для невидаленого товару рендерить заголовок продукту', () => {
    const firstRow = wrapper.findAll('div.border-b').at(0)
    expect(firstRow.find('h4').text()).toBe(order.items[0].title)
    expect(firstRow.find('h4').classes()).not.toContain('italic')
  })

  it('для видаленого товару рендерить "Товар видалено" з italic та червоним кольором', () => {
    const secondRow = wrapper.findAll('div.border-b').at(1)
    expect(secondRow.find('h4').text()).toBe('Товар видалено')
    expect(secondRow.find('h4').classes()).toContain('italic')
    expect(secondRow.find('h4').classes()).toContain('text-red-600')
  })

  it('виводить правильний текст кількості та ціни для кожного товару', () => {
    const firstRow = wrapper.findAll('div.border-b').at(0)
    const qty = firstRow.findAll('p').at(0)
    const price = firstRow.findAll('p').at(1)
    expect(qty.text()).toBe(`Кількість: ${order.items[0].quantity}`)
    expect(price.text()).toBe(`Ціна: ${order.items[0].price}₴`)
  })

  it('має кнопку "Закрити" з правильним класом та текстом', () => {
    const btn = wrapper.find('button')
    expect(btn.exists()).toBe(true)
    expect(btn.text()).toBe('Закрити')
    expect(btn.classes()).toContain('bg-[#6B1F1F]')
  })

  it('емітить "close" при кліку на кнопку Закрити', async () => {
    const btn = wrapper.find('button')
    await btn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.emitted('close').length).toBe(1)
  })

  it('емітить "close" при кліку по фону (self)', async () => {
    // click.self означає, що лише по контейнеру-модалці
    await wrapper.trigger('click.self')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('не емітує "close" при кліку всередині модального вікна', async () => {
    const inner = wrapper.find('div.bg-white')
    await inner.trigger('click')
    expect(wrapper.emitted('close')).toBeFalsy()
  })

  it('якщо order.items порожній, не показує список товарів', async () => {
    await wrapper.setProps({ order: { ...order, items: [] } })
    expect(wrapper.find('div.max-h-60').exists()).toBe(false)
  })

  it('h3 має клас text-[#6B1F1F] та font-semibold', () => {
    const h3 = wrapper.find('h3')
    expect(h3.classes()).toContain('text-[#6B1F1F]')
    expect(h3.classes()).toContain('font-semibold')
  })

  it('контейнер модалки має класи для фону та позиціонування', () => {
    const backdrop = wrapper.find('div.fixed')
    expect(backdrop.classes()).toContain('bg-black/30')
    expect(backdrop.classes()).toContain('flex')
    expect(backdrop.classes()).toContain('justify-center')
    expect(backdrop.classes()).toContain('items-center')
  })

  it('внутрішній контейнер має max-width клас max-w-lg', () => {
    const inner = wrapper.find('div.bg-white')
    expect(inner.classes()).toContain('max-w-lg')
  })

  it('текст статусу обгорнутий в span з класом font-medium', () => {
    const statusSpan = wrapper.find('p span.font-medium')
    expect(statusSpan.exists()).toBe(true)
    expect(statusSpan.text()).toBe(order.status)
  })

  it('closeModal метод емітує лише один раз навіть при подвійному кліку', async () => {
    await wrapper.find('button').trigger('click')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('close').length).toBe(2)
  })

  it('якщо order.items undefined, не показує блок з товарами', async () => {
    await wrapper.setProps({ order: { id: 5, status: 'OK' } })
    expect(wrapper.find('div.max-h-60').exists()).toBe(false)
  })

  it('всі h4 мають коректні теги відповідно до is_deleted прапора', () => {
    const headings = wrapper.findAll('h4')
    expect(headings.at(0).text()).toBe(order.items[0].title)
    expect(headings.at(1).text()).toBe('Товар видалено')
  })

  it('кнопка Закрити має клас absolute bottom-6 right-6', () => {
    const btn = wrapper.find('button')
    expect(btn.classes()).toContain('absolute')
    expect(btn.classes()).toContain('bottom-6')
    expect(btn.classes()).toContain('right-6')
  })

  it('після еміту closeModal, order проп залишився незмінним', async () => {
    const before = wrapper.props('order')
    await wrapper.find('button').trigger('click')
    expect(wrapper.props('order')).toEqual(before)
  })
});
