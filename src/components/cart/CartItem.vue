<template>
  <article class="relative flex bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 font-montserrat">
    <!-- Велике X у кутку -->
    <button
      @click="remove"
      class="absolute top-2 right-2 text-2xl text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-all duration-200 w-8 h-8 flex items-center justify-center"
  :aria-label="$t('cart.removeItem')"
    >
      ×
    </button>

    <!-- Фіксована ширина зображення -->
    <img
      :src="item.image"
      :alt="item.name"
      class="w-32 h-32 sm:w-40 sm:h-40 object-cover"
    />

    <div class="flex-1 p-4 flex flex-col justify-between space-y-4">
      <div>
        <h3 class="text-xl font-semibold text-gray-900 line-clamp-2">
          {{ item.name }}
        </h3>
        <p class="mt-1 text-lg text-red-600 font-medium">
  {{ formatCurrencyIntl(item.price, item.currency) }}
</p>

      </div>

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div class="flex items-center space-x-2">
          <label class="text-gray-700">{{ $t('cart.size') }}</label>

          <select
            v-model="localSize"
            @change="onSizeChange"
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50"
          >
            <option
              v-for="v in item.variants"
              :key="v.size"
              :value="v.size"
              :disabled="!v.isAvailable"
              class="disabled:text-gray-400"
            >
              {{ v.size }}
            </option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <label class="text-gray-700">{{ $t('cart.quantity') }}</label>

          <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden w-[104px] justify-between">

            <button
              @click="decrease"
              :disabled="item.quantity <= 1"
              class="px-3 py-1 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
            >-</button>
            <span class="px-4 text-gray-800">{{ item.quantity }}</span>
            <button
              @click="increase"
              class="px-3 py-1 hover:bg-gray-100 transition-colors duration-200"
            >+</button>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: 'CartItem',
  props: {
    item: { type: Object, required: true }
  },
  data() {
    return { localSize: this.item.selectedSize };
  },
  watch: {
    'item.selectedSize'(newVal) {
      this.localSize = newVal;
    }
  },
  methods: {
    increase() {
      this.$emit('change-quantity', { id: this.item.id, operation: 'increase' });
    },
    decrease() {
      if (this.item.quantity > 1) {
        this.$emit('change-quantity', { id: this.item.id, operation: 'decrease' });
      }
    },
    remove() {
      this.$emit('remove-item', this.item.id);
    },
    formatCurrencyIntl(price, currency) {
    const fallbackCurrency = (localStorage.getItem('currency') || 'UAH').toUpperCase();
    const finalCurrency = (currency || fallbackCurrency).toUpperCase();
    const locale = finalCurrency === 'USD' ? 'en-US' : 'uk-UA';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: finalCurrency,
    }).format(Number(price));
  },
    onSizeChange() {
      this.$emit('change-size', { id: this.item.id, size: this.localSize });
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
