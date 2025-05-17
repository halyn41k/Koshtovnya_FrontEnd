<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="close"
  >
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto font-montserrat relative">
      <h2 class="text-2xl font-bold mb-4">{{ product.name }}</h2>

      <img
        :src="product.image_url"
        :alt="product.name"
        class="w-full h-64 object-contain rounded mb-4"
      />

      <div class="space-y-2 text-gray-800 text-sm">
        <p><strong>Ціна:</strong> {{ product.price }} грн</p>
        <p><strong>Виробник бісеру:</strong> {{ product.bead_producer_name }}</p>
        <p><strong>Країна виробництва:</strong> {{ product.country_of_manufacture }}</p>
        <p><strong>Матеріал:</strong> {{ product.material }}</p>
        <p><strong>Тип бісеру:</strong> {{ product.type_of_bead }}</p>

        <div v-if="product.type_of_fitting?.length">
          <strong>Фурнітура:</strong>
          <ul class="ml-4 list-disc">
            <li
              v-for="(fit, index) in product.type_of_fitting"
              :key="index"
            >
              {{ fit.fitting }} — {{ fit.material }} ({{ fit.quantity }} шт)
            </li>
          </ul>
        </div>

        <p><strong>Вага:</strong> {{ product.weight }} г</p>
        <p><strong>Кольори:</strong> {{ product.colors?.join(', ') }}</p>

        <div>
          <strong>Розміри:</strong>
          <ul class="ml-4 list-disc">
            <li
              v-for="v in product.variants"
              :key="v.size"
            >
              Розмір {{ v.size }} см – {{ v.quantity }} шт ({{ v.is_available ? 'доступний' : 'н/д' }})
            </li>
          </ul>
        </div>

        <div class="pt-2">
          <p><strong>Рейтинг:</strong> {{ product.rating }} ({{ product.review_count }} відгуків)</p>
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <!-- Редагування -->
        <button
          v-if="!isDeleted"
          @click="emitAndClose('edit', product)"
          class="flex items-center gap-2 px-4 py-2 bg-[#6B1F1F] text-white rounded hover:bg-[#A01212] transition"
        >
          <img src="@/assets/icons/edit-2.svg" alt="Edit" class="w-5 h-5" />
          <span>Редагувати</span>
        </button>

        <!-- Видалити -->
        <button
          v-if="!isDeleted"
          @click="emitAndClose('delete', product.id)"
          class="flex items-center gap-2 px-4 py-2 bg-[#6B1F1F] text-white rounded hover:bg-[#A01212] transition"
        >
          <img src="@/assets/icons/delete-2.svg" alt="Delete" class="w-5 h-5" />
          <span>Видалити</span>
        </button>

        <!-- Відновити -->
        <button
          v-if="isDeleted"
          @click="emitAndClose('restore', product.id)"
          class="flex items-center gap-2 px-4 py-2 bg-[#6B1F1F] text-white rounded hover:bg-[#A01212] transition"
        >
          <img src="@/assets/icons/restore-wh.svg" alt="Restore" class="w-5 h-5" />
          <span>Відновити</span>
        </button>

        <!-- Закрити -->
        <button
          @click="close"
          class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
        >
          Закрити
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductDetailModal',
  props: {
    product: { type: Object, required: true },
    visible: { type: Boolean, required: true }
  },
  emits: ['close', 'edit', 'delete', 'restore'],
  computed: {
    isDeleted() {
      return this.product.is_deleted === true || this.product.is_deleted === 1 || this.product.is_deleted === '1'
    }
  },
  methods: {
    close() {
      this.$emit('close');
    },
    emitAndClose(event, payload) {
      this.$emit(event, payload);
      this.close();
    }
  }
}
</script>

<style scoped>
/* Нічого додаткового не потрібно, стилі вже гарні */
</style>
