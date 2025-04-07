<template>
  <section class="reviews-section">
    <h2 class="specifications-title">Відгуки</h2>

    <!-- Список відгуків -->
    <ul v-if="reviews?.length > 0" class="reviews-list">
      <li v-for="review in reviews" :key="review.id" class="review-item">
        <div class="review-header">
          <div class="review-user">
            <h4 class="review-author">{{ review.user_first_name }} {{ review.user_last_name }}</h4>
          </div>
          <div class="review-details">
            <div class="review-rating">
              <span v-for="n in 5" :key="n" class="star static-star" :class="{ 'filled': n <= review.rating }">
                &#9733;
              </span>
            </div>
            <p class="review-date">{{ formatReviewDate(review.date) }}</p>
          </div>
        </div>
        <p class="review-comment">{{ review.comment }}</p>
        <button class="reply-button" @click="replyToReview(review.id)">Відповісти</button>

        <div v-if="replyTo === review.id" class="reply-form">
          <textarea v-model="replyText" placeholder="Напишіть відповідь..." required></textarea>
          <button class="reply-submit" @click="submitReply">Відправити</button>
        </div>

        <!-- Відповіді -->
        <ul v-if="review.replies?.length" class="reply-list">
          <li v-for="reply in review.replies" :key="reply.id" class="reply-item">
            <h5>{{ reply.user_first_name ? `${reply.user_first_name} ${reply.user_last_name}` : 'Адміністратор' }}</h5>
            <p class="reply-date">{{ formatReviewDate(reply.date) }}</p>
            <p class="reply-comment">{{ reply.comment }}</p>
          </li>
        </ul>
      </li>
    </ul>

    <p v-else class="no-reviews">Немає відгуків для цього товару.</p>

    <button class="review-button" @click="toggleReviewForm">Додати відгук</button>

    <div v-if="showReviewForm" class="review-form">
      <h3>Напишіть відгук</h3>
      <div class="rating-selector">
        <label for="rating">Рейтинг:</label>
        <div class="rating-stars">
          <span v-for="n in 5" :key="n" class="star interactive-star"
            :class="{ filled: n <= (hoverRatingValue || newReview.rating) }" @mouseover="hoverRating(n)"
            @mouseleave="resetRating" @click="setRating(n)">
            &#9733;
          </span>
        </div>
      </div>
      <textarea v-model="newReview.comment" placeholder="Ваш коментар" required></textarea>
      <button @click="submitReview" class="review-submit">Відправити</button>
    </div>

    <div class="pagination">
      <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)" class="page-button">&lt;</button>
      <button v-for="page in pagesArray" :key="page" :class="{ active: page === currentPage }" @click="goToPage(page)"
        class="page-button">
        {{ page }}
      </button>
      <button :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)"
        class="page-button">&gt;</button>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    productId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      reviews: [],
      showReviewForm: false,
      newReview: {
        comment: "",
        rating: null,
      },
      replyTo: null,
      replyText: "",
      hoverRatingValue: null,
      currentPage: 1,
      reviewsPerPage: 5,
      totalReviews: 0,
      loading: false, // додано для контролю стану завантаження
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalReviews / this.reviewsPerPage);
    },
    pagesArray() {
      return Array.from({ length: this.totalPages }, (_, index) => index + 1);
    },
  },
  methods: {
    async fetchReviews(page = 1) {
      try {
        const response = await fetch(`http://26.235.139.202:8080/api/products/${this.productId}/reviews?page=${page}&limit=${this.reviewsPerPage}`);
        const data = await response.json();
        this.reviews = data?.data ?? [];
        this.totalReviews = data?.total ?? 0;
        this.currentPage = page;
      } catch (error) {
        console.error("Помилка при завантаженні відгуків:", error.message);
        this.reviews = [];
      }
    },
    async submitReview() {
      if (!this.newReview.comment.trim() || this.newReview.rating < 1) {
        alert("Будь ласка, введіть коментар та виберіть рейтинг.");
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }
      this.loading = true;

      try {
        // Логування тіла запиту
        console.log("Запит:", JSON.stringify({
          comment: this.newReview.comment,
          rating: this.newReview.rating,
        }));

        const response = await fetch(`http://26.235.139.202:8080/api/products/${this.productId}/reviews`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            comment: this.newReview.comment,
            rating: this.newReview.rating,
          }),
        });

        // Перевірка статусу відповіді
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Помилка відповіді сервера:", errorText);
          alert(`Не вдалося додати відгук: ${response.status} ${response.statusText}`);
          return;
        }

        // Спроба парсингу JSON
        let responseData;
        try {
          responseData = await response.json();
          console.log("Відповідь сервера:", responseData);
        } catch (error) {
          const responseText = await response.text();
          console.error("Помилка парсингу JSON:", error);
          console.error("Текст відповіді сервера:", responseText);
          alert("Сервер повернув некоректну відповідь.");
          return;
        }

        // Якщо все добре
        alert("Ваш відгук успішно додано!");
        this.fetchReviews(this.currentPage); // Оновлення списку відгуків
        this.newReview.comment = ""; // Скидання форми
        this.newReview.rating = 5;
        this.showReviewForm = false;
        this.loading = false;
      } catch (error) {
        console.error("Помилка при додаванні відгуку:", error);
        alert("Виникла проблема з додаванням відгуку.");
        this.loading = false;
      }
    },

    async submitReply() {
      if (!this.replyText.trim()) {
        alert("Введіть текст відповіді.");
        return;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }
      this.loading = true;

      try {
        const response = await fetch(`http://26.235.139.202:8080/api/reviews/${this.replyTo}/reply`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            comment: this.replyText,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Помилка відповіді сервера:", errorText);
          alert(`Помилка: ${response.status} ${response.statusText}`);
          return;
        }

        const data = await response.json();
        alert("Відповідь успішно додано!");
        console.log("Дані відповіді:", data);
        this.fetchReviews(this.currentPage);
        this.replyTo = null;
        this.replyText = "";
        this.loading = false;
      } catch (error) {
        console.error("Помилка при додаванні відповіді:", error);
        alert("Виникла проблема з додаванням відповіді.");
        this.loading = false;
      }
    },

    toggleReviewForm() {
      this.showReviewForm = !this.showReviewForm;
    },
    replyToReview(reviewId) {
      this.replyTo = reviewId;
      this.replyText = "";
    },
    hoverRating(n) {
      this.hoverRatingValue = n;
    },
    resetRating() {
      this.hoverRatingValue = null;
    },
    setRating(n) {
      this.newReview.rating = n;
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.fetchReviews(page);
      }
    },
    parseDate(dateString) {
      const isoDate = new Date(dateString);
      if (!isNaN(isoDate.getTime())) {
        return isoDate;
      }

      const regex = /(\d+)\s(\S+)\s(\d{4}),\s(\d{1,2}):(\d{2})/;
      const match = dateString.match(regex);
      if (match) {
        const [_, day, month, year, hours, minutes] = match;
        const months = [
          "січня", "лютого", "березня", "квітня", "травня", "червня",
          "липня", "серпня", "вересня", "жовтня", "листопада", "грудня",
        ];
        const monthIndex = months.indexOf(month.toLowerCase());
        if (monthIndex !== -1) {
          return new Date(year, monthIndex, day, hours, minutes);
        }
      }

      throw new Error("Invalid date format");
    },
    formatReviewDate(dateString) {
      try {
        const date = this.parseDate(dateString);
        return new Intl.DateTimeFormat("uk-UA", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
      } catch (error) {
        console.error("Помилка форматування дати:", error.message, dateString);
        return "Невідома дата";
      }
    },
  },
  created() {
    this.fetchReviews();
  },
};
</script>

