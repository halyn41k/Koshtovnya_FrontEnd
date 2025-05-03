<template>
  <div class="filter-container">
    <section class="filter">
      <h2 class="section-title">Доступність</h2>
      <hr class="divider" />
      <div class="availability-options">
        <div class="option" v-for="item in availabilityOptions" :key="item.name">
          <input type="checkbox" :id="item.name" :value="item.name" v-model="selectedAvailability" />
          <label :for="item.name">{{ item.name }} ({{ item.count }})</label>
        </div>
      </div>

      <!-- Розмір -->
      <h3 class="subsection-title">Розмір</h3>
      <hr class="divider" />
      <div class="input-box">
        <div class="min-box">
          <!-- Показує абсолютне значення -->
          <input 
            type="number" 
            v-model.number="sizeAbsolute[0]" 
            :min="sizeOptions.min" 
            :max="sizeOptions.max" 
            step="1"
            @input="onSizeInput(0)" 
          />
          <span class="unit-label">см</span>
        </div>
        <div class="input-divider"></div>
        <div class="max-box">
          <input 
            type="number" 
            v-model.number="sizeAbsolute[1]" 
            :min="sizeOptions.min" 
            :max="sizeOptions.max" 
            step="1"
            @input="onSizeInput(1)" 
          />
          <span class="unit-label">см</span>
        </div>
      </div>
      <div class="range-slider">
        <!-- Слайдер працює у нормалізованому діапазоні 0-100 -->
        <input 
          type="range" 
          v-model.number="sizeSlider[0]" 
          min="0" 
          max="100" 
          class="slider min-slider" 
          @input="onSizeSliderInput('min')"
        />
        <input 
          type="range" 
          v-model.number="sizeSlider[1]" 
          min="0" 
          max="100" 
          class="slider max-slider" 
          @input="onSizeSliderInput('max')"
        />
        <div class="slider-track" :style="getNormalizedTrackStyle(sizeSlider[0], sizeSlider[1])"></div>
      </div>

      <!-- Колір -->
      <h3 class="subsection-title">Колір</h3>
      <hr class="divider" />
      <div class="dropdown-menu">
        <select v-model="selectedColor" class="dropdown">
          <option value="">(без фільтра)</option>
          <option v-for="color in colorOptions" :key="color" :value="color">
            {{ color }}
          </option>
        </select>
      </div>

      <!-- Тип бісеру -->
      <h3 class="subsection-title">Тип бісеру</h3>
      <hr class="divider" />
      <div class="bead-type-options">
        <div class="option" v-for="item in beadTypeOptions" :key="item.name">
          <input type="checkbox" :id="item.name" :value="item.name" v-model="selectedBeadTypes" />
          <label :for="item.name">{{ item.name }} ({{ item.count }})</label>
        </div>
      </div>

      <!-- Виробник бісеру -->
      <h3 class="subsection-title">Виробник бісеру</h3>
      <hr class="divider" />
      <div class="manufacturer-options">
        <div class="option" v-for="item in beadProducerOptions" :key="item.origin_country">
          <input type="checkbox" :id="item.origin_country" :value="item.origin_country" v-model="selectedProducers" />
          <label :for="item.origin_country">{{ item.origin_country }} ({{ item.count }})</label>
        </div>
      </div>

      <!-- Вага -->
      <h3 class="subsection-title">Вага</h3>
      <hr class="divider" />
      <div class="input-box">
        <div class="min-box">
          <input 
            type="number" 
            v-model.number="weightAbsolute[0]" 
            :min="weightOptions.min" 
            :max="weightOptions.max" 
            step="1"
            @input="onWeightInput(0)" 
          />
          <span class="unit-label">г</span>
        </div>
        <div class="input-divider"></div>
        <div class="max-box">
          <input 
            type="number" 
            v-model.number="weightAbsolute[1]" 
            :min="weightOptions.min" 
            :max="weightOptions.max" 
            step="1"
            @input="onWeightInput(1)" 
          />
          <span class="unit-label">г</span>
        </div>
      </div>
      <div class="range-slider">
        <input 
          type="range" 
          v-model.number="weightSlider[0]" 
          min="0" 
          max="100" 
          class="slider min-slider" 
          @input="onWeightSliderInput('min')"
        />
        <input 
          type="range" 
          v-model.number="weightSlider[1]" 
          min="0" 
          max="100" 
          class="slider max-slider" 
          @input="onWeightSliderInput('max')"
        />
        <div class="slider-track" :style="getNormalizedTrackStyle(weightSlider[0], weightSlider[1])"></div>
      </div>

      <!-- Ціна -->
      <h3 class="subsection-title">Ціна</h3>
      <hr class="divider" />
      <div class="input-box">
        <div class="min-box">
          <input 
            type="number" 
            v-model.number="priceAbsolute[0]" 
            :min="priceOptions.min" 
            :max="priceOptions.max" 
            step="1"
            @input="onPriceInput(0)" 
          />
          <span class="unit-label">грн</span>
        </div>
        <div class="input-divider"></div>
        <div class="max-box">
          <input 
            type="number" 
            v-model.number="priceAbsolute[1]" 
            :min="priceOptions.min" 
            :max="priceOptions.max" 
            step="1"
            @input="onPriceInput(1)" 
          />
          <span class="unit-label">грн</span>
        </div>
      </div>
      <div class="range-slider">
        <input 
          type="range" 
          v-model.number="priceSlider[0]" 
          min="0" 
          max="100" 
          class="slider min-slider" 
          @input="onPriceSliderInput('min')"
        />
        <input 
          type="range" 
          v-model.number="priceSlider[1]" 
          min="0" 
          max="100" 
          class="slider max-slider" 
          @input="onPriceSliderInput('max')"
        />
        <div class="slider-track" :style="getNormalizedTrackStyle(priceSlider[0], priceSlider[1])"></div>
      </div>

      <div class="apply-filters">
        <button @click="applyFilters" class="results-button">Результати</button>
      </div>
      <div class="pattern-background"></div>
    </section>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  name: "FilterComponent",
  props: {
    fetchProducts: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      // опції
      availabilityOptions: [],
      sizeOptions:    { min: 0, max: 100 },
      weightOptions:  { min: 0, max: 1000 },
      priceOptions:   { min: 0, max: 10000 },
      colorOptions:   [],
      beadTypeOptions:     [],
      beadProducerOptions: [],
      categoryOptions:     [],
      statusOptions:       [],

      // абсолютні значення та слайдери
      sizeAbsolute:   [0, 100],
      sizeSlider:     [0, 100],
      weightAbsolute: [0, 1000],
      weightSlider:   [0, 100],
      priceAbsolute:  [0, 10000],
      priceSlider:    [0, 100],
      
      // вибрані фільтри
      selectedAvailability: [],
      selectedColor:        '',
      selectedBeadTypes:    [],
      selectedProducers:    [],
      selectedCategory:     [],
      selectedStatus:       []
    };
  },
  created() {
    this.loadFilters();
  },
  methods: {
    normalize(abs, min, max) {
      return ((abs - min) / (max - min)) * 100;
    },
    denormalize(norm, min, max) {
      return (norm / 100) * (max - min) + min;
    },
    updateSize() {
      this.sizeAbsolute = [
        Math.round(this.denormalize(this.sizeSlider[0], this.sizeOptions.min, this.sizeOptions.max)),
        Math.round(this.denormalize(this.sizeSlider[1], this.sizeOptions.min, this.sizeOptions.max))
      ];
    },
    updateSizeSlider() {
      this.sizeSlider = [
        this.normalize(this.sizeAbsolute[0], this.sizeOptions.min, this.sizeOptions.max),
        this.normalize(this.sizeAbsolute[1], this.sizeOptions.min, this.sizeOptions.max)
      ];
    },
    onSizeSliderInput() {
      this.updateSize();
    },
    onSizeInput() {
      this.updateSizeSlider();
    },
    updateWeight() {
      this.weightAbsolute = [
        Math.round(this.denormalize(this.weightSlider[0], this.weightOptions.min, this.weightOptions.max)),
        Math.round(this.denormalize(this.weightSlider[1], this.weightOptions.min, this.weightOptions.max))
      ];
    },
    updateWeightSlider() {
      this.weightSlider = [
        this.normalize(this.weightAbsolute[0], this.weightOptions.min, this.weightOptions.max),
        this.normalize(this.weightAbsolute[1], this.weightOptions.min, this.weightOptions.max)
      ];
    },
    onWeightSliderInput() {
      this.updateWeight();
    },
    onWeightInput() {
      this.updateWeightSlider();
    },
    updatePrice() {
      this.priceAbsolute = [
        Math.round(this.denormalize(this.priceSlider[0], this.priceOptions.min, this.priceOptions.max)),
        Math.round(this.denormalize(this.priceSlider[1], this.priceOptions.min, this.priceOptions.max))
      ];
    },
    updatePriceSlider() {
      this.priceSlider = [
        this.normalize(this.priceAbsolute[0], this.priceOptions.min, this.priceOptions.max),
        this.normalize(this.priceAbsolute[1], this.priceOptions.min, this.priceOptions.max)
      ];
    },
    onPriceSliderInput() {
      this.updatePrice();
    },
    onPriceInput() {
      this.updatePriceSlider();
    },
    getNormalizedTrackStyle(minNorm, maxNorm) {
      return {
        left:   minNorm + '%',
        right:  (100 - maxNorm) + '%',
        backgroundColor: '#6B1F1F'
      };
    },
    async loadFilters() {
      try {
        const data = await api.getFilter();

        // Доступність
        this.availabilityOptions = data['Доступність'] || [];

        // Розмір
        const sz = data['Розмір'] || { min: '0', max: '100' };
        this.sizeOptions.min = parseFloat(sz.min);
        this.sizeOptions.max = parseFloat(sz.max);
        this.sizeAbsolute = [ this.sizeOptions.min, this.sizeOptions.max ];
        this.sizeSlider   = [ 0, 100 ];

        // Колір
        this.colorOptions = data['Колір'] || [];

        // Тип бісеру
        this.beadTypeOptions = data['Тип бісеру'] || [];

        // Виробник бісеру
        this.beadProducerOptions = data['Виробник бісеру'] || [];

        // Вага
        const wt = data['Вага'] || { min: '0', max: '1000' };
        this.weightOptions.min = parseFloat(wt.min);
        this.weightOptions.max = parseFloat(wt.max);
        this.weightAbsolute = [ this.weightOptions.min, this.weightOptions.max ];
        this.weightSlider   = [ 0, 100 ];

        // Ціна
        const pr = data['Ціна'] || { min: '0', max: '10000' };
        this.priceOptions.min = parseFloat(pr.min);
        this.priceOptions.max = parseFloat(pr.max);
        this.priceAbsolute = [ this.priceOptions.min, this.priceOptions.max ];
        this.priceSlider   = [ 0, 100 ];

        // Категорія
        this.categoryOptions = data['Категорія'] || [];

        // Статус
        this.statusOptions = data['Статус'] || [];

      } catch (error) {
        console.warn('Не вдалося завантажити фільтри:', error);
      }
    },
    applyFilters() {
      const filters = {
        availability: this.selectedAvailability,
        size:         this.sizeAbsolute,
        color:        this.selectedColor,
        beadTypes:    this.selectedBeadTypes,
        producers:    this.selectedProducers,
        weight:       this.weightAbsolute,
        price:        this.priceAbsolute,
        category:     this.selectedCategory,
        status:       this.selectedStatus
      };
      this.fetchProducts(1, filters);
    }
  }
};
</script>


