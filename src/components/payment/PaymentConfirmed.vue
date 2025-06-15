<template>
  <main
    class="min-h-screen pt-[180px] pb-20 bg-fixed bg-cover bg-center px-4 sm:px-6"
    :style="{ backgroundImage: `url(${require('@/assets/cartpattern.png')})` }"
  >
    <!-- Заголовок -->
    <header class="flex items-center justify-center gap-6 mb-12 animate-fade-in">
      <div class="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
      <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-center text-gray-900 dark:text-white drop-shadow-md font-kyiv">
        Оплата підтверджена
      </h1>
      <div class="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
    </header>

    <!-- Основний блок -->
    <div
      class="max-w-md mx-auto bg-white dark:bg-[#17223b] bg-opacity-80 dark:bg-opacity-90 backdrop-blur-md rounded-2xl shadow-lg p-8 animate-slide-up text-black dark:text-white"
    >
      <section class="space-y-6 text-center">
        <p class="text-lg text-gray-700 dark:text-gray-300 font-montserrat">
          Ви успішно здійснили оплату. Зачекайте, будь ласка, вас перенаправляють...
        </p>
        <p class="text-gray-600 dark:text-gray-400 font-montserrat">
          Якщо перенаправлення не відбулося, перейдіть за посиланням
          <router-link
            to="/account?tab=orderhistory"
            class="text-red-600 dark:text-blue-300 font-semibold hover:underline"
          >
            Історія замовлень
          </router-link>.
        </p>
      </section>
    </div>

    <!-- Конфетті -->
    <div class="fixed inset-0 pointer-events-none z-50">
      <canvas ref="confettiCanvas" class="w-full h-full"></canvas>
    </div>
  </main>
</template>

<script>
import confetti from 'canvas-confetti';
import bus from '@/eventBus';

export default {
  name: 'PaymentConfirmed',
  mounted() {
    document.title = 'Підтвердження оплати';

    // через 3 секунди — повне перенаправлення з перезавантаженням сторінки
    setTimeout(() => {
      window.location.replace(window.location.origin + '/account?tab=orderhistory');
    }, 3000);

    // запускаємо конфетті
    const canvas = this.$refs.confettiCanvas;
    const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });
    myConfetti({ particleCount: 200, spread: 180, origin: { y: 0.6 } });

    // повідомити про оновлення кошика
    bus.emit('cart-updated');
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap');

@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

.font-montserrat { font-family: 'Montserrat', sans-serif; }
.font-kyiv { font-family: 'KyivType Titling Black2', sans-serif; }

@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes slide-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
.animate-fade-in { animation: fade-in 1s ease-out both; }
.animate-slide-up { animation: slide-up 0.8s ease-out both; }
</style>