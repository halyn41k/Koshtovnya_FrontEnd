<template>
  <!-- Фон на всю ширину -->
  <div class="w-full bg-[#FFF7F6]">
    <article
      class="relative text-black font-montserrat py-[170px] px-[30px]
             w-full max-w-[1450px] mx-auto rounded-lg overflow-hidden
             shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
    >
      <!-- Title -->
      <header class="mb-8">
        <h1 class="flex items-center justify-center mt-[40px]
                   font-kyivBlack2 text-[34px] font-black tracking-[-1.2px]
                   text-center">
          <div class="flex-1 h-[2px] bg-gray-400 mx-2"></div>
          Умови оплати та доставки
          <div class="flex-1 h-[2px] bg-gray-400 mx-2"></div>
        </h1>
      </header>

      <main class="relative z-10 space-y-16">
        <!-- Доставка: тільки Умови доставки та картинка -->
        <section class="flex flex-col lg:flex-row items-start gap-5">
          <!-- Умови доставки -->
          <div class="flex-1 pr-5">
            <div class="fade-in opacity-0 translate-y-5 transition-all duration-700">
              <h3 class="mb-3 text-xl font-medium">Умови доставки:</h3>
              <ul class="list-none p-0 space-y-4">
                <li class="rounded-lg bg-white bg-opacity-50 p-4 shadow-sm">
                  <h4 class="text-[#6B1F1F] font-medium mb-2 flex items-center">
                    • Нова Пошта
                    <img src="@/assets/novapost.png" alt="Нова Пошта" class="w-7 ml-2 inline-block align-middle" />
                  </h4>
                  <p class="text-base leading-relaxed">
                    Термін доставки: <strong>1-3</strong> робочих дні<br>
                    Вартість доставки залежить від тарифів перевізника та ваги посилки.<br>
                    Замовлення доставляється на відділення або кур'єром за адресою.<br>
                    Можливий післяплатіж, оплата при отриманні.
                  </p>
                </li>
                <li class="rounded-lg bg-white bg-opacity-50 p-4 shadow-sm">
                  <h4 class="text-[#6B1F1F] font-medium mb-2 flex items-center">
                    • Укрпошта
                    <img src="@/assets/ukrpost.png" alt="Укрпошта" class="w-7 ml-2 inline-block align-middle" />
                  </h4>
                  <p class="text-base leading-relaxed">
                    Термін доставки: <strong>2-5</strong> робочих дні<br>
                    Доставка доступна до відділень або до поштових скриньок.<br>
                    Вартість доставки визначається згідно тарифів перевізника.<br>
                    Можлива передплата або післяплатіж.
                  </p>
                </li>
              </ul>
            </div>
          </div>

          <!-- Фото праворуч -->
          <div class="w-full lg:w-2/5 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-white to-transparent"></div>
            <img
              src="@/assets/delivery.png"
              alt="Доставка"
              class="relative w-full h-auto rounded-lg shadow-md"
            />
          </div>
        </section>

        <!-- Оплата -->
        <section class="fade-in opacity-0 translate-y-5 transition-all duration-700">
          <h2 class="mb-4 text-xl font-medium">Оплата</h2>
          <div class="space-y-4">
            <p class="pl-4 border-l-4 border-[#6B1F1F] mb-4">
              Ми пропонуємо кілька варіантів оплати:
            </p>
            <ul class="list-none p-0 space-y-4">
              <li class="rounded-lg bg-white bg-opacity-50 p-4 shadow-sm">
                <h4 class="text-[#6B1F1F] font-medium mb-2">• Оплата при отриманні</h4>
                <p class="text-base leading-relaxed">
                  Оплачується безпосередньо під час отримання товару у відділенні перевізника або кур'єром
                  (додаткова комісія перевізника за накладний платіж).
                </p>
              </li>
              <li class="rounded-lg bg-white bg-opacity-50 p-4 shadow-sm">
                <h4 class="text-[#6B1F1F] font-medium mb-2">• Передплата на банківську карту</h4>
                <p class="text-base leading-relaxed">
                  Після оформлення замовлення вам буде надано реквізити для оплати. Після зарахування коштів ми
                  відправимо ваше замовлення.
                </p>
              </li>
              <li class="rounded-lg bg-white bg-opacity-50 p-4 shadow-sm">
                <h4 class="text-[#6B1F1F] font-medium mb-2">• Онлайн оплата карткою</h4>
                <p class="text-base leading-relaxed">
                  Оплата може бути здійснена через захищену платіжну систему на сайті. Замовлення відправляється після
                  підтвердження платежу.
                </p>
              </li>
            </ul>
          </div>
        </section>

        <!-- Додаткові умови -->
        <section class="fade-in opacity-0 translate-y-5 transition-all duration-700">
          <h3 class="mb-3 text-lg font-medium">Додаткові умови:</h3>
          <ul class="list-none p-0 space-y-3">
            <li class="text-base">• У випадку оплати післяплатою, клієнт оплачує додаткову комісію перевізника за цей вид послуги.</li>
            <li class="text-base">• Замовлення відправляється протягом 1-2 робочих днів після підтвердження оплати або оформлення післяплати.</li>
          </ul>
        </section>
      </main>

      <!-- Footer -->
      <footer class="fade-in opacity-0 translate-y-5 transition-all duration-700 mt-16">
        <p class="text-center text-2xl font-bold text-[#6B1F1F] mb-10">
          Дякуємо, що обрали наш магазин!
        </p>
      </footer>

      <!-- Background pattern -->
      <div
        class="absolute inset-0 bg-[url('@/assets/deliverypattern.png')] bg-center bg-no-repeat bg-[length:80%]
               opacity-30 pointer-events-none"
      ></div>
    </article>
  </div>
</template>

<script>
export default {
  name: 'AboutDelivery',
  mounted() {
    document.title = 'Про Оплату Доставку';
    const els = document.querySelectorAll('.fade-in');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('opacity-100', 'translate-y-0');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
  }
};
</script>

<style scoped>
/* Google-шрифт Montserrat */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

/* Ваш кастомний шрифт */
@font-face {
  font-family: 'KyivType Titling Black2';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeTitling-Black2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

/* Класи для шрифтів */
.font-montserrat {
  font-family: 'Montserrat', sans-serif;
}
.font-kyivBlack2 {
  font-family: 'KyivType Titling Black2', sans-serif;
}

/* Тінь для заголовка */
.text-shadow-md {
  text-shadow: 0 2px 3px rgba(99, 2, 2, 0.22);
}
</style>
