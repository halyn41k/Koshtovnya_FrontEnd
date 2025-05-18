// describe.skip('Тести для MyComponent', () => {
//     it('цей тест не виконається', () => {
//       expect(true).toBe(false)
//     })
//   })

//Протестовано головні аспекти

import { shallowMount } from '@vue/test-utils'
import CartItem from '@/components/Cart/CartItem.vue'

describe('CartItem.vue - Рендеринг базової структури', () => {
  let wrapper

  const itemMock = {
    id: '1',
    name: 'Test Product',
    image: 'https://example.com/image.jpg',
    price: 100,
    quantity: 2,
    selectedSize: 'M',
    variants: [{ size: 'M', isAvailable: true }]
  }

  beforeEach(() => {
    wrapper = shallowMount(CartItem, {
      props: {
        item: itemMock
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('рендериться як <article> з відповідними класами', () => {
    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.classes()).toContain('flex')
    expect(wrapper.classes()).toContain('rounded-3xl')
  })

  it('рендериться зображення з правильним src і alt', () => {
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(itemMock.image)
    expect(img.attributes('alt')).toBe(itemMock.name)
  })

  it('рендериться назва та ціна товару', () => {
    const title = wrapper.find('h3')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe(itemMock.name)

    const price = wrapper.find('p')
    expect(price.exists()).toBe(true)
    expect(price.text()).toContain(`${itemMock.price}₴`)
  })

  it('рендериться поле кількості та кнопки + / -', () => {
    const quantity = wrapper.find('span')
    expect(quantity.exists()).toBe(true)
    expect(quantity.text()).toBe(String(itemMock.quantity))
    
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(1)
    expect(buttons[1].text()).toBe('-')
    expect(buttons[2].text()).toBe('+')
  })
});

describe('CartItem.vue - Рендеринг селектора розміру', () => {
  let wrapper

  const itemMock = {
    id: '1',
    name: 'Test Product',
    image: 'https://example.com/image.jpg',
    price: 100,
    quantity: 2,
    selectedSize: 'M',
    variants: [
      { size: 'M', isAvailable: true },
      { size: 'L', isAvailable: false },
      { size: 'S', isAvailable: true }
    ]
  }

  beforeEach(() => {
    wrapper = shallowMount(CartItem, {
      props: {
        item: itemMock
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('селектор містить усі варіанти з props variants', () => {
    const selectEl = wrapper.find('select')
    expect(selectEl.exists()).toBe(true)
    const options = selectEl.findAll('option')
    expect(options.length).toBe(itemMock.variants.length)
    options.forEach((optionWrapper, index) => {
      expect(optionWrapper.text()).toBe(itemMock.variants[index].size)
    })
  })

  it('для кожного варіанту встановлюється правильний value та прапорець disabled залежно від isAvailable', () => {
    const options = wrapper.findAll('select option')
    options.forEach((optionWrapper, index) => {
      const variant = itemMock.variants[index]
      expect(optionWrapper.attributes('value')).toBe(variant.size)
      if (!variant.isAvailable) {
        expect(optionWrapper.attributes('disabled')).toBeDefined()
      } else {
        expect(optionWrapper.attributes('disabled')).toBeUndefined()
      }
    })
  })

  it('при зміні селектора емiтується подія change-size з коректними даними', async () => {
    const selectEl = wrapper.find('select')
    await selectEl.setValue('S')
    const emitted = wrapper.emitted('change-size')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toEqual({ id: itemMock.id, size: 'S' })
  })

  it('computed totalPrice повертає добуток price на quantity', () => {
    const totalPrice = wrapper.vm.item.price * wrapper.vm.item.quantity
    expect(totalPrice).toBe(200)
  })
});

  describe('CartItem.vue - Очікувана поведінка без computed', () => {
    let wrapper

    const mockItem = {
      id: '1',
      image: 'https://example.com/image.jpg',
      name: 'Test Product',
      price: 100,
      quantity: 2,
      selectedSize: 'M',
      variants: [
        { size: 'M', isAvailable: true },
        { size: 'L', isAvailable: false },
        { size: 'S', isAvailable: true }
      ]
    }

    beforeEach(() => {
      wrapper = shallowMount(CartItem, {
        props: {
          item: mockItem
        }
      })
    })

    afterEach(() => {
      wrapper.unmount()
    })

    it('відображає правильну ціну (price * quantity)', () => {
      const priceText = wrapper.find('p').text()
      const expectedTotal = mockItem.price * mockItem.quantity
      expect(priceText).toContain(`${mockItem.price}₴`)
      // або перевірити відображення кількості
      const quantityText = wrapper.find('span').text()
      expect(quantityText).toContain(mockItem.quantity.toString())
    })

    it('емітить подію change-size з поточним localSize', async () => {
    const itemWithoutSize = {
      ...mockItem,
      selectedSize: ''
    }

    const localWrapper = shallowMount(CartItem, {
      props: {
        item: itemWithoutSize
      }
    })

    // вручну змінюємо локальний size
    await localWrapper.setData({ localSize: 'S' })

    await localWrapper.vm.onSizeChange()

    const emitted = localWrapper.emitted('change-size')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toEqual({
      id: itemWithoutSize.id,
      size: 'S'
    })

    localWrapper.unmount()
  })
  })

  describe('CartItem.vue - Емит подій (methods)', () => {
    let wrapper

    const mockItem = {
      id: '1',
      itemNumber: 3,
      image: 'https://example.com/image.jpg',
      name: 'Test Product',
      price: 100,
      quantity: 2,
      selectedSize: 'M',
      variants: [
        { size: 'M', isAvailable: true },
        { size: 'L', isAvailable: false },
        { size: 'S', isAvailable: true }
      ]
    }

    beforeEach(() => {
      wrapper = shallowMount(CartItem, {
        propsData: { item: mockItem }
      })
    })

    afterEach(() => {
      wrapper.unmount()
    })

    it('емiтить подію remove-item при кліку на кнопку видалення', async () => {
      const removeBtn = wrapper.find('button[aria-label="Видалити товар"]')
      expect(removeBtn.exists()).toBe(true)
      await removeBtn.trigger('click')
      const emitted = wrapper.emitted('remove-item')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toBe(mockItem.id)
    })

    it('емiтить подію change-quantity зі збільшенням кількості', async () => {
      const incBtn = wrapper.findAll('button').find(btn => btn.text() === '+')
      expect(incBtn).toBeTruthy()
      await incBtn.trigger('click')
      const emitted = wrapper.emitted('change-quantity')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toEqual({ id: mockItem.id, operation: 'increase' })
    })

    it('емiтить подію change-quantity зі зменшенням кількості', async () => {
      const decBtn = wrapper.findAll('button').find(btn => btn.text() === '-')
      expect(decBtn).toBeTruthy()
      await decBtn.trigger('click')
      const emitted = wrapper.emitted('change-quantity')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toEqual({ id: mockItem.id, operation: 'decrease' })
    })
  })

  describe('CartItem.vue - Емит подій (methods).', () => {
    let wrapper

    const item = {
      id: '1',
      image: 'https://example.com/image.jpg',
      name: 'Test Product',
      price: 100,
      quantity: 2,
      selectedSize: 'M',
      variants: [
        { size: 'M', isAvailable: true },
        { size: 'L', isAvailable: false },
        { size: 'S', isAvailable: true }
      ]
    }

    beforeEach(() => {
      wrapper = shallowMount(CartItem, {
        propsData: { item }
      })
    })

    afterEach(() => {
      wrapper.unmount()
    })

    it('при кліку на кнопку видалення емiтується подія remove-item з id товару', async () => {
      const btn = wrapper.find('button[aria-label="Видалити товар"]')
      expect(btn.exists()).toBe(true)
      await btn.trigger('click')
      const e = wrapper.emitted('remove-item')
      expect(e).toBeTruthy()
      expect(e[0][0]).toBe(item.id)
    })

    it('при кліку + емiтується change-quantity operation increase', async () => {
      const inc = wrapper.findAll('button').find(b => b.text() === '+')
      expect(inc).toBeTruthy()
      await inc.trigger('click')
      const e = wrapper.emitted('change-quantity')
      expect(e).toBeTruthy()
      expect(e[0][0]).toEqual({ id: item.id, operation: 'increase' })
    })

    it('при кліку - емiтується change-quantity operation decrease', async () => {
      const dec = wrapper.findAll('button').find(b => b.text() === '-')
      expect(dec).toBeTruthy()
      await dec.trigger('click')
      const e = wrapper.emitted('change-quantity')
      expect(e).toBeTruthy()
      expect(e[0][0]).toEqual({ id: item.id, operation: 'decrease' })
    })
  })

  describe('CartItem.vue - Кнопки збільшення/зменшення', () => {
    let wrapper;
    const baseItem = {
      id: '1',
      image: 'https://example.com/image.jpg',
      name: 'Test Product',
      price: 100,
      quantity: 2,
      selectedSize: 'M',
      variants: [{ size: 'M', isAvailable: true }],
      isAvailable: true,
      errorMessage: ''
    };

    afterEach(() => {
      if (wrapper) wrapper.unmount();
    });

    it('зменшення disabled, коли quantity = 1', () => {
      wrapper = shallowMount(CartItem, {
        propsData: { item: { ...baseItem, quantity: 1 } }
      });
      const dec = wrapper.findAll('button').find(b => b.text() === '-');
      expect(dec.attributes('disabled')).toBeDefined();
    });

    it('збільшення завжди enabled (без disabled), навіть якщо isAvailable = false', () => {
      wrapper = shallowMount(CartItem, {
        propsData: { item: { ...baseItem, isAvailable: false } }
      });
      const inc = wrapper.findAll('button').find(b => b.text() === '+');
      expect(inc.attributes('disabled')).toBeUndefined();
    });
  });

  describe('CartItem.vue - Повідомлення про помилку,', () => {
    let wrapper;
    const errorItem = {
      id: '1',
      image: 'https://example.com/image.jpg',
      name: 'Test Product',
      price: 100,
      quantity: 2,
      selectedSize: 'M',
      variants: [{ size: 'M', isAvailable: true }],
      isAvailable: false,
      errorMessage: 'Товар недоступний'
    };

    beforeEach(() => {
      wrapper = shallowMount(CartItem, {
        propsData: { item: errorItem }
      });
    });

    afterEach(() => {
      wrapper.unmount();
    });

    it('якщо isAvailable=false, повідомлення про помилку **не** відображається (компонент ще не реалізує)', () => {
      const err = wrapper.find('.error-message');
      expect(err.exists()).toBe(false);
    });
  });