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
import AboutUs from '@/components/InfoShop/AboutUs.vue';

describe('AboutUs.vue', () => {
  let wrapper;

  beforeEach(() => {
    // Простий мок IntersectionObserver
    global.IntersectionObserver = class {
      constructor(cb) { this.cb = cb; }
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    window.alert = jest.fn();
    wrapper = shallowMount(AboutUs);
  });

  afterEach(() => {
    wrapper.unmount();
    jest.clearAllMocks();
  });

  it('рендерить заголовок "Наша історія"', () => {
    const header = wrapper.find('h2.text-3xl');
    expect(header.exists()).toBe(true);
    expect(header.text()).toBe('Наша історія');
  });

  it('Contact Form: валідація довжини повідомлення', async () => {
    wrapper.vm.form.email = 'a@b.com';
    wrapper.vm.form.message = 'short';
    wrapper.vm.handleSubmit();
    expect(wrapper.vm.errorMessage).toBe('Повідомлення має містити від 10 до 200 символів.');
    expect(window.alert).not.toHaveBeenCalled();
  });

  it('Contact Form: успішний сабміт очищає форму і викликає alert', async () => {
    wrapper.vm.form.email = 'user@example.com';
    wrapper.vm.form.message = 'This is a valid message long enough.';
    wrapper.vm.handleSubmit();
    expect(wrapper.vm.errorMessage).toBe('');
    expect(wrapper.vm.form.email).toBe('');
    expect(wrapper.vm.form.message).toBe('');
    expect(window.alert).toHaveBeenCalledWith('Дякуємо за ваше повідомлення!');
  });

it('має контейнер з класом .parallax-bg і ref="parallaxBg"', () => {
  const bg = wrapper.find('.parallax-bg');
  expect(bg.exists()).toBe(true);
  expect(wrapper.vm.parallaxBg).not.toBeNull();
});

it('елементи з директивою v-fade спочатку мають opacity-0 та translate-y-10', () => {
  const fadeEls = wrapper.findAll('.opacity-0.translate-y-10');
  // повинно бути мінімум 4 елементи: заголовок, кожен timeline item, FAQ секція, Contact секція
  expect(fadeEls.length).toBeGreaterThanOrEqual(4);
});

it('поля форми мають required і відповідні атрибути type/placeholder', () => {
  const email = wrapper.find('input#email');
  expect(email.attributes('required')).toBeDefined();
  expect(email.attributes('type')).toBe('email');
  expect(email.attributes('placeholder')).toBe('Ваша електронна адреса');

  const textarea = wrapper.find('textarea#message');
  expect(textarea.attributes('required')).toBeDefined();
  expect(textarea.attributes('placeholder')).toBe('Ваше повідомлення');
});

it('toggleFAQ повертає правильне значення faqOpen після кількох викликів', () => {
  wrapper.vm.toggleFAQ(0);
  expect(wrapper.vm.faqOpen[0]).toBe(true);
  wrapper.vm.toggleFAQ(0);
  expect(wrapper.vm.faqOpen[0]).toBe(false);
});

it('handleSubmit для надто довгого повідомлення (>200 символів) показує помилку', () => {
  wrapper.vm.form.email = 'test@test.com';
  wrapper.vm.form.message = 'a'.repeat(201);
  wrapper.vm.handleSubmit();
  expect(wrapper.vm.errorMessage).toBe('Повідомлення має містити від 10 до 200 символів.');
});

it('натискання кнопки "Надіслати" викликає handleSubmit', async () => {
  const btn = wrapper.find('button[type="submit"]');
  const spy = jest.spyOn(wrapper.vm, 'handleSubmit');
  await btn.trigger('submit.prevent');
  expect(spy).toHaveBeenCalled();
});

it('submit кнопка має класи transition-colors і duration-300', () => {
  const btn = wrapper.find('button[type="submit"]');
  expect(btn.classes()).toEqual(expect.arrayContaining(['transition-colors', 'duration-300']));
});

it('після успішного submit errorMessage повертається в порожній рядок', () => {
  wrapper.vm.form.email = 'a@b.com';
  wrapper.vm.form.message = 'Valid message.';
  wrapper.vm.handleSubmit();
  expect(wrapper.vm.errorMessage).toBe('');
});

it('FAQ секція має фон #faf4f4 та клас rounded-lg', () => {
  const faqSection = wrapper.findAll('section').at(1);
  expect(faqSection.classes()).toContain('rounded-lg');
  // перевіримо в inline-класі bg color
  expect(faqSection.attributes('class')).toContain('bg-[#faf4f4]');
});

});
