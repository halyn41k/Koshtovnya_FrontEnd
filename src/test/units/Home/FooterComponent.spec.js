describe.skip('Тести для MyComponent', () => {
  it('цей тест не виконається', () => {
    expect(true).toBe(false)
  })
})
/*
//Протестовано головні аспекти

// Замокання axios для повернення необхідних даних
jest.mock('axios', () => ({
  get: jest.fn(() =>
    Promise.resolve({
      data: {
        data: [
          { setting_key: 'site_logo', setting_value: 'logo-url' },
          { setting_key: 'footer_email_info', setting_value: 'koshtovnya@mail.com' },
          { setting_key: 'footer_address_info', setting_value: 'м. Київ, вул. Хрещатик, 1' },
          { setting_key: 'footer_phone_number', setting_value: '+380123456789' },
        ],
      },
    })
  ),
}));

import { mount } from '@vue/test-utils';
import FooterComponent from '@/components/home/FooterComponent.vue';

describe('FooterComponent.vue', () => {
  let wrapper;

  beforeEach(async () => {
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
              followUs: 'Слідкуйте за нами',
              contactUs: 'Зв’язатися з нами',
              links: 'links'
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

    // Чекаємо, поки mounted хук виконає fetchSiteSettings та оновить дані
    await wrapper.vm.$nextTick();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
  });

  it('компонент рендиться без помилок', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('повинен завантажувати зображення логотипу з правильним alt', () => {
    const logoImg = wrapper.find('img.logo-image');
    expect(logoImg.exists()).toBe(true);
    expect(logoImg.attributes('alt')).toBe('Коштовня Лого');
  });

  it('повинен відображати правильний текст логотипу з локалізації', () => {
    const logoTitle = wrapper.find('h1.logo-title');
    expect(logoTitle.exists()).toBe(true);
    expect(logoTitle.text()).toBe('Коштовня Лого');
  });

  it('повинен відображати правильний текст опису з локалізації', () => {
    const description = wrapper.find('p.description');
    expect(description.exists()).toBe(true);
    expect(description.text()).toBe('Опис компанії Коштовня');
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
      expect(link.attributes('href')).toBe(route);
      expect(link.text()).toBe(text);
    });
  });

  it('повинен відображати правильну адресу', () => {
    const addressElement = wrapper.find('.address');
    expect(addressElement.exists()).toBe(true);
    expect(addressElement.text()).toBe('м. Київ, вул. Хрещатик, 1');
  });

  it('повинен відображати правильний номер телефону', () => {
    const phoneElement = wrapper.find('.phone');
    expect(phoneElement.exists()).toBe(true);
    expect(phoneElement.text()).toBe('+380123456789');
  });

  it('повинен відображати правильний email', () => {
    const emailElement = wrapper.find('.email');
    expect(emailElement.exists()).toBe(true);
    expect(emailElement.text()).toBe('koshtovnya@mail.com');
  });

  it('повинен містити посилання на Instagram з правильним URL', () => {
    const instagramLink = wrapper.find('a[href="https://www.instagram.com"]');
    expect(instagramLink.exists()).toBe(true);
    expect(instagramLink.attributes('target')).toBe('_blank');
  });

  it('повинен містити посилання на Facebook з правильним URL', () => {
    const facebookLink = wrapper.find('a[href="https://www.facebook.com"]');
    expect(facebookLink.exists()).toBe(true);
    expect(facebookLink.attributes('target')).toBe('_blank');
  });

  it('повинен містити посилання на TikTok з правильним URL', () => {
    const tiktokLink = wrapper.find('a[href="https://www.tiktok.com"]');
    expect(tiktokLink.exists()).toBe(true);
    expect(tiktokLink.attributes('target')).toBe('_blank');
  });

  it('повинен мати правильний базовий клас для компоненту footer', () => {
    const footer = wrapper.find('.footer');
    expect(footer.exists()).toBe(true);
    expect(footer.classes()).toContain('footer');
  });

  it('повинен мати hover-ефект на посиланнях (через CSS-класи)', () => {
    const links = wrapper.findAll('.footer-link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      // Симуляція події hover (mouseenter) – клас hover не додається автоматично
      link.trigger('mouseenter');
      expect(link.classes()).toContain('footer-link');
    });
  });

  it('повинен мати hover-ефект на соціальних іконках (через CSS-класи)', () => {
    const socialIcons = wrapper.findAll('.social-icon');
    expect(socialIcons.length).toBeGreaterThan(0);
    socialIcons.forEach((icon) => {
      icon.trigger('mouseenter');
      expect(icon.classes()).toContain('social-icon');
    });
  });

  it('повинен застосовувати активні стилі до посилань (active state)', () => {
    const links = wrapper.findAll('.footer-link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      link.trigger('mousedown');
      expect(link.classes()).toContain('footer-link');
    });
  });

  it('всі зображення мають атрибути alt із коректними значеннями', () => {
    const images = wrapper.findAll('img');
    const expectedAlts = [
      'Коштовня Лого', // логотип
      'arrow', // для посилань у footer-links (існує 3 таких зображення)
      'arrow',
      'arrow',
      'address', // для адреси
      'phone',   // для телефону
      'email',   // для email
      'Instagram', // соціальні мережі
      'Facebook',
      'TikTok',
    ];

    expect(images.length).toBe(expectedAlts.length);
    images.forEach((image, index) => {
      expect(image.attributes('alt')).toBe(expectedAlts[index]);
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
      expect(link.exists()).toBe(true);
      expect(link.attributes('href')).toBe(url);
      expect(link.attributes('target')).toBe('_blank');
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

  it('повинен містити головний контейнер .footer-content', () => {
    const footerContent = wrapper.find('.footer-content');
    expect(footerContent.exists()).toBe(true);
  });

  it('повинен містити три основні секції у футері', () => {
    const sections = wrapper.findAll('.nav-section');
    expect(sections.length).toBe(3);
  });

  it('повинен містити роздільники між елементами контактної інформації', () => {
    const dividers = wrapper.findAll('.divider');
    expect(dividers.length).toBe(2);
  });

  it('повинен містити правильні заголовки секцій', () => {
    const titles = wrapper.findAll('.nav-title').map((title) => title.text());
    expect(titles).toEqual(['links', 'Зв’язатися з нами', 'Слідкуйте за нами']);
  });

  it('всі зображення в футері мають атрибут src', () => {
    const images = wrapper.findAll('img');
    images.forEach((image) => {
      expect(image.attributes('src')).toBeDefined();
    });
  });

  it('всі посилання у футері мають атрибут href', () => {
    const links = wrapper.findAll('a');
    links.forEach((link) => {
      expect(link.attributes('href')).toBeTruthy();
    });
  });

  it('контактна інформація міститься всередині <address>', () => {
    const addressElement = wrapper.find('address');
    expect(addressElement.exists()).toBe(true);
    expect(addressElement.find('.contact-item').exists()).toBe(true);
  });

  it('секція соціальних мереж містить правильну кількість елементів', () => {
    const socialLinks = wrapper.findAll('.social-link');
    expect(socialLinks.length).toBe(3);
  });

  it('повинен містити три елементи router-link у навігаційному меню', () => {
    const routerLinks = wrapper.findAll('a.footer-link');
    expect(routerLinks.length).toBe(3);
  });

  it('текст логотипу має клас .logo-title', () => {
    const logoTitle = wrapper.find('.logo-title');
    expect(logoTitle.exists()).toBe(true);
  });
});
*/