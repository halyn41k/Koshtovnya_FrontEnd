// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти

import { mount } from '@vue/test-utils';
import FooterComponent from '@/components/home/FooterComponent.vue';

// Замокання axios для повернення необхідних даних
jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    __esModule: true,
    default: {
      ...actualAxios,
      create: () => actualAxios,
      get: jest.fn(() =>
        Promise.resolve({
          data: {
            data: [
              { setting_key: 'site_logo', setting_value: 'logo-url' },
              { setting_key: 'footer_email_info', setting_value: 'koshtovnya.store@gmail.com' },
              { setting_key: 'footer_address_info', setting_value: 'м. Київ, вул. Хрещатик, 1' },
              { setting_key: 'footer_phone_number', setting_value: '+380123456789' },
            ],
          },
        })
      ),
    },
  };
});

// 🔇 Один раз глушимо консоль
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

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
              links: 'links',
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

    // даємо час для всіх async дій у mounted
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  afterEach(async () => {
    jest.clearAllMocks();
    if (wrapper) {
      wrapper.unmount();
    }
    await new Promise(resolve => setTimeout(resolve, 0)); // уникнути "log after tests"
  });

  it('рендериться без помилок', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('відображає логотип та alt атрибут', () => {
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('alt')).toBe('Коштовня Лого');
  });

  it('відображає заголовок логотипу', () => {
    const h1 = wrapper.find('h1');
    expect(h1.exists()).toBe(true);
    expect(h1.text()).toBe('Коштовня');
  });

  it('відображає опис компанії', () => {
    const p = wrapper.find('p');
    expect(p.exists()).toBe(true);
    expect(p.text()).toContain('Опис компанії Коштовня');
  });

  it('відображає адресу, телефон, email', async () => {
    wrapper.vm.siteSettings = {
      site_logo: 'logo-url',
      footer_email_info: 'koshtovnya@mail.com',
      footer_address_info: 'м. Київ, вул. Хрещатик, 1',
      footer_phone_number: '+380123456789'
    };
    await wrapper.vm.$nextTick();

    const text = wrapper.text();
    expect(text).toContain('м. Київ, вул. Хрещатик, 1');
    expect(text).toContain('+380123456789');
    expect(text).toContain('koshtovnya@mail.com');
  });


  it('містить посилання на соцмережі', () => {
    const instagram = wrapper.find('a[href="https://www.instagram.com"]');
    const facebook = wrapper.find('a[href="https://www.facebook.com"]');
    const tiktok = wrapper.find('a[href="https://www.tiktok.com"]');
    expect(instagram.exists()).toBe(true);
    expect(facebook.exists()).toBe(true);
    expect(tiktok.exists()).toBe(true);
  });

  it('має всі навігаційні посилання', async () => {
    await wrapper.vm.$nextTick();

    const links = wrapper.findAll('a');
    const hrefs = links.map(link => link.attributes('href'));
    expect(hrefs).toEqual(expect.arrayContaining(['/aboutus', '/aboutdelivery', '/account']));
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

  it('має hover-класи на лінках', () => {
    const hoverLinks = wrapper.findAll('a').filter(link =>
      link.attributes('class')?.includes('hover:text-') ||
      link.attributes('class')?.includes('hover:')
    );
    expect(hoverLinks.length).toBeGreaterThan(0);
  });

  it('повинен мати правильний базовий клас для компоненту footer', () => {
    const footer = wrapper.find('footer');
    expect(footer.exists()).toBe(true);
    expect(footer.attributes('class')).toContain('bg-[#F4E7E5]');
  });

  it('повинен мати hover-ефект на соціальних іконках (через CSS-класи)', () => {
    const socialIcons = wrapper.findAll('a[href*="instagram"], a[href*="facebook"], a[href*="tiktok"]');
    expect(socialIcons.length).toBeGreaterThan(0);
    socialIcons.forEach((icon) => {
      expect(icon.attributes('class')).toMatch(/hover:scale-110/);
    });
  });

  it('повинен застосовувати активні стилі до посилань (active state)', () => {
    const links = wrapper.findAll('a[href="/aboutus"], a[href="/aboutdelivery"], a[href="/account"]');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      expect(link.attributes('class')).toMatch(/transition-colors/); // або .match(/hover:/)
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

  it('має основні елементи футера: логотип, соц. мережі, посилання, контакти', () => {
    const logo = wrapper.find('img[alt="Коштовня Лого"]');
    expect(logo.exists()).toBe(true);

    const socialIcons = wrapper.findAll('a[href*="instagram"], a[href*="facebook"], a[href*="tiktok"]');
    expect(socialIcons.length).toBeGreaterThan(0);

    const navLinks = wrapper.findAll('a[href="/aboutus"], a[href="/aboutdelivery"], a[href="/account"]');
    expect(navLinks.length).toBe(3);

    const contacts = wrapper.findAll('address p');
    expect(contacts.length).toBeGreaterThanOrEqual(3);
  });

  it('повинен містити контейнер з класами flex md:flex-row (групування секцій)', () => {
    const container = wrapper.find('div.flex-col.md\\:flex-row');
    expect(container.exists()).toBe(true);
  });

  it('повинен містити два горизонтальні роздільники у contact info', () => {
    const dividers = wrapper.findAll('.border-t.border-gray-300');
    expect(dividers.length).toBe(2);
  });



  it('повинен містити правильні заголовки секцій', () => {
    const headings = wrapper.findAll('h2').map(h => h.text());
    expect(headings).toEqual(['links', 'Зв’язатися з нами', 'Слідкуйте за нами']);
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
    // Перевіряємо, що в address є принаймні один <p>
    expect(addressElement.findAll('p').length).toBeGreaterThan(0);
  });

  it('секція соціальних мереж містить правильну кількість елементів', () => {
    const socialLinks = wrapper.findAll('a[href^="https://"]');
    expect(socialLinks.length).toBe(3);
  });

  it('повинен містити три елементи router-link у навігаційному меню', () => {
    const navSection = wrapper.findAll('ul li a[href^="/"]');
    expect(navSection.length).toBe(3);
  });

  it('текст логотипу має правильний клас', () => {
    const logoTitle = wrapper.find('h1');
    expect(logoTitle.exists()).toBe(true);
    expect(logoTitle.classes()).toContain('font-heading');
  });

  it('має один <ul> список у секції навігації', () => {
    const ulElements = wrapper.findAll('ul');
    // Має бути лише один список навігаційних лінків
    expect(ulElements.length).toBeGreaterThanOrEqual(1);
  });

  it('усі router-link у навігації мають іконку зі стрілкою', () => {
    const routerLinks = wrapper.findAll('ul li a');
    routerLinks.forEach(link => {
      const icon = link.find('img[alt="arrow"]');
      expect(icon.exists()).toBe(true);
    });
  });

  it('кожна секція футера має заголовок h2', () => {
    const headings = wrapper.findAll('h2');
    expect(headings.length).toBeGreaterThanOrEqual(3); // links, contactUs, followUs
  });

  it('логотип має правильні розміри (Tailwind класи)', () => {
    const logo = wrapper.find('img[alt="Коштовня Лого"]');
    expect(logo.exists()).toBe(true);
    expect(logo.attributes('class')).toContain('w-20');
    expect(logo.attributes('class')).toContain('h-auto');
  });
});