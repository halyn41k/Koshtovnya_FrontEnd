// describe.skip('Тести для MyComponent', () => {
//     it('цей тест не виконається', () => {
//       expect(true).toBe(false)
//     })
//   })
  
  //Протестовано головні аспекти
  

  import { shallowMount, mount, RouterLinkStub } from '@vue/test-utils';
  import SearchResults from '@/components/home/SearchResults.vue';
  import axios from 'axios';
  
  jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({ data: { data: [] } }))
  }));
  
  // Функція для очікування завершення всіх мікротасків
  const flushPromises = () => new Promise(setImmediate);
  
  describe('SearchResults.vue', () => {
    let wrapper;
  
    const createWrapper = (options = {}) => {
      return shallowMount(SearchResults, {
        propsData: { query: '' },
        // Початкові дані для більшості тестів
        data() {
          return {
            results: [
              { id: 1, name: 'Картина Соняхи' },
              { id: 2, name: 'Захід сонця' },
              { id: 3, name: 'Пейзаж гір' }
            ],
            isVisible: false,
            loading: false,
          };
        },
        global: {
          stubs: {
            'router-link': {
              template: '<a :href="to"><slot/></a>',
              props: ['to']
            }
          }
        },
        ...options
      });
    };
  
    beforeEach(() => {
      wrapper = createWrapper();
    });
  
    afterEach(() => {
      wrapper.unmount();
      jest.clearAllMocks();
    });
  
    it('не відображає блок з результатами пошуку, коли isVisible має значення false', () => {
      wrapper.setData({ isVisible: false });
      expect(wrapper.find('.search-results').exists()).toBe(false);
    });
  
    it('відображає блок з результатами пошуку, коли isVisible має значення true', async () => {
      wrapper.setData({ isVisible: true });
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.search-results').exists()).toBe(true);
    });
  
    it('повертає всі результати без виділення при порожньому запиті', () => {
      wrapper.setProps({ query: '' });
      expect(wrapper.vm.highlightedResults).toEqual([
        { id: 1, name: 'Картина Соняхи' },
        { id: 2, name: 'Захід сонця' },
        { id: 3, name: 'Пейзаж гір' }
      ]);
    });
  
    it('викликає axios та оновлює results і isVisible при успішному запиті до API', async () => {
      const mockData = [
        { id: 4, name: 'Новий продукт', image_url: 'test.jpg', price: 100 }
      ];
      // Налаштовуємо mock, щоб повернув mockData
      axios.get.mockResolvedValueOnce({ data: { data: mockData } });
      await wrapper.vm.search('Новий');
      await flushPromises();
      // Перевіряємо, що axios.get викликаний з коректним (закодованим) URL
      expect(axios.get).toHaveBeenCalledWith('http://26.235.139.202:8080/api/products/search/%D0%9D%D0%BE%D0%B2%D0%B8%D0%B9');
      // Перевіряємо, що дані записані в results і isVisible встановлено в true
      expect(wrapper.vm.results).toEqual(mockData);
      expect(wrapper.vm.isVisible).toBe(true);
    });
  
    it('обробляє помилку: логування помилки, очищення results і приховування блоку', async () => {
      const error = new Error('API Error');
      axios.get.mockRejectedValueOnce(error);
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await wrapper.vm.search('Помилка');
      await flushPromises();
      expect(axios.get).toHaveBeenCalledWith('http://26.235.139.202:8080/api/products/search/%D0%9F%D0%BE%D0%BC%D0%B8%D0%BB%D0%BA%D0%B0');
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching search results:", error);
      expect(wrapper.vm.results).toEqual([]);
      expect(wrapper.vm.isVisible).toBe(false);
      consoleErrorSpy.mockRestore();
    });
  
    it('спостерігач для властивості query викликає метод search при ненульовому запиті', async () => {
      wrapper.vm.search = jest.fn();
      await wrapper.setProps({ query: 'Картина' });
      expect(wrapper.vm.search).toHaveBeenCalledWith('Картина');
    });
  
    it('обробляє кліки поза компонентом, встановлюючи isVisible в false', async () => {
      wrapper.setData({ isVisible: true });
      await wrapper.vm.$nextTick();
      const outsideElement = document.createElement('div');
      wrapper.vm.handleOutsideClick({ target: outsideElement });
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.isVisible).toBe(false);
    });
  
    it('кліки всередині компонента не впливають на видимість блоку завдяки використанню .stop у події mousedown', async () => {
      wrapper.setData({ isVisible: true });
      await wrapper.vm.$nextTick();
      const searchResultsElement = wrapper.find('.search-results');
      await searchResultsElement.trigger('mousedown');
      expect(wrapper.vm.isVisible).toBe(true);
    });
  
    it('створює <li> для кожного продукту', async () => {
      const products = [
        { id: 10, name: 'Продукт 1' },
        { id: 11, name: 'Продукт 2' },
        { id: 12, name: 'Продукт 3' }
      ];
      wrapper.setData({ results: products, isVisible: true });
      await wrapper.vm.$nextTick();
      const liElements = wrapper.findAll('li');
      expect(liElements.length).toBe(products.length);
    });
  
    it('формує правильний URL для посилання (router-link) на основі ідентифікатора продукту', async () => {
      const products = [
        { id: 20, name: 'Продукт A' },
        { id: 21, name: 'Продукт B' },
        { id: 22, name: 'Продукт C' }
      ];
      await wrapper.setData({ results: products, isVisible: true });
      const routerLinks = wrapper.findAll('a');
      expect(routerLinks.length).toBe(products.length);
      routerLinks.forEach((routerLinkWrapper, index) => {
        expect(routerLinkWrapper.attributes('href')).toBe(`/productpage/${products[index].id}`);
      });
    });
  
    it('відображає зображення продуктів з правильним атрибутом src', async () => {
      const products = [
        { id: 1, name: 'Продукт A', image_url: 'imageA.jpg' },
        { id: 2, name: 'Продукт B', image_url: 'imageB.jpg' },
        { id: 3, name: 'Продукт C', image_url: 'imageC.jpg' }
      ];
      await wrapper.setData({ results: products, isVisible: true });
      const images = wrapper.findAll('img');
      expect(images.length).toBe(products.length);
      images.forEach((imgWrapper, index) => {
        expect(imgWrapper.attributes('src')).toBe(products[index].image_url);
      });
    });
  
    it('при монтуванні додається слухач подій mousedown', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const localWrapper = createWrapper();
      expect(addEventListenerSpy).toHaveBeenCalledWith("mousedown", localWrapper.vm.handleOutsideClick);
      localWrapper.unmount();
      addEventListenerSpy.mockRestore();
    });
  
    it('при демонтуванні видаляється слухач подій mousedown', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      const localWrapper = createWrapper();
      localWrapper.unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith("mousedown", localWrapper.vm.handleOutsideClick);
      removeEventListenerSpy.mockRestore();
    });
  
    it('рендерить заголовок "Результати пошуку:" коли блок видимий', async () => {
      wrapper.setData({ isVisible: true });
      await wrapper.vm.$nextTick();
      const header = wrapper.find('h2');
      expect(header.exists()).toBe(true);
      expect(header.text()).toBe('Результати пошуку:');
    });
  
    it('контейнер містить клас "search-results"', async () => {
      wrapper.setData({ isVisible: true });
      await wrapper.vm.$nextTick();
      const container = wrapper.find('div.search-results');
      expect(container.exists()).toBe(true);
    });
  
    it('рендерить зображення з атрибутом alt рівним "Product Image"', async () => {
      const product = { id: 102, name: 'Продукт Test', image_url: 'test.jpg', price: 100 };
      wrapper.setData({ results: [product], isVisible: true });
      await wrapper.vm.$nextTick();
      const img = wrapper.find('img');
      expect(img.exists()).toBe(true);
      expect(img.attributes('alt')).toBe('Product Image');
    });
  });
  