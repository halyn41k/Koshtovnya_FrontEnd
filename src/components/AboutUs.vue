<template>
  <article class="about-us">
    <header class="about-us__header">
      <h1 class="section-title-container">
        <div class="line"></div>
        <span class="main-title">Історія заснування "Коштовня</span>
        <div class="line"></div>
      </h1>
    </header>

    <section class="about-us__content">
      <div class="about-us__text-section">
        <h2 class="section-title fade-in">У 2015 році зародилася ідея, що почалася як просте захоплення — створення традиційних герданів із бісеру. Спочатку це було заняттям для душі, відтворюючи автентичні візерунки та орнаменти. Кожен виріб випромінював свою унікальну енергію, поєднуючи традиційні українські мотиви з сучасними елементами. Це дозволяло створювати прикраси, які мали не лише естетичну цінність, а й несли в собі глибокий символізм.</h2>
        <p class="about-us__text fade-in">
          "Коштовня" виросла з простого захоплення у справжній бренд, де кожна прикраса створюється з душею та повагою до традицій. У виробах поєднується багатовікова українська культура та сучасні тенденції, що робить кожну річ унікальною і неповторною.
        </p>
      </div>
      <div class="about-us__image-wrapper fade-in">
        <img src="@/assets/ukrainepattern.png" alt="Традиційні гердани та прикраси" class="about-us__image"
          loading="lazy" />
      </div>
    </section>

    <section class="about-us__growth fade-in">
      <div class="about-us__image-container">
        <img src="@/assets/woman.png" alt="Розвиток бренду Коштовня"
          class="about-us__background-image with-frame fade-in" />
      </div>
      <div class="about-us__text-content fade-in">
        <p class="about-us__description fade-in">
          {{ $t('aboutUsDescription') }}
        </p>
      </div>
      <div class="about-us__process-image-container">
        <img src="@/assets/deliverypattern.png" alt="Процес створення прикрас" class="about-us__process-image"
          loading="lazy" />
      </div>
    </section>

    <footer class="about-us__footer">
      <p class="about-us__conclusion fade-in">
        "Коштовня" виросла з простого захоплення у справжній бренд, де кожна прикраса створюється з душею та повагою до
        традицій. У виробах поєднується багатовікова українська культура та сучасні тенденції, що робить кожну річ
        унікальною і неповторною.
      </p>
    </footer>

    <!-- FAQ Section -->
    <section class="faq-section fade-in">
      <h2 class="faq-title">
        <div class="line"></div>
        <span>Часті запитання</span>
        <div class="line"></div>
      </h2>

      <div class="faq-item">
        <button class="faq-question" @click="toggleFAQ(0)">
          У чому різниця між виробниками бісерів?
          <span :class="{ 'rotate-icon': faqOpen[0] }" class="arrow-icon">▼</span>
        </button>
        <div v-if="faqOpen[0]" class="faq-answer">
          Дорожчий бісер часто відрізняється якістю матеріалів та процесом виробництва.
          Наприклад, японський бісер зазвичай вирізняється точністю розмірів і форми, що полегшує роботу і забезпечує
          більш
          естетичний результат. Чеський бісер також славиться високою якістю, тоді як китайський бісер може мати
          варіації у формі,
          що впливає на зовнішній вигляд готового виробу.
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-question" @click="toggleFAQ(1)">
          Як доглядати за прикрасами з бісеру?
          <span :class="{ 'rotate-icon': faqOpen[1] }" class="arrow-icon">▼</span>
        </button>
        <div v-if="faqOpen[1]" class="faq-answer">
          Для збереження якості прикрас з бісеру важливо уникати їх контакту з водою, особливо з хлорованою чи солоною.
          Не рекомендується носити такі прикраси під час купання чи занять спортом.
          Зберігайте їх у сухому місці, у м’якому мішечку чи коробочці, щоб уникнути пошкоджень чи подряпин.
        </div>
      </div>

      <div class="faq-item">
        <button class="faq-question" @click="toggleFAQ(2)">
          Чи можливо замовити індивідуальну прикрасу?
          <span :class="{ 'rotate-icon': faqOpen[2] }" class="arrow-icon">▼</span>
        </button>
        <div v-if="faqOpen[2]" class="faq-answer">
          Так, ми пропонуємо можливість створення прикрас за індивідуальним запитом.
          Ви можете обрати дизайн, кольори та розміри, які відповідають вашим особистим вподобанням.
          Зв'яжіться з нами для обговорення деталей, і ми створимо унікальний виріб спеціально для вас.
        </div>
      </div>

    </section>
    <section class="contact-section">
      <h2 class="contact-title">
        <div class="line"></div>
        <span>Зв'яжіться з нами</span>
        <div class="line"></div>
      </h2>
      <form @submit.prevent="handleSubmit">
        <label for="email" class="form-label">Електронна пошта</label>
        <input type="email" id="email" v-model="form.email" required class="form-input"
          placeholder="Ваша електронна адреса" />

        <label for="message" class="form-label">Повідомлення</label>
        <textarea id="message" v-model="form.message" required class="form-textarea"
          placeholder="Ваше повідомлення"></textarea>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

        <button type="submit" class="form-submit">Надіслати</button>
      </form>
    </section>
  </article>
