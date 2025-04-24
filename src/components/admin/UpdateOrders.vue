<template>
  <main class="order-update">
    <header class="order-header">
      <h1 class="order-title">Замовлення</h1>
      <h2 class="order-subtitle">Оновлення замовлення</h2>
    </header>
    <section class="order-form-container">
      <form class="order-form" @submit.prevent="updateOrder">
        <div class="form-group">
          <label for="orderName" class="form-label">Назва замовлення</label>
          <input id="orderName" type="text" class="form-input" value="Замовлення №1" readonly>
        </div>
        <fieldset class="order-details">
          <legend class="details-title">Деталі Замовлення</legend>
          <div class="form-group">
            <label for="productName" class="form-label">Назва виробу</label>
            <input id="productName" type="text" class="form-input" value="Гердан 'Гуцулка'" readonly>
          </div>
        </fieldset>
        <div class="form-group">
          <label for="customerName" class="form-label">Хто замовляв</label>
          <input id="customerName" type="text" class="form-input" value="Степан Мельник" readonly>
        </div>
        <div class="form-group">
          <label for="orderAmount" class="form-label">Сума замовлення</label>
          <input id="orderAmount" type="text" class="form-input" value="1500 грн" readonly>
        </div>
        <div class="form-group">
          <label for="phoneNumber" class="form-label">Номер телефону</label>
          <input id="phoneNumber" type="tel" class="form-input" value="+380964328994" readonly>
        </div>
        <div class="form-group">
          <label for="orderDate" class="form-label">Дата додавання</label>
          <input id="orderDate" type="text" class="form-input" value="01.01.2024" readonly>
        </div>
        <div class="form-group">
          <label for="deliveryAddress" class="form-label">Адреса доставки</label>
          <textarea id="deliveryAddress" class="form-input"
            readonly>Степан Мельник, Коломия, Нова Пошта, Відділення №3, Старий Ринок, 2Б</textarea>
        </div>
        <button type="submit" class="submit-button">Оновити Замовлення</button>
      </form>
    </section>
  </main>
</template>

<script>
export default {
  name: 'OrderUpdateForm',
  methods: {
    updateOrder() {
      console.log('Order updated');
    }
  }
}
</script>

<style scoped>
.order-update {
  display: flex;
  max-width: 640px;
  flex-direction: column;
}

.order-header {
  align-self: flex-start;
  display: flex;
  margin-left: 15px;
  flex-direction: column;
}

.order-title {
  color: #000;
  font: 700 40px Montserrat, sans-serif;
}

.order-subtitle {
  color: #040404;
  text-align: center;
  margin-top: 25px;
  font: 700 28px Montserrat;
}

.order-form-container {
  border-radius: 8px;
  background-color: #fff7f6;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  margin-top: 25px;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
}

.order-form {
  display: flex;
  width: 100%;
  flex-direction: column;
}

.form-group {
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: flex-start;
  margin-bottom: 15px;
}

.form-label {
  width: 100%;
  color: #040404;
  font: 18px Montserrat;
}

.form-input {
  justify-content: center;
  align-items: flex-start;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #d6c9c9;
  display: flex;
  margin-top: 5px;
  width: 100%;
  color: #555;
  padding: 11px;
  font: 16px Inter;
}

.order-details {
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: #eee3e3;
  display: flex;
  margin-top: 19px;
  flex-direction: column;
  justify-content: flex-start;
  gap: 21.05px;
  padding: 37px 16px 11px;
  margin-bottom: 20px;
}

.details-title {
  width: 100%;
  color: #040404;
  font: 21px Montserrat;
}

.submit-button {
  border-radius: 4px;
  background-color: #6b1f1f;
  color: #fff;
  text-align: center;
  padding: 12px;
  font: 700 18px Inter;
  border: none;
  cursor: pointer;
  margin-top: 15px;
}

@media (max-width: 991px) {
  .order-header {
    margin-left: 10px;
  }

  .order-form-container,
  .order-form,
  .form-group,
  .form-label,
  .form-input,
  .order-details,
  .details-title,
  .submit-button {
    max-width: 100%;
  }

  .submit-button {
    padding: 12px 20px;
  }
}
</style>