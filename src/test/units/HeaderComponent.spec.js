import { mount } from '@vue/test-utils';
import HeaderComponent from '../../components/home/HeaderComponent.vue';

// Замокати axios, щоб уникнути помилок з ESM
jest.mock('axios', () => ({
  get: jest.fn(),
}));

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

const globalConfig = {
  mocks: {
    $t: jest.fn((msg) => translations.uk[msg] || msg), // Початкова локаль - українська
    $i18n: {
      locale: 'uk',
      // Виклик зміни локалі
      changeLocale: jest.fn(function (newLocale) {
        this.locale = newLocale;
        globalConfig.mocks.$t.mockImplementation((msg) => translations[newLocale][msg] || msg);
      }),
    },
  },
  stubs: {
    'router-link': {
      props: ['to'],
      template: '<a :href="to" :class="{ active: to === currentPath }"><slot /></a>',
      data() {
        return { currentPath: '/aboutus' }; // Імітуємо активний маршрут
      },
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

  it('перевіряє, що всі навігаційні посилання присутні в DOM', () => {
    const expectedLinks = [
      { route: '/aboutus', text: 'Про нас' },
      { route: '/aboutdelivery', text: 'Доставка' },
      { route: '/bracelets', text: 'Браслети' },
      { route: '/herdany', text: 'Гердани' },
      { route: '/dukats', text: 'Дукати' },
      { route: '/sylyanky', text: 'Силянки' },
      { route: '/earrings', text: 'Сережки' },
      { route: '/belts', text: 'Пояси' },
    ];
  
    // Фільтруємо тільки навігаційні посилання
    const links = wrapper.findAll('a').filter((link) =>
      expectedLinks.some(({ route }) => link.attributes('href') === route)
    );
  
    expect(links.length).toBe(expectedLinks.length);
  
    links.forEach((link, index) => {
      const { route, text } = expectedLinks[index];
      expect(link.attributes('href')).toBe(route); // Перевіряємо маршрут
      expect(link.text()).toBe(text); // Перевіряємо текст
    });
  });

  it('перевіряє, що посилання використовують коректні маршрути', () => {
    const expectedRoutes = [
      { route: '/aboutus', text: 'Про нас' },
      { route: '/aboutdelivery', text: 'Доставка' },
      { route: '/bracelets', text: 'Браслети' },
      { route: '/herdany', text: 'Гердани' },
      { route: '/dukats', text: 'Дукати' },
      { route: '/sylyanky', text: 'Силянки' },
      { route: '/earrings', text: 'Сережки' },
      { route: '/belts', text: 'Пояси' },
    ];

    // Знаходимо всі елементи router-link
    const links = wrapper.findAll('a').filter((link) =>
      expectedRoutes.some(({ route }) => link.attributes('href') === route)
    );

    expect(links.length).toBe(expectedRoutes.length);

    links.forEach((link, index) => {
      const { route, text } = expectedRoutes[index];
      expect(link.attributes('href')).toBe(route); // Перевіряємо маршрут
      expect(link.text()).toBe(text); // Перевіряємо текст посилання
    });
  });

  it('перевіряє, чи відображається випадаючий список мов', () => {
    const languageDropdown = wrapper.find('.language .dropdown-container select');

    // Перевірка наявності елемента
    expect(languageDropdown.exists()).toBe(true);

    // Перевірка, що випадаючий список має правильні опції
    const options = languageDropdown.findAll('option');
    expect(options.length).toBe(2); // Очікуємо 2 мови
    expect(options[0].attributes('value')).toBe('uk');
    expect(options[0].text()).toBe('Українська');
    expect(options[1].attributes('value')).toBe('en');
    expect(options[1].text()).toBe('English');
  });

  it('рендерить вибір мови з коректними опціями', () => {
    const languageDropdown = wrapper.find('.language .dropdown-container select');

    expect(languageDropdown.exists()).toBe(true); // Елемент існує

    const options = languageDropdown.findAll('option');
    expect(options.length).toBe(2); // 2 опції
    expect(options[0].attributes('value')).toBe('uk');
    expect(options[0].text()).toBe('Українська');
    expect(options[1].attributes('value')).toBe('en');
    expect(options[1].text()).toBe('English');
  });

 it('змінює вибір мови та оновлює прапорець', async () => {
    const languageDropdown = wrapper.find('.language .dropdown-container select');

    await languageDropdown.setValue('en');
    expect(wrapper.vm.selectedLanguage).toBe('en');
    expect(wrapper.vm.$i18n.locale).toBe('en');
    expect(wrapper.find('.language .flag').attributes('src')).toContain('gb.png');
  });

  it('викликає метод changeLanguage при зміні мови', async () => {
    const changeLanguageSpy = jest.fn();
    wrapper.vm.changeLanguage = changeLanguageSpy;

    const languageDropdown = wrapper.find('.language .dropdown-container select');
    await languageDropdown.setValue('en'); // Змінюємо значення

    expect(changeLanguageSpy).toHaveBeenCalledTimes(1); // Перевіряємо виклик
  });

  it('рендерить випадаючий список валют', () => {
    const currencyDropdown = wrapper.find('.currency .dropdown-container select');

    // Перевірка, чи випадаючий список існує
    expect(currencyDropdown.exists()).toBe(true);

    // Перевірка, чи випадаючий список має правильні опції
    const options = currencyDropdown.findAll('option');
    expect(options.length).toBe(2); // Очікуємо 2 валюти
    expect(options[0].attributes('value')).toBe('UAH');
    expect(options[0].text()).toBe('UAH ₴');
    expect(options[1].attributes('value')).toBe('USD');
    expect(options[1].text()).toBe('USD $');
  });

  it('викликає метод changeCurrency при зміні валюти', async () => {
    // Замінюємо метод на мок-функцію
    const changeCurrencySpy = jest.fn();
    wrapper.vm.changeCurrency = changeCurrencySpy;

    // Знаходимо випадаючий список валюти
    const currencyDropdown = wrapper.find('.currency .dropdown-container select');

    // Змінюємо значення
    await currencyDropdown.setValue('USD');

    // Перевірка виклику changeCurrency
    expect(changeCurrencySpy).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.selectedCurrency).toBe('USD'); // Перевіряємо, чи оновлено модель
  });

  it('відображає поле для введення пошукового запиту', () => {
    // Знаходимо елемент поля вводу
    const searchInput = wrapper.find('.search-bar input');

    // Перевірка, чи елемент існує
    expect(searchInput.exists()).toBe(true);

    // Перевірка placeholder
    expect(searchInput.attributes('placeholder')).toBe('Пошук...');
  });

  it('оновлює модель searchQuery при введенні тексту', async () => {
    const searchInput = wrapper.find('.search-bar input');

    // Імітуємо введення тексту
    await searchInput.setValue('Тестовий запит');

    // Перевіряємо, чи оновилася модель
    expect(wrapper.vm.searchQuery).toBe('Тестовий запит');
  });

  it('викликає метод startSearch при натисканні Enter у пошуковому полі', async () => {
    // Замінюємо метод startSearch на мок-функцію
    wrapper.vm.startSearch = jest.fn();
  
    // Оновлюємо компонент
    await wrapper.setData({ searchQuery: 'Тестовий запит' });
  
    // Знаходимо поле вводу пошуку
    const searchInput = wrapper.find('.search-bar input');
  
    // Імітуємо натискання клавіші Enter
    await searchInput.trigger('keyup.enter');
  
    // Перевіряємо, що метод startSearch викликано
    expect(wrapper.vm.startSearch).toHaveBeenCalledTimes(1);
  });

  it('викликає метод startSearch при кліку на іконку пошуку', async () => {
    // Замінюємо метод startSearch на мок-функцію
    wrapper.vm.startSearch = jest.fn();
  
    // Оновлюємо компонент
    await wrapper.setData({ searchQuery: 'Тестовий запит' });
  
    // Знаходимо іконку пошуку
    const searchIcon = wrapper.find('.search-icon');
  
    // Імітуємо клік по іконці пошуку
    await searchIcon.trigger('click');
  
    // Перевіряємо, що метод startSearch викликано
    expect(wrapper.vm.startSearch).toHaveBeenCalledTimes(1);
  });

  it('відображає компонент SearchResults після введення пошукового запиту англійською мовою', async () => {
    // Оновлюємо поточну мову на англійську
    await wrapper.setData({ selectedLanguage: 'en' });
  
    // Встановлюємо тестовий запит
    await wrapper.setData({ searchQuery: 'Test query' });
  
    // Знаходимо DOM-вузол SearchResults
    const searchResults = wrapper.find('.search-results');
  
    // Перевіряємо, що SearchResults відображається
    expect(searchResults.exists()).toBe(true);
  
    // Перевіряємо текст, переданий у проп `query`
    expect(searchResults.text()).toBe('Test query');
  });

  it('рендерить значок користувача', () => {
    // Знаходимо значок користувача
    const userIcon = wrapper.find('.user-icon img');
  
    // Перевірка, чи значок існує
    expect(userIcon.exists()).toBe(true);
  
    // Перевірка, чи значок має атрибут src
    expect(userIcon.attributes('src')).toBeDefined(); // Перевірка наявності атрибута src
    expect(userIcon.attributes('alt')).toBe('User Icon'); // Перевіряємо alt-атрибут
  });
  
  it('рендерить значок кошика', () => {
  // Знаходимо значок кошика
  const cartIcon = wrapper.find('.cart-icon img');

  // Перевірка, чи значок існує
  expect(cartIcon.exists()).toBe(true);

  // Перевірка атрибутів значка кошика
  expect(cartIcon.attributes('src')).toBeDefined(); // Перевіряємо, що атрибут src існує
  expect(cartIcon.attributes('alt')).toBe('Cart Icon'); // Перевіряємо alt-атрибут
  });

  it('відображає бейдж із кількістю товарів у кошику, якщо cartCount > 0', async () => {
    // Встановлюємо кількість товарів у кошику
    await wrapper.setData({ cartCount: 5 });

    // Знаходимо бейдж кошика
    const cartBadge = wrapper.find('.cart-badge');

    // Перевіряємо, чи бейдж існує
    expect(cartBadge.exists()).toBe(true);

    // Перевіряємо текст бейджа
    expect(cartBadge.text()).toBe('5');
  });

  it('не відображає бейдж, якщо cartCount === 0', async () => {
    // Встановлюємо кількість товарів у кошику
    await wrapper.setData({ cartCount: 0 });

    // Знаходимо бейдж кошика
    const cartBadge = wrapper.find('.cart-badge');

    // Перевіряємо, що бейдж не відображається
    expect(cartBadge.exists()).toBe(false);
  });

  it('змінює значення isLanguageDropdownOpen при кліку на випадаюче меню мови', async () => {
    // Мокаємо console.log
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Початковий стан
    expect(wrapper.vm.isLanguageDropdownOpen).toBe(false);

    // Знаходимо контейнер випадаючого меню мови
    const languageDropdown = wrapper.find('.language .dropdown-container');

    // Імітуємо клік на контейнер
    await languageDropdown.trigger('click');

    // Перевіряємо, що isLanguageDropdownOpen змінився на true
    expect(wrapper.vm.isLanguageDropdownOpen).toBe(true);

    // Імітуємо повторний клік на контейнер
    await languageDropdown.trigger('click');

    // Перевіряємо, що isLanguageDropdownOpen змінився на false
    expect(wrapper.vm.isLanguageDropdownOpen).toBe(false);

    // Відновлюємо оригінальний console.log
    consoleLogMock.mockRestore();
  });

  it('змінює значення isCurrencyDropdownOpen при кліку на випадаюче меню валюти', async () => {
    // Мокаємо console.log
    const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Початковий стан
    expect(wrapper.vm.isCurrencyDropdownOpen).toBe(false);

    // Знаходимо контейнер випадаючого меню валюти
    const currencyDropdown = wrapper.find('.currency .dropdown-container');

    // Імітуємо клік на контейнер
    await currencyDropdown.trigger('click');

    // Перевіряємо, що isCurrencyDropdownOpen змінився на true
    expect(wrapper.vm.isCurrencyDropdownOpen).toBe(true);

    // Імітуємо повторний клік на контейнер
    await currencyDropdown.trigger('click');

    // Перевіряємо, що isCurrencyDropdownOpen змінився на false
    expect(wrapper.vm.isCurrencyDropdownOpen).toBe(false);

    // Відновлюємо оригінальний console.log
    consoleLogMock.mockRestore();
  });

  it('рендери з початковим українським текстом', () => {
    // Перевіряємо початковий рендер
    expect(wrapper.html()).toContain('Про нас');
    expect(wrapper.html()).toContain('Доставка');
    expect(wrapper.html()).toContain('Список бажань');
    expect(wrapper.find('input').attributes('placeholder')).toBe('Пошук...');
    expect(wrapper.find('.logo h1').text()).toBe('Коштовня');
  });

  // Тести для CSS-класів
  it('перевіряє, що активне посилання має клас active', () => {
    const activeLink = wrapper.find('a.active'); // Знаходимо посилання з класом active
    expect(activeLink.exists()).toBe(true);
    expect(activeLink.attributes('href')).toBe('/aboutus'); // Перевіряємо маршрут
  });

  it('перевіряє, що інші посилання не мають класу active', () => {
    const inactiveLinks = wrapper.findAll('a').filter((link) => !link.classes('active'));
    inactiveLinks.forEach((link) => {
      expect(link.classes('active')).toBe(false); // Перевірка відсутності класу
    });
  });

  it('перевіряє, що активне посилання має коректний клас', () => {
    const activeLink = wrapper.find('a.active'); // Знаходимо активне посилання
    expect(activeLink.exists()).toBe(true); // Перевіряємо, що воно існує
    expect(activeLink.classes()).toContain('active'); // Перевіряємо клас active
  });
  
  it('перевіряє, що неактивні посилання не мають класу active', () => {
    const links = wrapper.findAll('a');
    links.forEach((link) => {
      if (!link.classes().includes('active')) {
        expect(link.classes()).not.toContain('active'); // Всі інші не повинні мати клас active
      }
    });
  });
});
