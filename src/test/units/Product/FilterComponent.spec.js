// describe.skip('Тести для MyComponent', () => {
//   it('цей тест не виконається', () => {
//     expect(true).toBe(false)
//   })
// })

//Протестовано головні аспекти

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

import { mount } from '@vue/test-utils'
import FilterComponent from '@/components/Product/FilterComponent.vue'
import api from '@/services/api'

// Мокаємо API та компонент Slider
jest.mock('@/services/api', () => ({
  getFilter: jest.fn()
}))
jest.mock('@vueform/slider', () => ({
  __esModule: true,
  default: { name: 'Slider', render: () => null, props: ['modelValue', 'min', 'max', 'step', 'range'] }
}))

describe('FilterComponent.vue', () => {
  let wrapper
  const mockData = {
    'Доступність': [
      { name: 'В наявності', count: 5 },
      { name: 'Немає в наявності', count: 3 }
    ],
    'Тип бісеру': [
      { name: 'Круглий', count: 10 }
    ],
    'Виробник бісеру': [
      { origin_country: 'Чехія', count: 7 }
    ],
    'Розмір': { min: '10', max: '50' },
    'Вага':   { min: '0', max: '1000' },
    'Ціна':   { min: '100', max: '5000' },
    'Колір': ['Червоний', 'Зелений'],
    'Категорія': ['А', 'Б']
  }

  beforeEach(async () => {
    api.getFilter.mockResolvedValue(mockData)
    wrapper = mount(FilterComponent, {
      props: {
        initialFilters: { color: 'Зелений', availability: ['В наявності'] },
        hideCategory: false
      }
    })
    // Дочекаємося onMounted та наступних рендерів
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
  })

  afterEach(() => {
    wrapper.unmount()
    jest.clearAllMocks()
  })

  it('відображає чекбокси доступності та оновлює v-model', async () => {
    const labels = wrapper
      .findAll('h2.section-title').at(0)
      .element.nextElementSibling.querySelectorAll('label')
    expect(labels.length).toBe(mockData['Доступність'].length)

    const inputs = wrapper.findAll('input[type="checkbox"][value="В наявності"]')
    await inputs[0].setValue(true)
    expect(wrapper.vm.filters.availability).toContain('В наявності')
  })

  it('відображає рейтинг і оновлює вибір', async () => {
    const ratingSection = wrapper
      .findAll('.subsection-title')
      .find(w => w.text().includes('Рейтинг'))
      .element.parentElement
    const inputs = ratingSection.querySelectorAll('input[type="checkbox"]')
    expect(inputs.length).toBe(5)

    await wrapper.find('input[type="checkbox"][value="4"]').setValue(true)
    expect(wrapper.vm.filters.rating).toContain(4)
  })

  it('рендерить три Slider і передає їм props', () => {
    const sliders = wrapper.findAllComponents({ name: 'Slider' })
    expect(sliders.length).toBe(3)
    expect(sliders[0].props('modelValue')).toEqual([
      +mockData['Розмір'].min,
      +mockData['Розмір'].max
    ])
  })

  it('сортує та відображає кольори, оновлює v-model', async () => {
    const select = wrapper.find('select')
    const optionTexts = select.findAll('option').map(o => o.text())
    expect(optionTexts).toEqual([
      '(без фільтра)',
      'Червоний',
      'Зелений'
    ].sort((a, b) => a.localeCompare(b)))

    await select.setValue('Червоний')
    expect(wrapper.vm.filters.color).toBe('Червоний')
  })

  it('відображає beadTypes та producers і оновлює v-model', async () => {
    await wrapper.find(`input[value="${mockData['Тип бісеру'][0].name}"]`).setValue(true)
    expect(wrapper.vm.filters.beadTypes).toContain('Круглий')

    const prodVal = mockData['Виробник бісеру'][0].origin_country
    await wrapper.find(`input[value="${prodVal}"]`).setValue(true)
    expect(wrapper.vm.filters.producers).toContain(prodVal)
  })

  it('показ/приховує секцію категорій за пропом hideCategory', async () => {
    expect(wrapper.text()).toContain('Категорія')
    await wrapper.setProps({ hideCategory: true })
    expect(wrapper.text()).not.toContain('Категорія')
  })

  it('емітить close на Escape', async () => {
    await wrapper.trigger('keydown.escape')
    expect(wrapper.emitted()).toHaveProperty('close')
  })

  it('емітить apply з очищеними фільтрами при кліку кнопки', async () => {
    wrapper.vm.filters.color = 'Червоний'
    wrapper.vm.filters.category = ['А']
    await wrapper.find('button').trigger('click')
    const applyEvents = wrapper.emitted('apply')
    expect(applyEvents).toHaveLength(1)
    expect(applyEvents[0][0]).toEqual({
      availability: ['В наявності'],
      color: 'Червоний',
      category: ['А']
    })
  })

  it('застосовує initialFilters на mount', () => {
    expect(wrapper.vm.filters.color).toBe('Зелений')
    expect(wrapper.vm.filters.availability).toContain('В наявності')
  })

   it('встановлює loading = false після завантаження навіть при помилці', async () => {
    // змокаємо помилку
    api.getFilter.mockRejectedValueOnce(new Error('Network error'))
    const w = mount(FilterComponent, {
      props: { initialFilters: {}, hideCategory: false }
    })
    expect(w.vm.loading).toBe(true)
    await w.vm.$nextTick()
    await w.vm.$nextTick()
    expect(w.vm.loading).toBe(false)
    w.unmount()
  })

  it('применяє initialFilters.size, weight, price якщо задані', async () => {
    const init = {
      size: [20, 80],
      weight: [200, 800],
      price: [500, 3000]
    }
    const w = mount(FilterComponent, { props: { initialFilters: init, hideCategory: false } })
    await w.vm.$nextTick()
    await w.vm.$nextTick()
    expect(w.vm.filters.size).toEqual([20, 80])
    expect(w.vm.filters.weight).toEqual([200, 800])
    expect(w.vm.filters.price).toEqual([500, 3000])
    w.unmount()
  })

  it('при зміні initialFilters через проп оновлює фільтри (watch)', async () => {
    const w = mount(FilterComponent, { props: { initialFilters: {}, hideCategory: false } })
    await w.vm.$nextTick()
    await w.vm.$nextTick()
    w.setProps({ initialFilters: { color: 'Червоний', availability: ['Немає в наявності'] } })
    await w.vm.$nextTick()
    expect(w.vm.filters.color).toBe('Червоний')
    expect(w.vm.filters.availability).toEqual(['Немає в наявності'])
    w.unmount()
  })

  it('скролить сторінку до верху при застосуванні фільтрів', async () => {
    // спайкуємо window.scrollTo
    const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {})
    await wrapper.find('button').trigger('click')
    expect(scrollSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    scrollSpy.mockRestore()
  })
})
