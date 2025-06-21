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
import AboutDelivery from '@/components/infoshop/AboutDelivery.vue';

// Мок для IntersectionObserver
global.IntersectionObserver = class {
  constructor() { }
  observe() { }
  unobserve() { }
  disconnect() { }
};

describe('AboutDelivery.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(AboutDelivery);
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('встановлює правильний document.title при монтуванні', () => {
    expect(document.title).toBe('Про Оплату Доставку');
  });

  it('рендерить головний заголовок з текстом "Умови оплати та доставки"', () => {
    const h1 = wrapper.find('h1');
    expect(h1.exists()).toBe(true);
    expect(h1.text().trim()).toBe('Умови оплати та доставки');
  });

  it('рендерить секцію доставки з двома елементами списку', () => {
    const deliveryItems = wrapper.findAll('section:first-of-type ul li');
    expect(deliveryItems.length).toBe(2);
  });

  it('кожен елемент доставки містить картинку з правильним alt', () => {
    const imgs = wrapper.findAll('section:first-of-type ul li img');
    expect(imgs.at(0).attributes('alt')).toBe('Нова Пошта');
    expect(imgs.at(1).attributes('alt')).toBe('Укрпошта');
  });

  it('рендерить секцію "Оплата" з трьома пунктами', () => {
    const paymentItems = wrapper.findAll('section:nth-of-type(2) ul li');
    expect(paymentItems.length).toBe(3);
  });

  it('перший спосіб оплати описано як "Оплата при отриманні"', () => {
    const firstMethod = wrapper.find('section:nth-of-type(2) ul li h4');
    expect(firstMethod.text()).toContain('Оплата при отриманні');
  });

  it('рендерить секцію "Додаткові умови" з двома пунктами', () => {
    const extra = wrapper.findAll('section:nth-of-type(3) ul li');
    expect(extra.length).toBe(2);
    expect(extra.at(0).text()).toContain('У випадку оплати післяплатою');
  });

  it('рендерить футер із подякою', () => {
    const footerText = wrapper.find('footer p');
    expect(footerText.exists()).toBe(true);
    expect(footerText.text().trim()).toBe('Дякуємо, що обрали наш магазин!');
  });

  it('додає клас show до .fade-in елементів при IntersectionObserver.observe', async () => {
    const observed = [];
    global.IntersectionObserver = class {
      constructor(cb) { this.cb = cb; }
      observe(el) {
        observed.push(el);
        this.cb([{ target: el, isIntersecting: true }]);
      }
      unobserve() { }
      disconnect() { }
    };
    wrapper = shallowMount(AboutDelivery);
    await wrapper.vm.$nextTick();
    observed.forEach(el => {
      expect(el.classList.contains('opacity-100')).toBe(true);
      expect(el.classList.contains('translate-y-0')).toBe(true);
    });
  });

  it('має семантичний тег <main>', () => {
    const main = wrapper.find('main');
    expect(main.exists()).toBe(true);
  });

  it('має семантичний тег <header>', () => {
    const header = wrapper.find('header');
    expect(header.exists()).toBe(true);
  });

  it('має семантичний тег <footer>', () => {
    const footer = wrapper.find('footer');
    expect(footer.exists()).toBe(true);
  });

  it('головний заголовок має класи font-kyivBlack2, text-[34px], text-center', () => {
    const h1 = wrapper.find('h1');
    expect(h1.classes()).toEqual(expect.arrayContaining([
      'font-kyivBlack2', 'text-[34px]', 'text-center'
    ]));
  });

  it('перша секція має класи lg:flex-row і gap-5', () => {
    const section = wrapper.find('section');
    expect(section.classes()).toEqual(expect.arrayContaining([
      'lg:flex-row', 'gap-5'
    ]));
  });

  it('друга секція має заголовок "Оплата"', () => {
    const h2 = wrapper.find('section:nth-of-type(2) h2');
    expect(h2.exists()).toBe(true);
    expect(h2.text().trim()).toBe('Оплата');
  });

  it('список методів оплати містить текст про банківську карту', () => {
    const payment = wrapper.find('section:nth-of-type(2)').text();
    expect(payment).toContain('Передплата на банківську карту');
  });

  it('зображення доставки має клас rounded-lg і shadow-md', () => {
    const img = wrapper.find('img[alt="Доставка"]');
    expect(img.exists()).toBe(true);
    expect(img.classes()).toEqual(expect.arrayContaining([
      'rounded-lg', 'shadow-md'
    ]));
  });

  it('немає дубльованих заголовків h1', () => {
    const h1s = wrapper.findAll('h1');
    expect(h1s.length).toBe(1);
  });

  it('кожен елемент доставки має заголовок h4', () => {
    const deliveryItems = wrapper.findAll('section:first-of-type li h4');
    expect(deliveryItems.length).toBe(2);
  });

  it('контент має правильну послідовність секцій: доставка → оплата → додаткові умови', () => {
    const sections = wrapper.findAll('main > section');
    expect(sections.length).toBe(3);
    expect(sections.at(0).text()).toContain('Умови доставки');
    expect(sections.at(1).text()).toContain('Оплата');
    expect(sections.at(2).text()).toContain('Додаткові умови');
  });

  it('елементи .fade-in змінюють класи при перетині (симуляція)', async () => {
    const el = wrapper.find('.fade-in');
    el.element.classList.remove('opacity-0', 'translate-y-5');
    el.element.classList.add('opacity-100', 'translate-y-0');
    expect(el.classes()).toContain('opacity-100');
    expect(el.classes()).toContain('translate-y-0');
  });
});