<style scoped>
.specifications-title {
  font-size: 24px;
  font-family: 'Montserrat', sans-serif;
  font-weight: bold;
  text-align: center;
  color: #171717;
  margin: 20px 0;
  position: relative;
}

.specifications-title::before,
.specifications-title::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 45%;
  height: 2px;
  background: grey;
  transform: translateY(-50%);
  /* Це вирівнює лінії по вертикалі */
}

.specifications-title::before {
  left: 0;
}

.specifications-title::after {
  right: 0;
}

.reviews-list {
  list-style: none;
  padding: 0;
  align-items: center;
}

.review-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 1150px;
  margin-left: 130px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.review-user {
  font-size: 16px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  color: #333;
}

.review-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.review-rating {
  display: flex;
  gap: 3px;
}

.review-date {
  font-size: 14px;
  color: #777;
}

.review-comment {
  font-size: 16px;
  font-family: 'Montserrat', sans-serif;
  color: #555;
  margin: 10px 0;
}

.reply-button {
  align-self: flex-start;
  background: transparent;
  border: none;
  color: #6B1F1F;
  font-size: 14px;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
}

.reply-button:hover {
  text-decoration: underline;
}


.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.review-author {
  font-family: 'Montserrat', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.review-rating .star {
  font-size: 20px;
  color: #ccc;
}

.review-rating .star.filled {
  color: #ffcc00;
}

.review-comment {
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  color: #555;
  margin: 10px 0;

}

.review-date {
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: #999;
}

.no-reviews {
  font-size: 18px;
  font-family: 'Montserrat', sans-serif;
  text-align: center;
  color: #666;
  margin: 20px 0;
}

.review-button {
  padding: 12px 17px;
  width: 170px;
  color: #FFF;
  background: #6B1F1F;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-family: 'Merriweather', sans-serif;
  cursor: pointer;
  margin-left: 0;
  /* Кнопка переміститься до лівого краю */
  margin-bottom: 20px;
  /* Додаємо відступ знизу */
  margin-left: 135px;
}


.review-button:hover,
.review-submit:hover {
  background: #a01212;

}

.review-form {
  margin-top: 30px;
  padding: 20px;
  background-color: #FFF7F6;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-left: 135px;
  width: 1150px;
  font-family: 'Montserrat', sans-serif;
}

.review-form textarea {
  width: 1100px;
  padding: 12px;
  font-size: 16px;
  font-family: 'Montserrat', sans-serif;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 15px;
  resize: vertical;
  background: #fefefe;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.review-submit {
  padding: 10px 20px;
  font-size: 16px;
  color: #FFF;
  background-color: #6B1F1F;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Merriweather', sans-serif;
  margin-bottom: -20px;
}

.review-submit:hover {
  background-color: #a01212;
}

.review-item:hover {
  border: 1px solid #6B1F1F;
  background-color: #fff4f4;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.review-comment {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.6;
  color: #444;
}

.reply-form {
  margin-top: 10px;
  padding: 10px;
  background: #f1f1f1;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
  /* Шрифт Montserrat для відповіді */
}

.reply-form textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  font-family: 'Montserrat', sans-serif;
  /* Шрифт Montserrat для тексту */
  font-size: 16px;
  color: #444;
}

