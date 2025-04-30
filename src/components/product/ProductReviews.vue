<template>
  <section class="py-8 font-montserrat">
    <!-- Заголовок з лініями -->
    <div class="flex items-center my-6">
      <hr class="flex-grow border-t-2 border-gray-300" />
      <h2 class="mx-4 text-2xl font-bold text-gray-900">Відгуки</h2>
      <hr class="flex-grow border-t-2 border-gray-300" />
    </div>

    <!-- Кнопка “Додати відгук” під заголовком — тільки коли є відгуки -->
    <div v-if="!loading && reviews.length" class="flex justify-end w-full mb-6 px-4 sm:px-0">
      <button
        @click="toggleReviewForm"
        class="bg-red-800 text-white py-2 px-4 rounded-lg text-lg hover:bg-red-700 font-montserrat disabled:opacity-50"
      >
        Додати відгук
      </button>
    </div>

    <!-- Список відгуків -->
    <ul v-if="reviews.length" class="space-y-6">
      <li
        v-for="review in pagedReviews"
        :key="review.id"
        class="p-4 bg-gray-50 border border-gray-200 rounded-lg shadow hover:border-red-800 hover:bg-red-50 max-w-3xl mx-auto"
      >
        <!-- Ім'я користувача -->
        <h4 class="text-lg font-semibold text-gray-800 mb-1">
          {{ review.user_first_name }} {{ review.user_last_name }}
        </h4>

        <!-- Рейтинг та дата -->
        <div class="flex items-center gap-2 mb-3">
          <div class="flex gap-1">
            <span
              v-for="n in 5"
              :key="n"
              class="text-xl"
              :class="n <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
            >
              &#9733;
            </span>
          </div>
          <p class="text-sm text-gray-500">{{ formatReviewDate(review.date) }}</p>
        </div>

        <!-- Коментар -->
        <p class="text-base text-gray-700 mb-3">{{ review.comment }}</p>

        <!-- Відповіді адміністратора -->
        <div v-if="review.replies.length" class="mt-2 space-y-2">
          <div
            v-for="(r, idx) in review.replies"
            :key="idx"
            class="pl-4 border-l-4 border-red-300 bg-white rounded shadow-sm"
          >
            <p class="text-sm text-gray-600">
              <strong>Відповідь адміністратора:</strong> {{ r.comment }}
            </p>
          </div>
        </div>

        <!-- Кнопка “Відповісти” для адміна -->
        <div v-if="isAdmin" class="mt-3">
          <button
            @click="replyToReview(review.id)"
            class="text-sm font-medium text-red-800 hover:underline"
          >
            Відповісти
          </button>

          <div
            v-if="replyTo === review.id"
            class="mt-2 p-4 bg-white rounded-lg shadow space-y-2"
          >
            <textarea
              v-model="replyText"
              placeholder="Напишіть відповідь..."
              required
              class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring font-montserrat"
            ></textarea>
            <button
              @click="submitReply"
              :disabled="loading"
              class="bg-red-800 text-white py-1 px-3 rounded hover:bg-red-700 disabled:opacity-50 font-montserrat"
            >
              Відправити відповідь
            </button>
          </div>
        </div>
      </li>
    </ul>

    <!-- Якщо відгуків немає — повідомлення зліва, кнопка справа -->
    <div v-else-if="!loading" class="flex justify-between w-full mb-6 px-4 sm:px-0">
      <p class="text-gray-600">Немає відгуків для цього товару.</p>
      <button
        @click="toggleReviewForm"
        class="bg-red-800 text-white py-2 px-4 rounded-lg text-lg hover:bg-red-700 font-montserrat disabled:opacity-50"
      >
        Додати відгук
      </button>
    </div>

    <!-- Форма для нового відгуку -->
    <div
      v-if="showReviewForm"
      class="bg-red-50 p-6 rounded-lg shadow max-w-3xl mx-auto space-y-4"
    >
      <h3 class="text-xl font-semibold text-gray-900">Напишіть відгук</h3>

      <!-- Вибір рейтингу -->
      <div class="flex items-center gap-2">
        <label class="text-gray-700 font-montserrat">Рейтинг:</label>
        <div class="flex gap-1">
          <span
            v-for="n in 5"
            :key="n"
            class="text-2xl cursor-pointer transition-colors"
            :class="n <= (hoverRatingValue || newReview.rating) ? 'text-yellow-400' : 'text-gray-300'"
            @mouseover="hoverRating(n)"
            @mouseleave="resetRating"
            @click="setRating(n)"
          >
            &#9733;
          </span>
        </div>
      </div>

      <textarea
        v-model="newReview.comment"
        placeholder="Ваш коментар"
        required
        class="w-full h-32 p-2 border border-gray-300 rounded focus:outline-none focus:ring font-montserrat"
      ></textarea>
      <button
        @click="submitReview"
        :disabled="loading"
        class="bg-red-800 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50 font-montserrat"
      >
        Відправити
      </button>
    </div>
  </section>