</template>

<script>
export default {
  name: 'AboutUs',
  data() {
    return {
      faqOpen: [false, false, false],
      form: {
        email: '',
        message: '',
      },
      errorMessage: '', // Для повідомлення про помилки
    };
  },
  mounted() {
    this.observeElements();
  },
  methods: {
    observeElements() {
      const elements = document.querySelectorAll('.fade-in');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('show');
              observer.unobserve(entry.target); // Зупинити спостереження після появи
            }
          });
        },
        { threshold: 0.1 } // Показувати при 10% видимості
      );

      elements.forEach((el) => observer.observe(el));
    },
    toggleFAQ(index) {
      this.faqOpen[index] = !this.faqOpen[index];
    },
    handleSubmit() {
      const trimmedMessage = this.form.message.trim();

      // Валідація
      if (trimmedMessage.length < 10 || trimmedMessage.length > 200) {
        this.errorMessage = 'Повідомлення має містити від 10 до 200 символів.';
        return;
      }
      if (!trimmedMessage) {
        this.errorMessage = 'Повідомлення не може складатися лише з пробілів.';
        return;
      }

      // Успішна валідація
      this.errorMessage = ''; // Очистити попередні помилки
      console.log('Form submitted:', this.form);
      this.form.email = '';
      this.form.message = '';
      alert('Дякуємо за ваше повідомлення! Ми зв’яжемося з вами найближчим часом.');
    },
  },
};
</script>


<style scoped>
@font-face {
  font-family: 'KyivType Titling';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeSans-Heavy2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
}

@font-face {
  font-family: 'KyivType Medium2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeSans-Medium2.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
}

.about-us {
  background-color: #fdf5f4;
  padding: 160px 40px 100px;
  width: calc(100% - 100px);
  max-width: 1700px;
  margin: auto;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  color: #333;
  position: relative;
  z-index: 2;
}

.about-us__header {
  text-align: center;
  margin-bottom: 50px;
}

.section-title-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40px;
}

.line {
  flex: 1;
  height: 2px;
  background-color: grey;
  margin: 0 10px;
}

.main-title {
  font-family: 'KyivType Titling', sans-serif;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: -1.2px;
  text-shadow: 0 2px 3px rgba(99, 2, 2, 0.22);
  text-align: center;
}

.about-us__content {
  display: flex;
  align-items: flex-start;
  gap: 40px;
}

.about-us__text-section {
  flex: 1 1 60%;
}

.about-us__image-wrapper {
  flex: 1 1 40%;
}