<style scoped>
.filter {
  top: 150px;
  margin-left: -40px;
  z-index: -1;
  background-color: #fff7f6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 600px;
  font-family: 'Montserrat', sans-serif;
}

.pattern-background {
  position: absolute;
  top: -15px;
  left: 140px;
  transform: translateX(-10%);
  width: 300px;
  height: 1000px;
  background-image: url('@/assets/patternik.png');
  background-size: cover;
  background-repeat: no-repeat;
  z-index: -1;

}

.section-title,
.subsection-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin: 10px 0;
  color: #333;
  align-items: center;
}


.divider {
  width: 30px;
  height: 1px;
  background-color: #8F8A8A;
  margin-bottom: 15px;
}

.dropdown {
  width: 100%;
  height: 40px;
  background-color: #F6E7E7;
  border: none;
  font-family: 'Montserrat', sans-serif;
  padding-right: 20px;
  background-image: url('data:image/svg+xml;base64,...');
  /* Arrow icon as base64 */
  background-position: calc(100% - 10px) center;
  background-repeat: no-repeat;
}

.option {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
}

input[type="checkbox"] {
  accent-color: #996666;
}

.range-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.slider-container {
  position: relative;
  width: 100%;
}

input[type="range"].slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 5px;
  background: transparent;
  position: absolute;
}


