<template>
  <div
    class="fixed inset-0 bg-[rgba(0,0,0,0.5)] dark:bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-50"
    @click.self="close"
  >
    <div
      class="w-full max-w-md mx-4 p-6 text-center font-montserrat rounded-lg shadow-lg
             bg-white dark:bg-[#1E293B] dark:border dark:border-gray-700"
    >
      <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        {{ $t('admin.deleteProduct.title') }}
      </h2>
      <p class="text-gray-700 dark:text-gray-200">
        {{ $t('admin.deleteProduct.question', { name: product.name }) }}
      </p>
      <div class="flex justify-center space-x-4 mt-6">
        <button
          @click="close"
          class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100
                 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition"
        >
          {{ $t('admin.deleteProduct.cancel') }}
        </button>
        <button
          @click="confirmDelete"
          class="px-4 py-2 bg-[#6B1F1F] hover:bg-[#861818] text-white rounded-md font-medium
                 dark:bg-[#A01212] dark:hover:bg-[#c42e2e] transition"
        >
          {{ $t('admin.deleteProduct.delete') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'DeleteProductModal',
  props: {
    product: { type: Object, required: true }
  },
  methods: {
    confirmDelete() {
      axios
        .delete(
          `https://koshtovnya.api-dev.bmax-edu.website/api/admin/products/${this.product.id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        )
        .then(() => this.$emit('product-deleted', this.product.id))
        .catch(console.error);
    },
    close() {
      this.$emit('close');
    }
  }
};
</script>
