<template>
  <section class="mt-24 px-4 sm:px-6 lg:px-8 font-montserrat">
   <h2 class="text-3xl lg:text-4xl font-semibold mb-10 text-center">
  {{ $t('home.customerReviews') }}
</h2>


    <div class="relative">
      <transition name="fade">
        <div
          v-show="show"
          class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
        >
        <div
  v-for="review in visibleReviews"
  :key="review.id"
  class="min-h-[260px] p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md bg-white dark:bg-[#1F2937] flex flex-col justify-between transition-colors duration-300"
>


            <!-- Зірки -->
            <div class="flex items-center mb-3">
              <svg
                v-for="i in 5"
                :key="i"
                class="w-6 h-6 mr-1"
                :class="getStarClass(i, review.rating)"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.785.57-1.84-.197-1.54-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.075 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.955z"
                />
              </svg>
            </div>

            <!-- Іконка + Текст -->
            <div class="flex items-start mb-6">
              <img
                src="@/assets/icons/quote.svg"
                alt="quote"
                class="w-6 h-6 mr-3 mt-1 flex-shrink-0"
              />
              <p class="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed text-sm">
  {{ review.comment }}
</p>

            </div>

            <!-- Автор -->
            <div class="flex items-center space-x-4 mt-auto">
             <div
  v-if="!review.user_image"
  class="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white font-bold text-sm uppercase overflow-hidden"
>
  {{ getInitials(review.user_first_name, review.user_last_name) }}
</div>

              <img
                v-else
                :src="review.user_image"
                alt="User"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p class="font-semibold text-gray-900 dark:text-white leading-tight">
  {{ review.user_first_name }} {{ review.user_last_name }}
</p>
<p class="text-sm text-gray-500 dark:text-gray-400">
  {{ review.date }}
</p>

                
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </section>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'TopLatest',
  data() {
    return {
      reviews: [],
      visibleReviews: [],
      currentIndex: 0,
      reviewsPerPage: 6,
      interval: null,
      show: true,
    };
  },
  mounted() {
    this.fetchReviews();
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
  methods: {
    getStarClass(position, rating) {
      if (position <= Math.floor(rating)) {
        return 'text-yellow-400';
      } else if (position - rating <= 0.5) {
        return 'text-yellow-300';
      } else {
        return 'text-gray-300';
      }
    },
    async fetchReviews() {
      try {
        const data = await api.getTopLatestReviews();
        this.reviews = Array.isArray(data?.data) ? data.data : [];
        this.updateVisible();
        this.startAutoSlide();
      } catch (error) {
        console.error('Помилка отримання відгуків:', error);
      }
    },
    updateVisible() {
      const start = this.currentIndex;
      const end = start + this.reviewsPerPage;
      const total = this.reviews.length;

      if (total === 0) {
        this.visibleReviews = [];
        return;
      }

      if (end <= total) {
        this.visibleReviews = this.reviews.slice(start, end);
      } else {
        this.visibleReviews = [
          ...this.reviews.slice(start, total),
          ...this.reviews.slice(0, end - total),
        ];
      }
    },
    startAutoSlide() {
      this.interval = setInterval(() => {
        this.show = false;
        setTimeout(() => {
          this.currentIndex =
            (this.currentIndex + this.reviewsPerPage) % this.reviews.length;
          this.updateVisible();
          this.show = true;
        }, 100);
      }, 5000);
    },
    getInitials(first, last) {
      const firstInitial = first?.trim()?.[0] || '';
      const lastInitial = last?.trim()?.[0] || '';
      return (firstInitial + lastInitial).toUpperCase();
    },
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


</style>
