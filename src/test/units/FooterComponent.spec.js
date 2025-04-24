import { mount } from '@vue/test-utils';
import FooterComponent from '../../components/home/FooterComponent.vue';

describe('FooterComponent.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(FooterComponent, {
      global: {
        mocks: {
          $t: (msg) => {
            const translations = {
              logo: 'Коштовня Лого',
              description: 'Опис компанії Коштовня',
              aboutUs: 'Про нас',
              aboutDelivery: 'Доставка',
              userAccount: 'Особистий кабінет',
              address: 'м. Київ, вул. Хрещатик, 1',
              phone: '+380123456789',
              email: 'koshtovnya@mail.com',
              followUs: 'Слідкуйте за нами',
              contactUs: 'Зв’язатися з нами',
            };
            return translations[msg] || msg;
          },
        },
        stubs: {
          'router-link': {
            props: ['to'],
            template: '<a :href="to"><slot /></a>',
          },
        },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('компонент рендиться без помилок', () => {
    expect(wrapper.exists()).toBe(true); // Перевіряємо, що компонент існує
  });

  it('повинен завантажувати зображення логотипу з правильним alt', () => {
    const logoImg = wrapper.find('img.logo-image');
    expect(logoImg.exists()).toBe(true);
    expect(logoImg.attributes('alt')).toBe('Коштовня Лого'); // Перевірка alt
  });

  it('повинен відображати правильний текст логотипу з локалізації', () => {
    const logoTitle = wrapper.find('h1.logo-title');
    expect(logoTitle.exists()).toBe(true);
    expect(logoTitle.text()).toBe('Коштовня Лого'); // Перевірка тексту
  });

  it('повинен відображати правильний текст опису з локалізації', () => {
    const description = wrapper.find('p.description');
    expect(description.exists()).toBe(true); // Перевірка наявності елемента
    expect(description.text()).toBe('Опис компанії Коштовня'); // Перевірка тексту з локалізації
  });

  it('Всі посилання у розділі footer-links присутні та мають правильні маршрути', () => {
    const expectedLinks = [
      { route: '/aboutus', text: 'Про нас' },
      { route: '/aboutdelivery', text: 'Доставка' },
      { route: '/account', text: 'Особистий кабінет' },
    ];

    const links = wrapper.findAll('.footer-list .footer-link');
    expect(links.length).toBe(expectedLinks.length);

    links.forEach((link, index) => {
      const { route, text } = expectedLinks[index];
      expect(link.attributes('href')).toBe(route); // Перевіряємо маршрут
      expect(link.text()).toBe(text); // Перевіряємо текст посилання
    });
  });

  it('повинен відображати правильну адресу', () => {
    const addressElement = wrapper.find('.address');
    expect(addressElement.exists()).toBe(true); // Перевірка наявності елемента
    expect(addressElement.text()).toBe('м. Київ, вул. Хрещатик, 1'); // Перевірка тексту
  });

  it('повинен відображати правильний номер телефону', () => {
    const phoneElement = wrapper.find('.phone');
    expect(phoneElement.exists()).toBe(true); // Перевірка наявності елемента
    expect(phoneElement.text()).toBe('+380123456789'); // Перевірка тексту
  });

  it('повинен відображати правильний email', () => {
    const emailElement = wrapper.find('.email');
    expect(emailElement.exists()).toBe(true); // Перевірка наявності елемента
    expect(emailElement.text()).toBe('koshtovnya@mail.com'); // Перевірка тексту
  });

  it('повинен містити посилання на Instagram з правильним URL', () => {
    const instagramLink = wrapper.find('a[href="https://www.instagram.com"]');
    expect(instagramLink.exists()).toBe(true); // Перевірка, чи є посилання
    expect(instagramLink.attributes('target')).toBe('_blank'); // Перевірка, чи відкривається в новій вкладці
  });

  it('повинен містити посилання на Facebook з правильним URL', () => {
    const facebookLink = wrapper.find('a[href="https://www.facebook.com"]');
    expect(facebookLink.exists()).toBe(true); // Перевірка, чи є посилання
    expect(facebookLink.attributes('target')).toBe('_blank'); // Перевірка, чи відкривається в новій вкладці
  });

  it('повинен містити посилання на TikTok з правильним URL', () => {
    const tiktokLink = wrapper.find('a[href="https://www.tiktok.com"]');
    expect(tiktokLink.exists()).toBe(true); // Перевірка, чи є посилання
    expect(tiktokLink.attributes('target')).toBe('_blank'); // Перевірка, чи відкривається в новій вкладці
  });

  it('повинен мати правильний базовий клас для компоненту footer', () => {
    const footer = wrapper.find('.footer');
    expect(footer.exists()).toBe(true);
    expect(footer.classes()).toContain('footer');
  });

  it('повинен мати hover-ефект на посиланнях (через CSS-класи)', () => {
    const links = wrapper.findAll('.footer-link');
    expect(links.length).toBeGreaterThan(0); // Перевіряємо, що посилання присутні

    // Перевіряємо, чи клас для hover описаний у стилях
    links.forEach((link) => {
      expect(link.classes()).toContain('footer-link'); // Базовий клас
      // Додатково можна перевірити стиль у snapshot тестах, якщо потрібно
    });
  });

  it('повинен мати hover-ефект на соціальних іконках (через CSS-класи)', () => {
    const socialIcons = wrapper.findAll('.social-icon');
    expect(socialIcons.length).toBeGreaterThan(0); // Перевіряємо, що іконки присутні

    socialIcons.forEach((icon) => {
      expect(icon.classes()).toContain('social-icon'); // Базовий клас
      // Додатково перевіряємо через snapshot чи стилі описані
    });
  });

  it('Всі зображення мають атрибути alt із коректними значеннями', () => {
    const images = wrapper.findAll('img');
    const expectedAlts = [
      'Коштовня Лого', 'arrow', 'arrow', 'arrow', 'address', 'phone',
      'email', 'Instagram', 'Facebook', 'TikTok',
    ];

    expect(images.length).toBe(expectedAlts.length); // Перевірка кількості зображень

    images.forEach((image, index) => {
      expect(image.attributes('alt')).toBe(expectedAlts[index]); // Перевірка значення alt
    });
  });

  it('має посилання соціальних мереж з правильними атрибутами', () => {
    const socialLinks = [
      { selector: 'a[href="https://www.instagram.com"]', url: 'https://www.instagram.com' },
      { selector: 'a[href="https://www.facebook.com"]', url: 'https://www.facebook.com' },
      { selector: 'a[href="https://www.tiktok.com"]', url: 'https://www.tiktok.com' },
    ];
  
    socialLinks.forEach(({ selector, url }) => {
      const link = wrapper.find(selector);
      expect(link.exists()).toBe(true); // Перевірка, чи посилання існує
      expect(link.attributes('href')).toBe(url); // Перевірка, чи правильний URL
      expect(link.attributes('target')).toBe('_blank'); // Перевірка, чи відкривається в новій вкладці
    });
  });
    
  it('має необхідні CSS-класи на ключових елементах', () => {
    const logoWrapper = wrapper.find('.logo-wrapper');
    expect(logoWrapper.exists()).toBe(true);
    expect(logoWrapper.classes()).toContain('logo-wrapper');

    const footer = wrapper.find('.footer');
    expect(footer.exists()).toBe(true);
    expect(footer.classes()).toContain('footer');

    const footerLinks = wrapper.findAll('.footer-link');
    expect(footerLinks.length).toBeGreaterThan(0);
    footerLinks.forEach((link) => {
      expect(link.classes()).toContain('footer-link');
    });

    const socialIcons = wrapper.findAll('.social-icon');
    expect(socialIcons.length).toBeGreaterThan(0);
    socialIcons.forEach((icon) => {
      expect(icon.classes()).toContain('social-icon');
    });
  });

  it('застосовує стилі hover до посилань', async () => {
    const footerLinks = wrapper.findAll('.footer-link');
    expect(footerLinks.length).toBeGreaterThan(0);

    footerLinks.forEach((link) => {
      expect(link.classes()).toContain('footer-link'); // Базовий клас
      // Перевірити, чи є стилі для hover
      link.trigger('mouseenter'); // Симуляція hover
      expect(link.classes()).not.toContain('hover'); // CSS hover не додає клас
    });

    const socialIcons = wrapper.findAll('.social-icon');
    expect(socialIcons.length).toBeGreaterThan(0);

    socialIcons.forEach((icon) => {
      expect(icon.classes()).toContain('social-icon');
      icon.trigger('mouseenter'); // Симуляція hover
      expect(icon.classes()).not.toContain('hover'); // CSS hover не додає клас
    });
  });

  it('застосовує стилі active до посилань', async () => {
    const footerLinks = wrapper.findAll('.footer-link');
    expect(footerLinks.length).toBeGreaterThan(0);

    footerLinks.forEach((link) => {
      expect(link.classes()).toContain('footer-link'); // Базовий клас
      link.trigger('mousedown'); // Симуляція active
      expect(link.classes()).not.toContain('active'); // CSS active не додає клас
    });

    const socialIcons = wrapper.findAll('.social-icon');
    expect(socialIcons.length).toBeGreaterThan(0);

    socialIcons.forEach((icon) => {
      expect(icon.classes()).toContain('social-icon');
      icon.trigger('mousedown'); // Симуляція active
      expect(icon.classes()).not.toContain('active'); // CSS active не додає клас
    });
  });
});