.reply-submit {
  background: #6B1F1F;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Merriweather', sans-serif;
  /* Шрифт Merriweather для кнопки */
}

.reply-submit:hover {
  background: #a01212;
}

.reply-list {
  margin-top: 10px;
  padding-left: 20px;
  border-left: 2px solid #ddd;
}

.reply-item {
  margin-bottom: 10px;
  font-family: 'Montserrat', sans-serif;
  /* Шрифт Montserrat для відгуків */
  font-size: 16px;
  color: #444;
}

.reply-item h5 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.reply-item .reply-date {
  font-size: 14px;
  color: #777;
}

.reply-item .reply-comment {
  font-size: 16px;
  line-height: 1.6;
  color: #444;
}

.rating-stars {
  display: flex;
  gap: 3px;
}

/* Нові стилі для зірок */
.star {
  font-size: 1.5em;
  color: #d3d3d3;
}

/* Статичні зірки у відгуках */
.static-star {
  pointer-events: none;
  /* Відключаємо всі події миші */
  user-select: none;
}

.static-star.filled {
  color: gold;
}

/* Інтерактивні зірки у формі створення відгуку */
.interactive-star {
  cursor: pointer;
  transition: color 0.2s;
}

.interactive-star.filled {
  color: gold;
}

.interactive-star:hover {
  color: gold;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 50px;
  /* Було 30px, збільшено на 20px */
}


.page-button {
  padding: 8px 16px;
  border: 2px solid #6B1F1F;
  background-color: #ffffff;
  color: #6B1F1F;
  font-size: 14px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 4px;
}

.page-button:hover {
  background-color: #6B1F1F;
  color: #ffffff;
}

.page-button.active {
  background-color: #6B1F1F;
  color: #ffffff;
  border-color: #6B1F1F;
}

.page-button:disabled {
  background-color: #f4f4f4;
  color: #b5b5b5;
  border-color: #dcdcdc;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
