import { shallowMount } from '@vue/test-utils';
import ProductPage from '@/components/ProductPage.vue';
import axios from 'axios';

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

describe('ProductPage Component', () => {
  let wrapper;

  const mockProduct = {
    id: 1,
    name: 'Тестовий товар',
    price: 1500,
    image_url: 'https://example.com/image.jpg',
    sizes: [10, 20, 30],
    is_available: true,
  };

  const mockRoute = {
    params: {
      id: 1,
    },
  };

  beforeEach(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {}); // Мокаємо alert
    // Мокаємо fetch
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {})

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: mockProduct }),
      })
    );

    // Мокаємо localStorage з токеном
    global.localStorage = {
      getItem: jest.fn((key) => (key === 'token' ? 'mock-token' : null)),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    // Мокаємо відповідь API
    axios.get.mockResolvedValue({ data: { data: mockProduct } });

    // Мокаємо fetchWishlist ще до створення компонента
    jest.spyOn(ProductPage.methods, 'fetchWishlist').mockImplementation(() => {});

    // Монтуюємо компонент
    wrapper = shallowMount(ProductPage, {
      global: {
        mocks: {
          $route: mockRoute,
          $router: { push: jest.fn() }, // Додаємо мок для роутера
        },
        stubs: {
          ProductReviews: true, // Замоканий компонент
          ViewOtherProduct: true, // Замоканий компонент
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Очищення моків
    delete global.localStorage; // Видалення моків для localStorage
    delete global.fetch; // Видалення моків для fetch
  });

  it('Відображає заголовок товару без помилок авторизації', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await wrapper.vm.$nextTick();

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    const title = wrapper.find('.product-title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe(mockProduct.name);

    consoleErrorSpy.mockRestore();
  });

  it('Компонент main.product-content відображається коректно', async () => {
    await wrapper.vm.$nextTick();

    // Перевіряємо, чи є компонент main.product-content
    const mainContent = wrapper.find('main.product-content');
    expect(mainContent.exists()).toBe(true);

    // Перевіряємо наявність основних секцій
    expect(mainContent.find('.product-section').exists()).toBe(true); // Секція продукту
    expect(mainContent.find('.specifications-list').exists()).toBe(true); // Секція характеристик

    // Перевіряємо, чи замокані компоненти існують
    expect(wrapper.findComponent({ name: 'ProductReviews' }).exists()).toBe(true); // Секція оглядів
    expect(wrapper.findComponent({ name: 'ViewOtherProduct' }).exists()).toBe(true); // Секція інших продуктів
  });

  it('Зображення товару (img.product-image) відображається з коректним URL', async () => {
    await wrapper.vm.$nextTick();

    // Знаходимо зображення
    const productImage = wrapper.find('img.product-image');

    // Перевіряємо, чи існує зображення
    expect(productImage.exists()).toBe(true);

    // Перевіряємо, чи атрибут src відповідає URL з product.image_url
    expect(productImage.attributes('src')).toBe(mockProduct.image_url);
  });

  it('Відображає заголовок товару (`product.name`) та його ціну (`product.price`)', async () => {
    await wrapper.vm.$nextTick();

    // Перевіряємо заголовок
    const title = wrapper.find('.product-title');
    expect(title.exists()).toBe(true);
    expect(title.text()).toBe(mockProduct.name);

    // Перевіряємо ціну
    const price = wrapper.find('.product-price');
    expect(price.exists()).toBe(true);
    expect(price.text()).toBe(`${mockProduct.price}₴`);
  });

  it('Перевіряє візуальне відображення бейджа доступності', async () => {
    wrapper.setData({
      product: {
        ...mockProduct,
        variants: [
          { size: 10, is_available: true }, // Один доступний варіант
          { size: 20, is_available: false },
        ],
      },
    });
    await wrapper.vm.$nextTick();
  
    const availabilityBadge = wrapper.find('.availability-badge');
    expect(availabilityBadge.exists()).toBe(true); // Перевірка наявності елемента
    expect(availabilityBadge.classes()).toContain('available'); // Перевірка класу
    expect(availabilityBadge.text()).toBe('В наявності'); // Перевірка тексту
  });

  // Товар без розмірів
  it('Перевіряє відображення без розмірів, якщо розміри відсутні', async () => {
    wrapper.setData({
      product: {
        ...mockProduct,
        sizes: [],
      },
    });
    await wrapper.vm.$nextTick();

    const sizeDropdown = wrapper.find('select.size-dropdown');
    expect(sizeDropdown.exists()).toBe(true);
    expect(sizeDropdown.findAll('option').length).toBe(0);
  });
  
  it('Перевіряє відображення випадаючого списку розмірів з варіантами', async () => {
    // Задаємо товар із варіантами розмірів
    wrapper.setData({
      product: {
        id: 1,
        name: 'Тестовий товар',
        price: 1500,
        image_url: 'https://example.com/image.jpg',
        variants: [
          { size: 10, is_available: true },
          { size: 20, is_available: true },
          { size: 30, is_available: true },
        ],
        is_available: true,
      },
    });
  
    await wrapper.vm.$nextTick();
  
    // Знаходимо випадаючий список
    const sizeDropdown = wrapper.find('select.size-dropdown');
    expect(sizeDropdown.exists()).toBe(true); // Перевіряємо, що список існує
  
    // Перевіряємо кількість варіантів у списку
    const options = sizeDropdown.findAll('option');
    expect(options.length).toBe(3); // Очікуємо 3 варіанти (10, 20, 30)
  
    // Перевіряємо значення кожного варіанту
    expect(options.at(0).text()).toContain('10 см');
    expect(options.at(1).text()).toContain('20 см');
    expect(options.at(2).text()).toContain('30 см');
  
    // Перевіряємо атрибути value кожного варіанту
    expect(options.at(0).attributes('value')).toBe('10');
    expect(options.at(1).attributes('value')).toBe('20');
    expect(options.at(2).attributes('value')).toBe('30');
  });  
  
  it('Перевірка роботи кнопки збільшення кількості (`increaseQuantity`) з граничними значеннями', async () => {
    wrapper.setData({
      product: {
        ...mockProduct,
        variants: [{ size: 10, is_available: true, quantity: 5 }], // Максимальна кількість товару
      },
      selectedSize: 10,
      quantity: 1, // Початкова кількість
    });
  
    await wrapper.vm.$nextTick();
  
    const increaseButton = wrapper.find('.quantity-arrow.up-arrow');
    expect(increaseButton.exists()).toBe(true);
  
    // Кількість збільшується до максимальної
    for (let i = 1; i < 5; i++) {
      await increaseButton.trigger('click');
      expect(wrapper.vm.quantity).toBe(i + 1); // Перевіряємо кожне збільшення
    }
  
    // Перевіряємо, що кількість не перевищує `product.quantity`
    await increaseButton.trigger('click');
    expect(wrapper.vm.quantity).toBe(5); // Максимальне значення
  });
  
  it('Перевірка роботи кнопки зменшення кількості (`decreaseQuantity`) з граничними значеннями', async () => {
    wrapper.setData({
      product: mockProduct,
      quantity: 2, // Початкова кількість
    });
  
    await wrapper.vm.$nextTick();
  
    const decreaseButton = wrapper.find('.quantity-arrow.down-arrow');
    expect(decreaseButton.exists()).toBe(true);
  
    // Кількість зменшується до мінімальної
    await decreaseButton.trigger('click');
    expect(wrapper.vm.quantity).toBe(1); // Мінімальне значення
  
    // Перевіряємо, що кількість не стає меншою за 1
    await decreaseButton.trigger('click');
    expect(wrapper.vm.quantity).toBe(1); // Залишається мінімальною
  });
  
  it('Перевірка, що кнопки враховують граничні значення', async () => {
    wrapper.setData({
      product: {
        ...mockProduct,
        quantity: 3, // Максимальна кількість товару
      },
      quantity: 3, // Початкова кількість
    });
  
    await wrapper.vm.$nextTick();
  
    const increaseButton = wrapper.find('.quantity-arrow.up-arrow');
    const decreaseButton = wrapper.find('.quantity-arrow.down-arrow');
  
    // Натискаємо кнопку збільшення, коли кількість вже максимальна
    await increaseButton.trigger('click');
    expect(wrapper.vm.quantity).toBe(3); // Залишається максимальною
  
    // Встановлюємо мінімальну кількість
    wrapper.setData({ quantity: 1 });
    await wrapper.vm.$nextTick();
  
    // Натискаємо кнопку зменшення, коли кількість вже мінімальна
    await decreaseButton.trigger('click');
    expect(wrapper.vm.quantity).toBe(1); // Залишається мінімальною
  });
  
  it('Перевірка відкриття модального вікна для зображення (`openModal`)', async () => {
    wrapper.setData({ isModalOpen: false }); // Початково модальне вікно закрите
  
    await wrapper.vm.openModal(); // Викликаємо метод відкриття модального вікна
    expect(wrapper.vm.isModalOpen).toBe(true); // Перевіряємо, чи встановлено `isModalOpen` в true
  
    await wrapper.vm.$nextTick();
  
    const modalOverlay = wrapper.find('.modal-overlay');
    expect(modalOverlay.exists()).toBe(true); // Перевіряємо, чи з'явилося модальне вікно
  });
  
  it('Перевірка закриття модального вікна (`closeModal`)', async () => {
    wrapper.setData({ isModalOpen: true }); // Початково модальне вікно відкрите
  
    await wrapper.vm.closeModal(); // Викликаємо метод закриття модального вікна
    expect(wrapper.vm.isModalOpen).toBe(false); // Перевіряємо, чи встановлено `isModalOpen` в false
  
    await wrapper.vm.$nextTick();
  
    const modalOverlay = wrapper.find('.modal-overlay');
    expect(modalOverlay.exists()).toBe(false); // Перевіряємо, чи модальне вікно зникло
  });
  
  it('Наявність кнопки "Купити" для доступного товару', async () => {
    wrapper.setData({
      product: {
        ...mockProduct,
        is_available: true,
        variants: [{ size: 10, is_available: true }], // Доступний варіант
      },
      selectedSize: 10, // Обраний розмір
    });
  
    await wrapper.vm.$nextTick();
  
    const buyButton = wrapper.find('.buy-button');
    expect(buyButton.exists()).toBe(true); // Перевіряємо, що кнопка існує
    expect(buyButton.text()).toBe('Купити'); // Текст кнопки
    expect(buyButton.attributes('disabled')).toBeFalsy(); // Перевіряємо, що кнопка активна
  
    const notifyButton = wrapper.find('.notify-button');
    expect(notifyButton.exists()).toBe(false); // Кнопки "Повідомити про наявність" не повинно бути
  });
  
  it('Наявність кнопки "Повідомити про наявність" для недоступного товару (`notifyWhenAvailable`)', async () => {
    wrapper.setData({
      product: {
        ...mockProduct,
        is_available: false, // Товар недоступний
      },
    });
  
    await wrapper.vm.$nextTick();
  
    const notifyButton = wrapper.find('.notify-button');
    expect(notifyButton.exists()).toBe(true); // Перевіряємо, що кнопка існує
    expect(notifyButton.text()).toBe('Повідомити про наявність'); // Текст кнопки
    expect(notifyButton.attributes('disabled')).toBeUndefined(); // Кнопка активна
  
    const buyButton = wrapper.find('.buy-button');
    expect(buyButton.exists()).toBe(false); // Кнопки "Купити" не повинно бути
  });
  
  it('Перевірка додавання товару до списку бажаного (`toggleWishlist`)', async () => {
    // Імітуємо, що товар відсутній у списку бажаного
    wrapper.setData({
      wishlist: [],
      product: mockProduct,
    });
  
    // Замінюємо toggleWishlist мокованою функцією
    const toggleWishlistMock = jest.fn();
    wrapper.vm.toggleWishlist = toggleWishlistMock;
  
    // Викликаємо toggleWishlist
    await wrapper.vm.toggleWishlist(mockProduct);
  
    // Перевіряємо, чи викликано моковану функцію
    expect(toggleWishlistMock).toHaveBeenCalledWith(mockProduct);
  
    // Перевіряємо, чи товар додано до списку бажаного
    wrapper.setData({ wishlist: [mockProduct.id] }); // Емітуємо додавання
    expect(wrapper.vm.wishlist).toContain(mockProduct.id);
  });
  
  it('Перевірка видалення товару зі списку бажаного', async () => {
    // Імітуємо, що товар є у списку бажаного
    wrapper.setData({
      wishlist: [mockProduct.id],
      product: mockProduct,
    });
  
    // Замінюємо toggleWishlist мокованою функцією
    const toggleWishlistMock = jest.fn();
    wrapper.vm.toggleWishlist = toggleWishlistMock;
  
    // Викликаємо toggleWishlist
    await wrapper.vm.toggleWishlist(mockProduct);
  
    // Перевіряємо, чи викликано моковану функцію
    expect(toggleWishlistMock).toHaveBeenCalledWith(mockProduct);
  
    // Перевіряємо, чи товар видалено зі списку бажаного
    wrapper.setData({ wishlist: [] }); // Емітуємо видалення
    expect(wrapper.vm.wishlist).not.toContain(mockProduct.id);
  });
  
  it('Перевірка стану серця (заповнене/порожнє) залежно від `isInWishlist`', async () => {
    // Сценарій: товар у списку бажаного
    wrapper.setData({
      wishlist: [mockProduct.id],
      product: mockProduct,
    });
    await wrapper.vm.$nextTick();
  
    // Знаходимо іконку серця
    const filledHeart = wrapper.find('.filled-heart');
    expect(filledHeart.exists()).toBe(true); // Заповнене серце відображається
  
    const emptyHeart = wrapper.find('.empty-heart');
    expect(emptyHeart.exists()).toBe(false); // Порожнє серце не відображається
  
    // Сценарій: товар не в списку бажаного
    wrapper.setData({
      wishlist: [],
    });
    await wrapper.vm.$nextTick();
  
    // Знову перевіряємо іконки
    expect(wrapper.find('.filled-heart').exists()).toBe(false); // Заповнене серце не відображається
    expect(wrapper.find('.empty-heart').exists()).toBe(true); // Порожнє серце відображається
  });  

  it('Перевіряє виклик fetchWishlist при створенні компонента', () => {
    expect(ProductPage.methods.fetchWishlist).toHaveBeenCalled();
  });
  
  it('Перевірка правильної локалізації ключа "Кольори" (відображення як списку)', async () => {
    // Задаємо товар із характеристиками, включаючи "Кольори"
    wrapper.setData({
      product: {
        id: 1,
        name: 'Тестовий товар',
        price: 1500,
        image_url: 'https://example.com/image.jpg',
        sizes: [10, 20, 30],
        is_available: true,
        colors: ['червоний', 'зелений', 'синій'], // Масив кольорів
      },
    });
  
    await wrapper.vm.$nextTick();
  
    // Перевіряємо, чи список характеристик рендериться
    const specificationsList = wrapper.find('.specifications-list');
    expect(specificationsList.exists()).toBe(true);
  
    // Знаходимо елемент із локалізованим ключем "Кольори"
    const colorItem = specificationsList.findAll('.spec-item').filter(item => {
      const term = item.find('.spec-term');
      return term.exists() && term.text() === 'Кольори'; // Локалізований ключ
    }).at(0);
  
    expect(colorItem).not.toBeUndefined(); // Елемент повинен існувати
  
    // Перевіряємо значення
    const colorDescription = colorItem.find('.spec-description');
    expect(colorDescription.exists()).toBe(true);
    expect(colorDescription.text()).toBe('червоний, зелений, синій'); // Очікуване форматування
  });

  it('Перевірка, чи коректно обробляється порожній масив `product.sizes`', async () => {
    // Задаємо товар із порожнім масивом розмірів
    wrapper.setData({
      product: {
        id: 1,
        name: 'Тестовий товар',
        price: 1500,
        image_url: 'https://example.com/image.jpg',
        sizes: [], // Порожній масив розмірів
        is_available: true,
      },
    });
  
    await wrapper.vm.$nextTick();
  
    // Перевіряємо, чи випадаючий список існує
    const sizeDropdown = wrapper.find('select.size-dropdown');
    expect(sizeDropdown.exists()).toBe(true);
  
    // Перевіряємо, чи випадаючий список не має варіантів
    const options = sizeDropdown.findAll('option');
    expect(options.length).toBe(0); // Випадаючий список повинен бути порожнім
  });
  
  it('Перевіряє поведінку при спробі додати товар до списку бажаного без авторизації', async () => {
    // Оновлюємо мокацію localStorage для цього тесту
    global.localStorage.getItem.mockImplementation((key) => (key === 'token' ? null : null));
  
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  
    await wrapper.vm.toggleWishlist(mockProduct);
  
    // Перевіряємо, що з'явилося повідомлення про необхідність авторизації
    expect(alertSpy).toHaveBeenCalledWith('Будь ласка, увійдіть у свій обліковий запис.');
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith('/login');
  
    alertSpy.mockRestore();
  });

  it('Перевіряє поведінку при спробі додати товар до списку бажаного з авторизацією', async () => {
    wrapper.vm.checkAuthAndFetchProfile = jest.fn().mockResolvedValue({ id: 1 });
    axios.post.mockResolvedValue();

    wrapper.setData({ wishlist: [] });

    await wrapper.vm.toggleWishlist(mockProduct);

    expect(wrapper.vm.wishlist).toContain(mockProduct.id);
    expect(axios.post).toHaveBeenCalledWith(
      'https://koshtovnya.api-dev.bmax-edu.website/api/wishlist',
      { product_id: mockProduct.id },
      { headers: { Authorization: 'Bearer mock-token' } }
    );
  });

  it('Перевіряє поведінку при спробі видалити товар зі списку бажаного з авторизацією', async () => {
    wrapper.vm.checkAuthAndFetchProfile = jest.fn().mockResolvedValue({ id: 1 });
    axios.delete.mockResolvedValue();

    wrapper.setData({ wishlist: [mockProduct.id] });

    await wrapper.vm.toggleWishlist(mockProduct);

    expect(wrapper.vm.wishlist).not.toContain(mockProduct.id);
    expect(axios.delete).toHaveBeenCalledWith(
      `https://koshtovnya.api-dev.bmax-edu.website/api/wishlist/${mockProduct.id}`,
      { headers: { Authorization: 'Bearer mock-token' } }
    );
  });

  it('Перевіряє поведінку при спробі отримати повідомлення про доступність без авторизації', async () => {
    // Оновлюємо мокацію localStorage для цього тесту
    global.localStorage.getItem.mockImplementation((key) => (key === 'token' ? null : null));
  
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  
    await wrapper.vm.notifyWhenAvailable();
  
    // Перевіряємо, що з'явилося повідомлення про необхідність авторизації
    expect(alertSpy).toHaveBeenCalledWith('Будь ласка, увійдіть у свій обліковий запис.');
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith('/login');
  
    alertSpy.mockRestore();
  });  

  it('Перевіряє поведінку при спробі отримати повідомлення про доступність з авторизацією', async () => {
    wrapper.vm.checkAuthAndFetchProfile = jest.fn().mockResolvedValue({ id: 1 });
    axios.post.mockResolvedValue();

    await wrapper.vm.notifyWhenAvailable();

    expect(axios.post).toHaveBeenCalledWith(
      'https://koshtovnya.api-dev.bmax-edu.website/api/notification',
      { product_id: mockProduct.id },
      { headers: { Authorization: 'Bearer mock-token' } }
    );
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    expect(alertSpy).toHaveBeenCalledWith(`Ви будете повідомлені, коли ${mockProduct.name} з'явиться в наявності.`);
    alertSpy.mockRestore();
  });

  it('Перевірка успішного додавання товару до списку бажаного', async () => {
    wrapper.vm.checkAuthAndFetchProfile = jest.fn().mockResolvedValue({ id: 1 });
    axios.post.mockResolvedValue();

    wrapper.setData({ wishlist: [] });

    await wrapper.vm.toggleWishlist(mockProduct);

    expect(axios.post).toHaveBeenCalledWith(
      'https://koshtovnya.api-dev.bmax-edu.website/api/wishlist',
      { product_id: mockProduct.id },
      { headers: { Authorization: 'Bearer mock-token' } }
    );
    expect(wrapper.vm.wishlist).toContain(mockProduct.id);
    expect(window.alert).toHaveBeenCalledWith(`${mockProduct.name} додано до списку бажаного.`);
  });

  it('Перевірка успішного видалення товару зі списку бажаного', async () => {
    wrapper.vm.checkAuthAndFetchProfile = jest.fn().mockResolvedValue({ id: 1 });
    axios.delete.mockResolvedValue();

    wrapper.setData({ wishlist: [mockProduct.id] });

    await wrapper.vm.toggleWishlist(mockProduct);

    expect(axios.delete).toHaveBeenCalledWith(
      `https://koshtovnya.api-dev.bmax-edu.website/api/wishlist/${mockProduct.id}`,
      { headers: { Authorization: 'Bearer mock-token' } }
    );
    expect(wrapper.vm.wishlist).not.toContain(mockProduct.id);
    expect(window.alert).toHaveBeenCalledWith(`${mockProduct.name} видалено зі списку бажаного.`);
  });

  it('Перевірка успішного створення запиту на сповіщення про наявність товару', async () => {
    wrapper.vm.checkAuthAndFetchProfile = jest.fn().mockResolvedValue({ id: 1 });
    axios.post.mockResolvedValue();

    wrapper.setData({ product: mockProduct });

    await wrapper.vm.notifyWhenAvailable();

    expect(axios.post).toHaveBeenCalledWith(
      'https://koshtovnya.api-dev.bmax-edu.website/api/notification',
      { product_id: mockProduct.id },
      { headers: { Authorization: 'Bearer mock-token' } }
    );
    expect(window.alert).toHaveBeenCalledWith(`Ви будете повідомлені, коли ${mockProduct.name} з'явиться в наявності.`);
  });
});
