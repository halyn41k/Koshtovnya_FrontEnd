<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50"
    @click.self="close"
  >
    <div
      class="bg-white rounded-lg w-full max-w-md mx-4 p-6 text-center font-montserrat shadow-lg"
    >
      <h2 class="text-xl font-semibold mb-4">Підтвердіть видалення</h2>
      <p class="text-gray-700">
        Ви впевнені, що хочете видалити товар "<strong>{{ product.name }}</strong>"?
      </p>
      <div class="flex justify-center space-x-4 mt-6">
        <button
          @click="close"
          class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md font-medium hover:bg-gray-400"
        >
          Скасувати
        </button>
        <button
          @click="confirmDelete"
          class="px-4 py-2 bg-[#6B1F1F] text-white rounded-md font-medium hover:bg-[#A01212]"
        >
          Видалити
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
