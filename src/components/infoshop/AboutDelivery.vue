<template>
  <div class="w-full bg-[#FFF7F6] dark:bg-[#17223b] transition-colors duration-300">
    <article class="relative text-black dark:text-white font-montserrat py-[170px] px-[30px] w-full max-w-[1450px] mx-auto rounded-lg overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-colors">
      <!-- Title -->
      <header class="mb-8">
        <h1 class="flex items-center justify-center mt-[40px] font-kyivBlack2 text-[34px] font-black tracking-[-1.2px] text-center text-[#6B1F1F] dark:text-white transition-colors">
          <div class="flex-1 h-[2px] bg-gray-400 mx-2"></div>
          {{ $t('infoshop.aboutDelivery.title') }}
          <div class="flex-1 h-[2px] bg-gray-400 mx-2"></div>
        </h1>
      </header>

      <main class="relative z-10 space-y-16">
        <!-- Delivery Section -->
        <section class="flex flex-col lg:flex-row items-start gap-5">
          <div class="flex-1 pr-5">
            <h3 class="mb-3 text-xl font-medium dark:text-white">{{ $t('infoshop.aboutDelivery.deliveryTitle') }}</h3>
            <ul class="space-y-4">
              <li
                v-for="(option, index) in deliveryOptions"
                :key="index"
                class="bg-white dark:bg-[#1e263b] bg-opacity-50 dark:bg-opacity-100 p-4 shadow-sm rounded-lg transition-colors"
              >
                <h4 class="text-[#6B1F1F] dark:text-[#fca5a5] font-medium mb-2 flex items-center">
                  • {{ option.carrier }}
                  <img
                    :src="getImage(option.logo)"
                    :alt="option.carrier"
                    class="w-7 ml-2 inline-block align-middle"
                  />
                </h4>
                <p
                  class="text-base leading-relaxed text-gray-700 dark:text-gray-300"
                  v-html="getSafeText(option.text)"
                />
              </li>
            </ul>
          </div>
          <div class="w-full lg:w-2/5 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-white dark:from-[#17223b] to-transparent transition-colors"></div>
            <img
              src="@/assets/delivery.png"
              alt="Доставка"
              class="relative w-full h-auto rounded-lg shadow-md"
            />
          </div>
        </section>

        <!-- Payment Section -->
        <section>
          <h2 class="mb-4 text-xl font-medium dark:text-white">{{ $t('infoshop.aboutDelivery.paymentTitle') }}</h2>
          <p class="pl-4 border-l-4 border-[#6B1F1F] dark:border-[#fca5a5] mb-4 text-gray-800 dark:text-gray-200">
            {{ $t('infoshop.aboutDelivery.paymentIntro') }}
          </p>
          <ul class="space-y-4">
            <li
              v-for="(method, index) in paymentMethods"
              :key="index"
              class="bg-white dark:bg-[#1e263b] bg-opacity-50 dark:bg-opacity-100 p-4 shadow-sm rounded-lg transition-colors"
            >
              <h4 class="text-[#6B1F1F] dark:text-[#fca5a5] font-medium mb-2">• {{ method.title }}</h4>
              <p class="text-base leading-relaxed text-gray-700 dark:text-gray-300">{{ method.text }}</p>
            </li>
          </ul>
        </section>

        <!-- Additional Conditions -->
        <section>
          <h3 class="mb-3 text-lg font-medium dark:text-white">{{ $t('infoshop.aboutDelivery.additionalTitle') }}</h3>
          <ul class="space-y-3">
            <li
              v-for="(item, i) in additional"
              :key="i"
              class="text-base text-gray-800 dark:text-gray-200"
            >
              • {{ item }}
            </li>
          </ul>
        </section>
      </main>

      <!-- Footer -->
      <footer class="mt-16">
        <p class="text-center text-2xl font-bold text-[#6B1F1F] dark:text-[#fca5a5] mb-10">
          {{ $t('infoshop.aboutDelivery.thankYou') }}
        </p>
      </footer>

      <!-- Background pattern -->
      <div class="absolute inset-0 bg-[url('@/assets/deliverypattern.png')] bg-center bg-no-repeat bg-[length:80%] opacity-30 pointer-events-none"></div>
    </article>
  </div>
</template>


<script>
export default {
  name: 'AboutDelivery',
  data() {
    return {
      deliveryOptions: [],
      paymentMethods: [],
      additional: []
    };
  },
  methods: {
  loadLocaleData() {
    const currentLocale = this.$i18n.locale;
    const data = this.$i18n.messages[currentLocale].infoshop.aboutDelivery;

    this.deliveryOptions = data.deliveryOptions || [];
    this.paymentMethods = data.paymentMethods || [];
    this.additional = data.additional || [];
},
    getImage(filename) {
      try {
        return require(`@/assets/${filename}`);
      } catch {
        return require('@/assets/placeholder.png');
      }
    },
    getSafeText(text) {
      return typeof text === 'string' ? text.replace(/\n/g, '<br>') : '';
    }
  },
  watch: {
    '$i18n.locale'() {
      this.loadLocaleData();
    }
  },
  mounted() {
    this.loadLocaleData();
    document.title = this.$t('infoshop.aboutDelivery.title');
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

.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
.font-kyivBlack2 {
  font-family: 'KyivType Titling Black2', sans-serif;
}
.text-shadow-md {
  text-shadow: 0 2px 3px rgba(99, 2, 2, 0.22);
}
</style>
