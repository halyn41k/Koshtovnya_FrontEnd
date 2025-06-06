<template>
  <div class="relative overflow-hidden">
    <!-- Паралакс-фон -->
    <div
  ref="parallaxBg"
  class="absolute inset-0 pointer-events-none z-0"
>
  <div class="w-full h-full backdrop-blur-sm bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(23,34,59,0.4)]"></div>
</div>


    <div class="relative z-10 w-full bg-[#fdf5f4] dark:bg-[#17223b] pt-32 pb-20 px-4 max-w-[1000px] mx-auto transition-colors duration-300">
      <!-- Заголовок -->
      <h2 v-fade class="text-3xl font-kyivBlack2 text-center mb-12 text-[#6B1F1F] dark:text-white transition-colors">
        {{ $t('infoshop.title') }}
      </h2>

      <!-- Таймлайн -->
      <div class="relative before:absolute before:top-0 before:bottom-0 before:left-1/2 before:w-1 before:bg-gray-300 dark:before:bg-[#303b59] transition-colors">
        <div
          v-for="(item, i) in timeline"
          :key="i"
          v-fade
          :class="['mb-16 flex flex-col lg:flex-row items-center', i % 2 === 0 ? 'lg:flex-row-reverse' : '']"
        >
          <div class="hidden lg:block lg:w-1/2"></div>
          <div class="w-full lg:w-1/2 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg transition-colors duration-300">
            <span class="text-sm text-gray-500 dark:text-gray-300">{{ $t(`infoshop.timeline[${i}].date`) }}</span>
            <h3 class="font-kyivBlack2 text-xl mt-2 mb-4 text-gray-900 dark:text-white">{{ $t(`infoshop.timeline[${i}].title`) }}</h3>
            <p class="text-base text-gray-700 dark:text-gray-300">{{ $t(`infoshop.timeline[${i}].content`) }}</p>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <section v-fade class="bg-[#faf4f4] dark:bg-[#1e263b] p-8 rounded-lg mb-16 transition-colors duration-300">
        <h2 class="flex items-center justify-center mb-6 text-2xl font-kyivBlack2 text-gray-800 dark:text-white">
          <div class="flex-1 h-[2px] bg-gray-400 mx-3"></div>
          {{ $t('infoshop.faqTitle') }}
          <div class="flex-1 h-[2px] bg-gray-400 mx-3"></div>
        </h2>

        <div v-for="(open, i) in faqOpen" :key="i" class="mb-4">
          <button
            @click="toggleFAQ(i)"
            class="w-full flex justify-between items-center text-lg font-medium text-[#6B1F1F] dark:text-[#fca5a5] py-2 transition-colors"
          >
            <span>{{ $t(`infoshop.faqQuestions[${i}]`) }}</span>
            <span :class="{ 'rotate-180': faqOpen[i] }" class="transform transition-transform duration-300">▼</span>
          </button>
          <div v-if="faqOpen[i]" class="mt-2 pl-4 border-l-4 border-[#6B1F1F] dark:border-red-400 text-base text-gray-700 dark:text-gray-200 leading-relaxed">
            {{ $t(`infoshop.faqAnswers[${i}]`) }}
          </div>
        </div>
      </section>

      <!-- Contact Form -->
      <section v-fade class="bg-[#faf4f4] dark:bg-[#1e263b] p-8 rounded-lg mb-16 transition-colors duration-300">
        <h2 class="flex items-center justify-center mb-6 text-2xl font-kyivBlack2 text-gray-800 dark:text-white">
          <div class="flex-1 h-[2px] bg-gray-400 mx-3"></div>
          {{ $t('infoshop.contactTitle') }}
          <div class="flex-1 h-[2px] bg-gray-400 mx-3"></div>
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="email" class="block text-base font-medium mb-1 text-gray-800 dark:text-gray-200">{{ $t('infoshop.emailLabel') }}</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              :placeholder="$t('infoshop.emailPlaceholder')"
              class="w-full bg-[#fafafa] dark:bg-[#303b59] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded p-2 focus:outline-none focus:ring-2 focus:ring-[#6B1F1F]"
            />
          </div>
          <div>
            <label for="message" class="block text-base font-medium mb-1 text-gray-800 dark:text-gray-200">{{ $t('infoshop.messageLabel') }}</label>
            <textarea
              id="message"
              v-model="form.message"
              required
              :placeholder="$t('infoshop.messagePlaceholder')"
              class="w-full bg-[#fafafa] dark:bg-[#303b59] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded p-2 h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-[#6B1F1F]"
            ></textarea>
            <p v-if="errorMessage" class="text-red-600 dark:text-red-300 text-sm mt-1">
              {{ $t('infoshop.errorMessageShort') }}
            </p>
          </div>
          <button
            type="submit"
            class="bg-[#6B1F1F] hover:bg-[#8E0E0E] text-white font-medium py-2 px-6 rounded transition-colors duration-300"
          >
            {{ $t('infoshop.sendButton') }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>


<script>
import { ref, onMounted, nextTick } from 'vue';
import Rellax from 'rellax';

export default {
  name: 'AboutUs',
  directives: {
    fade: {
      mounted(el) {
        el.classList.add('opacity-0', 'translate-y-10', 'transition-all', 'duration-700');
        const obs = new IntersectionObserver((entries, observer) => {
          entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) {
              target.classList.add('opacity-100', 'translate-y-0');
              observer.unobserve(target);
            }
          });
        }, { threshold: 0.2 });
        obs.observe(el);
      }
    }
  },
  setup() {
    const parallaxBg = ref(null);
    const timeline = ref([
      { date: '2015', title: 'Початок із герданів', content: 'Початок із герданів: усе розпочалося з простого захоплення створенням унікальних прикрас власними руками.' },
      { date: '2016', title: 'Перші продажі', content: 'Вироби почали купувати друзі, вражені витонченим дизайном і дбайливою ручною роботою.' },
      { date: '2018', title: 'Розвиток бренду', content: 'Проект перетворився на бізнес...' },
      { date: '2020', title: 'Майстер-класи', content: 'Почали проводити воркшопи, щоб ділитися техніками плетіння та надихати інших створювати власні прикраси.' },
      { date: '2023', title: 'Міжнародний рівень', content: 'Прикраси почали експортувати до кількох країн, знаходячи своїх поціновувачів за кордоном.' }
    ]);
    const faqOpen = ref([false, false, false]);
    const faqQuestions = ref([
      'У чому різниця між виробниками бісерів?',
      'Як доглядати за прикрасами з бісеру?',
      'Чи можливо замовити індивідуальну прикрасу?'
    ]);
    const faqAnswers = ref([
      `Дорожчий бісер часто відрізняється якістю матеріалів та процесом виробництва. Наприклад, японський бісер зазвичай вирізняється точністю розмірів і форми, що полегшує роботу і забезпечує більш естетичний результат. Чеський бісер також славиться високою якістю, тоді як китайський бісер може мати варіації у формі, що впливає на зовнішній вигляд готового виробу.`,
      `Для збереження якості прикрас з бісеру важливо уникати їх контакту з водою, особливо з хлорованою чи солоною. Не рекомендується носити такі прикраси під час купання чи занять спортом. Зберігайте їх у сухому місці, у м’якому мішечку чи коробочці, щоб уникнути пошкоджень чи подряпин.`,
      `Так, ми пропонуємо можливість створення прикрас за індивідуальним запитом. Ви можете обрати Ви можете обрати дизайн, колір та розмір, які відповідають вашим особистим вподобанням. Зв'яжіться з нами для обговорення деталей, і ми створимо унікальний виріб спеціально для вас.`
    ]);
    const form = ref({ email: '', message: '' });
    const errorMessage = ref('');

    function toggleFAQ(i) {
      faqOpen.value[i] = !faqOpen.value[i];
    }
    function handleSubmit() {
      const len = form.value.message.trim().length;
      if (len < 10 || len > 200) {
        errorMessage.value = 'Повідомлення має містити від 10 до 200 символів.';
        return;
      }
      errorMessage.value = '';
      alert('Дякуємо за ваше повідомлення!');
      form.value.email = '';
      form.value.message = '';
    }

    onMounted(() => {
      console.log('AboutUs mounted, parallaxBg:', parallaxBg.value);
      nextTick(() => {
        if (parallaxBg.value) {
          new Rellax(parallaxBg.value, { speed: -2, center: false });
          console.log('Rellax initialized');
        } else {
          console.warn('parallaxBg.value is null — перевірте ref у шаблоні');
        }
      });
    });

    return {
      parallaxBg,
      timeline,
      faqOpen,
      faqQuestions,
      faqAnswers,
      form,
      errorMessage,
      toggleFAQ,
      handleSubmit
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

* { font-family: 'Montserrat', sans-serif; }
.font-kyivBlack2 { font-family: 'KyivType Titling Black2', sans-serif; }

.parallax-bg {
  background-image: url('@/assets/deliverypattern.png');
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
  opacity: 0.2;
}

.text-shadow { text-shadow: 0 2px 3px rgba(99,2,2,0.22); }
</style>
