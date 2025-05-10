<template>
  <div
    class="filter-container w-[350px] h-full min-h-[1750px] p-6 bg-[#fff7f6] shadow-xl rounded-lg font-montserrat"
    @keydown.escape="$emit('close')"
  >
    <section v-if="!loading" class="space-y-8">
      <!-- Доступність -->
      <div class="section bg-white p-4 rounded-lg shadow-sm">
        <h2 class="section-title text-center text-xl font-bold text-gray-800 mb-4">
          Доступність
        </h2>
        <div class="space-y-3">
          <label
            v-for="item in availabilityOptions"
            :key="item.name"
            class="flex items-center space-x-3"
          >
            <input
              type="checkbox"
              :value="item.name"
              v-model="filters.availability"
              class="custom-checkbox"
            />
            <span class="text-base text-gray-700">
              {{ item.name }} ({{ item.count }})
            </span>
          </label>
        </div>
      </div>

      <!-- Рейтинг -->
      <div class="section bg-white p-4 rounded-lg shadow-sm">
        <h3 class="subsection-title mb-3 text-lg font-semibold text-gray-800">
          Рейтинг
        </h3>
        <div class="space-y-3">
          <label v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center space-x-2">
            <input
              type="checkbox"
              :value="star"
              v-model="filters.rating"
              class="custom-checkbox"
            />
            <span class="text-base text-gray-700">{{ star }} зірки</span>
          </label>
        </div>
      </div>

      <!-- Розмір -->
      <div class="section bg-white p-4 rounded-lg shadow-sm">
        <h3 class="subsection-title mb-3 text-lg font-semibold text-gray-800">
          Розмір (см)
        </h3>
        <Slider
          class="w-full"
          v-model="filters.size"
          :min="sizeOptions.min"
          :max="sizeOptions.max"
          :step="1"
          range
        />
      </div>

      <!-- Вага -->
      <div class="section bg-white p-4 rounded-lg shadow-sm">
        <h3 class="subsection-title mb-3 text-lg font-semibold text-gray-800">
          Вага (г)
        </h3>
        <Slider
          class="w-full"
          v-model="filters.weight"
          :min="weightOptions.min"
          :max="weightOptions.max"
          :step="1"
          range
        />
      </div>

      <!-- Ціна -->
      <div class="section bg-white p-4 rounded-lg shadow-sm">
        <h3 class="subsection-title mb-3 text-lg font-semibold text-gray-800">
          Ціна (₴)
        </h3>
        <Slider
          class="w-full"
          v-model="filters.price"
          :min="priceOptions.min"
          :max="priceOptions.max"
          :step="10"
          range
        />
      </div>

      <!-- Колір -->
      <div class="section bg-white p-4 rounded-lg shadow-sm">
        <h3 class="subsection-title mb-3 text-lg font-semibold text-gray-800">
          Колір
        </h3>
        <select
          v-model="filters.color"
          class="w-full p-2 border border-gray-300 bg-white rounded focus:outline-none focus:ring-2 focus:ring-[#6B1F1F]"
        >
          <option value="">(без фільтра)</option>
          <option v-for="color in colorOptions" :key="color" :value="color">
            {{ color }}
          </option>
        </select>
      </div>

      <!-- Тип бісеру -->
      <div class="section bg-white p-4 rounded-lg shadow-sm">
        <h3 class="subsection-title mb-3 text-lg font-semibold text-gray-800">
          Тип бісеру
        </h3>
        <div class="space-y-3">
          <label
            v-for="item in beadTypeOptions"
            :key="item.name"
            class="flex items-center space-x-3"
          >
            <input
              type="checkbox"
              :value="item.name"
              v-model="filters.beadTypes"
              class="custom-checkbox"
            />
            <span class="text-base text-gray-700">
              {{ item.name }} ({{ item.count }})
            </span>
          </label>
        </div>
      </div>

      <!-- Виробник бісеру -->
      <div class="section bg-white p-4 rounded-lg shadow-sm">
        <h3 class="subsection-title mb-3 text-lg font-semibold text-gray-800">
          Виробник бісеру
        </h3>
        <div class="space-y-3">
          <label
            v-for="item in beadProducerOptions"
            :key="item.origin_country"
            class="flex items-center space-x-3"
          >
            <input
              type="checkbox"
              :value="item.origin_country"
              v-model="filters.producers"
              class="custom-checkbox"
            />
            <span class="text-base text-gray-700">
              {{ item.origin_country }} ({{ item.count }})
            </span>
          </label>
        </div>
      </div>

      <!-- Категорія -->
      <div class="section bg-white p-4 rounded-lg shadow-sm">
        <h3 class="subsection-title mb-3 text-lg font-semibold text-gray-800">
          Категорія
        </h3>
        <div class="space-y-3">
          <label
            v-for="cat in categoryOptions"
            :key="cat"
            class="flex items-center space-x-3"
          >
            <input
              type="checkbox"
              :value="cat"
              v-model="filters.category"
              class="custom-checkbox"
            />
            <span class="text-base text-gray-700">
              {{ cat }}
            </span>
          </label>
        </div>
      </div>

      <!-- Кнопка застосувати -->
      <div class="flex justify-center">
        <button
          @click="applyFilters"
          class="w-full max-w-xs px-6 py-3 bg-[#6B1F1F] text-white font-semibold rounded-lg hover:bg-[#531717] transition"
        >
          Застосувати фільтри
        </button>
      </div>
    </section>

    <div v-else class="text-center text-gray-500 py-8">
      Завантаження фільтрів...
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import Slider from '@vueform/slider'
import api from '@/services/api'

