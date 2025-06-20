<template>
  <div
    class="delivery-address-card
           bg-gradient-to-br from-gray-50 to-white dark:from-[#1f2937] dark:to-[#111827]
           rounded-2xl shadow-xl p-6
           max-w-lg
           hover:shadow-2xl transition-shadow
           lg:ml-0 ml-4"
  >
    <h2 class="text-center text-2xl font-semibold text-gray-800 dark:text-white mb-6">
      {{ $t('payment.orderSummary.header') }}
    </h2>

    <div class="space-y-4">
      <!-- User Info -->
      <div class="flex items-center space-x-4">
        <div class="text-red-600 dark:text-gray-100 text-xl">👤</div>
        <div>
          <p class="text-gray-700 dark:text-white font-medium">{{ fullName }}</p>
          <p class="text-gray-500 dark:text-gray-300 text-sm">
            {{ $t('payment.orderSummary.userLabel') }}
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <div class="text-red-600 dark:text-gray-100 text-xl">📞</div>
        <div>
          <p class="text-gray-700 dark:text-white font-medium">
            {{ customerData.phone || $t('payment.orderSummary.notProvided') }}
          </p>
          <p class="text-gray-500 dark:text-gray-300 text-sm">
            {{ $t('payment.orderSummary.phoneLabel') }}
          </p>
        </div>
      </div>

      <!-- Delivery Details -->
      <div class="border-t dark:border-gray-700 pt-4">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          🚚 {{ $t('payment.orderSummary.deliveryDetails') }}
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex items-center space-x-2">
            <span class="text-gray-600 dark:text-gray-300">🏙️</span>
            <span class="text-gray-700 dark:text-white">
              {{ customerData.city || $t('payment.orderSummary.notProvided') }}
            </span>
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-gray-600 dark:text-gray-300">🏠</span>
            <span class="text-gray-700 dark:text-white">
              {{
                (customerData.street || $t('payment.orderSummary.notProvided')) +
                (customerData.houseNumber ? ' ' + customerData.houseNumber : '')
              }}
            </span>
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-gray-600 dark:text-gray-300">📦</span>
            <span class="text-gray-700 dark:text-white">
              {{

                typeof customerData.deliveryType === 'object'
                  ? (customerData.deliveryType.name || customerData.deliveryType.label)
                  : (customerData.deliveryType || $t('payment.orderSummary.notProvided'))
              }}
            </span>
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-gray-600 dark:text-gray-300">🏤</span>
            <span class="text-gray-700 dark:text-white">
              {{

                typeof customerData.warehouse === 'object'
                  ? customerData.warehouse.name
                  : (customerData.warehouse || $t('payment.orderSummary.notProvided'))
              }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: "DeliveryAddress",
  props: {
    customerData: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    fullName() {
      const { lastName = '', firstName = '', secondName = '' } = this.customerData;
      const name = [lastName, firstName, secondName].filter(Boolean).join(' ');
      return name || 'Не вказано';
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500&display=swap');
.delivery-address-card {
  font-family: 'Montserrat', sans-serif;
}
</style>
