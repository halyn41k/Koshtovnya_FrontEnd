// describe.skip('Тести для MyComponent', () => {
//    it('цей тест не виконається', () => {
//      expect(true).toBe(false)
//    })
//  })

//Протестовано головні аспекти

import { mount, flushPromises } from '@vue/test-utils';
import CartShopPage from '@/components/Cart/CartShopPage.vue';
import CartItem from '@/components/Cart/CartItem.vue';
import CartSummary from '@/components/Cart/CartSummary.vue';
import Loader from '@/components/Home/Loader.vue';
import api from '@/services/api';
import bus from '@/eventBus';

// Моки
jest.mock('@/services/api');
jest.mock('@/eventBus', () => ({
  emit: jest.fn(),
}));

jest.mock('@/assets/icons/empty-cart.svg', () => 'empty-cart.svg');
jest.mock('@/assets/logo1.webp', () => 'logo1.webp');

describe('CartShopPage.vue', () => {
  let wrapper;

  const mockProducts = [
    {
      id: '1',
      image_url: 'https://example.com/image1.jpg',
      name: 'Product 1',
      price: 200,
      quantity: 2,
      selected_size: 'M',
      variants: [
        { size: 'S', quantity: 10, is_available: true },
        { size: 'M', quantity: 5, is_available: true },
      ],
    },
  ];

  const mountComponent = async (options = {}) => {
    api.getCart.mockResolvedValue({ products: mockProducts });

    wrapper = mount(CartShopPage, {
      global: {
        stubs: {
          'router-link': {
            template: '<a><slot /></a>'
          }
        }
      },
      ...options
    });

    await flushPromises();
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('рендерить компонент і викликає fetchCartItems()', async () => {
    await mountComponent();
    expect(api.getCart).toHaveBeenCalled();
    expect(wrapper.vm.cartItems).toHaveLength(1);
  });

  it('рендерить Loader під час завантаження', async () => {
    wrapper = mount(CartShopPage, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot /></a>' }
        }
      }
    });

    await wrapper.setData({ loading: true });

    expect(wrapper.findComponent(Loader).exists()).toBe(true);
  });

  it('рендерить порожній стан, якщо кошик пустий', async () => {
    api.getCart.mockResolvedValue({ products: [] });
    wrapper = mount(CartShopPage, {
      global: {
        stubs: {
          'router-link': { template: '<a><slot /></a>' }
        }
      }
    });
    await flushPromises();
    expect(wrapper.find('.empty-cart-message').exists()).toBe(true);
    expect(wrapper.text()).toContain('Ваш кошик порожній');
  });

  it('рендерить CartItem для кожного елемента', async () => {
    await mountComponent();
    const items = wrapper.findAllComponents(CartItem);
    expect(items).toHaveLength(mockProducts.length);
  });

  it('рендерить CartSummary якщо товари є', async () => {
    await mountComponent();
    const summary = wrapper.findComponent(CartSummary);
    expect(summary.exists()).toBe(true);
    expect(summary.props('cartItems')).toEqual(wrapper.vm.cartItems);
  });

  it('updateCartItem: змінює розмір товару', async () => {
    await mountComponent();
    const payload = { id: '1', size: 'S' };
    api.updateCartItem.mockResolvedValue({});
    await wrapper.vm.updateCartItem(payload);
    expect(api.updateCartItem).toHaveBeenCalledWith('1', { size: 'S' });
    expect(wrapper.vm.cartItems[0].selectedSize).toBe('S');
  });

  it('updateCartItem: збільшує кількість', async () => {
    await mountComponent();
    const payload = { id: '1', operation: 'increase' };
    api.updateCartItem.mockResolvedValue({});
    await wrapper.vm.updateCartItem(payload);
    expect(wrapper.vm.cartItems[0].quantity).toBe(3);
  });

  it('updateCartItem: зменшує кількість', async () => {
    await mountComponent();
    const payload = { id: '1', operation: 'decrease' };
    api.updateCartItem.mockResolvedValue({});
    await wrapper.vm.updateCartItem(payload);
    expect(wrapper.vm.cartItems[0].quantity).toBe(1);
  });

  it('updateCartItem: не дозволяє зменшити нижче 1', async () => {
    await mountComponent();
    wrapper.vm.cartItems[0].quantity = 1;
    const payload = { id: '1', operation: 'decrease' };
    await wrapper.vm.updateCartItem(payload);
    expect(wrapper.vm.cartItems[0].quantity).toBe(1);
  });

  it('removeItem: видаляє товар з кошика і викликає bus.emit', async () => {
    await mountComponent();
    api.removeFromCart.mockResolvedValue({});
    await wrapper.vm.removeItem('1');
    expect(api.removeFromCart).toHaveBeenCalledWith('1');
    expect(wrapper.vm.cartItems).toHaveLength(0);
    expect(bus.emit).toHaveBeenCalledWith('cart-updated');
  });

  it('document.title має бути "Кошик"', async () => {
    await mountComponent();
    expect(document.title).toBe('Кошик');
  });

  it('не оновлює нічого якщо некоректний payload у updateCartItem', async () => {
    await mountComponent();
    await wrapper.vm.updateCartItem({ id: '1' });
    expect(api.updateCartItem).not.toHaveBeenCalled();
  });
});
