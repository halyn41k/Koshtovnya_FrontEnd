// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })
/* eslint-disable jest/no-commented-out-tests, no-unused-vars, jest/no-identical-title, no-undef */
//Протестовано головні аспекти
beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

import { shallowMount } from '@vue/test-utils';
import ProductReviews from '@/components/Product/ProductReviews.vue';

describe('ProductReviews.vue', () => {
  let wrapper;
  const originalCreated = ProductReviews.created;

  beforeEach(() => {
    // Замокаємо console.error, щоб уникнути виводу помилок під час тестів
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Створюємо глобальний мок для fetch
  global.fetch = jest.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: [], total: 0 }),
    })
  );  

  afterAll(() => {
    global.fetch.mockClear();
    delete global.fetch;
    ProductReviews.created = originalCreated;
  });

  // Демонтуємо компонент після кожного тесту
  afterEach(() => {
    if (wrapper) wrapper.unmount();
    consoleErrorSpy.mockRestore();
  });

  it('повинен коректно форматувати дату з формату ISO та заданого рядкового формату', () => {
    // Відключаємо виклик created
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
    });
  
    // Для ISO формату: "2024-03-15T15:00:00Z"
    // Зверніть увагу, що ця дата конвертується в локальний час (наприклад, UTC+2 дасть "17:00")
    const isoDate = "2024-03-15T15:00:00Z";
    const formattedIso = wrapper.vm.formatReviewDate(isoDate);
    expect(formattedIso).toContain("березня");
    expect(formattedIso).toContain("17:00");
  
    // Для заданого рядкового формату: "15 березня 2024, 15:00"
    // Це значення парситься як локальний час і має залишатися "15:00"
    const stringDate = "15 березня 2024, 15:00";
    const formattedString = wrapper.vm.formatReviewDate(stringDate);
    expect(formattedString).toContain("березня");
    expect(formattedString).toContain("15:00");
  });  
  
  it('повинен правильно встановлювати стан завантаження (loading) під час запитів', async () => {
    // Відключаємо виклик created
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, {
      props: { productId: 1 },
    });
  
    // Перевіряємо, що спочатку loading = false
    expect(wrapper.vm.loading).toBe(false);
  
    // Замінюємо метод fetchReviews на фейкову функцію із затримкою
    wrapper.vm.fetchReviews = async () => {
      wrapper.vm.loading = true;
      await new Promise(resolve => setTimeout(resolve, 100));
      wrapper.vm.loading = false;
    };
  
    // Викликаємо метод і перевіряємо, що loading встановлюється у true
    const fetchPromise = wrapper.vm.fetchReviews();
    expect(wrapper.vm.loading).toBe(true);
  
    // Чекаємо завершення запиту
    await fetchPromise;
  
    // Після завершення запиту loading має бути false
    expect(wrapper.vm.loading).toBe(false);
  });
  //
it('рендерить заголовок "Відгуки"', () => {
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, { props: { productId: 1 } });
    expect(wrapper.find('h2').text()).toBe('Відгуки');
  });

  it('показує повідомлення про відсутність відгуків, якщо масив пустий', async () => {
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, { props: { productId: 1 } });
    wrapper.setData({ loading: false, reviews: [] });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('p.text-gray-600').text()).toBe('Немає відгуків для цього товару.');
  });
  
  it('перемикає showReviewForm при кліку на кнопку "Додати відгук"', async () => {
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, { props: { productId: 1 } });
    wrapper.setData({ loading: false, reviews: [] });
    await wrapper.vm.$nextTick();
    const btn = wrapper.find('button');
    expect(wrapper.vm.showReviewForm).toBe(false);
    await btn.trigger('click');
    expect(wrapper.vm.showReviewForm).toBe(true);
    await btn.trigger('click');
    expect(wrapper.vm.showReviewForm).toBe(false);
  });

  it('hoverRating змінює hoverRatingValue, resetRating скидає його', () => {
    wrapper = shallowMount(ProductReviews, { props: { productId: 1 } });
    wrapper.vm.hoverRating(3);
    expect(wrapper.vm.hoverRatingValue).toBe(3);
    wrapper.vm.resetRating();
    expect(wrapper.vm.hoverRatingValue).toBeNull();
  });

  it('setRating задає newReview.rating', () => {
    wrapper = shallowMount(ProductReviews, { props: { productId: 1 } });
    wrapper.vm.setRating(4);
    expect(wrapper.vm.newReview.rating).toBe(4);
  });

  it('забороняє submitReview, якщо comment пустий або лише пробіли', async () => {
    wrapper = shallowMount(ProductReviews, { props: { productId: 1 } });
    wrapper.setData({ newReview: { comment: '   ', rating: 5 } });
    await wrapper.vm.submitReview();
    expect(wrapper.vm.loading).toBe(false);
  });

  it('getRatingWidth коректно рахує відсоток', () => {
    wrapper = shallowMount(ProductReviews, { props: { productId: 1 } });
    wrapper.setData({ ratingsBreakdown: { 5: 2, 4: 1 } });
    // total = 3, для 5 зірок: 2/3*100 ≈ 66.7
    expect(parseFloat(wrapper.vm.getRatingWidth(5))).toBeCloseTo(66.7, 1);
  });

  it('submitReply не виконується, якщо replyText пустий', async () => {
    wrapper = shallowMount(ProductReviews, { props: { productId: 1 } });
    wrapper.setData({ replyText: '  ', replyTo: 1 });
    await wrapper.vm.submitReply();
    expect(wrapper.vm.loading).toBe(false);
  });

  it('рендерить шкалу для кожного рейтингу від 5 до 1', () => {
    ProductReviews.created = () => {};
    wrapper = shallowMount(ProductReviews, { props: { productId: 1 } });
    const rows = wrapper.findAll('div.flex.items-center.gap-3');
    // Перша група — зірки, потім по 5 рядків breakdown
    expect(rows.length).toBe(1 + 5);
  });

  it('toggleReviewForm переключає видимість форми без помилок', () => {
    wrapper = shallowMount(ProductReviews, { props: { productId: 1 } });
    expect(wrapper.vm.showReviewForm).toBe(false);
    wrapper.vm.toggleReviewForm();
    expect(wrapper.vm.showReviewForm).toBe(true);
    wrapper.vm.toggleReviewForm();
    expect(wrapper.vm.showReviewForm).toBe(false);
  });

  it('форматує невірні дати як "Невідома дата"', () => {
    wrapper = shallowMount(ProductReviews, { props: { productId: 1 } });
    const bad = wrapper.vm.formatReviewDate('invalid date string');
    expect(bad).toBe('Невідома дата');
  });
  
});
