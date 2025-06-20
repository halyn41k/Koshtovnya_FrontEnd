<template>
  <div
    class="fixed inset-0 bg-black/30 backdrop-opacity-30 flex justify-center items-center z-50"
    @click.self="closeModal"
  >
    <div
      class="bg-white dark:bg-[#17223b] p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-lg relative font-[Montserrat] text-gray-800 dark:text-white"
    >
      <h3 class="text-2xl font-semibold text-[#6B1F1F] dark:text-[#F87171] mb-4">
        {{ $t('user.orderDetails') }} №{{ order.id }}
      </h3>

      <p class="text-base mb-4">
  {{ $t('user.status') }}: <span class="font-medium">{{ order.statusLabel }}</span>
</p>


      <div
        v-if="order.items?.length"
        class="max-h-60 overflow-y-auto mb-6 space-y-4 pr-2"
      >
        <div
          v-for="(item, index) in order.items"
          :key="index"
          class="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-[#303b59]"
        >
          <img
            :src="item.image_url"
            alt="Product Image"
            class="w-20 h-20 object-cover rounded-lg"
          />
          <div class="flex-1">
            <h4
              v-if="!item.is_deleted"
              class="text-lg font-semibold text-gray-800 dark:text-white"
            >
              {{ item.title }}
            </h4>
            <h4
              v-else
              class="text-lg italic text-red-600 dark:text-red-300"
            >
              {{ $t('user.productDeleted') }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              {{ $t('user.quantity') }}: {{ item.quantity }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              {{ $t('user.price') }}: {{ formatCurrencyIntl(item.price, item.currency) }}
            </p>
          </div>
        </div>
      </div>

      <button
        @click="closeModal"
        class="absolute bottom-6 right-6 bg-[#6B1F1F] hover:bg-[#A01212] text-white px-4 py-2 rounded-md font-medium transition"
      >
        {{ $t('user.close') }}
      </button>
    </div>
  </div>
</template>


<script>
export default {
  name: "OrderDetailModal",
  props: {
  order: Object,
  formatCurrencyIntl: {
    type: Function,
    required: true
  }
},

  methods: {
    closeModal() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
</style>