</template>

<script>
import api from "@/services/api";

export default {
  props: {
    productId: { type: Number, required: true },
  },
  data() {
    const storedUser = localStorage.getItem("user");
    return {
      reviews: [],
      showReviewForm: false,
      newReview: { comment: "", rating: 5 },
      replyTo: null,
      replyText: "",
      hoverRatingValue: null,
      currentPage: 1,
      reviewsPerPage: 5,
      loading: false,
      userRole: storedUser ? JSON.parse(storedUser).role : null,
    };
  },
  computed: {
    pagedReviews() {
      const start = (this.currentPage - 1) * this.reviewsPerPage;
      return this.reviews.slice(start, start + this.reviewsPerPage);
    },
    isAdmin() {
      return ["admin", "superadmin"].includes(this.userRole);
    },
  },
  methods: {
    async fetchReviews() {
      this.loading = true;
      try {
        const resp = await api.getProductReviews(this.productId);
        // Уніфікуємо replies як масив
        this.reviews = (resp.data || []).map(r => ({
          ...r,
          replies: r.replies
            ? r.replies
            : r.reply
            ? [r.reply]
            : [],
        }));
      } catch (e) {
        console.error("Помилка завантаження відгуків:", e);
      } finally {
        this.loading = false;
      }
    },
    async submitReview() {
      if (!this.newReview.comment.trim()) return;
      this.loading = true;
      try {
        await api.postProductReview(this.productId, {
          comment: this.newReview.comment,
          rating: this.newReview.rating,
        });
        await this.fetchReviews();
        this.newReview.rating = 5;
        this.newReview.comment = "";
        this.showReviewForm = false;
      } catch (e) {
        console.error("Не вдалося додати відгук:", e);
      } finally {
        this.loading = false;
      }
    },
    toggleReviewForm() {
      this.showReviewForm = !this.showReviewForm;
    },
    replyToReview(id) {
      this.replyTo = this.replyTo === id ? null : id;
      this.replyText = "";
    },
    async submitReply() {
      if (!this.replyText.trim()) return;
      this.loading = true;
      try {
        await api.replyReview(this.replyTo, { comment: this.replyText });
        await this.fetchReviews();
        this.replyTo = null;
        this.replyText = "";
      } catch (e) {
        console.error("Не вдалося додати відповідь:", e);
      } finally {
        this.loading = false;
      }
    },
    hoverRating(val) {
      this.hoverRatingValue = val;
    },
    resetRating() {
      this.hoverRatingValue = null;
    },
    setRating(val) {
      this.newReview.rating = val;
    },
    parseDate(dateString) {
      const iso = new Date(dateString);
      if (!isNaN(iso)) return iso;
      const m = dateString.match(/(\d+)\s(\S+)\s(\d{4}),\s(\d{1,2}):(\d{2})/);
      if (m) {
        const [_, d, mon, y, h, min] = m;
        const months = [
          "січня","лютого","березня","квітня","травня","червня",
          "липня","серпня","вересня","жовтня","листопада","грудня"
        ];
        return new Date(y, months.indexOf(mon.toLowerCase()), d, h, min);
      }
      return new Date(NaN);
    },
    formatReviewDate(str) {
      try {
        const dt = this.parseDate(str);
        return new Intl.DateTimeFormat("uk-UA", {
          year: "numeric", month: "long", day: "numeric",
          hour: "2-digit", minute: "2-digit"
        }).format(dt);
      } catch {
        return "Невідома дата";
      }
    },
  },
  created() {
    this.fetchReviews();
  },
};
</script>
