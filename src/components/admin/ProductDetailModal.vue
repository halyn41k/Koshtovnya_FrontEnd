<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="close"
  >
    <div
      class="
        bg-white dark:bg-[#1f2a42] 
        rounded-lg shadow-lg p-6 
        w-full max-w-2xl max-h-[90vh] overflow-y-auto 
        font-montserrat relative
        text-gray-800 dark:text-gray-200
      "
    >
      <!-- Заголовок -->
      <h2 class="text-2xl font-bold mb-4">
        {{ product.name }}
      </h2>

      <!-- Зображення -->
      <img
        :src="product.image_url"
        :alt="product.name"
        class="w-full h-64 object-contain rounded mb-4 border dark:border-gray-700"
      />

      <!-- Інформація -->
      <div class="space-y-2 text-sm">
        <p>
          <strong class="text-gray-700 dark:text-gray-300">
            {{ $t('admin.productModal.price') }}:
          </strong>
          <span>{{ product.price }} грн</span>
        </p>
        <p>
          <strong class="text-gray-700 dark:text-gray-300">
            {{ $t('admin.productModal.beadProducer') }}:
          </strong>
          <span>{{ product.bead_producer_name }}</span>
        </p>
        <p>
          <strong class="text-gray-700 dark:text-gray-300">
            {{ $t('admin.productModal.country') }}:
          </strong>
          <span>{{ product.country_of_manufacture }}</span>
        </p>
        <p>
          <strong class="text-gray-700 dark:text-gray-300">
            {{ $t('admin.productModal.material') }}:
          </strong>
          <span>{{ product.material }}</span>
        </p>
        <p>
          <strong class="text-gray-700 dark:text-gray-300">
            {{ $t('admin.productModal.beadType') }}:
          </strong>
          <span>{{ product.type_of_bead }}</span>
        </p>

        <div v-if="product.type_of_fitting?.length">
          <strong class="text-gray-700 dark:text-gray-300">
            {{ $t('admin.productModal.fittings') }}:
          </strong>
          <ul class="ml-4 list-disc">
            <li v-for="(fit, idx) in product.type_of_fitting" :key="idx">
              {{ fit.fitting }} — {{ fit.material }} ({{ fit.quantity }} {{ $t('admin.productModal.pcs') }})
            </li>
          </ul>
        </div>

        <p>
          <strong class="text-gray-700 dark:text-gray-300">
            {{ $t('admin.productModal.weight') }}:
          </strong>
          <span>{{ product.weight }} г</span>
        </p>
        <p>
          <strong class="text-gray-700 dark:text-gray-300">
            {{ $t('admin.productModal.colors') }}:
          </strong>
          <span>{{ product.colors?.join(', ') }}</span>
        </p>

        <div>
          <strong class="text-gray-700 dark:text-gray-300">
            {{ $t('admin.productModal.variants') }}:
          </strong>
          <ul class="ml-4 list-disc">
            <li v-for="v in product.variants" :key="v.size">
              {{ $t('admin.productModal.size') }} {{ v.size }} см – {{ v.quantity }} {{ $t('admin.productModal.pcs') }}
              (<span :class="v.is_available 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'">
                {{ v.is_available 
                  ? $t('admin.productModal.available') 
                  : $t('admin.productModal.notAvailable') 
                }}
              </span>)
            </li>
          </ul>
        </div>

        <div class="pt-2">
          <p>
            <strong class="text-gray-700 dark:text-gray-300">
              {{ $t('admin.productModal.rating') }}:
            </strong>
            <span>{{ product.rating }} ({{ product.review_count }} {{ $t('productModal.reviews') }})</span>
          </p>
        </div>
      </div>

      <!-- Кнопки дій -->
      <div class="flex justify-end gap-3 mt-6">
        <button
          v-if="!isDeleted"
          @click="emitAndClose('edit', product)"
          class="flex items-center gap-2 px-4 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded transition"
        >
          <img src="@/assets/icons/edit-2.svg" alt="Edit" class="w-5 h-5 invert dark:invert-0" />
          <span>{{ $t('admin.productModal.edit') }}</span>
        </button>

        <button
          v-if="!isDeleted"
          @click="emitAndClose('delete', product.id)"
          class="flex items-center gap-2 px-4 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded transition"
        >
          <img src="@/assets/icons/delete-2.svg" alt="Delete" class="w-5 h-5 invert dark:invert-0" />
          <span>{{ $t('admin.productModal.delete') }}</span>
        </button>

        <button
          v-if="isDeleted"
          @click="emitAndClose('restore', product.id)"
          class="flex items-center gap-2 px-4 py-2 bg-[#6B1F1F] hover:bg-[#A01212] text-white rounded transition"
        >
          <img src="@/assets/icons/restore-wh.svg" alt="Restore" class="w-5 h-5 invert dark:invert-0" />
          <span>{{ $t('admin.productModal.restore') }}</span>
        </button>

        <button
          @click="close"
          class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 rounded transition"
        >
          {{ $t('admin.productModal.close') }}
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
