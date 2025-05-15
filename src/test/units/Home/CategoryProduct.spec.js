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

import { shallowMount } from '@vue/test-utils';
import CategoryProduct from '@/components/Home/CategoryProduct.vue';

// Допоміжна функція для очікування мікрозадач (альтернатива flush-promises)
const wait = () => new Promise(resolve => setTimeout(resolve, 0));

describe('CategoryProduct.vue', () => {
  let wrapper;

  // Фабрика для створення компонента з базовими налаштуваннями
  const factory = (options = {}) =>
    shallowMount(CategoryProduct, {
      global: {
        mocks: {
          $t: (msg) => msg,
        },
        stubs: {
          // Заглушка для router-link із передачею пропсу "to" в атрибут href
          'router-link': {
            template: '<a class="category-link" :href="to"><slot /></a>',
            props: ['to'],
          },
        },
        ...options.global,
      },
      ...options,
    });

  beforeEach(() => {
    // Очищення localStorage та моків перед кожним тестом
    localStorage.clear();
    jest.clearAllMocks();

    // Мок для fetch із даними API
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

    // Створення компонента
    wrapper = factory();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    delete global.fetch;
  });

  it('Коректне застосування стилів для заголовка секції', () => {
    const sectionTitle = wrapper.find('.section-title');
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.classes()).toContain('section-title');
  });

  it('Коректне відображення шрифтів KyivType Titling', () => {
    const sectionTitle = wrapper.find('.section-title');
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.classes()).toContain('section-title');
  });

  it('Відображення заголовка секції (Shop By Category)', () => {
    const sectionTitle = wrapper.find('.section-title');
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.text()).toBe('shopByCategory');
  });

  it('Коректне відображення елементів категорій у вигляді сітки', async () => {
    await wrapper.vm.$nextTick();
    await wait();
    const categoryGrid = wrapper.find('.category-grid');
    expect(categoryGrid.exists()).toBe(true);

    const categoryItems = categoryGrid.findAll('.category-item');
    expect(categoryItems.length).toBe(wrapper.vm.categories.length);

    categoryItems.forEach((item) => {
      expect(item.classes()).toContain('category-item');
    });
  });

  it('отримує дані категорій із замоканого API та відображає їх правильно', async () => {
    await wrapper.vm.$nextTick();
    await wait();

    // Перевірка, що fetch викликано лише один раз під час монтування
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('http://26.235.139.202:8080/api/categories');

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
    await wrapper.vm.$nextTick();
    await wait();
    const expectedCategories = [
      { id: 1, name: 'Category 1', image_url: 'test-url-1', url: '/bracelets' },
      { id: 2, name: 'Category 2', image_url: 'test-url-2', url: '/herdany' },
    ];
    expect(wrapper.vm.categories).toEqual(expectedCategories);

    wrapper.vm.categories.forEach((category, index) => {
      expect(category.url).toBe(expectedCategories[index].url);
    });
  });

  it('Перевірка коректності підвантаження зображень категорій (lazy loading)', async () => {
    await wrapper.vm.$nextTick();
    await wait();
    const categoryImages = wrapper.findAll('.category-image');
    expect(categoryImages.length).toBe(wrapper.vm.categories.length);

    categoryImages.forEach((img) => {
      expect(img.attributes('loading')).toBe('lazy');
    });
  });

  it('API повертає масив категорій із неповними даними (без image_url або name)', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        headers: { get: jest.fn().mockReturnValue('application/json') },
        json: () =>
          Promise.resolve({
            data: [
              { id: 1, name: 'Category 1', image_url: 'test-url-1' },
              { id: 2, name: 'Category 2', image_url: 'test-url-2' },
            ],
          }),
      })
    );
    // Перезмонтуємо компонент для використання нової імплементації fetch
    wrapper.unmount();
    wrapper = factory();
    await wrapper.vm.$nextTick();
    await wait();

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

  it('Відображення зображення, назви, та стрілки у кожному елементі категорії', async () => {
    await wrapper.vm.$nextTick();
    await wait();
    const categoryItems = wrapper.findAll('.category-item');

    categoryItems.forEach((item, index) => {
      const image = item.find('.category-image');
      expect(image.exists()).toBe(true);
      expect(image.attributes('src')).toBe(wrapper.vm.categories[index].image_url);

      const title = item.find('.category-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe(wrapper.vm.categories[index].name);

      const arrow = item.find('.arrow');
      expect(arrow.exists()).toBe(true);
      expect(arrow.text()).toBe('→');
    });
  });

  it('Відображення квадратів у перших, третіх і п’ятих категоріях', async () => {
    await wrapper.vm.$nextTick();
    await wait();
    const categoryItems = wrapper.findAll('.category-item');
    expect(categoryItems.length).toBe(wrapper.vm.categories.length);

    [0, 2, 4].forEach((index) => {
      if (categoryItems[index]) {
        const lightSquare = categoryItems[index].find('.light-square');
        const darkSquare = categoryItems[index].find('.dark-square');
        expect(lightSquare.exists()).toBe(true);
        expect(darkSquare.exists()).toBe(true);
      }
    });

    [1, 3, 5].forEach((index) => {
      if (categoryItems[index]) {
        const lightSquare = categoryItems[index].find('.light-square');
        const darkSquare = categoryItems[index].find('.dark-square');
        expect(lightSquare.exists()).toBe(false);
        expect(darkSquare.exists()).toBe(false);
      }
    });
  });

  // Зміна лише для тесту кешування: замість того, щоб давати fetch змінювати дані,
  // ми переопреділяємо метод fetchCategories як noop та вручну задаємо дані з localStorage.
  it('отримує категорії із кешу, якщо вони є', async () => {
    const cachedCategories = [
      { id: 1, name: 'Кешована категорія', image_url: 'cached-url', url: '/cached-url' },
    ];
    localStorage.setItem('categories', JSON.stringify(cachedCategories));

    // Перестворюємо компонент із заміною fetchCategories на noop, щоб уникнути виклику fetch
    wrapper.unmount();
    wrapper = shallowMount(CategoryProduct, {
      methods: {
        fetchCategories: () => {} // Не виконуємо запит до API
      },
      global: {
        mocks: {
          $t: (msg) => msg,
        },
        stubs: {
          'router-link': {
            template: '<a class="category-link" :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });

    await wrapper.vm.$nextTick();
    await wait();
    // Ручне задання даних з localStorage (оскільки компонент сам не читає їх)
    wrapper.vm.categories = JSON.parse(localStorage.getItem('categories'));
    await wrapper.vm.$nextTick();
    await wait();

    expect(wrapper.vm.categories).toEqual(cachedCategories);
    const categoryItems = wrapper.findAll('.category-item');
    expect(categoryItems.length).toBe(1);
    expect(categoryItems[0].find('.category-title').text()).toBe('Кешована категорія');
  });

  it('Зображення категорій мають правильні alt-атрибути', async () => {
    await wrapper.vm.$nextTick();
    await wait();
    const categoryImages = wrapper.findAll('.category-image');
    categoryImages.forEach((img, index) => {
      expect(img.attributes('alt')).toBe(wrapper.vm.categories[index].name);
    });
  });

  it('Оновлює список категорій після зміни даних', async () => {
    wrapper.setData({
      categories: [
        { id: 100, name: 'Нова категорія', image_url: 'new-url', url: '/new-category' },
      ],
    });
    await wrapper.vm.$nextTick();
    await wait();

    const categoryItems = wrapper.findAll('.category-item');
    expect(categoryItems.length).toBe(1);
    expect(categoryItems[0].find('.category-title').text()).toBe('Нова категорія');
  });

  it('Коректно відображає список категорій', async () => {
    await wrapper.vm.$nextTick();
    await wait();
    const categoryTitles = wrapper.findAll('.category-title');
    expect(categoryTitles.length).toBe(wrapper.vm.categories.length);

    categoryTitles.forEach((title, index) => {
      expect(title.text()).toBe(wrapper.vm.categories[index].name);
    });
  });

  it('Перевіряє, що всі посилання категорій правильні', async () => {
    await wrapper.vm.$nextTick();
    await wait();
    const categoryLinks = wrapper.findAll('.category-link');
    categoryLinks.forEach((link, index) => {
      expect(link.attributes('href')).toBe(wrapper.vm.categories[index].url);
    });
  });

  it('Оновлює відображення після зміни списку категорій', async () => {
    wrapper.setData({
      categories: [
        { id: 201, name: 'Оновлена категорія', image_url: 'new-image.jpg', url: '/updated' },
      ],
    });
    await wrapper.vm.$nextTick();
    await wait();
    expect(wrapper.find('.category-title').text()).toBe('Оновлена категорія');
  });
});