input[type="range"].slider::-webkit-slider-runnable-track {
  height: 5px;
}

input[type="range"].slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
}

.double-slider-box {
  padding: 20px 40px;
  border-radius: 10px;
  max-width: 20rem;
}

.range-title {
  margin-bottom: 4rem;
  text-align: center;
}



.range-slider {
  position: relative;
  width: calc(100% - 30px);
  margin-left: 5px;
  height: 5px;
  margin: 30px 0;
  background-color: #8a8a8a;
  border-radius: 5px;
  margin-left: 10px;
  z-index: 1;
}

.slider-track {
  height: 100%;
  margin-left: 0px;
  position: absolute;
  background-color: #6B1F1F;
  border-radius: 5px;
  z-index: -1;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: calc(90% + 30px);
  background: none;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translateY(-60%);
  left: -7px;
}

input[type="range"].min-slider::-webkit-slider-thumb {
  z-index: 3;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #fff;
  border: 3px solid #999;
  pointer-events: auto;
  cursor: pointer;
  box-shadow: 0 0.125rem 0.5625rem -0.125rem rgba(0, 0, 0, 0.25);
  position: relative;
  top: -12px;
  left: 5px;
  z-index: 5;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #fff;
  border: 3px solid #6B1F1F;
  pointer-events: auto;
  cursor: pointer;
  box-shadow: 0 0.125rem 0.5625rem -0.125rem rgba(0, 0, 0, 0.25);
  position: relative;
  top: -2px;
}

