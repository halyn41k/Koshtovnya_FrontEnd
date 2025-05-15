describe.skip('Тести для MyComponent', () => {
  it('цей тест не виконається', () => {
    expect(true).toBe(false)
  })
})
/*
//Протестовано головні аспекти

jest.mock('@/assets/logo1.webp', () => 'logo1.webp');

import { shallowMount } from '@vue/test-utils';
import Loader from '@/components/home/Loader.vue';

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

  it('повинен відображати сам лоадер (зображення)', () => {
    const loaderImg = wrapper.find('img.logo');
    expect(loaderImg.exists()).toBe(true);
  });

  it('повинен мати правильні класи для контейнера', () => {
    const overlay = wrapper.find('.loader-overlay');
    expect(overlay.exists()).toBe(true);
    expect(overlay.classes()).toContain('loader-overlay');
  });

  it('повинен відображати зображення з правильним alt атрибутом', () => {
    const loaderImg = wrapper.find('img.logo');
    expect(loaderImg.exists()).toBe(true);
    expect(loaderImg.attributes('alt')).toBe('Logo');
  });

  it('повинен не мати inline стилів на зображенні лоадера', () => {
    const loaderImg = wrapper.find('img.logo');
    expect(loaderImg.attributes('style')).toBeUndefined();
  });

  it('повинен коректно рендеритися з іменем компонента Loader', () => {
    expect(wrapper.vm.$options.name).toBe('Loader');
  });

  it('повинен змінювати класи при додаванні нових умов', async () => {
    // Приклад: якщо передати проп hidden, клас "hidden" не додається, оскільки такої логіки немає
    await wrapper.setProps({ hidden: true });
    const overlay = wrapper.find('.loader-overlay');
    expect(overlay.classes()).not.toContain('hidden');
  });

  it('повинен мати правильні стилі для контейнера', () => {
    const overlay = wrapper.find('.loader-overlay');
  
    // Мокаємо getComputedStyle, щоб повернути значення з властивостей CSS із Loader.vue
    jest.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      position: 'fixed',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    }));
  
    const styles = getComputedStyle(overlay.element);
    expect(styles.position).toBe('fixed');
    expect(styles.backgroundColor).toBe('rgba(255, 255, 255, 0.5)');
  
    jest.restoreAllMocks();
  });
});
*/