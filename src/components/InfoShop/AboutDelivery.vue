<template>
  <article class="payment-delivery-info">
    <header class="info-header">
      <h1 class="section-title-container">
        <div class="line"></div>
        <span class="main-title">Умови оплати та доставки</span>
        <div class="line"></div>
      </h1>
    </header>
    <main class="info-content">
      <section class="delivery-section">
        <div class="text-and-image">
          <div class="text-content">
            <h2 class="section-title fade-in">Доставка</h2>
            <p class="delivery-description fade-in">
              Ми здійснюємо доставку по всій території України за допомогою таких перевізників:
            </p>
            <p><b>- Нова Пошта </b></p>
            <p><b>- Укрпошта</b></p>
            <section class="delivery-conditions fade-in">
              <h2 class="section-title">1. Умови доставки:</h2>
              <ul class="delivery-list">
                <li class="delivery-item">
                  <h4 class="delivery-company ">
                    • Нова Пошта
                    <img src="@/assets/novapost.png" alt="Нова Пошта" class="company-icon" />
                  </h4>
                  <p class="delivery-details">
                    Термін доставки: <strong>1-3</strong> робочих дні<br />
                    Вартість доставки залежить від тарифів перевізника та ваги посилки.<br />
                    Замовлення доставляється на відділення або кур'єром за адресою (за бажанням клієнта).<br />
                    Можливий післяплатіж, оплата при отриманні.
                  </p>
                </li>
                <li class="delivery-item">
                  <h4 class="delivery-company">
                    • Укрпошта
                    <img src="@/assets/ukrpost.png" alt="Укрпошта" class="company-icon" />
                  </h4>
                  <p class="delivery-details">
                    Термін доставки: <strong>2-5</strong> робочих днів<br />
                    Доставка доступна до відділень або до поштових скриньок.<br />
                    Вартість доставки визначається згідно тарифів перевізника.<br />
                    Можлива передплата або післяплатіж.
                  </p>
                </li>
              </ul>
            </section>
          </div>
          <div class="image-wrapper gradient-overlay">
            <img src="@/assets/delivery.png" alt="Доставка" class="full-width-image delivery-icon" />
          </div>
        </div>
      </section>

      <section class="payment-section fade-in">
        <h2 class="section-title">2. Оплата</h2>
        <div class="text-and-image">
          <div class="text-content">
            <p class="payment-description">Ми пропонуємо кілька варіантів оплати:</p>
            <ul class="payment-list">
              <li class="payment-item">
                <h4 class="payment-method">• Оплата при отриманні</h4>
                <p class="payment-details">
                  Оплачується безпосередньо під час отримання товару у відділенні перевізника або кур'єром
                  (додаткова комісія перевізника за накладний платіж).
                </p>
              </li>
              <li class="payment-item">
                <h4 class="payment-method">• Передплата на банківську карту</h4>
                <p class="payment-details">
                  Після оформлення замовлення вам буде надано реквізити для оплати. Після зарахування коштів ми
                  відправимо ваше замовлення.
                </p>
              </li>
              <li class="payment-item">
                <h4 class="payment-method">• Онлайн оплата карткою</h4>
                <p class="payment-details">
                  Оплата може бути здійснена через захищену платіжну систему на сайті. Замовлення відправляється після
                  підтвердження платежу.
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="additional-conditions fade-in">
        <h3 class="subsection-title">Додаткові умови:</h3>
        <ul class="conditions-list">
          <li class="condition-item">
            • У випадку оплати післяплатою, клієнт оплачує додаткову комісію перевізника за цей вид послуги.
          </li>
          <li class="condition-item">
            • Замовлення відправляється протягом 1-2 робочих днів після підтвердження оплати або оформлення післяплати.
          </li>
        </ul>
      </section>
    </main>

    <footer class="info-footer fade-in">
      <p class="thank-you-message">Дякуємо, що обрали наш магазин!</p>
    </footer>

    <div class="background-image"></div>
  </article>
</template>

<script>
export default {
  name: 'AboutDelivery',
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
  }
}
</script>

<style scoped>
@font-face {
  font-family: 'KyivType Titling';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeSans-Heavy2.ttf') format('truetype');
  font-weight: 900;
  font-style: normal;
}

@font-face {
  font-family: 'KyivType Medium';
  src: url('@/assets/fonts/KyivType2020-14-12/KyivType-NoVariable/TTF/KyivTypeSans-Medium2.ttf') format('truetype');
  font-weight: 500;
  font-style: normal;
}

.payment-delivery-info {
  background-color: #fff7f6;
  color: #000;
  font: 500 18px/27px 'KyivType Titling', sans-serif;
  letter-spacing: -0.5px;
  padding: 170px 30px;
  width: 1450px;
  text-align: left;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  overflow: hidden;
}

/* Container for title with side lines */
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
  text-align: center;
  text-shadow: 0 2px 3px rgba(99, 2, 2, 0.22);
}

.text-and-image {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.text-content {
  flex: 1;
  padding-right: 20px;
}

.image-wrapper {
  flex: 0 0 40%;
  position: relative;
  overflow: hidden;
}

.gradient-overlay::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));
  z-index: 2;
}

.full-width-image {
  width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.section-title {
  font-family: 'KyivType Medium', sans-serif;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.delivery-description,
.payment-description {
  margin-bottom: 18px;
  padding: 5px 15px;
  border-left: 3px solid #6b1f1f;
}

.delivery-list,
.payment-list,
.conditions-list {
  list-style-type: none;
  padding-left: 0;
}

.delivery-item,
.payment-item,
.condition-item {
  margin-bottom: 20px;
  border-radius: 10px;
  background: rgba(255, 247, 246, 0.5);
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.delivery-company,
.payment-method {
  font-family: 'KyivType Medium', sans-serif;
  font-weight: 700;
  margin-bottom: 8px;
  color: #6b1f1f;
}

.company-icon {
  width: 30px;
  margin-left: 8px;
  vertical-align: middle;
}

.thank-you-message {
  font-family: 'KyivType Medium', sans-serif;
  color: #6b1f1f;
  font-size: 30px;
  font-weight: 700;
  text-align: center;
  margin: 40px 0;
}

.background-image {
  background-image: url('@/assets/deliverypattern.png');
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.3;
  z-index: 0;
  background-position: center;
  background-size: 80%;
  pointer-events: none;
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


@media (max-width: 991px) {
  .text-and-image {
    flex-direction: column;
  }

  .payment-delivery-info {
    padding: 150px 150px;
    border-radius: 10px;
  }

  .main-title {
    font-size: 26px;
    line-height: 32px;
  }

  .thank-you-message {
    font-size: 22px;
    margin: 20px 0;
  }

  .image-wrapper {
    flex: 1;
    margin-top: 20px;
  }

  .background-image {
    background-size: contain;
    opacity: 0.25;
  }
}
</style>