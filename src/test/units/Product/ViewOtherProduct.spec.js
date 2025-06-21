// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

import { mount } from '@vue/test-utils';
import ViewOtherProduct from '@/components/product/ViewOtherProduct.vue';

jest.mock('axios', () => {
  const mAxios = {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  mAxios.create = jest.fn(() => mAxios);
  return mAxios;
});

describe('ViewOtherProduct.vue - Тестування іконки сердечка та стану наведення', () => {
  let wrapper;

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { id: 1, name: 'Product 1', price: 100, image_url: 'test-url-1', bead_producer_name: 'Producer 1', is_in_wishlist: false },
              { id: 2, name: 'Product 2', price: 200, image_url: '', bead_producer_name: 'Producer 2', is_in_wishlist: true },
            ],
          }),
      })
    );

    global.alert = jest.fn();

    jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
      if (key === 'token') return null;
      return null;
    });

    jest.spyOn(console, 'warn').mockImplementation(() => {});

    wrapper = mount(ViewOtherProduct, {
      global: {
        mocks: {
          $t: (msg) => msg,
        },
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
      },
    });
  });

  afterEach(() => {
    global.fetch.mockRestore();
    jest.restoreAllMocks();
    wrapper.unmount();
  });

  it('Перевіряє, чи викликається метод fetchProducts при монтуванні компонента', () => {
    // Створюємо шпигун для методу fetchProducts
    const fetchProductsSpy = jest.spyOn(ViewOtherProduct.methods, 'fetchProducts');
  
    // Монтуємо компонент
    wrapper = mount(ViewOtherProduct, {
      global: {
        mocks: {
          $t: (msg) => msg,
        },
        stubs: {
          'router-link': {
            template: '<a><slot /></a>',
          },
        },
      },
    });
  
    // Перевіряємо, чи викликаний метод fetchProducts
    expect(fetchProductsSpy).toHaveBeenCalled();
  
    // Очищуємо шпигун
    fetchProductsSpy.mockRestore();
  });

  it('Перевіряє, чи зникає кнопка, коли немає продуктів', async () => {
    wrapper.setData({
      visibleProducts: [],
    });
    await wrapper.vm.$nextTick();
  
    const productCards = wrapper.findAll('.product-card');
    expect(productCards.length).toBe(0); // Перевірка відсутності продуктів
  
    const buyButton = wrapper.find('.buy-button');
    expect(buyButton.exists()).toBe(false); // Перевірка відсутності кнопки
  });

   it('goToProduct викликає $router.push з правильним шляхом', async () => {
    const pushMock = jest.fn();
    wrapper = mount(ViewOtherProduct, {
      global: {
        mocks: { $router: { push: pushMock }, $t: msg => msg },
        stubs: { 'router-link': true },
      },
    });
    wrapper.setData({ visibleProducts: [{ id: 42 }] });
    await wrapper.vm.$nextTick();
    const card = wrapper.find('article');
    await card.trigger('click');
    expect(pushMock).toHaveBeenCalledWith('/productpage/42');
  });

 it('рендерить заголовок секції', () => {
    const title = wrapper.find('h2');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe('Перегляньте інші товари');
  });

  it('рендерить ліву та праву стрілки зі стандартними класами', () => {
    const buttons = wrapper.findAll('button');
    // перша та остання кнопки — це стрілки
    expect(buttons.at(0).classes()).toContain('hidden');
    expect(buttons.at(buttons.length - 1).classes()).toContain('hidden');
  });

  it('рендерить продукт у visibleProducts як article з правильним вмістом', async () => {
    wrapper.setData({
      visibleProducts: [
        { id: 123, name: 'Test Product', price: 999, image_url: 'url', bead_producer_name: 'Brand', rating: 4, review_count: 10, is_in_wishlist: false },
      ],
    });
    await wrapper.vm.$nextTick();
    const article = wrapper.find('article');
    expect(article.exists()).toBe(true);
    expect(article.find('h3').text()).toContain('Test Product');
    expect(article.find('p.text-xl').text()).toBe('999 грн');
  });

  it('goToProduct викликає $router.push при кліці на article', async () => {
    const pushMock = jest.fn();
    wrapper = mount(ViewOtherProduct, {
      global: { mocks: { $router: { push: pushMock }, $t: msg => msg }, stubs: ['router-link'] }
    });
    wrapper.setData({ visibleProducts: [{ id: 77 }] });
    await wrapper.vm.$nextTick();
    const art = wrapper.find('article');
    await art.trigger('click');
    expect(pushMock).toHaveBeenCalledWith('/productpage/77');
  });

  it('має контейнер з класом "relative"', () => {
    expect(wrapper.find('div.relative').exists()).toBe(true);
  });

  it('рендерить контейнер для товарів з класом "overflow-x-auto"', () => {
    expect(wrapper.find('div.overflow-x-auto').exists()).toBe(true);
  });

  it('рендерить <img> з правильним alt та src для продукту', async () => {
    wrapper.setData({
      visibleProducts: [{ id: 5, name: 'Name', image_url: 'img-url', price: 10, bead_producer_name: 'Brand', rating: 3, review_count: 1, is_in_wishlist: false }]
    });
    await wrapper.vm.$nextTick();
    const img = wrapper.find('article img');
    expect(img.attributes('src')).toBe('img-url');
    expect(img.attributes('alt')).toBe('Name');
  });

  it('рендерить назву бренду у спані', async () => {
    wrapper.setData({
      visibleProducts: [{ bead_producer_name: 'Maker' }]
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('article span.text-base').text()).toBe('Maker');
  });

  it('рендерить review_count у тексті "(count)"', async () => {
    wrapper.setData({
      visibleProducts: [{ id:1, name:'N', image_url:'', price:0, bead_producer_name:'B', rating:0, review_count:7, is_in_wishlist:false }]
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('span.text-sm').text()).toBe('(7)');
  });

  it('Math.round(product.rating) керує заповненням зірок', async () => {
    wrapper.setData({
      visibleProducts: [{ rating: 2.4 }]
    });
    await wrapper.vm.$nextTick();
    const filled = wrapper.findAll('svg[fill="#FFD700"]');
    expect(filled.length).toBe(2); 
  });

  it('updateVisibleProducts не видаляє продукти за межами currentPage', () => {
    const items = [{},{},{},{},{}];
    wrapper = mount(ViewOtherProduct, { global:{ mocks:{ $t:msg=>msg }, stubs:['router-link'] } });
    wrapper.setData({ products: items, productsPerPage: 2, currentPage: 0 });
    wrapper.vm.updateVisibleProducts();
    expect(wrapper.vm.visibleProducts.length).toBe(2);
    wrapper.setData({ currentPage: 2 });
    wrapper.vm.updateVisibleProducts();
    expect(wrapper.vm.visibleProducts.length).toBe(1);
  });

  it('showNextProducts не змінює currentPage якщо totalPages = 0', () => {
    wrapper.setData({ totalPages: 0, currentPage: 0 });
    wrapper.vm.showNextProducts();
    expect(wrapper.vm.currentPage).toBe(0);
  });

  it('showPreviousProducts не змінює currentPage якщо currentPage = 0', () => {
    wrapper.setData({ currentPage: 0 });
    wrapper.vm.showPreviousProducts();
    expect(wrapper.vm.currentPage).toBe(0);
  });

  it('mounted додає слухача на resize', () => {
    const spy = jest.spyOn(window, 'addEventListener');
    mount(ViewOtherProduct, { global:{ mocks:{ $t:msg=>msg }, stubs:['router-link'] } });
    expect(spy).toHaveBeenCalledWith('resize', expect.any(Function));
    spy.mockRestore();
  });
});
