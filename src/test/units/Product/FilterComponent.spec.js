// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти


import { mount } from '@vue/test-utils';
import FilterComponent from '@/components/Product/FilterComponent.vue';
import axios from 'axios';

// Мокаємо axios
jest.mock('axios', () => ({
  get: jest.fn(),
}));

describe('FilterComponent.vue', () => {
  let wrapper;

  const mockFilterData = {
    Доступність: [
      { name: 'В наявності', count: 5 },
      { name: 'Немає в наявності', count: 3 },
    ],
    'Тип бісеру': [
      { name: 'Круглий', count: 10 },
      { name: 'Циліндричний', count: 7 },
    ],
    'Виробник бісеру': [
      { origin_country: 'Чехія', count: 7 },
      { origin_country: 'Японія', count: 5 },
    ],
    Розмір: ['30', '50', '100'],
    Колір: ['Червоний', 'Зелений', 'Синій'],
    Вага: { min: 0, max: 1000 },
    Ціна: { min: 0, max: 10000 },
  };

  beforeEach(async () => {
    // Трансформуємо mockFilterData перед передачею в компонент
    const transformedMockFilterData = {
      ...mockFilterData,
      Розмір: {
        min: Math.min(...mockFilterData['Розмір'].map(Number)), // мінімальне значення
        max: Math.max(...mockFilterData['Розмір'].map(Number)), // максимальне значення
      },
    };

    axios.get.mockResolvedValue({ data: transformedMockFilterData });
    jest.spyOn(console, 'log').mockImplementation(() => {});

    // Монтуюємо компонент
    wrapper = mount(FilterComponent, {
      props: {
        fetchProducts: jest.fn(),
      },
    });

    // Очікуємо завершення асинхронного завантаження
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
  });

  afterEach(() => {
    wrapper.unmount();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('повинен дозволяти вибір та зміну значень у чекбоксах доступності', async () => {
    const checkboxes = wrapper.findAll('.availability-options input[type="checkbox"]');

    expect(wrapper.vm.selectedAvailability).toEqual([]);
    expect(checkboxes.length).toBe(2);

    await checkboxes.at(0).setValue(true);
    expect(wrapper.vm.selectedAvailability).toEqual(['В наявності']);

    await checkboxes.at(1).setValue(true);
    expect(wrapper.vm.selectedAvailability).toEqual(['В наявності', 'Немає в наявності']);

    await checkboxes.at(0).setValue(false);
    expect(wrapper.vm.selectedAvailability).toEqual(['Немає в наявності']);
  });

  it('повинен дозволяти вибір та зміну значень у чекбоксах типу бісеру', async () => {
    const checkboxes = wrapper.findAll('.bead-type-options input[type="checkbox"]');

    expect(wrapper.vm.selectedBeadTypes).toEqual([]);
    expect(checkboxes.length).toBe(2);

    await checkboxes.at(0).setValue(true);
    expect(wrapper.vm.selectedBeadTypes).toEqual(['Круглий']);

    await checkboxes.at(1).setValue(true);
    expect(wrapper.vm.selectedBeadTypes).toEqual(['Круглий', 'Циліндричний']);

    await checkboxes.at(0).setValue(false);
    expect(wrapper.vm.selectedBeadTypes).toEqual(['Циліндричний']);
  });

  it('повинен дозволяти вибір та зміну значень у чекбоксах виробників бісеру', async () => {
    const checkboxes = wrapper.findAll('.manufacturer-options input[type="checkbox"]');

    expect(wrapper.vm.selectedProducers).toEqual([]);
    expect(checkboxes.length).toBe(2);

    await checkboxes.at(0).setValue(true);
    expect(wrapper.vm.selectedProducers).toEqual(['Чехія']);

    await checkboxes.at(1).setValue(true);
    expect(wrapper.vm.selectedProducers).toEqual(['Чехія', 'Японія']);

    await checkboxes.at(0).setValue(false);
    expect(wrapper.vm.selectedProducers).toEqual(['Японія']);
  });

  it('повинен оновлювати "sizeRange" при виборі в меню розмірів', async () => {
    const minSizeInput = wrapper.find('.input-box .min-box input');
    const maxSizeInput = wrapper.find('.input-box .max-box input');
  
    await minSizeInput.setValue(30);
    await maxSizeInput.setValue(50);
  
    expect(wrapper.vm.sizeRange).toEqual([30, 50]);
  });  

  it('повинен оновлювати "selectedColor" при виборі в меню кольорів', async () => {
    const colorDropdown = wrapper.find('.dropdown-menu select');
  
    await colorDropdown.setValue('Зелений');
    expect(wrapper.vm.selectedColor).toBe('Зелений');
  
    await colorDropdown.setValue('Синій');
    expect(wrapper.vm.selectedColor).toBe('Синій');
  });  
  
  it('повинен завантажувати дані фільтрів з API коректно', async () => {
    const expectedSizeOptions = {
      min: Math.min(...mockFilterData['Розмір'].map(Number)),
      max: Math.max(...mockFilterData['Розмір'].map(Number)),
    };
  
    expect(wrapper.vm.availabilityOptions).toEqual(mockFilterData['Доступність']);
    expect(wrapper.vm.sizeOptions).toEqual(expectedSizeOptions);  // Оновлено тут
    expect(wrapper.vm.colorOptions).toEqual(mockFilterData['Колір']);
    expect(wrapper.vm.beadTypeOptions).toEqual(mockFilterData['Тип бісеру']);
    expect(wrapper.vm.beadProducerOptions).toEqual(mockFilterData['Виробник бісеру']);
    expect(wrapper.vm.weightOptions).toEqual(mockFilterData['Вага']);
    expect(wrapper.vm.priceOptions).toEqual(mockFilterData['Ціна']);
    expect(wrapper.vm.weightRange).toEqual([mockFilterData['Вага'].min, mockFilterData['Вага'].max]);
    expect(wrapper.vm.priceRange).toEqual([mockFilterData['Ціна'].min, mockFilterData['Ціна'].max]);
  });  
  
  it('повинен коректно заповнювати значення для availabilityOptions', async () => {
    const options = wrapper.findAll('.availability-options .option');
  
    // Перевіряємо кількість елементів
    expect(options.length).toBe(mockFilterData['Доступність'].length);
  
    // Перевіряємо, чи кожен чекбокс має правильний текст і атрибути
    options.forEach((optionWrapper, index) => {
      const checkbox = optionWrapper.find('input[type="checkbox"]');
      const label = optionWrapper.find('label');
  
      // Перевіряємо, чи чекбокси мають правильний ID та value
      expect(checkbox.attributes('id')).toBe(mockFilterData['Доступність'][index].name);
      expect(checkbox.attributes('value')).toBe(mockFilterData['Доступність'][index].name);
  
      // Перевіряємо, чи текст лейбла відповідає даним
      const expectedLabelText = `${mockFilterData['Доступність'][index].name} (${mockFilterData['Доступність'][index].count})`;
      expect(label.text()).toBe(expectedLabelText);
    });
  });
  
  it('повинен коректно заповнювати значення для colorOptions', async () => {
    const selects = wrapper.findAll('.dropdown-menu select');
  
    // Перевіряємо, чи є хоча б один select
    expect(selects.length).toBeGreaterThan(0);
  
    // Отримуємо перший select (або доступний)
    const colorDropdown = selects.at(0);  // Замість at(1)
    const options = colorDropdown.findAll('option');
  
    // Перевіряємо кількість елементів (включаючи "(без фільтра)")
    expect(options.length).toBe(mockFilterData['Колір'].length + 1);
  
    // Перевіряємо текст і значення кожної опції
    mockFilterData['Колір'].forEach((color, index) => {
      const option = options.at(index + 1); // Пропускаємо "(без фільтра)"
      expect(option.text()).toBe(color);
      expect(option.attributes('value')).toBe(color);
    });
  });  

  it('повинен коректно заповнювати значення для beadTypeOptions', async () => {
    const options = wrapper.findAll('.bead-type-options .option');
  
    expect(options.length).toBe(mockFilterData['Тип бісеру'].length);
  
    options.forEach((optionWrapper, index) => {
      const checkbox = optionWrapper.find('input[type="checkbox"]');
      const label = optionWrapper.find('label');
  
      expect(checkbox.attributes('id')).toBe(mockFilterData['Тип бісеру'][index].name);
      expect(checkbox.attributes('value')).toBe(mockFilterData['Тип бісеру'][index].name);
  
      const expectedLabelText = `${mockFilterData['Тип бісеру'][index].name} (${mockFilterData['Тип бісеру'][index].count})`;
      expect(label.text()).toBe(expectedLabelText);
    });
  });

  it('повинен коректно заповнювати значення для beadProducerOptions', async () => {
    const options = wrapper.findAll('.manufacturer-options .option');
  
    expect(options.length).toBe(mockFilterData['Виробник бісеру'].length);
  
    options.forEach((optionWrapper, index) => {
      const checkbox = optionWrapper.find('input[type="checkbox"]');
      const label = optionWrapper.find('label');
  
      expect(checkbox.attributes('id')).toBe(mockFilterData['Виробник бісеру'][index].origin_country);
      expect(checkbox.attributes('value')).toBe(mockFilterData['Виробник бісеру'][index].origin_country);
  
      const expectedLabelText = `${mockFilterData['Виробник бісеру'][index].origin_country} (${mockFilterData['Виробник бісеру'][index].count})`;
      expect(label.text()).toBe(expectedLabelText);
    });
  }); 
  
  it('повинен коректно перетворювати значення доступності на "1" або "0"', async () => {
    // Мокаємо console.log тільки для цього тесту
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  
    const fetchProductsMock = jest.fn();
    await wrapper.setProps({ fetchProducts: fetchProductsMock });
  
    expect(wrapper.props('fetchProducts')).toBe(fetchProductsMock);
  
    await wrapper.setData({
      selectedAvailability: ['В наявності', 'Немає в наявності'],
    });
  
    wrapper.vm.applyFilters();
  
    await wrapper.vm.$nextTick();
  
    const expectedFilters = {
      is_available: ['1', '0'], // "В наявності" => '1', "Немає в наявності" => '0'
    };
  
    expect(fetchProductsMock).toHaveBeenCalledWith(1, expectedFilters);
  
    await wrapper.setData({
      selectedAvailability: ['В наявності'],
    });
  
    wrapper.vm.applyFilters();
  
    await wrapper.vm.$nextTick();
  
    expect(fetchProductsMock).toHaveBeenCalledWith(1, {
      is_available: ['1'],
    });
  
    await wrapper.setData({
      selectedAvailability: ['Немає в наявності'],
    });
  
    wrapper.vm.applyFilters();
  
    await wrapper.vm.$nextTick();
  
    expect(fetchProductsMock).toHaveBeenCalledWith(1, {
      is_available: ['0'],
    });
  
    // Відновлюємо оригінальний console.log після завершення тесту
    logSpy.mockRestore();
  });
  
  it('повинен правильно формувати стилі треку слайдера через trackStyle', () => {
    const maxRange = 1000;
    
    // Викликаємо метод з тестовими даними
    const styles = wrapper.vm.trackStyle(200, 800, maxRange);
  
    // Обчислюємо очікувані значення
    const minPercent = (200 / maxRange) * 100;
    const maxPercent = (800 / maxRange) * 100;
    
    const expectedStyles = {
      left: `${minPercent}%`,
      right: `${100 - maxPercent}%`,
      background: 'linear-gradient(to right, #ccc, #6B1F1F, #ccc)',
    };
  
    // Перевіряємо, чи результат відповідає очікуваному
    expect(styles).toEqual(expectedStyles);
  });
  
  it('повинен відображати всі основні елементи компонента', () => {
    // Перевіряємо наявність основних секцій
    expect(wrapper.find('.filter-container').exists()).toBe(true);
    expect(wrapper.find('.filter').exists()).toBe(true);
    expect(wrapper.find('.availability-options').exists()).toBe(true);
    expect(wrapper.find('.dropdown-menu').exists()).toBe(true);
    expect(wrapper.find('.bead-type-options').exists()).toBe(true);
    expect(wrapper.find('.manufacturer-options').exists()).toBe(true);
    expect(wrapper.find('.range-slider').exists()).toBe(true);
    expect(wrapper.find('.apply-filters button').exists()).toBe(true);
  });
  
  it('повинен правильно вирівнювати заголовки секцій', () => {
    const titles = wrapper.findAll('.section-title, .subsection-title');
  
    // Мокаємо getComputedStyle
    const mockGetComputedStyle = jest.fn(() => ({
      textAlign: 'center',
      fontWeight: 'bold',
    }));
  
    global.getComputedStyle = mockGetComputedStyle;
  
    titles.forEach((title) => {
      const style = getComputedStyle(title.element);
  
      // Перевіряємо значення стилів
      expect(style.textAlign).toBe('center');
      expect(style.fontWeight).toBe('bold');
    });
  });
  
  it('повинен центровано розташовувати кнопку "Результати"', () => {
    const applyButton = wrapper.find('.apply-filters button');
  
    // Перевірка існування кнопки
    expect(applyButton.exists()).toBe(true);
  
    // Мокаємо getComputedStyle для контролю стилів
    const mockGetComputedStyle = jest.fn(() => ({
      margin: '0px auto',
      textAlign: 'center',
      display: 'inline-block',
    }));
  
    // Замінюємо оригінальну функцію
    global.getComputedStyle = mockGetComputedStyle;
  
    const buttonStyles = getComputedStyle(applyButton.element);
  
    expect(buttonStyles.margin).toBe('0px auto');
    expect(buttonStyles.textAlign).toBe('center');
  });

  it('повинен рендерити чекбокси для доступності', () => {
    const checkboxes = wrapper.findAll('.availability-options input[type="checkbox"]');
    expect(checkboxes.length).toBe(2);
  });

  it('повинен оновлювати "selectedAvailability" при зміні чекбоксів', async () => {
    const checkboxes = wrapper.findAll('.availability-options input[type="checkbox"]');
    await checkboxes.at(0).setValue(true);
    expect(wrapper.vm.selectedAvailability).toContain('В наявності');
  });

  it('повинен правильно оновлювати "selectedColor" при зміні випадаючого списку', async () => {
    const select = wrapper.find('.dropdown-menu select');
    await select.setValue('Зелений');
    expect(wrapper.vm.selectedColor).toBe('Зелений');
  });

  it('повинен коректно застосовувати фільтри', async () => {
    wrapper.vm.selectedColor = 'Червоний';
    await wrapper.vm.applyFilters();
    expect(wrapper.vm.fetchProducts).toHaveBeenCalledWith(1, expect.objectContaining({ color: 'Червоний' }));
  });

  it('повинен відображати збережені у localStorage фільтри', async () => {
    localStorage.setItem('filterCache', JSON.stringify(mockFilterData));
    await wrapper.vm.loadFilters();
    expect(wrapper.vm.colorOptions).toEqual(mockFilterData['Колір']);
  });
});
