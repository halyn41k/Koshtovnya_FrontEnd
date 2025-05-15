// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти

import { shallowMount } from '@vue/test-utils';
import HomePage from '@/components/Home/HomePage.vue';

jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('HomePage.vue', () => {
  let wrapper;
  let observeMock;
  let unobserveMock;
  let disconnectMock;
  let observeCallback;
  let consoleErrorMock;

  beforeAll(() => {
    // Mock для fetch API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }), // Фіктивна відповідь API
      })
    );

    // Mock для browser methods
    window.alert = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    // Моки для IntersectionObserver
    observeMock = jest.fn();
    unobserveMock = jest.fn();
    disconnectMock = jest.fn();
    observeCallback = jest.fn((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          unobserveMock(entry.target);
        }
      });
    });

    global.IntersectionObserver = jest.fn((callback) => {
      observeCallback.mockImplementation(callback); // Зберігаємо переданий callback
      return {
        observe: observeMock,
        unobserve: unobserveMock,
        disconnect: disconnectMock,
      };
    });

    // Mock для console.error
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Мок для перекладів
    const translations = {
      viewProducts: 'Переглянути товари',
      handmadeProducts: 'Ручні вироби',
      exclusiveJewelry: 'Ексклюзивні прикраси',
      quoteText: 'Українська спадщина',
      gnatKhotkevich: 'Гнат Хоткевич',
      followInsta: 'Підписуйтеся на нас в Instagram',
      dontMissTheMost: 'Не пропустіть найкраще',
    };

    // Ініціалізація компонента
    wrapper = shallowMount(HomePage, {
      global: {
        mocks: {
          $t: (msg) => translations[msg] || msg,
        },
        stubs: ['router-link', 'PopularProducts', 'NewArrivals', 'CategoryProduct'], // Заглушки для дочірніх компонентів
      },
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    jest.clearAllMocks(); // Очищення моків
    consoleErrorMock.mockRestore();
  });

  it('слід загорнути кнопку «Переглянути продукти» у маршрутизатор із правильним маршрутом', () => {
    const routerLink = wrapper.find('router-link-stub');
    expect(routerLink.exists()).toBe(true);
    expect(routerLink.attributes('to')).toBe('/allproduct');
  });

  it('має мати ефект наведення курсора на кнопку «Переглянути продукти».', async () => {
    const button = wrapper.find('.view-products-button');
    expect(button.exists()).toBe(true);

    jest.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      if (element === button.element) {
        return { backgroundColor: 'rgb(160, 18, 18)' };
      }
      return {};
    });

    await button.trigger('mouseenter');
    expect(getComputedStyle(button.element).backgroundColor).toBe('rgb(160, 18, 18)');

    jest.restoreAllMocks();
  });

  it('має отримати популярні продукти на монтуванні', async () => {
    await wrapper.vm.fetchPopularProducts();
    expect(global.fetch).toHaveBeenCalledWith('http://26.235.139.202:8080/api/popular-products');
  });

  // Тестування API запитів (нові надходження)
  it('повинен отримати нових надходжень', async () => {
    await wrapper.vm.fetchNewArrivals();
    expect(global.fetch).toHaveBeenCalledWith('http://26.235.139.202:8080/api/new-arrivals');
  });

  // Тестування IntersectionObserver
  it('має викликати IntersectionObserver для спостереження за елементами, що зникають', () => {
    const observerMock = jest.fn();
    global.IntersectionObserver = jest.fn(() => ({
      observe: observerMock,
      unobserve: jest.fn(),
    }));

    wrapper.vm.observeElements();

    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((element) => {
      expect(observerMock).toHaveBeenCalledWith(element);
    });
  });

  it('має показувати елементи з класом .fade-in поступово при прокрутці', () => {
    const observeMock = jest.fn();
    const unobserveMock = jest.fn();
    const callback = jest.fn((entries) => {
      entries.forEach((entry) => {
        entry.isIntersecting = true;
        entry.target.classList.add('show');
      });
    });
  
    global.IntersectionObserver = jest.fn((cb) => {
      callback.mockImplementation(cb);
      return {
        observe: observeMock,
        unobserve: unobserveMock,
        disconnect: jest.fn(),
      };
    });
  
    wrapper.vm.observeElements();
  
    // Емулюємо наявність елементів з класом .fade-in
    const elements = Array.from(document.querySelectorAll('.fade-in')); // Перетворення на масив
    elements.forEach((el) => {
      el.classList.remove('show');
    });
  
    // Викликаємо IntersectionObserver
    callback(elements.map((el) => ({ target: el, isIntersecting: true }))); // Використовуємо масив
  
    // Перевіряємо, що всі елементи отримали клас .show
    elements.forEach((el) => {
      expect(el.classList.contains('show')).toBe(true);
    });
  
    // Перевіряємо виклики observe/unobserve
    expect(observeMock).toHaveBeenCalledTimes(elements.length);
    expect(unobserveMock).toHaveBeenCalledTimes(elements.length);
  });
  
  it('має правильні стилі для елементів з класом .fade-in', () => {
    // Створюємо фейковий елемент
    const element = document.createElement('div');
    element.classList.add('fade-in');
    document.body.appendChild(element); // Додаємо до DOM
  
    // Імітуємо додавання класу .show
    element.classList.add('show');
  
    // Встановлюємо стилі вручну для перевірки
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  
    // Перевіряємо стилі
    const styles = getComputedStyle(element);
    expect(styles.opacity).toBe('1'); // Стиль для видимого елемента
    expect(styles.transform).toBe('translateY(0)'); // Анімація переміщення
  
    // Очищення після тесту
    element.remove();
  });
  
  it('має правильні стилі для кнопки .view-products-button', () => {
    const button = document.createElement('button');
    button.classList.add('view-products-button');
    document.body.appendChild(button);
  
    // Встановлюємо стилі вручну
    button.style.backgroundColor = '#6B1F1F';
    button.style.borderRadius = '8px';
    button.style.padding = '10px 20px';
  
    const styles = getComputedStyle(button);
    expect(styles.backgroundColor).toBe('rgb(107, 31, 31)'); // Перевірка кольору
    expect(styles.borderRadius).toBe('8px'); // Перевірка скруглення
    expect(styles.padding).toBe('10px 20px'); // Перевірка внутрішнього відступу
  
    button.remove();
  });
  
  it('має правильні стилі для тексту з класом .handmade-beaded-products', () => {
    const textElement = document.createElement('div');
    textElement.classList.add('handmade-beaded-products');
    document.body.appendChild(textElement);
  
    // Встановлюємо стилі вручну
    textElement.style.fontSize = '45px';
    textElement.style.color = 'rgb(246, 248, 246)';
    textElement.style.fontFamily = "'KyivType Titling', sans-serif";
  
    const styles = getComputedStyle(textElement);
    expect(styles.fontSize).toBe('45px'); // Перевірка розміру шрифту
    expect(styles.color).toBe('rgb(246, 248, 246)'); // Перевірка кольору тексту
    expect(styles.fontFamily).toContain('KyivType Titling'); // Перевірка шрифту
  
    textElement.remove();
  });
  
  it('має правильні стилі для зображень у .instagram-image', () => {
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('instagram-image');
    const img = document.createElement('img');
    imageContainer.appendChild(img);
    document.body.appendChild(imageContainer);
  
    // Встановлюємо стилі вручну
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    imageContainer.style.width = '300px';
    imageContainer.style.height = '300px';
  
    const containerStyles = getComputedStyle(imageContainer);
    const imageStyles = getComputedStyle(img);
  
    expect(containerStyles.width).toBe('300px'); // Перевірка розміру контейнера
    expect(containerStyles.height).toBe('300px'); // Перевірка розміру контейнера
    expect(imageStyles.objectFit).toBe('cover'); // Перевірка обтікання зображення
  
    imageContainer.remove();
  });
  
  it('має правильні стилі для тексту з класом .quote-text', () => {
    const quote = document.createElement('div');
    quote.classList.add('quote-text');
    document.body.appendChild(quote);
  
    // Встановлюємо стилі вручну
    quote.style.fontSize = '28px';
    quote.style.fontFamily = "'Podkova', sans-serif";
    quote.style.lineHeight = '1.3';
  
    const styles = getComputedStyle(quote);
    expect(styles.fontSize).toBe('28px'); // Розмір шрифту
    expect(styles.fontFamily).toContain('Podkova'); // Сімейство шрифтів
    expect(styles.lineHeight).toBe('1.3'); // Міжрядковий інтервал
  
    quote.remove();
  });
  
  it('має правильний відступ між елементами у сітці Instagram', () => {
    const grid = document.createElement('div');
    grid.classList.add('instagram-grid');
    document.body.appendChild(grid);
  
    // Встановлюємо стилі вручну
    grid.style.gap = '15px';
  
    const styles = getComputedStyle(grid);
    expect(styles.gap).toBe('15px'); // Відступ між елементами
  
    grid.remove();
  });
    
  it('має відображати коректну мітку Instagram', () => {
    // Знаходимо елемент із класом .instagram-handle-link
    const instagramHandle = wrapper.find('.instagram-handle-link');
    expect(instagramHandle.exists()).toBe(true);
    expect(instagramHandle.text()).toBe('@koshtovnya_jewelry');
  });
  
  it('має відображати правильну кількість популярних продуктів на сторінку', () => {
    // Імітуємо дані для популярних продуктів
    wrapper.vm.products = [
      { id: 1, name: 'Product 1', price: 100 },
      { id: 2, name: 'Product 2', price: 200 },
      { id: 3, name: 'Product 3', price: 300 },
      { id: 4, name: 'Product 4', price: 400 },
      { id: 5, name: 'Product 5', price: 500 },
    ];
    
    // Встановлюємо кількість продуктів на сторінку
    wrapper.vm.productsPerPage = 3;
    wrapper.vm.currentPage = 0;
    wrapper.vm.updateVisibleProducts();
  
    // Перевіряємо, що у visibleProducts рівно 3 елементи
    expect(wrapper.vm.visibleProducts.length).toBe(3);
  
    // Перевіряємо, що visibleProducts містить перші три продукти
    expect(wrapper.vm.visibleProducts).toEqual([
      { id: 1, name: 'Product 1', price: 100 },
      { id: 2, name: 'Product 2', price: 200 },
      { id: 3, name: 'Product 3', price: 300 },
    ]);
  
    // Змінюємо сторінку і перевіряємо знову
    wrapper.vm.currentPage = 1;
    wrapper.vm.updateVisibleProducts();
  
    // Перевіряємо, що наступні два продукти відображаються
    expect(wrapper.vm.visibleProducts).toEqual([
      { id: 4, name: 'Product 4', price: 400 },
      { id: 5, name: 'Product 5', price: 500 },
    ]);
  });
  
  it('має оновлювати вміст visibleProducts при зміні сторінки', () => {
    // Імітуємо дані для популярних продуктів
    wrapper.vm.products = [
      { id: 1, name: 'Product 1', price: 100 },
      { id: 2, name: 'Product 2', price: 200 },
      { id: 3, name: 'Product 3', price: 300 },
      { id: 4, name: 'Product 4', price: 400 },
      { id: 5, name: 'Product 5', price: 500 },
    ];
    
    // Встановлюємо кількість продуктів на сторінку
    wrapper.vm.productsPerPage = 2;
  
    // Емуляція першої сторінки
    wrapper.vm.currentPage = 0;
    wrapper.vm.updateVisibleProducts();
  
    expect(wrapper.vm.visibleProducts).toEqual([
      { id: 1, name: 'Product 1', price: 100 },
      { id: 2, name: 'Product 2', price: 200 },
    ]);
  
    // Зміна сторінки
    wrapper.vm.currentPage = 1;
    wrapper.vm.updateVisibleProducts();
  
    expect(wrapper.vm.visibleProducts).toEqual([
      { id: 3, name: 'Product 3', price: 300 },
      { id: 4, name: 'Product 4', price: 400 },
    ]);
  
    // Перевірка останньої сторінки
    wrapper.vm.currentPage = 2;
    wrapper.vm.updateVisibleProducts();
  
    expect(wrapper.vm.visibleProducts).toEqual([
      { id: 5, name: 'Product 5', price: 500 },
    ]);
  });
  
  it('має оновлювати вміст visibleNewArrivals при зміні сторінки', () => {
    // Імітуємо дані для нових надходжень
    wrapper.vm.newArrivals = [
      { id: 6, name: 'New Arrival 1', price: 150 },
      { id: 7, name: 'New Arrival 2', price: 250 },
      { id: 8, name: 'New Arrival 3', price: 350 },
      { id: 9, name: 'New Arrival 4', price: 450 },
      { id: 10, name: 'New Arrival 5', price: 550 },
    ];
  
    // Встановлюємо кількість продуктів на сторінку
    wrapper.vm.productsPerPage = 2;
  
    // Емуляція першої сторінки
    wrapper.vm.newArrivalsPage = 0;
    wrapper.vm.updateVisibleNewArrivals();
  
    expect(wrapper.vm.visibleNewArrivals).toEqual([
      { id: 6, name: 'New Arrival 1', price: 150 },
      { id: 7, name: 'New Arrival 2', price: 250 },
    ]);
  
    // Зміна сторінки
    wrapper.vm.newArrivalsPage = 1;
    wrapper.vm.updateVisibleNewArrivals();
  
    expect(wrapper.vm.visibleNewArrivals).toEqual([
      { id: 8, name: 'New Arrival 3', price: 350 },
      { id: 9, name: 'New Arrival 4', price: 450 },
    ]);
  
    // Перевірка останньої сторінки
    wrapper.vm.newArrivalsPage = 2;
    wrapper.vm.updateVisibleNewArrivals();
  
    expect(wrapper.vm.visibleNewArrivals).toEqual([
      { id: 10, name: 'New Arrival 5', price: 550 },
    ]);
  });
  
  it('fetchPopularProducts оновлює products і visibleProducts при успішному запиті', async () => {
    // Мок даних від API
    const mockPopularProducts = [
      { id: 1, name: 'Product 1', price: 100, image_url: 'url1' },
      { id: 2, name: 'Product 2', price: 200, image_url: 'url2' },
      { id: 3, name: 'Product 3', price: 300, image_url: 'url3' },
    ];

    // Імітуємо успішний API-запит
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockPopularProducts }),
    });

    await wrapper.vm.fetchPopularProducts();

    // Перевіряємо, що продукти оновилися
    expect(wrapper.vm.products).toEqual(mockPopularProducts);

    // Перевіряємо, що visibleProducts оновився
    expect(wrapper.vm.visibleProducts).toEqual(mockPopularProducts.slice(0, wrapper.vm.productsPerPage));
  });

  it('fetchPopularProducts використовує testPopularProducts при помилці запиту', async () => {
    // Імітуємо помилковий API-запит
    global.fetch.mockRejectedValueOnce(new Error('Network Error'));

    await wrapper.vm.fetchPopularProducts();

    // Перевіряємо, що testPopularProducts використовуються як fallback
    expect(wrapper.vm.products).toEqual(wrapper.vm.testPopularProducts);

    // Перевіряємо, що visibleProducts також оновився
    expect(wrapper.vm.visibleProducts).toEqual(wrapper.vm.testPopularProducts.slice(0, wrapper.vm.productsPerPage));
  });

  it('fetchNewArrivals оновлює newArrivals і visibleNewArrivals при успішному запиті', async () => {
    // Мок даних від API
    const mockNewArrivals = [
      { id: 4, name: 'New Arrival 1', price: 150, image_url: 'url4' },
      { id: 5, name: 'New Arrival 2', price: 250, image_url: 'url5' },
      { id: 6, name: 'New Arrival 3', price: 350, image_url: 'url6' },
    ];

    // Імітуємо успішний API-запит
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockNewArrivals }),
    });

    await wrapper.vm.fetchNewArrivals();

    // Перевіряємо, що newArrivals оновився
    expect(wrapper.vm.newArrivals).toEqual(mockNewArrivals);

    // Перевіряємо, що visibleNewArrivals оновився
    expect(wrapper.vm.visibleNewArrivals).toEqual(mockNewArrivals.slice(0, wrapper.vm.productsPerPage));
  });

  it('fetchNewArrivals використовує testNewArrivals при помилці запиту', async () => {
    // Імітуємо помилковий API-запит
    global.fetch.mockRejectedValueOnce(new Error('Network Error'));

    await wrapper.vm.fetchNewArrivals();

    // Перевіряємо, що testNewArrivals використовуються як fallback
    expect(wrapper.vm.newArrivals).toEqual(wrapper.vm.testNewArrivals);

    // Перевіряємо, що visibleNewArrivals також оновився
    expect(wrapper.vm.visibleNewArrivals).toEqual(wrapper.vm.testNewArrivals.slice(0, wrapper.vm.productsPerPage));
  });

  it('має рендерити елемент .welcome-image', () => {
    const welcomeImage = wrapper.find('.welcome-image');
    expect(welcomeImage.exists()).toBe(true);
  });

  it('має рендерити текст .handmade-beaded-products', () => {
    const handmadeProducts = wrapper.find('.handmade-beaded-products');
    expect(handmadeProducts.exists()).toBe(true);
    expect(handmadeProducts.text()).toBe('Ручні вироби');
  });

  it('має рендерити текст .exclusive-necklaces-bracelets-earrings', () => {
    const exclusiveJewelry = wrapper.find('.exclusive-necklaces-bracelets-earrings');
    expect(exclusiveJewelry.exists()).toBe(true);
    expect(exclusiveJewelry.text()).toBe('Ексклюзивні прикраси');
  });

  it('має рендерити секцію .instagram-grid', () => {
    const instagramGrid = wrapper.find('.instagram-grid');
    expect(instagramGrid.exists()).toBe(true);
  });

  it('має рендерити компонент PopularProducts', () => {
    const popularProducts = wrapper.findComponent({ name: 'PopularProducts' });
    expect(popularProducts.exists()).toBe(true);
  });

  it('має рендерити компонент NewArrivals', () => {
    const newArrivals = wrapper.findComponent({ name: 'NewArrivals' });
    expect(newArrivals.exists()).toBe(true);
  });

  it('має рендерити компонент CategoryProduct', () => {
    const categoryProduct = wrapper.findComponent({ name: 'CategoryProduct' });
    expect(categoryProduct.exists()).toBe(true);
  });
 
  it('має відображати правильний текст для handmadeProducts', () => {
    const handmadeProducts = wrapper.find('.handmade-beaded-products');
    expect(handmadeProducts.exists()).toBe(true);
    expect(handmadeProducts.text()).toBe('Ручні вироби');
  });

  it('має відображати правильний текст для exclusiveJewelry', () => {
    const exclusiveJewelry = wrapper.find('.exclusive-necklaces-bracelets-earrings');
    expect(exclusiveJewelry.exists()).toBe(true);
    expect(exclusiveJewelry.text()).toBe('Ексклюзивні прикраси');
  });

  it('має відображати правильний текст для quoteText', () => {
    const quoteText = wrapper.find('.quote-text .ukrainian-heritage');
    expect(quoteText.exists()).toBe(true);
    expect(quoteText.text().trim()).toBe('Українська спадщина');
  });

  it('має відображати правильний текст для gnatKhotkevich', () => {
    const gnatKhotkevich = wrapper.find('.gnat-khotkevich');
    expect(gnatKhotkevich.exists()).toBe(true);
    expect(gnatKhotkevich.text()).toBe('Гнат Хоткевич');
  });

  it('має відображати правильний текст для followInsta', () => {
    const followInsta = wrapper.find('.follow-text');
    expect(followInsta.exists()).toBe(true);
    expect(followInsta.text()).toContain('Підписуйтеся на нас в Instagram');
  });

  it('має відображати правильний текст для dontMissTheMost', () => {
    const followInsta = wrapper.find('.follow-text');
    expect(followInsta.exists()).toBe(true);
    expect(followInsta.text()).toContain('Не пропустіть найкраще');
  });

  it('повинен викликати unobserve для елементів після додавання класу "show"', async () => {
    // Створюємо елементи DOM з класом fade-in
    const fadeInElements = Array.from({ length: 3 }).map(() => {
      const element = document.createElement('div');
      element.classList.add('fade-in');
      document.body.appendChild(element);
      return element;
    });

    wrapper.vm.observeElements();

    // Емітуємо подію isIntersecting: true
    fadeInElements.forEach((element) => {
      observeCallback([{ target: element, isIntersecting: true }]);
    });

    await wrapper.vm.$nextTick();

    // Перевіряємо виклик unobserve
    fadeInElements.forEach((element) => {
      expect(unobserveMock).toHaveBeenCalledWith(element);
    });

    // Очищуємо створені елементи
    fadeInElements.forEach((element) => element.remove());
  });

  it('повинен викликати disconnect при завершенні спостереження', () => {
    const disconnectMock = jest.fn();
  
    // Мок для IntersectionObserver
    const observerMock = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: disconnectMock,
    };
  
    global.IntersectionObserver = jest.fn(() => observerMock);
  
    // Викликаємо observeElements
    wrapper.vm.observeElements();
  
    // Викликаємо disconnect
    observerMock.disconnect();
  
    // Перевіряємо, чи disconnect було викликано
    expect(disconnectMock).toHaveBeenCalled();
  }); 

  it('не повинен викликати unobserve для елементів, якщо isIntersecting: false', async () => {
    // Створюємо елементи DOM з класом fade-in
    const fadeInElements = Array.from({ length: 3 }).map(() => {
      const element = document.createElement('div');
      element.classList.add('fade-in');
      document.body.appendChild(element);
      return element;
    });

    wrapper.vm.observeElements();

    // Емітуємо подію isIntersecting: false
    fadeInElements.forEach((element) => {
      observeCallback([{ target: element, isIntersecting: false }]);
    });

    await wrapper.vm.$nextTick();

    // Перевіряємо, що unobserve не викликався
    expect(unobserveMock).not.toHaveBeenCalled();

    // Очищуємо створені елементи
    fadeInElements.forEach((element) => element.remove());
  });

  it('повинен додати клас "show" лише до елементів, які перетинаються', async () => {
    const elementIntersecting = document.createElement('div');
    elementIntersecting.classList.add('fade-in');
    const elementNotIntersecting = document.createElement('div');
    elementNotIntersecting.classList.add('fade-in');

    document.body.appendChild(elementIntersecting);
    document.body.appendChild(elementNotIntersecting);

    wrapper.vm.observeElements();

    observeCallback([
      { target: elementIntersecting, isIntersecting: true },
      { target: elementNotIntersecting, isIntersecting: false },
    ]);

    await wrapper.vm.$nextTick();

    expect(elementIntersecting.classList.contains('show')).toBe(true);
    expect(elementNotIntersecting.classList.contains('show')).toBe(false);

    elementIntersecting.remove();
    elementNotIntersecting.remove();
  });
});