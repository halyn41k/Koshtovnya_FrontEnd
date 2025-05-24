<template>
  <aside class="order-summary flex-shrink-0 w-64 bg-[#FFF7F6] border border-gray-200 rounded-2xl p-4 font-montserrat">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">
      Сума до оплати
    </h2>

    <div class="flex justify-between items-baseline mb-6">
<span class="text-xl font-semibold text-red-700">{{ formatCurrencyIntl(totalSum, detectedCurrency) }}</span>
    </div>

    <button
      @click="goToPayment"
      class="mt-4 w-full flex items-center justify-center space-x-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded-lg py-2 text-sm transition-colors"
    >
      <span>Перейти до оплати</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </aside>
</template>

<script>
export default {
  name: 'SummaryCart',
  props: {
  cartItems: {
    type: Array,
    required: true,
    default: () => []
  }
},
  computed: {
    totalSum() {
      return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    detectedCurrency() {
  if (!Array.isArray(this.cartItems)) return (localStorage.getItem('currency') || 'UAH').toUpperCase();
  const fromItem = this.cartItems.find(i => i.currency)?.currency;
  return (fromItem || localStorage.getItem('currency') || 'UAH').toUpperCase();
},

  },
  methods: {
    goToPayment() {
      this.$router.push('/payment');
    },
    formatCurrencyIntl(price, currency) {
      const locale = currency === 'USD' ? 'en-US' : 'uk-UA';
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency.toUpperCase(),
      }).format(Number(price));
    },
    
  }
};

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
</style>