input[type="range"]::-ms-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #fff;
  border: 3px solid #6B1F1F;
  pointer-events: auto;
  cursor: pointer;
  box-shadow: 0 0.125rem 0.5625rem -0.125rem rgba(0, 0, 0, 0.25);
  position: relative;
  top: -2px;
}

input[type="range"]:nth-of-type(2) {
  z-index: 10;
}

.input-box {
  display: flex;
  justify-content: center;
  /* Центрує інпути та лінію */
  align-items: center;
  gap: 10px;
  /* Відстань між елементами */
  margin-top: 20px;
  max-width: 400px;
  /* Максимальна ширина для всього блоку */
  margin-left: auto;
  /* Центрує блок */
  margin-right: auto;
}

.min-box {
  margin-left: 20px;
  /* Зсунути мінімальний інпут до центра */
  width: 100px;
  /* Ширина інпуту */
}

.max-box {
  margin-left: -10px;
  /* Зсунути максимальний інпут до центра */
  width: 100px;
  /* Ширина інпуту */
}

.min-box input,
.max-box input {
  width: 100%;
  /* Займає весь простір контейнера */
  height: 20px;
  /* Висота інпутів */
  padding: 5px;
  text-align: center;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
}

.input-divider {
  z-index: 3;
  margin-right: 30px;
  width: 20px;
  /* Ширина лінії */
  height: 1px;
  background-color: #8a8a8a;
}


.double-slider-box {
  padding: 20px;
  border-radius: 10px;
  max-width: 20rem;
}

.range-title {
  margin-bottom: 1rem;
}

input[type="number"] {
  width: 50%;
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.results-button {
  font-family: 'Montserrat', sans-serif;
  font-size: 17px;
  padding: 12px 20px;
  font-weight: 700;
  border-radius: 8px;
  background-color: #6b1f1f;
  color: white;
  /* Текст білий */
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  /* Плавний перехід для змін */
  width: 230px;
}


.results-button:hover {
  background-color: #a01212;
  /* Темніший відтінок при наведенні */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  /* Додаємо тінь при наведенні */
}

я .results-button:focus {
  outline: none;
  /* Видаляємо стандартне обведення фокусу */
  box-shadow: 0 0 0 3px rgba(153, 102, 102, 0.6);
  /* Тінь для фокусу */
}

.results-button:active {
  background-color: #a01212;
  /* Тіні темніший відтінок при натисканні */
  transform: translateY(2px);
  /* Зробити кнопку натискною */
}

.apply-filters {
  display: flex;
  justify-content: center;
  /* Центрує кнопку по горизонталі */
  width: 100%;
  /* Забезпечує, що контейнер займає всю ширину */
  margin-top: 20px;
  /* Відступ від інших елементів */
}

.unit-label {
  margin-left: 5px;
  font-size: 0.9rem;
  color: #555;
}

.input-box {
  display: flex;
  align-items: center;
  gap: 5px;
}

.input-divider {
  flex: 0 0 auto;
  width: 10px;
}
</style>