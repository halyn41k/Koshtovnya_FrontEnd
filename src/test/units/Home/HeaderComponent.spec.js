describe.skip('Тести для MyComponent', () => {
  it('цей тест не виконається', () => {
    expect(true).toBe(false)
  })
})

/*
//Протестовано головні аспекти
beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

jest.mock('axios', () => {
  const interceptors = {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  };

  return {
    __esModule: true,
    default: {
      create: () => ({
        interceptors,
        get: jest.fn(() => Promise.resolve({ data: [] })), // тут можеш вставити реальні mock-дані
        post: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      }),
    },
  };
});

import { mount } from '@vue/test-utils';
import HeaderComponent from '@/components/home/HeaderComponent.vue';

// --- Переклади ---
const translations = {
  uk: {
    aboutUs: 'Про нас',
    aboutDelivery: 'Доставка',
    wishlist: 'Список бажань',
    searchPlaceholder: 'Пошук...',
    logo: 'Коштовня',
    bracelets: 'Браслети',
    herdany: 'Гердани',
    dukats: 'Дукати',
    sylyanky: 'Силянки',
    earrings: 'Сережки',
    belts: 'Пояси',
  },
};

// --- Глобальна конфігурація для тестів ---
const globalConfig = {
  mocks: {
    $t: jest.fn((msg) => translations.uk[msg] || msg),
    $i18n: {
      locale: 'uk',
      changeLocale: jest.fn(function (newLocale) {
        this.locale = newLocale;
        globalConfig.mocks.$t.mockImplementation((msg) => translations[newLocale][msg] || msg);
      }),
    },
  },
  stubs: {
    'router-link': {
      props: ['to'],
      computed: {
        href() {
          if (typeof this.to === 'string') return this.to;
          if (typeof this.to === 'object') {
            const path = this.to.path || '';
            const query = this.to.query
              ? '?' +
              Object.entries(this.to.query)
                .map(([key, val]) => `${key}=${val}`)
                .join('&')
              : '';
            return `${path}${query}`;
          }
          return '';
        },
        isActive() {
          return this.href === '/aboutus'; // ← або передай через data
        }
      },
      template: `<a :href="href" :class="{ active: isActive }"><slot /></a>`,
    },
    SearchResults: {
      props: ['query'],
      template: '<div class="search-results">{{ query }}</div>',
    },
    'dropdown-component': {
      props: ['items', 'value'],
      template: '<div class="dropdown">{{ value }}</div>',
    },
  },
  provide: {
    translations,
  },
};

// --- Початок describe ---
describe('HeaderComponent.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(HeaderComponent, {
      global: globalConfig,
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('перевіряє, що всі навігаційні посилання присутні в DOM', async () => {
    const expectedTexts = ['Про нас', 'Про Оплату | Доставку', 'Список бажань'];

    await wrapper.vm.$nextTick();

    const links = wrapper.findAll('a');
    const foundTexts = links.map((link) => link.text().trim());

    expectedTexts.forEach((expectedText) => {
      const match = foundTexts.find((text) => text.includes(expectedText));
      expect(match).toBeDefined();
    });

    expect(
      expectedTexts.every((text) => foundTexts.some((t) => t.includes(text)))
    ).toBe(true);
  });

  it('перевіряє, що посилання використовують коректні маршрути', async () => {
    const expected = [
      { text: 'Про нас', route: '/aboutus' },
      { text: 'Про Оплату | Доставку', route: '/aboutdelivery' },
      { text: 'Список бажань', routeIncludes: '/account', queryIncludes: 'tab=wishlist' }
    ];

    await wrapper.vm.$nextTick();

    const links = wrapper.findAll('a');

    expected.forEach(({ text, route, routeIncludes, queryIncludes }) => {
      const link = links.find((l) => l.text().includes(text));
      expect(link).toBeDefined();

      const href = link.attributes('href');
      if (route) {
        expect(href).toBe(route);
      }
      if (routeIncludes) {
        expect(href.includes(routeIncludes)).toBe(true);
      }
      if (queryIncludes) {
        expect(href.includes(queryIncludes)).toBe(true);
      }
    });
  });

  it('перевіряє, чи відкривається випадаючий список мов при кліку', async () => {
    const toggleBtn = wrapper.findAll('button').find(btn => btn.text().includes('Українська'));
    expect(toggleBtn).toBeDefined();

    await toggleBtn.trigger('click');
    await wrapper.vm.$nextTick();

    const dropdown = wrapper.findAll('button').filter(btn => btn.text() === 'English');
    expect(dropdown.length).toBe(1);
  });

  it('відображає опції вибору мови при відкритті дропдауну', async () => {
    const toggleButton = wrapper.findAll('button').find(btn =>
      btn.text().includes('Українська') || btn.text().includes('English')
    );
    expect(toggleButton.exists()).toBe(true);

    // Клік на кнопку, щоб відкрити випадаючий список
    await toggleButton.trigger('click');

    const options = wrapper.findAll('ul > li > button');
    const labels = options.map(o => o.text());
    expect(labels).toEqual(expect.arrayContaining(['Українська', 'English']));
  });

  it('змінює мову на English після вибору з дропдауну', async () => {
    const toggleButton = wrapper.findAll('button').find(btn =>
      btn.text().includes('Українська') || btn.text().includes('English')
    );
    await toggleButton.trigger('click');

    const englishOption = wrapper.findAll('ul > li > button').find(btn =>
      btn.text().includes('English')
    );
    expect(englishOption.exists()).toBe(true);

    await englishOption.trigger('click');
    expect(wrapper.vm.selectedLanguage).toBe('en');
    expect(wrapper.vm.$i18n.locale).toBe('en');
    expect(wrapper.find('img').attributes('src')).toContain('gb.png');
  });

  it('відображає опції вибору валюти при відкритті дропдауну', async () => {
    const toggleButton = wrapper.findAll('button').find(btn =>
      btn.text().includes('UAH') || btn.text().includes('USD')
    );
    expect(toggleButton.exists()).toBe(true);

    await toggleButton.trigger('click');

    const currencyOptions = wrapper.findAll('ul > li > button');
    const labels = currencyOptions.map(o => o.text());
    expect(labels).toEqual(expect.arrayContaining(['UAH ₴', 'USD $']));
  });

  it('змінює валюту після вибору з дропдауну', async () => {
    const toggleButton = wrapper.findAll('button').find(btn =>
      btn.text().includes('UAH') || btn.text().includes('USD')
    );
    await toggleButton.trigger('click');

    const usdOption = wrapper.findAll('ul > li > button').find(btn =>
      btn.text().includes('USD')
    );
    expect(usdOption.exists()).toBe(true);

    await usdOption.trigger('click');
    expect(wrapper.vm.selectedCurrency).toBe('USD');
  });

  it('викликає метод changeCurrency при виборі нової валюти', async () => {
    const spy = jest.fn();
    wrapper.vm.changeCurrency = spy;

    const currencyButton = wrapper.findAll('button').find(btn => btn.text().includes('UAH'));
    expect(currencyButton.exists()).toBe(true);
    await currencyButton.trigger('click');

    const usdOption = wrapper.findAll('ul > li > button').find(btn => btn.text().includes('USD'));
    expect(usdOption.exists()).toBe(true);

    await usdOption.trigger('click');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('відображає поле для введення пошуку', () => {
    const input = wrapper.find('input[placeholder="Пошук товарів..."]');
    expect(input.exists()).toBe(true);
  });

  it('оновлює searchQuery при введенні тексту', async () => {
    const input = wrapper.find('input[placeholder="Пошук товарів..."]');
    await input.setValue('Гердани');
    expect(wrapper.vm.searchQuery).toBe('Гердани');
  });

  it('викликає startSearch при Enter', async () => {
    wrapper.vm.startSearch = jest.fn();
    await wrapper.setData({ searchQuery: 'Силянки' });

    const input = wrapper.find('input[placeholder="Пошук товарів..."]');
    await input.trigger('keyup.enter');

    expect(wrapper.vm.startSearch).toHaveBeenCalledTimes(1);
  });

  it('викликає метод startSearch при кліку на іконку пошуку', async () => {
    wrapper.vm.startSearch = jest.fn();
    await wrapper.setData({ searchQuery: 'Тестовий запит' });

    const icon = wrapper.find('button > img[alt="Search"]');
    expect(icon.exists()).toBe(true);

    await icon.trigger('click');
    expect(wrapper.vm.startSearch).toHaveBeenCalledTimes(1);
  });

  it('рендерить значок користувача', () => {
    const userIcon = wrapper.find('img[alt="User"]');
    expect(userIcon.exists()).toBe(true);
    expect(userIcon.attributes('src')).toBeDefined();
  });

  it('рендерить значок кошика', () => {
    const cartIcon = wrapper.find('img[alt="Cart"]');
    expect(cartIcon.exists()).toBe(true);
    expect(cartIcon.attributes('src')).toBeDefined();
  });

  it('не відображає бейдж, якщо cartCount === 0', async () => {
    await wrapper.setData({ cartCount: 0 });

    const cartBadge = wrapper.find('[data-testid="cart-badge"]');
    expect(cartBadge.exists()).toBe(false);
  });

  it('рендери з початковим українським текстом', () => {
    const logoTitle = wrapper.find('a[href="/"] h1');
    expect(logoTitle.exists()).toBe(true);
    expect(logoTitle.text()).toBe('Коштовня');
  });


  // Тести для CSS-класів
  it('перевіряє, що активне посилання має клас active', () => {
    const activeLink = wrapper.find('a.active');
    expect(activeLink.exists()).toBe(true);
    expect(activeLink.attributes('href')).toBe('/aboutus');
  });

  it('перевіряє, що інші посилання не мають класу active', () => {
    const inactiveLinks = wrapper.findAll('a').filter((link) => !link.classes('active'));
    inactiveLinks.forEach((link) => {
      expect(link.classes('active')).toBe(false); // Перевірка відсутності класу
    });
  });

  it('перевіряє, що активне посилання має коректний клас', () => {
    const activeLink = wrapper.find('a.active');
    expect(activeLink.exists()).toBe(true);
    expect(activeLink.classes()).toContain('active');
  });

  it('перевіряє, що неактивні посилання не мають класу active', () => {
    const links = wrapper.findAll('a');
    links.forEach((link) => {
      if (!link.classes().includes('active')) {
        expect(link.classes()).not.toContain('active'); // Всі інші не повинні мати клас active
      }
    });
  });

  it('відображає логотип із правильним src і текстом', () => {
    const logoImg = wrapper.find('a[href="/"] img');
    expect(logoImg.exists()).toBe(true);
    expect(logoImg.attributes('src')).toBeDefined();

    const logoTitle = wrapper.find('a[href="/"] h1');
    expect(logoTitle.exists()).toBe(true);
    expect(logoTitle.text()).toBe('Коштовня');
  });

  it('не відображає SearchResults при пустому searchQuery', async () => {
    await wrapper.setData({ searchQuery: '' });
    expect(wrapper.findComponent({ name: 'SearchResults' }).exists()).toBe(false);
  });

  it('відображає активний маршрут навігації', () => {
    const activeLink = wrapper.find('a.active');
    expect(activeLink.exists()).toBe(true);
    expect(activeLink.text()).toBe('Про нас');
  });

  it('при кліку на корзину переходить на сторінку кошика', async () => {
    const cartLink = wrapper.find('a[href="/cart"]');
    expect(cartLink.exists()).toBe(true);
  });

  it('при кліку на значок користувача переходить у профіль', async () => {
    const userLink = wrapper.find('a[href="/account"]');
    expect(userLink.exists()).toBe(true);
  });

  it('при виборі нової валюти оновлюється selectedCurrency', async () => {
    // Вручну змінюємо, якби був select
    await wrapper.setData({ selectedCurrency: 'USD' });
    expect(wrapper.vm.selectedCurrency).toBe('USD');
  });

  it('при натисканні на значок пошуку викликає startSearch', async () => {
    wrapper.vm.startSearch = jest.fn();

    // Замість .search-icon — знайди кнопку з img[alt="Search"]
    const searchButton = wrapper.find('button img[alt="Search"]');
    expect(searchButton.exists()).toBe(true);

    await searchButton.trigger('click');
    expect(wrapper.vm.startSearch).toHaveBeenCalled();
  });

  it('перемикає mobileSearchActive при виклику toggleMobileSearch', async () => {
    expect(wrapper.vm.mobileSearchActive).toBe(false);
    wrapper.vm.toggleMobileSearch();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.mobileSearchActive).toBe(true);
    wrapper.vm.toggleMobileSearch();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.mobileSearchActive).toBe(false);
  });

  it('перемикає isCategoriesOpen при виклику toggleCategories', async () => {
    expect(wrapper.vm.isCategoriesOpen).toBe(false);
    wrapper.vm.toggleCategories();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.isCategoriesOpen).toBe(true);
  });

  it('не рендерить категорії, якщо categories порожні', async () => {
    await wrapper.setData({ categories: [] });
    const items = wrapper.findAll('.nav-menu ul li');
    expect(items.length).toBe(0);
  });
});*/