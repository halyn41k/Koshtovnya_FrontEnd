<template>
  <main class="min-h-screen bg-fixed bg-cover bg-center px-6 py-32" :style="{ backgroundImage: `url(${require('@/assets/cartpattern.png')})` }">
    <header class="flex items-center justify-center gap-6 mb-12">
      <div class="flex-1 h-px bg-gray-300"></div>
      <h1 class="text-3xl font-extrabold tracking-tight text-center text-gray-900 drop-shadow-md">
        Оплата підтверджена
      </h1>
      <div class="flex-1 h-px bg-gray-300"></div>
    </header>

    <div class="max-w-md mx-auto bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-lg p-8">
      <section class="space-y-6 text-center">
        <p class="text-lg text-gray-700">
          Ви успішно здійснили оплату. Зачекайте, будь ласка, вас перенаправляють...
        </p>
        <p class="text-gray-600">
          Якщо перенаправлення не відбулося, перейдіть за посиланням
          <router-link to="/account?tab=orderhistory" class="text-red-600 font-medium hover:underline">
            Історія замовлень
          </router-link>.
        </p>
      </section>
    </div>
  </main>
</template>

<script>
export default {
  name: 'PaymentConfirmed',
  mounted() {
    document.title = 'Підтвердження оплати';
    setTimeout(() => {
      this.$router.push({ path: '/account', query: { tab: 'orderhistory' } });
    }, 10000);
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap');

main, h1, p, .router-link-active {
  font-family: 'Montserrat', sans-serif;
}
</style>