export default {
  name: 'FilterComponent',
  components: { Slider },
  props: {
    initialFilters: { type: Object, default: () => ({}) }
  },
  emits: ['apply', 'close'],
  setup(props, { emit }) {
    const loading = ref(true)
    const filters = reactive({
      availability: [],
      size: [0, 100],
      weight: [0, 1000],
      price: [0, 10000],
      color: '',
      beadTypes: [],
      producers: [],
      category: [],
      rating: []
    })
    const availabilityOptions = ref([])
    const sizeOptions = reactive({ min: 0, max: 100 })
    const weightOptions = reactive({ min: 0, max: 1000 })
    const priceOptions = reactive({ min: 0, max: 10000 })
    const colorOptions = ref([])
    const beadTypeOptions = ref([])
    const beadProducerOptions = ref([])
    const categoryOptions = ref([])

    const loadFilters = async () => {
      try {
        const data = await api.getFilter()
        availabilityOptions.value = data['Доступність'] || []
        const sz = data['Розмір'] || { min: '0', max: '150' }
        sizeOptions.min = +sz.min; sizeOptions.max = +sz.max
        if (
  !props.initialFilters.size ||
  props.initialFilters.size[0] === 0 && props.initialFilters.size[1] === 100
) {
  filters.size = [+sz.min, +sz.max]
}

        const wt = data['Вага'] || { min: '0', max: '1000' }
        weightOptions.min = +wt.min; weightOptions.max = +wt.max
        const pr = data['Ціна'] || { min: '0', max: '10000' }
        priceOptions.min = +pr.min; priceOptions.max = +pr.max

        colorOptions.value = data['Колір'] || []
        beadTypeOptions.value = data['Тип бісеру'] || []
        beadProducerOptions.value = data['Виробник бісеру'] || []
        categoryOptions.value = data['Категорія'] || []

        if (props.initialFilters.size?.length === 2) filters.size = [...props.initialFilters.size]
        if (props.initialFilters.weight?.length === 2) filters.weight = [...props.initialFilters.weight]
        if (props.initialFilters.price?.length === 2) filters.price = [...props.initialFilters.price]
      } catch (e) {
        console.error('Помилка завантаження фільтрів:', e)
      } finally {
        loading.value = false
      }
    }

    loadFilters()

    const applyFilters = () => {
  const cleaned = {}

  if (filters.availability.length) cleaned.availability = [...filters.availability]
  if (filters.rating.length) cleaned.rating = [...filters.rating]

  if (filters.beadTypes.length) cleaned.type_of_bead = [...filters.beadTypes]
  if (filters.producers.length) cleaned.bead_producer = [...filters.producers]
  if (filters.category.length) cleaned.category = [...filters.category]
  if (filters.color) cleaned.color = filters.color

  if (filters.size[0] > sizeOptions.min || filters.size[1] < sizeOptions.max)
    cleaned.size = [...filters.size]

  if (filters.weight[0] > weightOptions.min || filters.weight[1] < weightOptions.max)
    cleaned.weight = [...filters.weight]

  if (filters.price[0] > priceOptions.min || filters.price[1] < priceOptions.max)
    cleaned.price = [...filters.price]

  // 🔽 Прокрутка з анімацією
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })

  emit('apply', cleaned)
}



    return {
      loading,
      filters,
      availabilityOptions,
      sizeOptions,
      weightOptions,
      priceOptions,
      colorOptions,
      beadTypeOptions,
      beadProducerOptions,
      categoryOptions,
      applyFilters
    }
  }
}
</script>

<style>
@import "@vueform/slider/themes/default.css";

:root {
  --slider-connect-bg: #6B1F1F;
  --slider-tooltip-bg: #6B1F1F;
  --slider-handle-bg: #fff;
  --slider-handle-border: 2px solid #6B1F1F;
  --slider-handle-ring-color: #6B1F1F30;
  --slider-height: 6px;
}

.custom-checkbox {
  -webkit-appearance: none;
  appearance: none;
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #cbd5e0;
  border-radius: 0.375rem;
  background-color: #fff;
  cursor: pointer;
  position: relative;
  background-repeat: no-repeat;
  background-position: center;
}
.custom-checkbox:checked {
  background-color: #996666;
  border-color: #996666;
  background-image: url("data:image/svg+xml,%3Csvg%20viewBox='0%200%2016%2016'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cpath%20fill='none'%20stroke='%23fff'%20stroke-width='2'%20d='M4%208l3%203%20l5-5'/%3E%3C/svg%3E");
}
.custom-checkbox:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(107, 31, 31, 0.4);
}

.section {
  transition: transform 0.2s;
}
.section:hover {
  transform: translateY(-2px);
}

.filter-container {
  max-width: 42rem;
  height: 50rem;
}
</style>

<style scoped>
.subsection-title {
  text-align: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
</style>
