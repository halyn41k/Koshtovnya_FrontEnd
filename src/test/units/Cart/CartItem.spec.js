// describe.skip('Тести для MyComponent', () => {
//     it('цей тест не виконається', () => {
//       expect(true).toBe(false)
//     })
//   })
  
  //Протестовано головні аспекти
  
import { shallowMount } from '@vue/test-utils';
import CartItem from '@/components/Cart/CartItem.vue';

describe('CartItem.vue - Рендеринг базової структури', () => {
  let wrapper;
  const props = {
    id: '1',
    itemNumber: 3,
    imageSrc: 'https://example.com/image.jpg',
    title: 'Test Product',
    price: 100,
    quantity: 2,
    isAvailable: true,
    errorMessage: '',
    selectedSize: 'M',
    variants: [{ size: 'M', isAvailable: true }]
  };

  beforeEach(() => {
    wrapper = shallowMount(CartItem, {
      propsData: props,
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('рендериться як <article> з класом "cart-item"', () => {
    expect(wrapper.element.tagName).toBe('ARTICLE');
    expect(wrapper.classes()).toContain('cart-item');
  });

  it('відображається номер товару з точкою після нього', () => {
    const itemNumberEl = wrapper.find('.item-number');
    expect(itemNumberEl.exists()).toBe(true);
    expect(itemNumberEl.text()).toBe(`${props.itemNumber}.`);
  });

  it('рендериться зображення з коректними атрибутами src та alt', () => {
    const imageEl = wrapper.find('img.item-image');
    expect(imageEl.exists()).toBe(true);
    expect(imageEl.attributes('src')).toBe(props.imageSrc);
    expect(imageEl.attributes('alt')).toBe(props.title);
  });

  it('рендеряться деталі товару: заголовок, ціна та інформація про кількість', () => {
    const titleEl = wrapper.find('.item-title');
    expect(titleEl.exists()).toBe(true);
    expect(titleEl.text()).toBe(props.title);

    const priceEl = wrapper.find('.item-price');
    expect(priceEl.exists()).toBe(true);
    expect(priceEl.text()).toContain(`${props.price}₴`);

    const quantityEl = wrapper.find('.item-quantity');
    expect(quantityEl.exists()).toBe(true);
    expect(quantityEl.text()).toContain(`Кількість: ${props.quantity}`);
  });
});

describe('CartItem.vue - Рендеринг селектора розміру', () => {
    let wrapper;
    const customProps = {
      id: '1',
      itemNumber: 3,
      imageSrc: 'https://example.com/image.jpg',
      title: 'Test Product',
      price: 100,
      quantity: 2,
      isAvailable: true,
      errorMessage: '',
      selectedSize: 'M',
      // Створюємо кілька варіантів для перевірки
      variants: [
        { size: 'M', isAvailable: true },
        { size: 'L', isAvailable: false },
        { size: 'S', isAvailable: true }
      ]
    };
  
    beforeEach(() => {
      wrapper = shallowMount(CartItem, {
        propsData: customProps,
      });
    });
  
    afterEach(() => {
      wrapper.unmount();
    });
  
    it('селектор містить усі варіанти з props variants', () => {
      const selectEl = wrapper.find('select.size-dropdown');
      expect(selectEl.exists()).toBe(true);
      // Знаходимо всі option елементи
      const options = selectEl.findAll('option');
      expect(options.length).toBe(customProps.variants.length);
      // Перевіряємо, що текст опцій співпадає з варіантами
      options.forEach((optionWrapper, index) => {
        expect(optionWrapper.text()).toBe(customProps.variants[index].size);
      });
    });
  
    it('для кожного варіанту встановлюється правильний value та прапорець disabled залежно від isAvailable', () => {
      const options = wrapper.findAll('select.size-dropdown option');
      options.forEach((optionWrapper, index) => {
        const variant = customProps.variants[index];
        expect(optionWrapper.attributes('value')).toBe(variant.size);
        // disabled має бути встановлено, якщо variant.isAvailable === false
        if (!variant.isAvailable) {
          expect(optionWrapper.attributes('disabled')).toBeDefined();
        } else {
          expect(optionWrapper.attributes('disabled')).toBeUndefined();
        }
      });
    });
  
    it('при зміні селектора викликається метод updateSize і емiтується подія change-size з коректними даними', async () => {
      const selectEl = wrapper.find('select.size-dropdown');
      // Змінимо значення селектора, встановлюючи новий розмір, наприклад 'S'
      // Оскільки v-model не оновлює props, скористаємося setProps для зміни selectedSize
      await wrapper.setProps({ selectedSize: 'S' });
      // Імітуємо подію change на селекторі
      await selectEl.trigger('change');
      // Перевіряємо, що подія change-size була емiтована
      const emitted = wrapper.emitted('change-size');
      expect(emitted).toBeTruthy();
      // Перевіряємо, що перший емiт має коректну структуру
      expect(emitted[0][0]).toEqual({ id: customProps.id, size: 'S' });
    });
  });

  describe('CartItem.vue - Computed властивості', () => {
  let wrapper;
  const props = {
    id: '1',
    itemNumber: 3,
    imageSrc: 'https://example.com/image.jpg',
    title: 'Test Product',
    price: 100,
    quantity: 2,
    isAvailable: true,
    errorMessage: '',
    selectedSize: 'M',
    variants: [
      { size: 'M', isAvailable: true },
      { size: 'L', isAvailable: false },
      { size: 'S', isAvailable: true }
    ]
  };

  beforeEach(() => {
    wrapper = shallowMount(CartItem, {
      propsData: props,
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('computed totalPrice повертає добуток price на quantity', () => {
    expect(wrapper.vm.totalPrice).toBe(props.price * props.quantity);
  });

  it('computed selectedVariant: якщо selectedSize немає значення, емiтиться подія change-size з першим варіантом', () => {
    // Створюємо компонент із пустим selectedSize
    const newProps = { ...props, selectedSize: '' };
    wrapper = shallowMount(CartItem, {
      propsData: newProps,
    });
    // Виклик computed selectedVariant
    const variant = wrapper.vm.selectedVariant;
    // Оскільки selectedSize пустий, computed має повернути {} та емiтити подію change-size з першим варіантом
    const emitted = wrapper.emitted('change-size');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toEqual({ id: props.id, size: props.variants[0].size });
    // Оскільки не знайдено варіанту за пустим selectedSize, computed повертає пустий об'єкт
    expect(variant).toEqual({});
  });
});
describe('CartItem.vue - Computed властивості', () => {
    let wrapper;
    const props = {
      id: '1',
      itemNumber: 3,
      imageSrc: 'https://example.com/image.jpg',
      title: 'Test Product',
      price: 100,
      quantity: 2,
      isAvailable: true,
      errorMessage: '',
      selectedSize: 'M',
      variants: [
        { size: 'M', isAvailable: true },
        { size: 'L', isAvailable: false },
        { size: 'S', isAvailable: true }
      ]
    };
  
    beforeEach(() => {
      wrapper = shallowMount(CartItem, {
        propsData: props,
      });
    });
  
    afterEach(() => {
      wrapper.unmount();
    });
  
    it('computed totalPrice повертає добуток price на quantity', () => {
      expect(wrapper.vm.totalPrice).toBe(props.price * props.quantity);
    });
  
    it('computed selectedVariant: якщо selectedSize немає значення, емiтиться подія change-size з першим варіантом', () => {
      // Створюємо компонент із пустим selectedSize
      const newProps = { ...props, selectedSize: '' };
      wrapper = shallowMount(CartItem, {
        propsData: newProps,
      });
      // Виклик computed selectedVariant
      const variant = wrapper.vm.selectedVariant;
      // Оскільки selectedSize пустий, computed має повернути {} та емiтити подію change-size з першим варіантом
     const emitted = wrapper.emitted('change-size');
     expect(emitted).toBeTruthy();
     expect(emitted[0][0]).toEqual({ id: props.id, size: props.variants[0].size });
     // Оскільки не знайдено варіанту за пустим selectedSize, computed повертає пустий об'єкт
     expect(variant).toEqual({});
   });
});
describe('CartItem.vue - Емит подій (methods)', () => {
  let wrapper;
  const props = {
    id: '1',
    itemNumber: 3,
    imageSrc: 'https://example.com/image.jpg',
    title: 'Test Product',
    price: 100,
    quantity: 2,
    isAvailable: true,
    errorMessage: '',
    selectedSize: 'M',
    variants: [
      { size: 'M', isAvailable: true },
      { size: 'L', isAvailable: false },
      { size: 'S', isAvailable: true }
    ]
  };

  beforeEach(() => {
    wrapper = shallowMount(CartItem, {
      propsData: props,
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('при кліку на кнопку видалення (remove-button) емiтується подія remove-item з ідентифікатором товару', async () => {
    const removeBtn = wrapper.find('button.remove-button');
    expect(removeBtn.exists()).toBe(true);
    await removeBtn.trigger('click');
    const emitted = wrapper.emitted('remove-item');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toBe(props.id);
  });

  it('при кліку на кнопку збільшення кількості (increaseQuantity) емiтується подія change-quantity з новою кількістю (якщо товар доступний)', async () => {
    // Збільшення кількості: нова кількість має бути props.quantity + 1
    const increaseBtn = wrapper.find('button.quantity-button.increase');
    expect(increaseBtn.exists()).toBe(true);
    await increaseBtn.trigger('click');
    const emitted = wrapper.emitted('change-quantity');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toEqual({
      id: props.id,
      quantity: props.quantity + 1,
      operation: 'increase'
    });
  });

  it('при кліку на кнопку зменшення кількості (decreaseQuantity) емiтується подія change-quantity з новою кількістю (якщо товар доступний і кількість більше 1)', async () => {
    // Переконаємося, що quantity більше 1, і товар доступний
    expect(props.quantity).toBeGreaterThan(1);
    const decreaseBtn = wrapper.find('button.quantity-button.decrease');
    expect(decreaseBtn.exists()).toBe(true);
    await decreaseBtn.trigger('click');
    const emitted = wrapper.emitted('change-quantity');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toEqual({
      id: props.id,
      quantity: props.quantity - 1,
      operation: 'decrease'
    });
  });
});
describe('CartItem.vue - Емит подій (methods)', () => {
    let wrapper;
    const props = {
      id: '1',
      itemNumber: 3,
      imageSrc: 'https://example.com/image.jpg',
      title: 'Test Product',
      price: 100,
      quantity: 2,
      isAvailable: true,
      errorMessage: '',
      selectedSize: 'M',
      variants: [
        { size: 'M', isAvailable: true },
        { size: 'L', isAvailable: false },
        { size: 'S', isAvailable: true }
      ]
    };
  
    beforeEach(() => {
      wrapper = shallowMount(CartItem, {
        propsData: props,
      });
    });
  
    afterEach(() => {
      wrapper.unmount();
    });
  
    it('при кліку на кнопку видалення (remove-button) емiтується подія remove-item з ідентифікатором товару', async () => {
      const removeBtn = wrapper.find('button.remove-button');
      expect(removeBtn.exists()).toBe(true);
      await removeBtn.trigger('click');
      const emitted = wrapper.emitted('remove-item');
      expect(emitted).toBeTruthy();
      expect(emitted[0][0]).toBe(props.id);
    });
  
    it('при кліку на кнопку збільшення кількості (increaseQuantity) емiтується подія change-quantity з новою кількістю (якщо товар доступний)', async () => {
      // Збільшення кількості: нова кількість має бути props.quantity + 1
      const increaseBtn = wrapper.find('button.quantity-button.increase');
      expect(increaseBtn.exists()).toBe(true);
      await increaseBtn.trigger('click');
      const emitted = wrapper.emitted('change-quantity');
      expect(emitted).toBeTruthy();
      expect(emitted[0][0]).toEqual({
        id: props.id,
        quantity: props.quantity + 1,
        operation: 'increase'
      });
    });
  
    it('при кліку на кнопку зменшення кількості (decreaseQuantity) емiтується подія change-quantity з новою кількістю (якщо товар доступний і кількість більше 1)', async () => {
      // Переконаємося, що quantity більше 1, і товар доступний
      expect(props.quantity).toBeGreaterThan(1);
      const decreaseBtn = wrapper.find('button.quantity-button.decrease');
      expect(decreaseBtn.exists()).toBe(true);
      await decreaseBtn.trigger('click');
      const emitted = wrapper.emitted('change-quantity');
      expect(emitted).toBeTruthy();
      expect(emitted[0][0]).toEqual({
        id: props.id,
        quantity: props.quantity - 1,
        operation: 'decrease'
      });
    });
});

describe('CartItem.vue - Кнопки збільшення/зменшення', () => {
    let wrapper;
    const baseProps = {
      id: '1',
      itemNumber: 3,
      imageSrc: 'https://example.com/image.jpg',
      title: 'Test Product',
      price: 100,
      quantity: 2,
      isAvailable: true,
      errorMessage: '',
      selectedSize: 'M',
      variants: [{ size: 'M', isAvailable: true }]
    };
  
    afterEach(() => {
      if (wrapper) {
        wrapper.unmount();
      }
    });
  
    it('кнопки збільшення та зменшення неактивні (disabled), якщо isAvailable встановлена в false', () => {
      wrapper = shallowMount(CartItem, {
        propsData: {
          ...baseProps,
          isAvailable: false,
        },
      });
      const increaseBtn = wrapper.find('button.quantity-button.increase');
      const decreaseBtn = wrapper.find('button.quantity-button.decrease');
      expect(increaseBtn.attributes('disabled')).toBeDefined();
      expect(decreaseBtn.attributes('disabled')).toBeDefined();
    });
  
    it('кнопка зменшення не емiтує подію, коли quantity рівне 1 (щоб не було зменшення нижче мінімуму)', async () => {
      wrapper = shallowMount(CartItem, {
        propsData: {
          ...baseProps,
          quantity: 1,
        },
      });
      const decreaseBtn = wrapper.find('button.quantity-button.decrease');
      await decreaseBtn.trigger('click');
      expect(wrapper.emitted('change-quantity')).toBeFalsy();
    });
});

describe('CartItem.vue - Повідомлення про помилку', () => {
    let wrapper;
    const props = {
      id: '1',
      itemNumber: 3,
      imageSrc: 'https://example.com/image.jpg',
      title: 'Test Product',
      price: 100,
      quantity: 2,
      isAvailable: false, // Товар недоступний
      errorMessage: 'Товар недоступний',
      selectedSize: 'M',
      variants: [{ size: 'M', isAvailable: true }]
    };
  
    beforeEach(() => {
      wrapper = shallowMount(CartItem, {
        propsData: props,
      });
    });
  
    afterEach(() => {
      wrapper.unmount();
    });
  
    it('якщо isAvailable має значення false, відображається елемент з класом error-message із заданим текстом', () => {
      const errorEl = wrapper.find('.error-message');
      expect(errorEl.exists()).toBe(true);
      expect(errorEl.text()).toBe(props.errorMessage);
    });
});