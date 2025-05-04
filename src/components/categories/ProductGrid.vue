<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <article
        v-for="product in products"
        :key="product.id"
        class="bg-[#fff7f6] border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transform hover:-translate-y-2 transition duration-300 overflow-hidden flex flex-col"
      >
        <router-link :to="`/productpage/${product.id}`" class="flex-1 flex flex-col">
          <div class="h-48 overflow-hidden">
            <img
              :src="product.image_url"
              :alt="product.name"
              class="w-full h-full object-cover hover:scale-105 transition duration-300"
            />
          </div>
          <div class="px-4 py-3 flex-1 flex flex-col justify-between">
            <h3 class="text-lg font-semibold line-clamp-2 h-12">
              {{ product.name }}
            </h3>
            <p class="text-xl font-semibold text-red-700 mt-1">
              {{ product.price }} грн
            </p>
          </div>
        </router-link>
  
        <div class="px-4 mb-4 flex justify-between items-center">
          <span class="text-base text-gray-800">{{ product.bead_producer_name }}</span>
          <button @click.stop="$emit('toggle-wishlist', product)" class="focus:outline-none hover:scale-110 transform transition duration-300">
            <svg v-if="product.is_in_wishlist" xmlns="http://www.w3.org/2000/svg" fill="#A01212" class="w-6 h-6"><path d="M12 21.35..."/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" stroke="#B3B3B3" stroke-width="2" fill="none" class="w-6 h-6"><path d="M20.84 4.61..."/></svg>
          </button>
        </div>
  
        <div class="px-4 pb-4">
          <button
            @click="$emit('add-to-cart', product)"
            class="w-full h-12 bg-[#6B1F1F] hover:bg-[#A01212] text-white font-semibold rounded-lg flex items-center justify-between px-4 transition duration-300"
          >
            <span>Купити</span>
            <img src="@/assets/miniarrow.png" alt="arrow" class="w-5 h-4" />
          </button>
        </div>
      </article>
    </div>
  </template>
  
  <script setup>
  // eslint-disable-next-line no-undef, import/no-unresolved
  /* global defineProps, defineEmits */
  const props = defineProps({
    products: { type: Array, default: () => [] },
  })
  const emit = defineEmits(['add-to-cart', 'toggle-wishlist'])
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
  
  /* Optional: line-clamp utility */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  </style>