<template>
  <main class="cart">
    <header class="cart-header">
      <div class="line"></div>
      <h1 class="main-title">Оплата підтверджена</h1>
      <div class="line"></div>
    </header>
    <div class="cart-content">
      <section class="confirmation-content">
        <p>Ви успішно здійснили оплату. Зачекайте, будь ласка, вас перенаправляють...</p>
        <p>
          Якщо перенаправлення не відбулося, перейдіть за посиланням 
          <router-link to="/account?tab=orderhistory">Історія замовлень</router-link>.
        </p>
      </section>
    </div>
  </main>
</template>

<script>
export default {
  name: "PaymentConfirmed",
  mounted() {
    // Перенаправлення через 3 секунди
    setTimeout(() => {
      this.$router.push({ path: "/account", query: { tab: "orderhistory" } });
    }, 3000);
  },
};
</script>

<style scoped>
@font-face {
  font-family: 'KyivType Medium';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeSans-Medium2.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
}

.cart {
  display: flex;
  flex-direction: column;
  padding: 0 46.67px;
  margin-top: 180px;
  background-image: url('@/assets/cartpattern.png');
  background-size: cover;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  margin-bottom: 40px;
}

.line {
  flex: 1;
  height: 2px;
  background-color: grey;
  width: 45%;
}

.main-title {
  font-family: 'KyivType Titling', sans-serif;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: -1.2px;
  text-shadow: 0 2px 3px rgba(99, 2, 2, 0.22);
  text-align: center;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.confirmation-content {
  text-align: center;
  font-size: 18px;
  color: grey;
  padding: 20px;
}

.confirmation-content p {
  margin-bottom: 20px;
}
</style>
