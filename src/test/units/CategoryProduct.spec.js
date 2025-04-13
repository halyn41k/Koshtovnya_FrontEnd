import { shallowMount } from '@vue/test-utils';
import CategoryProduct from '../../components/CategoryProduct.vue';

describe('CategoryProduct.vue', () => {
  let wrapper;

  beforeEach(() => {
    // Очищення localStorage та моків перед кожним тестом
    localStorage.clear();
    jest.clearAllMocks();

    // Мок для fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              { id: 1, name: 'Category 1', image_url: 'test-url-1' },
              { id: 2, name: 'Category 2', image_url: 'test-url-2' },
            ],
          }),
      })
    );

    // Ініціалізація wrapper з shallowMount
    wrapper = shallowMount(CategoryProduct, {
      global: {
        mocks: {
          $t: (msg) => msg, // Мок для i18n
        },
        stubs: {
          'router-link': {
            template: '<a><slot /></a>', // Заглушка для router-link
          },
        },
      },
    });
  });

  afterEach(() => {
    // Розмонтування wrapper і видалення мока fetch
    if (wrapper) {
      wrapper.unmount();
    }
    delete global.fetch;
  });

  it('Коректне застосування стилів для заголовка секції', () => {
    // Знаходимо заголовок секції
    const sectionTitle = wrapper.find('.section-title');

    // Перевіряємо, чи існує елемент із класом section-title
    expect(sectionTitle.exists()).toBe(true);

    // Перевірка наявності класів, що відповідають стилю
    expect(sectionTitle.classes()).toContain('section-title');
  });

  it('Коректне відображення шрифтів KyivType Titling', () => {
    // Знаходимо заголовок секції
    const sectionTitle = wrapper.find('.section-title');

    // Перевіряємо, чи існує елемент із класом section-title
    expect(sectionTitle.exists()).toBe(true);

    // Перевіряємо, чи має клас, що відповідає KyivType Titling
    expect(sectionTitle.classes()).toContain('section-title');
  });

  it('Відображення заголовка секції (Shop By Category)', () => {
    // Знаходимо заголовок секції
    const sectionTitle = wrapper.find('.section-title');
  
    // Перевіряємо, чи існує елемент із класом section-title
    expect(sectionTitle.exists()).toBe(true);
  
    // Перевіряємо, чи текст відповідає очікуваному
    expect(sectionTitle.text()).toBe('shopByCategory');
  });

  it('Коректне відображення елементів категорій у вигляді сітки', () => {
    // Знаходимо контейнер категорій
    const categoryGrid = wrapper.find('.category-grid');
  
    // Перевіряємо, чи існує елемент із класом category-grid
    expect(categoryGrid.exists()).toBe(true);
  
    // Перевіряємо кількість елементів категорій у сітці
    const categoryItems = categoryGrid.findAll('.category-item');
    expect(categoryItems.length).toBe(wrapper.vm.categories.length);
  
    // Перевіряємо, чи кожен елемент має клас category-item
    categoryItems.forEach((item) => {
      expect(item.classes()).toContain('category-item');
    });
  });

  it('отримує дані категорій із замоканого API та відображає їх правильно', async () => {
    await wrapper.vm.fetchCategories();
    await wrapper.vm.$nextTick();
  
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('https://koshtovnya.api-dev.bmax-edu.website/api/categories');
  
    expect(wrapper.vm.categories).toEqual([
      { id: 1, name: 'Category 1', image_url: 'test-url-1', url: '/bracelets' },
      { id: 2, name: 'Category 2', image_url: 'test-url-2', url: '/herdany' },
    ]);
  
    const categoryItems = wrapper.findAll('.category-item');
    expect(categoryItems.length).toBe(2);
    expect(categoryItems[0].find('img').attributes('src')).toBe('test-url-1');
    expect(categoryItems[0].find('.category-title').text()).toBe('Category 1');
    expect(categoryItems[1].find('img').attributes('src')).toBe('test-url-2');
    expect(categoryItems[1].find('.category-title').text()).toBe('Category 2');
  });   
  
  it('Перевірка, що URL кожної категорії коректно додається під час мапінгу даних', async () => {
    // Очікуваний масив категорій з коректними URL
    const expectedCategories = [
      { id: 1, name: 'Category 1', image_url: 'test-url-1', url: '/bracelets' },
      { id: 2, name: 'Category 2', image_url: 'test-url-2', url: '/herdany' },
    ];
  
    // Виклик fetchCategories для отримання даних
    await wrapper.vm.fetchCategories();
  
    // Перевіряємо, чи дані категорій відповідають очікуваним
    expect(wrapper.vm.categories).toEqual(expectedCategories);
  
    // Перевіряємо, чи кожна категорія має коректний URL
    wrapper.vm.categories.forEach((category, index) => {
      expect(category.url).toBe(expectedCategories[index].url);
    });
  });
  
  it('Перевірка коректності підвантаження зображень категорій (lazy loading)', async () => {
    // Очікуємо, що fetch буде викликаний один раз
    expect(global.fetch).toHaveBeenCalledTimes(1);
  
    // Чекаємо завершення асинхронного виклику fetchCategories
    await wrapper.vm.$nextTick();
  
    // Отримуємо всі категорії
    const categoryImages = wrapper.findAll('.category-image');
  
    // Перевіряємо кількість зображень
    expect(categoryImages.length).toBe(wrapper.vm.categories.length);
  
    // Перевіряємо, що кожне зображення має атрибут loading="lazy"
    categoryImages.forEach((img) => {
      expect(img.attributes('loading')).toBe('lazy');
    });
  });
  
  it('API повертає масив категорій із неповними даними (без image_url або name)', async () => {
    // Імітуємо, що API повертає масив категорій із даними, де поля містять значення
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('application/json'),
        },
        json: () => Promise.resolve({
          data: [
            { id: 1, name: 'Category 1', image_url: 'test-url-1' }, // Повне значення
            { id: 2, name: 'Category 2', image_url: 'test-url-2' }, // Повне значення
          ],
        }),
      })
    );
  
    // Викликаємо fetchCategories і чекаємо результату
    await wrapper.vm.$nextTick();
  
    // Очікуємо, що компонент використовує API-відповідь без змін
    expect(wrapper.vm.categories).toEqual([
      { id: 1, name: 'Category 1', image_url: 'test-url-1', url: '/bracelets' },
      { id: 2, name: 'Category 2', image_url: 'test-url-2', url: '/herdany' },
    ]);
  
    // Перевіряємо, що DOM відображає ці дані
    const categoryItems = wrapper.findAll('.category-item');
    expect(categoryItems.length).toBe(2);
  
    // Перевіряємо перший елемент
    expect(categoryItems[0].find('img').attributes('src')).toBe('test-url-1');
    expect(categoryItems[0].find('.category-title').text()).toBe('Category 1');
  
    // Перевіряємо другий елемент
    expect(categoryItems[1].find('img').attributes('src')).toBe('test-url-2');
    expect(categoryItems[1].find('.category-title').text()).toBe('Category 2');
  });  
  
  it('Відображення зображення, назви, та стрілки у кожному елементі категорії', async () => {
    // Чекаємо завершення асинхронного виклику fetchCategories
    await wrapper.vm.$nextTick();
  
    // Отримуємо всі елементи категорій
    const categoryItems = wrapper.findAll('.category-item');
  
    // Перевіряємо, що всі елементи категорій правильно відображаються
    categoryItems.forEach((item, index) => {
      // Перевірка наявності зображення
      const image = item.find('.category-image');
      expect(image.exists()).toBe(true);
      expect(image.attributes('src')).toBe(wrapper.vm.categories[index].image_url);
  
      // Перевірка наявності назви
      const title = item.find('.category-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe(wrapper.vm.categories[index].name);
  
      // Перевірка наявності стрілки
      const arrow = item.find('.arrow');
      expect(arrow.exists()).toBe(true);
      expect(arrow.text()).toBe('→');
    });
  });
  
  it('Відображення квадратів у перших, третіх і п’ятих категоріях', async () => {
    // Чекаємо завершення асинхронного виклику fetchCategories
    await wrapper.vm.$nextTick();
  
    // Отримуємо всі елементи категорій
    const categoryItems = wrapper.findAll('.category-item');
  
    // Перевіряємо, що кількість категорій відповідає кількості у масиві
    expect(categoryItems.length).toBe(wrapper.vm.categories.length);
  
    // Перевіряємо першу, третю та п’яту категорії на наявність квадратів
    [0, 2, 4].forEach((index) => {
      // Перевіряємо, чи існує категорія за цим індексом
      if (categoryItems[index]) {
        const lightSquare = categoryItems[index].find('.light-square');
        const darkSquare = categoryItems[index].find('.dark-square');
  
        // Перевірка наявності квадратів
        expect(lightSquare.exists()).toBe(true);
        expect(darkSquare.exists()).toBe(true);
      }
    });
  
    // Перевіряємо, що у інших категорій квадратів немає
    [1, 3, 5].forEach((index) => {
      // Перевіряємо, чи існує категорія за цим індексом
      if (categoryItems[index]) {
        const lightSquare = categoryItems[index].find('.light-square');
        const darkSquare = categoryItems[index].find('.dark-square');
  
        // Перевірка відсутності квадратів
        expect(lightSquare.exists()).toBe(false);
        expect(darkSquare.exists()).toBe(false);
      }
    });
  });

  it('отримує категорії із кешу, якщо вони є', async () => {
    // Записуємо категорії у localStorage
    localStorage.setItem(
      'categories',
      JSON.stringify([
        { id: 1, name: 'Кешована категорія', image_url: 'cached-url', url: '/cached-url' },
      ])
    );
  
    wrapper = shallowMount(CategoryProduct, {
      global: {
        mocks: { $t: (msg) => msg },
        stubs: { 'router-link': { template: '<a><slot /></a>' } },
      },
    });
  
    await wrapper.vm.$nextTick();
  
    // Перевірка використання кешованих категорій
    expect(wrapper.vm.categories).toEqual([
      { id: 1, name: 'Кешована категорія', image_url: 'cached-url', url: '/cached-url' },
    ]);
  
    // Перевірка відображення кешованих категорій
    const categoryItems = wrapper.findAll('.category-item');
    expect(categoryItems.length).toBe(1);
    expect(categoryItems[0].find('.category-title').text()).toBe('Кешована категорія');
  });

  
});
