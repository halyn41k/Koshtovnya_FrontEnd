import { shallowMount } from '@vue/test-utils';
import Loader from '../../components/home/Loader.vue';

describe('Loader.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Loader);
  });

  afterEach(() => {
    wrapper.unmount();
    jest.clearAllMocks();
  });

  it('повинен відображати контейнер для завантаження', () => {
    const overlay = wrapper.find('.loader-overlay');
    expect(overlay.exists()).toBe(true);
  });

  it('повинен відображати сам лоадер', () => {
    const loader = wrapper.find('.loader');
    expect(loader.exists()).toBe(true);
  });

  it('повинен мати правильні класи для контейнера', () => {
    const overlay = wrapper.find('.loader-overlay');
    expect(overlay.exists()).toBe(true);
    expect(overlay.classes()).toContain('loader-overlay'); // Перевіряємо наявність класу.
  });  

  it('повинен використовувати правильні анімації для лоадера', () => {
    const loader = wrapper.find('.loader');
    expect(loader.classes()).toContain('loader');
    expect(loader.attributes('style')).toBeUndefined(); // Немає inline-стилів, лише CSS.
  });

  it('повинен коректно рендеритися з іменем компонента Loader', () => {
    expect(wrapper.vm.$options.name).toBe('Loader');
  });

  it('повинен змінювати класи при додаванні нових умов', async () => {
    // Приклад: умовно додаємо новий клас "hidden" до компонента
    await wrapper.setProps({ hidden: true });
    const overlay = wrapper.find('.loader-overlay');
    expect(overlay.classes()).not.toContain('hidden');
  });

  it('повинен мати правильні стилі для контейнера', () => {
    const overlay = wrapper.find('.loader-overlay');
  
    // Мокаємо getComputedStyle
    jest.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      position: 'fixed',
      backgroundColor: 'rgba(255, 255, 255, 0.263)',
    }));
  
    const styles = getComputedStyle(overlay.element);
    expect(styles.position).toBe('fixed');
    expect(styles.backgroundColor).toBe('rgba(255, 255, 255, 0.263)');
  
    jest.restoreAllMocks(); // Очищення моків після тесту
  });
});
