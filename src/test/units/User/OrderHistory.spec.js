// describe.skip('Тести для MyComponent', () => {
//     it('цей тест не виконається', () => {
//       expect(true).toBe(false)
//     })
//   })
  
  //Протестовано головні аспекти
  
  
  import { shallowMount } from '@vue/test-utils';
import OrderHistory from '@/components/User/OrderHistory.vue';
import axios from 'axios';

jest.mock('@/assets/logo1.webp', () => ''); // Замокаємо зображення

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { orders: [] } })),
}));

// Мок для alert, щоб не виникало помилки через jsdom
beforeAll(() => {
  window.alert = jest.fn();
});

describe('OrderHistory.vue', () => {
  let wrapper;
  // Дані для тестування
  const ordersData = [
    {
      id: 1,
      status: 'Completed',
      items: [
        {
          id: 101,
          title: 'Product 1',
          price: 100,
          quantity: 2,
          image_url: 'image1.jpg',
          is_deleted: false,
        },
      ],
    },
    {
      id: 2,
      status: 'Pending',
      items: [
        {
          id: 102,
          title: 'Product 2',
          price: 150,
          quantity: 1,
          image_url: 'image2.jpg',
          is_deleted: false,
        },
      ],
    },
  ];

  beforeEach(() => {
    wrapper = shallowMount(OrderHistory, {
      stubs: ['Loader', 'OrderDetailModal'],
      global: {
        mocks: {
          $router: {
            push: jest.fn(),
          },
        },
      },
      data() {
        return {
          loading: false, // Початкове значення loading
          orders: ordersData, // Використовуємо ordersData для тестування
        };
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    jest.clearAllMocks();
  });

  it('встановлюється заголовок сторінки як "Історія замовлень"', () => {
    expect(document.title).toBe("Історія замовлень");
  });

  it('базова структура компонента містить контейнер з класом "order-history" та заголовок з класом "order-history-title" із текстом "Історія замовлень"', () => {
    const container = wrapper.find('.order-history');
    expect(container.exists()).toBe(true);

    const title = container.find('.order-history-title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe("Історія замовлень");
  });

  it('рендерить компонент Loader, коли loading має значення true', async () => {
    await wrapper.setData({ loading: true });
    const loader = wrapper.findComponent({ name: 'Loader' });
    expect(loader.exists()).toBe(true);
  });

  it('якщо loading завершено (false) і масив orders порожній, показується блок з класом "no-orders" із повідомленням "Ви не розмістили жодного замовлення :("', async () => {
    await wrapper.setData({ orders: [] });
    const noOrdersBlock = wrapper.find('.no-orders');
    expect(noOrdersBlock.exists()).toBe(true);
    expect(noOrdersBlock.text()).toBe("Ви не розмістили жодного замовлення :(");
  });

  it('якщо в orders є дані, відображається контейнер з класом "orders-container"', () => {
    const ordersContainer = wrapper.find('.orders-container');
    expect(ordersContainer.exists()).toBe(true);
  });

  it('натискання кнопки "Деталі замовлення" оновлює selectedOrder та showModal', async () => {
    // Знаходимо кнопку і симулюємо клік
    const detailsButton = wrapper.find('.details-btn');
    await detailsButton.trigger('click');

    // Перевіряємо, що selectedOrder оновився і showModal встановлено в true
    expect(wrapper.vm.selectedOrder).toEqual(ordersData[0]);
    expect(wrapper.vm.showModal).toBe(true);
  });

  // 1. Наявність блоку з класом order-item для кожного елемента замовлення
  it('для кожного елемента замовлення існує блок з класом "order-item"', () => {
    const orderItems = wrapper.findAll('.order-item');
    expect(orderItems.length).toBe(ordersData.length);
  });

  // 2. Рендеринг заголовка замовлення з класом order-header, який містить елемент із класом order-number
  it('для кожного елемента замовлення рендериться заголовок з класом "order-header" та елемент з класом "order-number"', () => {
    const orderItems = wrapper.findAll('.order-item');
    orderItems.forEach((orderWrapper, index) => {
      const orderHeader = orderWrapper.find('.order-header');
      expect(orderHeader.exists()).toBe(true);

      const orderNumber = orderHeader.find('.order-number');
      expect(orderNumber.exists()).toBe(true);
      expect(orderNumber.text()).toContain(`Замовлення №${ordersData[index].id}`);
    });
  });

  // 3. Рендеринг елемента із класом order-status, що містить статус замовлення
  it('для кожного елемента замовлення рендериться елемент з класом "order-status", що містить статус замовлення', () => {
    const orderItems = wrapper.findAll('.order-item');
    orderItems.forEach((orderWrapper, index) => {
      const orderHeader = orderWrapper.find('.order-header');
      expect(orderHeader.exists()).toBe(true);

      const orderStatus = orderHeader.find('.order-status');
      expect(orderStatus.exists()).toBe(true);
      expect(orderStatus.text()).toContain(ordersData[index].status);
    });
  });

  // Тести для рендерингу деталей замовлення у блоці order-details
  describe('Рендеринг деталей замовлення у блоці order-details', () => {
    beforeEach(async () => {
      // Задаємо дані з декількома продуктами, серед яких один видалено
      const testOrders = [
        {
          id: 1,
          status: 'Completed',
          items: [
            {
              id: 101,
              title: 'Product 1',
              price: 100,
              quantity: 2,
              image_url: 'image1.jpg',
              is_deleted: false,
            },
            {
              id: 102,
              title: 'Product 2',
              price: 150,
              quantity: 1,
              image_url: 'image2.jpg',
              is_deleted: true,
            },
          ],
        },
      ];
      await wrapper.setData({ orders: testOrders });
    });

    it('Для кожного продукту перевіряється наявність зображення з класом "order-product-image" та відповідних атрибутів', () => {
      const orderItem = wrapper.find('.order-item');
      const orderProducts = orderItem.findAll('.order-product');
      orderProducts.forEach((productWrapper) => {
        const img = productWrapper.find('img.order-product-image');
        expect(img.exists()).toBe(true);
        expect(img.attributes('src')).toBeTruthy();
        expect(img.attributes('alt')).toBe('Product Image');
      });
    });

    it('Якщо is_deleted true, відображається заголовок з текстом "Товар видалено" і класом "deleted-product", інакше відображається оригінальна назва товару', () => {
      const orderItem = wrapper.find('.order-item');
      const orderProducts = orderItem.findAll('.order-product');
      orderProducts.forEach((productWrapper, idx) => {
        const product = wrapper.vm.orders[0].items[idx];
        const titleEl = productWrapper.find('h3');
        expect(titleEl.exists()).toBe(true);
        if (product.is_deleted) {
          expect(titleEl.classes()).toContain('deleted-product');
          expect(titleEl.text()).toBe('Товар видалено');
        } else {
          expect(titleEl.classes()).not.toContain('deleted-product');
          expect(titleEl.text()).toBe(product.title);
        }
      });
    });

    it('Відображаються кількість та ціна (з валютою ₴) для кожного товару', () => {
      const orderItem = wrapper.find('.order-item');
      const orderProducts = orderItem.findAll('.order-product');
      orderProducts.forEach((productWrapper, idx) => {
        const product = wrapper.vm.orders[0].items[idx];
        const productText = productWrapper.text();
        expect(productText).toContain(`Кількість: ${product.quantity}`);
        expect(productText).toContain(`Ціна: ${product.price}₴`);
      });
    });
  });

  // Нові тести для перевірки кнопки деталей замовлення
  it('усередині кожного елемента замовлення є кнопка з класом "details-btn" з текстом "Деталі замовлення"', () => {
    const orderItems = wrapper.findAll('.order-item');
    orderItems.forEach((orderWrapper) => {
      const btn = orderWrapper.find('button.details-btn');
      expect(btn.exists()).toBe(true);
      expect(btn.text().trim()).toBe('Деталі замовлення');
    });
  });

  // Нові тести для компонента OrderDetailModal
  describe('Модальне вікно OrderDetailModal', () => {
    const selectedOrder = ordersData[0];

    beforeEach(async () => {
      // Встановлюємо значення showModal та selectedOrder для тестування модального вікна
      await wrapper.setData({
        showModal: true,
        selectedOrder,
      });
    });

    it('при showModal === true рендериться компонент OrderDetailModal', () => {
      const modal = wrapper.findComponent({ name: 'OrderDetailModal' });
      expect(modal.exists()).toBe(true);
    });

    it('в компонент OrderDetailModal передається обране замовлення через проп order', () => {
      const modal = wrapper.findComponent({ name: 'OrderDetailModal' });
      expect(modal.props('order')).toEqual(selectedOrder);
    });

    it('при події close модального вікна викликається метод closeModal, який повертає showModal в false та скидає selectedOrder', async () => {
      const modal = wrapper.findComponent({ name: 'OrderDetailModal' });
      // Емітуємо подію close з модального вікна
      await modal.vm.$emit('close');

      // Перевіряємо, що метод closeModal скинув значення showModal та selectedOrder
      expect(wrapper.vm.showModal).toBe(false);
      expect(wrapper.vm.selectedOrder).toBe(null);
    });
  });

  // Тестування методу fetchOrders
  describe('Метод fetchOrders', () => {
    // Тест: Відсутність токена (вже реалізовано)
    it('відсутність токена: має бути показане повідомлення alert та виконується перенаправлення на "/login"', async () => {
      jest.spyOn(localStorage.__proto__, 'getItem').mockReturnValue(null);
      await wrapper.vm.fetchOrders();
      expect(window.alert).toHaveBeenCalledWith('Будь ласка, увійдіть у свій обліковий запис.');
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith("/login");
    });

    // 1. Успішне завантаження замовлень: перевірка обробки даних з API
    it('успішне завантаження замовлень: дані з API коректно обробляються та мапляться', async () => {
      // Мокаємо токен у localStorage
      jest.spyOn(localStorage.__proto__, 'getItem').mockReturnValue('fake-token');
      // Підготовка даних з API з полем "orders", де товари знаходяться в полі "products"
      const apiResponse = {
        data: {
          orders: [
            {
              id: 1,
              status: 'Completed',
              products: [
                {
                  id: 101,
                  name: 'Product 1',
                  price: 100,
                  quantity: 2,
                  image_url: 'image1.jpg',
                  is_deleted: false,
                },
                {
                  id: 102,
                  name: 'Product 2',
                  price: 150,
                  quantity: 1,
                  image_url: 'image2.jpg',
                  is_deleted: true,
                },
              ],
            },
            {
              id: 2,
              status: 'Pending',
              products: [
                {
                  id: 201,
                  name: 'Product 3',
                  price: 200,
                  quantity: 3,
                  image_url: 'image3.jpg',
                  is_deleted: false,
                },
              ],
            },
          ],
        },
      };
      axios.get.mockResolvedValue(apiResponse);
      // Виклик методу fetchOrders
      await wrapper.vm.fetchOrders();

      // Очікуваний результат після мапування даних
      const expectedOrders = [
        {
          id: 1,
          status: 'Completed',
          items: [
            {
              id: 101,
              title: 'Product 1',
              price: 100,
              quantity: 2,
              image_url: 'image1.jpg',
              is_deleted: false,
            },
            {
              id: 102,
              title: 'Product 2',
              price: 150,
              quantity: 1,
              image_url: 'image2.jpg',
              is_deleted: true,
            },
          ],
        },
        {
          id: 2,
          status: 'Pending',
          items: [
            {
              id: 201,
              title: 'Product 3',
              price: 200,
              quantity: 3,
              image_url: 'image3.jpg',
              is_deleted: false,
            },
          ],
        },
      ];
      expect(wrapper.vm.orders).toEqual(expectedOrders);
    });

    // 2. Успішне завантаження замовлень: перевірка виклику axios.get із правильними заголовками
    it('успішне завантаження замовлень: axios.get викликається з правильними заголовками', async () => {
      jest.spyOn(localStorage.__proto__, 'getItem').mockReturnValue('fake-token');
      axios.get.mockResolvedValue({ data: { orders: [] } });
      await wrapper.vm.fetchOrders();
      expect(axios.get).toHaveBeenCalledWith("http://26.235.139.202:8080/api/orders", {
        headers: { Authorization: `Bearer fake-token` },
      });
    });

    // 3. Успішне завантаження замовлень: перевірка, що після завершення завантаження loading стає false
    it('успішне завантаження замовлень: після завантаження властивість loading стає false', async () => {
      jest.spyOn(localStorage.__proto__, 'getItem').mockReturnValue('fake-token');
      // Перед викликом fetchOrders встановлюємо loading в true
      wrapper.setData({ loading: true });
      axios.get.mockResolvedValue({ data: { orders: [] } });
      await wrapper.vm.fetchOrders();
      expect(wrapper.vm.loading).toBe(false);
    });

    // 4. Обробка помилки завантаження: при помилковій відповіді від axios викликається console.error і показується повідомлення alert
    it('обробка помилки завантаження: при помилковій відповіді від axios викликається console.error і показується повідомлення alert', async () => {
      jest.spyOn(localStorage.__proto__, 'getItem').mockReturnValue('fake-token');
      const errorMessage = new Error('Network Error');
      axios.get.mockRejectedValue(errorMessage);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      await wrapper.vm.fetchOrders();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith("Помилка завантаження замовлень:", errorMessage);
      expect(window.alert).toHaveBeenCalledWith("Не вдалося завантажити ваші замовлення.");
    });
  });

  // Тести для інтерактивних подій та методів
  describe('Інтерактивні події та методи', () => {
    it('метод openOrderDetails: виклик оновлює selectedOrder та встановлює showModal у true', () => {
      const testOrder = { id: 999, status: 'Test', items: [] };
      wrapper.vm.openOrderDetails(testOrder);
      expect(wrapper.vm.selectedOrder).toEqual(testOrder);
      expect(wrapper.vm.showModal).toBe(true);
    });

    it('метод closeModal: виклик скидає selectedOrder (на null) та змінює showModal на false', () => {
      // Спочатку встановлюємо значення
      wrapper.setData({ selectedOrder: { id: 123 }, showModal: true });
      wrapper.vm.closeModal();
      expect(wrapper.vm.selectedOrder).toBe(null);
      expect(wrapper.vm.showModal).toBe(false);
    });
  });
});