.section-title {
  margin-left: 40px;
  font-family: 'KyivType Medium2', sans-serif;
  font-weight: 700;
  margin-bottom: 20px;
}

.about-us__description {
  font: 500 20px 'KyivType Titling', sans-serif;
  color: #111111;
  margin-top: -50px;
  line-height: 2.4;
  max-width: 1000px;
  margin-right: 300px;
}

.about-us__text {
  margin-left: 40px;
  font: 500 18px/27px 'KyivType Titling', sans-serif;
  color: #111111;
  line-height: 2.4;
}

.about-us__conclusion {
  font: 500 20px 'KyivType Titling', sans-serif;
  color: #111111;
  max-width: 1000px;
  text-align: center;
  line-height: 1.8;
  margin-left: 200px;
}

.about-us__image {
  width: 100%;
  max-height: 650px;
  object-fit: cover;
}

.about-us__growth {
  display: flex;
  align-items: center;
  margin-top: 30px;
  gap: 40px;
}

.about-us__image-container {
  margin-left: 0;
  margin-top: -30px;
  width: 60%;
  position: relative;
}

.about-us__background-image {
  width: 500px;
  max-height: 700px;
  object-fit: cover;
}

.about-us__process-image-container {
  flex: 1 1 40%;
  text-align: center;
  position: absolute;
  top: 0;
  right: 0;
  z-index: -1;
}

.about-us__process-image {
  margin-top: 200px;
  width: 100%;
  height: 1200px;
  opacity: 0.4;
  z-index: -1;
}

/* FAQ Section */
.faq-section {
  margin-top: 50px;
  padding: 40px;
  background-color: #faf4f4;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.faq-title {
  font-family: 'KyivType Titling', sans-serif;
  font-size: 28px;
  font-weight: 900;
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.faq-title .line {
  flex: 1;
  height: 2px;
  background-color: grey;
  margin: 0 10px;
}

.faq-item {
  margin-bottom: 15px;
}

.faq-question {
  width: 100%;
  font-size: 20px;
  font-weight: 600;
  font-family: 'KyivType Medium2', sans-serif;
  text-align: left;
  color: #6B1F1F;
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-answer {
  padding: 15px;
  font-size: 18px;
  font-family: 'KyivType Medium2', sans-serif;
  color: #333;
  line-height: 1.6;
  border-top: 1px solid #e6e6e6;
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.rotate-icon {
  transform: rotate(180deg);
}

.contact-section {
  margin-top: 50px;
  padding: 40px;
  background-color: #faf4f4;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.contact-title {
  font-family: 'KyivType Titling', sans-serif;
  font-size: 28px;
  font-weight: 900;
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contact-title .line {
  flex: 1;
  height: 2px;
  background-color: grey;
  margin: 0 10px;
}

.form-label {
  display: block;
  margin-top: 15px;
  font-size: 18px;
  color: #333;
  font-family: 'KyivType Medium2', sans-serif;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  font-family: 'KyivType Medium2', sans-serif;
}

.form-textarea {
  height: 100px;
  resize: vertical;
}

.form-submit {
  margin-top: 20px;
  background-color: #6B1F1F;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 18px;
  font-family: 'KyivType Medium2', sans-serif;
  transition: background-color 0.3s ease;
}

.form-submit:hover {
  background-color: #8e0e0e;
}

.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.fade-in.show {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive adjustments */
@media (max-width: 991px) {
  .about-us {
    padding: 110px 20px 60px;
  }

  .about-us__content,
  .about-us__growth {
    flex-direction: column;
    align-items: center;
  }

  .about-us__text-section,
  .about-us__image-wrapper,
  .about-us__text-content,
  .about-us__image-container,
  .about-us__process-image-container {
    width: 100%;
    text-align: center;
  }

  .about-us__process-image {
    width: 100%;
  }

  .error-message {
    color: red;
    font-size: 0.9em;
    margin-top: 5px;
  }
}
</style>
