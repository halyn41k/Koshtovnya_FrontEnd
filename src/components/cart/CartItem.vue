<template>
  <article
    class="relative flex bg-white dark:bg-[#1a2238] text-gray-900 dark:text-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 font-montserrat border dark:border-gray-700"
  >
    <!-- Кнопка закриття -->
    <button
      @click="remove"
      class="absolute top-2 right-2 text-2xl text-gray-500 dark:text-gray-300 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-all duration-200 w-8 h-8 flex items-center justify-center"
      :aria-label="$t('cart.removeItem')"
    >
      ×
    </button>

    <!-- Зображення -->
    <img
      :src="item.image"
      :alt="item.name"
      class="w-32 h-32 sm:w-40 sm:h-40 object-cover"
    />

    <!-- Контент -->
    <div class="flex-1 p-4 flex flex-col justify-between space-y-4">
      <!-- Назва і ціна -->
      <div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
          {{ item.name }}
        </h3>
        <p class="mt-1 text-lg text-[#6B1F1F] dark:text-white font-medium">
          {{ formatCurrencyIntl(item.price, item.currency) }}
        </p>
      </div>

      <!-- Варіанти і кількість -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <!-- Розмір -->
        <div class="flex items-center space-x-2">
          <label class="text-gray-700 dark:text-gray-300">{{ $t('cart.size') }}</label>
          <select
            v-model="localSize"
            @change="onSizeChange"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg focus:ring focus:ring-[#6B1F1F]/50 transition"
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

        <!-- Кількість -->
        <div class="flex items-center space-x-2">
          <label class="text-gray-700 dark:text-gray-300">{{ $t('cart.quantity') }}</label>
          <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden w-[104px] justify-between bg-white dark:bg-gray-800">
            <button
              @click="decrease"
              :disabled="item.quantity <= 1"
              class="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
            >-</button>
            <span class="px-4 text-gray-800 dark:text-white">{{ item.quantity }}</span>
            <button
              @click="increase"
              class="px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
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
