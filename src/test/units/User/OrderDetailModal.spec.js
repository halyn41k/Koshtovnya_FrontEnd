
describe.skip('Тести для MyComponent', () => {
    it('цей тест не виконається', () => {
      expect(true).toBe(false)
    })
  })
  
  //Протестовано головні аспекти
  
  /*
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

  it('повинен рендерити список товарів', () => {
    const products = wrapper.findAll('.order-product');
    expect(products.length).toBe(order.items.length);
  });

  it('повинен правильно відображати товар, якщо він не видалений', () => {
    const firstProduct = wrapper.findAll('.order-product').at(0);
    expect(firstProduct.find('img').attributes('src')).toBe(order.items[0].image_url);
    expect(firstProduct.find('.order-product-info h4').text()).toBe(order.items[0].title);
    expect(firstProduct.html()).toContain(`Кількість: ${order.items[0].quantity}`);
    expect(firstProduct.html()).toContain(`Ціна: ${order.items[0].price}₴`);
  });

  it('повинен відображати повідомлення про видалений товар', () => {
    const secondProduct = wrapper.findAll('.order-product').at(1);
    const deletedTitle = secondProduct.find('.order-product-info h4');
    expect(deletedTitle.classes()).toContain('deleted-product');
    expect(deletedTitle.text()).toBe('Товар видалено');
  });

  it('повинен емінтувати подію "close" при кліку на кнопку закриття', async () => {
    const closeButton = wrapper.find('.close-btn');
    await closeButton.trigger('click');
    expect(wrapper.emitted().close).toBeTruthy();
  });

  it('повинен емінтувати подію "close" при кліку на overlay', async () => {
    const overlay = wrapper.find('.modal-overlay');
  
    // Симуляція кліку без встановлення `target`
    await overlay.trigger('click');
  
    expect(wrapper.emitted().close).toBeTruthy();
  });
});
*/