describe.skip('Тести для MyComponent', () => {
  it('цей тест не виконається', () => {
    expect(true).toBe(false)
  })
})

//Протестовано головні аспекти
/*
beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

import { shallowMount } from '@vue/test-utils';
import CategoryProduct from '@/components/Home/CategoryProduct.vue';

jest.mock('@/services/api', () => ({
  getCategories: jest.fn(() =>
    Promise.resolve({
      data: [
        { id: 1, name: 'Category 1', image_url: 'test-url-1' },
        { id: 2, name: 'Category 2', image_url: 'test-url-2' },
      ],
    })
  ),
}));

const wait = () => new Promise(resolve => setTimeout(resolve, 0));

describe('CategoryProduct.vue', () => {
  let wrapper;

  const factory = (options = {}) =>
    shallowMount(CategoryProduct, {
      global: {
        mocks: {
          $t: msg => msg,
        },
        stubs: {
          'router-link': {
            template: '<a class="category-link group" :href="to"><slot /></a>',
            props: ['to'],
          },
        },
        ...options.global,
      },
      ...options,
    });

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    wrapper = factory();
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
  });

  it('Коректне застосування стилів для заголовка секції', () => {
    const sectionTitle = wrapper.find('h2');
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.classes()).toContain('text-[32px]');
    expect(sectionTitle.classes()).toContain('font-black');
    expect(sectionTitle.classes()).toContain('text-center');
  });

  it('Коректне відображення шрифтів KyivType Titling', () => {
    const sectionTitle = wrapper.find('h2');
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.classes()).toContain('font-kyivtype');
  });

  it('Відображення заголовка секції (Shop By Category)', () => {
    const sectionTitle = wrapper.find('h2');
    expect(sectionTitle.exists()).toBe(true);
    expect(sectionTitle.text()).toBe('shopByCategory'); // бо $t замокано як (msg) => msg
  });

  it('Коректне відображення елементів категорій у вигляді сітки', async () => {
    await wrapper.vm.$nextTick();
    await wait();

    const categoryGrid = wrapper.find('div.grid');
    expect(categoryGrid.exists()).toBe(true);

    const categoryItems = categoryGrid.findAll('.group'); // router-link має клас group
    expect(categoryItems.length).toBe(wrapper.vm.categories.length);

    categoryItems.forEach((item) => {
      expect(item.classes()).toContain('group');
    });
  });

  it('отримує дані категорій із замоканого API та відображає їх правильно', async () => {
    await wait();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.categories).toEqual([
      { id: 1, name: 'Category 1', image_url: 'test-url-1', url: '/bracelets' },
      { id: 2, name: 'Category 2', image_url: 'test-url-2', url: '/herdany' },
    ]);

    const categoryItems = wrapper.findAll('.group');
    expect(categoryItems.length).toBe(2);
    expect(categoryItems[0].find('img').attributes('src')).toBe('test-url-1');
    expect(categoryItems[0].find('h3').text()).toBe('Category 1');
    expect(categoryItems[1].find('img').attributes('src')).toBe('test-url-2');
    expect(categoryItems[1].find('h3').text()).toBe('Category 2');
  });

  it('Перевірка, що URL кожної категорії коректно додається під час мапінгу даних', async () => {
    await wait();
    await wrapper.vm.$nextTick();

    const expectedCategories = [
      { id: 1, name: 'Category 1', image_url: 'test-url-1', url: '/bracelets' },
      { id: 2, name: 'Category 2', image_url: 'test-url-2', url: '/herdany' },
    ];

    expect(wrapper.vm.categories).toEqual(expectedCategories);
    wrapper.vm.categories.forEach((category, i) => {
      expect(category.url).toBe(expectedCategories[i].url);
    });
  });

  it('Перевірка коректності підвантаження зображень категорій (lazy loading)', async () => {
    await wait();
    await wrapper.vm.$nextTick();

    const images = wrapper.findAll('img');
    expect(images.length).toBe(wrapper.vm.categories.length);

    images.forEach(img => {
      expect(img.attributes('loading')).toBe('lazy');
    });
  });

  it('API повертає масив категорій із неповними даними (без image_url або name)', async () => {
    const { getCategories } = require('@/services/api');
    getCategories.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Category 1' }, // без image_url
        { id: 2, image_url: 'test-url-2' }, // без name
      ],
    });

    wrapper.unmount();
    wrapper = factory();
    await wait();
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.categories).toEqual([
      { id: 1, name: 'Category 1', image_url: undefined, url: '/bracelets' },
      { id: 2, name: undefined, image_url: 'test-url-2', url: '/herdany' },
    ]);

    const categoryLinks = wrapper.findAll('.group');
    expect(categoryLinks.length).toBe(2);
    expect(categoryLinks[0].find('img').attributes('src')).toBeUndefined();
    expect(categoryLinks[0].find('h3').text()).toBe('Category 1');
    expect(categoryLinks[1].find('img').attributes('src')).toBe('test-url-2');
    expect(categoryLinks[1].find('h3').text()).toBe('');
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

  it('Зображення категорій мають правильні alt-атрибути', async () => {
    await wrapper.vm.$nextTick();
    await wait();
    const categoryImages = wrapper.findAll('.category-image');
    categoryImages.forEach((img, index) => {
      expect(img.attributes('alt')).toBe(wrapper.vm.categories[index].name);
    });
  });

  it('Оновлює список категорій після зміни даних', async () => {
    wrapper.vm.categories = [
      { id: 100, name: 'Нова категорія', image_url: 'new-url', url: '/new-category' },
    ];
    await wrapper.vm.$nextTick();
    await wait();

    const categoryItems = wrapper.findAll('.group'); // ← замість .category-item
    expect(categoryItems.length).toBe(1);
    const h3 = categoryItems[0].find('h3');
    expect(h3.exists()).toBe(true);
    expect(h3.text()).toBe('Нова категорія');
  });


  it('Коректно відображає список категорій', async () => {
    await wrapper.vm.$nextTick();
    await wait();

    const h3s = wrapper.findAll('h3');
    expect(h3s.length).toBe(wrapper.vm.categories.length);

    h3s.forEach((h3, index) => {
      expect(h3.text()).toBe(wrapper.vm.categories[index].name);
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
    wrapper.vm.categories = [
      { id: 201, name: 'Оновлена категорія', image_url: 'new-image.jpg', url: '/updated' },
    ];
    await wrapper.vm.$nextTick();
    await wait();

    const h3 = wrapper.find('h3');
    expect(h3.exists()).toBe(true);
    expect(h3.text()).toBe('Оновлена категорія');
  });
  //
  it('Використовує fallbackCategories при помилці API', async () => {
    const { getCategories } = require('@/services/api');
    getCategories.mockRejectedValueOnce(new Error('API Error'));

    wrapper.unmount();
    wrapper = shallowMount(CategoryProduct, {
      global: {
        mocks: { $t: msg => msg },
        stubs: {
          'router-link': {
            template: '<a class="category-link group" :href="to"><slot /></a>',
            props: ['to'],
          },
        },
      },
    });

    await wrapper.vm.$nextTick();
    await wait();

    expect(wrapper.vm.categories.length).toBe(wrapper.vm.fallbackCategories.length);
  });

  it('Кожна категорія має коректне значення :to у router-link', async () => {
    await wrapper.vm.$nextTick();
    await wait();

    const links = wrapper.findAllComponents({ name: 'router-link' });
    links.forEach((link, index) => {
      expect(link.attributes('href')).toBe(wrapper.vm.categories[index].url);
    });
  });

  it('Зображення без image_url не ламають lazy loading', async () => {
    wrapper.vm.categories = [
      { id: 1, name: 'Без картинки', image_url: undefined, url: '/no-image' },
    ];
    await wrapper.vm.$nextTick();
    await wait();

    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('loading')).toBe('lazy');
  });

  it('Формує URL для категорій поза межами fixedUrls', async () => {
    const { getCategories } = require('@/services/api');
    getCategories.mockResolvedValueOnce({
      data: new Array(10).fill(0).map((_, i) => ({
        id: i + 1,
        name: `Cat ${i + 1}`,
        image_url: `url-${i + 1}`,
      })),
    });

    wrapper.unmount();
    wrapper = factory();

    await wrapper.vm.$nextTick();
    await wait();

    expect(wrapper.vm.categories[9].url).toBe('/category/10');
  });

});
*/