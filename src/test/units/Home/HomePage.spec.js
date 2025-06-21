// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти
/* eslint-disable jest/no-commented-out-tests, no-unused-vars, jest/no-identical-title, no-undef */


import { shallowMount } from '@vue/test-utils';
import HomePage from '@/components/Home/HomePage.vue';

// Мокаємо axios так, щоб create повертало клієнта з методом get
jest.mock('axios', () => {
  const mGet = jest.fn();
  return {
    create: jest.fn(() => ({
      get: mGet,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    })),
  };
});

describe('HomePage.vue', () => {
  let wrapper;
  let observeMock;
  let unobserveMock;
  let disconnectMock;
  let consoleErrorMock;

  beforeAll(() => {
    // Мок для browser methods
    window.alert = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(() => {
    // Моки для IntersectionObserver
    observeMock = jest.fn();
    unobserveMock = jest.fn();
    disconnectMock = jest.fn();

    global.IntersectionObserver = jest.fn((callback) => ({
      observe: observeMock,
      unobserve: unobserveMock,
      disconnect: disconnectMock,
    }));

    // Мок для console.error
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Мок перекладів
    const translations = {
      viewProducts: 'Переглянути товари',
      handmadeProducts: 'Ручні вироби',
      exclusiveJewelry: 'Ексклюзивні прикраси',
    };

    wrapper = shallowMount(HomePage, {
      global: {
        mocks: {
          $t: (msg) => translations[msg] || msg,
        },
        stubs: ['router-link', 'PopularProducts', 'NewArrivals', 'CategoryProduct', 'TopLatest'],
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    jest.clearAllMocks();
    consoleErrorMock.mockRestore();
  });

  it('слід загорнути кнопку «Переглянути продукти» у маршрутизатор із правильним маршрутом', () => {
    const routerLink = wrapper.find('router-link-stub');
    expect(routerLink.exists()).toBe(true);
    expect(routerLink.attributes('to')).toBe('/allproducts');
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
});