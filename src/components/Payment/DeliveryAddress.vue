<template>
  <div class="delivery-address-card">
    <h2 class="title">Підсумкова інформація</h2>
    <div class="info-section">
      <p><span>👤 ПІБ:</span> {{ fullName }}</p>
      <p><span>📞 Телефон:</span> {{ customerData.phone || 'Не вказано' }}</p>
    </div>

    <div class="info-section">
      <h3>🚚 Доставка</h3>
      <ul>
        <li><span>🏙️ Місто:</span> {{ customerData.city || 'Не вказано' }}</li>
        <li><span>🏠 Вулиця:</span> {{ customerData.street || 'Не вказано' }}</li>
        <li><span>🔢 Номер будинку:</span> {{ customerData.houseNumber || 'Не вказано' }}</li>
        <li><span>📦 Спосіб доставки:</span> {{ customerData.deliveryType || 'Не вказано' }}</li>
        <li><span>🏤 Відділення:</span> {{ customerData.warehouse || 'Не вказано' }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "DeliveryAddress",
  props: {
    customerData: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    fullName() {
      const { lastName = '', firstName = '', secondName = '' } = this.customerData;
      return [lastName, firstName, secondName].filter(Boolean).join(' ') || 'Не вказано';
    },
  },
};
</script>

<style scoped>
.delivery-address-card {
  margin-top: 20px;
  max-width: 600px;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f9f9f9, #ffffff);
  transition: box-shadow 0.3s ease;
}

.delivery-address-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.title {
  font: 27px Merriweather, sans-serif;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
}

.info-section {
  font: 13px Merriweather, sans-serif;
  margin-bottom: 24px;
}

.info-section h3 {
  font-size: 1.4rem;
  margin-bottom: 12px;
  color: #555;
}

p, li {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #444;
}

p span, li span {
  font-weight: 500;
  color: #000;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin: 8px 0;
}

@media (max-width: 640px) {
  .delivery-address-card {
    padding: 16px;
    border-radius: 12px;
  }

  .title {
    font-size: 1.5rem;
  }

  p, li {
    font-size: 1rem;
  }
}
</style>
