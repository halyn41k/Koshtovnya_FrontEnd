// describe.skip('Тести для MyComponent', () => {
//    it('цей тест не виконається', () => {
//      expect(true).toBe(false)
//    })
//  })
  
 //Протестовано головні аспекти
  
import { shallowMount } from '@vue/test-utils';
import CartShopPage from '@/components/Cart/CartShopPage.vue';
import axios from 'axios';
import CartItem from '@/components/Cart/CartItem.vue';
import Summary from '@/components/Cart/Summary.vue';
import Loader from '@/components/Home/Loader.vue';

jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({ data: { data: [] } })),
    post: jest.fn(),
    patch: jest.fn(), // Додано patch
    delete: jest.fn()
}));

jest.mock('@/assets/logo1.webp', () => 'logo1.webp');

describe('CartShopPage.vue', () => {
  let wrapper;
  const token = 'fake-token';
  const mockCartResponse = {
    data: {
      products: [
        {
          id: '1',
          image_url: 'https://example.com/image1.jpg',
          name: 'Product 1',
          price: 50,
          quantity: 2,
          is_available: true,
          selected_size: 'M',
          variants: [
            { size: 'M', quantity: 10, is_available: true },
            { size: 'L', quantity: 5, is_available: false },
          ],
        },
        {
          id: '2',
          image_url: 'https://example.com/image2.jpg',
          name: 'Product 2',
          price: 100,
          quantity: 1,
          is_available: true,
          selected_size: null,
          variants: [
            { size: 'S', quantity: 2, is_available: true },
            { size: 'M', quantity: 3, is_available: true },
          ],
        },
      ],
      errors: [
        {
          product_name: 'Product 2',
          message: 'Not available',
        },
      ],
    },
  };

  beforeEach(() => {
    localStorage.setItem('token', token);
  
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Замокаємо console.error
    jest.spyOn(console, 'warn').mockImplementation(() => {}); // Замокаємо console.warn
  
    wrapper = shallowMount(CartShopPage, {
      stubs: {
        CartItem: true,
        Summary: true,
        Loader: true,
      },
      global: {
        mocks: {
          $router: {
            push: jest.fn(),
          },
        },
      },
    });
  });
  
  afterEach(() => {
    jest.restoreAllMocks(); // Відновлюємо оригінальні консольні методи після кожного тесту
    wrapper.unmount();
    jest.clearAllMocks();
  }); 

  describe('Рендеринг', () => {
    it('рендериться основна структура з класом "cart"', () => {
      expect(wrapper.classes()).toContain('cart');
      expect(wrapper.find('header.cart-header').exists()).toBe(true);
      expect(wrapper.find('div.cart-content').exists()).toBe(true);
    });

    it('показує Loader, коли loading === true', async () => {
      await wrapper.setData({ loading: true });
      expect(wrapper.findComponent(Loader).exists()).toBe(true);
    });

    it('показує повідомлення про порожній кошик, коли cartItems порожній', async () => {
      await wrapper.setData({ loading: false, cartItems: [] });
      const emptyCartEl = wrapper.find('div.empty-cart');
      expect(emptyCartEl.exists()).toBe(true);
      expect(emptyCartEl.text()).toContain('Ваш кошик порожній.');
    });

    it('рендерить компоненти CartItem та Summary, коли cartItems не порожній', async () => {
      const items = [
        {
          id: '1',
          image: 'https://example.com/image1.jpg',
          title: 'Product 1',
          price: 50,
          quantity: 2,
          selectedSize: 'M',
          variants: [],
        },
      ];
      await wrapper.setData({ loading: false, cartItems: items });
      expect(wrapper.findAllComponents(CartItem).length).toBe(items.length);
      expect(wrapper.findComponent(Summary).exists()).toBe(true);
    });
  });

  describe('Метод fetchCartItems', () => {
    it('якщо немає токену, викликається alert і редірект на /login', async () => {
      localStorage.removeItem('token');
      window.alert = jest.fn();
      await wrapper.vm.fetchCartItems();
      expect(window.alert).toHaveBeenCalledWith("Будь ласка, увійдіть у свій обліковий запис.");
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith("/login");
    });

    it('завантажує cartItems і оновлює їх, обробляючи помилки, якщо вони є', async () => {
      axios.get.mockResolvedValueOnce(mockCartResponse);
      await wrapper.vm.fetchCartItems();
      expect(axios.get).toHaveBeenCalledWith("http://26.235.139.202:8080/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Перевіряємо, що кількість товарів оновлена
      expect(wrapper.vm.cartItems.length).toBe(mockCartResponse.data.products.length);
      // Для товару з id '2' має бути встановлено isAvailable: false та errorMessage із помилкою
      const product2 = wrapper.vm.cartItems.find(item => item.id === '2');
      expect(product2.isAvailable).toBe(false);
      expect(product2.errorMessage).toBe('Not available');
    });

    it('обробляє помилку запиту fetchCartItems', async () => {
      window.alert = jest.fn();
      axios.get.mockRejectedValueOnce(new Error("Network Error"));
      await wrapper.vm.fetchCartItems();
      expect(window.alert).toHaveBeenCalledWith("Не вдалося завантажити кошик.");
      expect(wrapper.vm.loading).toBe(false);
    });
  });

  describe('Метод updateCartItem', () => {
    beforeEach(async () => {
      // Ініціалізуємо cartItems для тестування оновлення
      wrapper.setData({
        cartItems: [
          { id: '1', selectedSize: 'M', quantity: 2 },
        ],
      });
    });

    it('якщо немає токену, викликається alert і редірект на /login', async () => {
      localStorage.removeItem('token');
      window.alert = jest.fn();
      await wrapper.vm.updateCartItem({ id: '1', quantity: 3, operation: 'increase' });
      expect(window.alert).toHaveBeenCalledWith("Будь ласка, увійдіть у свій обліковий запис.");
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith("/login");
    });

    it('оновлює товар у кошику при зміні кількості', async () => {
      axios.patch.mockResolvedValueOnce({});
      window.alert = jest.fn();
      await wrapper.vm.updateCartItem({ id: '1', quantity: 3, operation: 'increase' });
      expect(axios.patch).toHaveBeenCalledWith(
        "http://26.235.139.202:8080/api/cart/1",
        { operation: 'increase', quantity: 3 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(wrapper.vm.cartItems[0].quantity).toBe(3);
      expect(window.alert).toHaveBeenCalledWith("Товар успішно оновлено.");
    });

    it('оновлює товар у кошику при зміні розміру', async () => {
      axios.patch.mockResolvedValueOnce({});
      window.alert = jest.fn();
      await wrapper.vm.updateCartItem({ id: '1', size: 'L' });
      expect(axios.patch).toHaveBeenCalledWith(
        "http://26.235.139.202:8080/api/cart/1",
        { size: 'L' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      expect(wrapper.vm.cartItems[0].selectedSize).toBe('L');
      expect(window.alert).toHaveBeenCalledWith("Товар успішно оновлено.");
    });

    it('обробляє помилку при оновленні товару', async () => {
      window.alert = jest.fn();
      axios.patch.mockRejectedValueOnce({
        response: { data: { message: "Update error" } },
      });
      await wrapper.vm.updateCartItem({ id: '1', quantity: 3, operation: 'increase' });
      expect(window.alert).toHaveBeenCalledWith("Update error");
    });
  });

  describe('Метод removeItem', () => {
    beforeEach(async () => {
      // Ініціалізуємо cartItems для тестування видалення
      wrapper.setData({
        cartItems: [
          { id: '1' },
          { id: '2' },
        ],
      });
    });

    it('якщо немає токену, викликається alert і редірект на /login', async () => {
      localStorage.removeItem('token');
      window.alert = jest.fn();
      await wrapper.vm.removeItem('1');
      expect(window.alert).toHaveBeenCalledWith("Будь ласка, увійдіть у свій обліковий запис.");
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith("/login");
    });

    it('успішно видаляє товар з кошика', async () => {
      axios.delete.mockResolvedValueOnce({});
      await wrapper.vm.removeItem('1');
      expect(axios.delete).toHaveBeenCalledWith("http://26.235.139.202:8080/api/cart/1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(wrapper.vm.cartItems.find(item => item.id === '1')).toBeUndefined();
    });

    it('обробляє помилку видалення товару', async () => {
      window.alert = jest.fn();
      axios.delete.mockRejectedValueOnce(new Error("Delete error"));
      await wrapper.vm.removeItem('1');
      expect(window.alert).toHaveBeenCalledWith("Не вдалося видалити товар із кошика.");
    });
  });
});