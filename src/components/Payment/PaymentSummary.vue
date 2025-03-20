<template>
  <section class="payment-summary">
    <div class="order-summary">
      <h2 class="summary-title">Сума до оплати</h2>
      <div class="summary-details">
        <!-- Вивід товарів з кошика -->
        <div class="summary-row" v-for="item in cartItems" :key="item.id">
          <span>{{ item.title }}</span>
          <span class="price">{{ item.price * item.quantity }}₴</span>
        </div>
        <!-- Вартість доставки -->
        <div class="summary-row">
          <span>Доставка</span>
          <span class="price">{{ deliveryCost }}₴</span>
        </div>
        <!-- Загальна сума -->
        <div class="summary-row total">
          <span>Загальна сума</span>
          <span class="price">{{ totalWithDelivery }}₴</span>
        </div>
      </div>
      <button class="payment-button" @click="submitOrder">
        <span>Оформити замовлення</span>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/436b738744905f60c6a542e2cd314f5694db20045d36b8991f8dab9a31b316a0?placeholderIfAbsent=true&apiKey=c3e46d0a629546c7a48302a5db3297d5"
          alt="Order icon"
          class="login-icon"
        />
      </button>
    </div>
  </section>
</template>

<script>
import axios from "axios";
import { mapGetters } from "vuex";

export default {
  name: "PaymentSummary",
  props: {
    cartItems: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  computed: {
    ...mapGetters("order", ["customerData", "deliveryCost"]),
    totalWithDelivery() {
      return (
        this.cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ) + this.deliveryCost
      );
    },
  },
  methods: {
    async submitOrder() {
      console.log("submitOrder запущено");
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }

      // Вивід даних для діагностики
      console.log("Customer Data:", this.customerData);
      console.log("Cart Items:", this.cartItems);

      const customer = this.customerData;
      const orderData = {
        last_name: customer.lastName,
        first_name: customer.firstName,
        second_name: customer.secondName || "",
        phone_number: customer.phone,
        city: customer.city,
        delivery_name: customer.deliveryType,
        delivery_address: customer.deliveryType.toLowerCase().includes("самовивіз")
          ? customer.warehouse
          : `${customer.street} ${customer.houseNumber}`,
        payment_method: customer.paymentMethod,
        type_of_card: customer.paymentMethod === "Післяоплата" ? "" : customer.typeOfCard,
        delivery_cost: this.deliveryCost,
        cart_cost: this.cartItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
      };

      console.log("Готовий payload замовлення:", orderData);
      try {
  const orderResponse = await axios.post(
    "http://26.235.139.202:8080/api/orders",
    orderData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  console.log("Повна відповідь сервера:", orderResponse);
  console.log("Дані у відповіді:", orderResponse.data);
  console.log("Вміст поля data:", orderResponse.data?.data);

  const orderId = orderResponse.data?.data?.order?.id;

  if (!orderId) {
    console.error("Помилка: order_id не отримано з API.");
    alert("Сталася помилка при оформленні замовлення. Спробуйте ще раз.");
    return;
  }

  console.log("Замовлення успішно створено, order_id:", orderId);

  if (customer.paymentMethod === "Післяоплата") {
    this.$router.push("/payment-confirmed");
  } else if (customer.paymentMethod === "Оплата картою") {
    const amount = this.totalWithDelivery;

    await axios.post("https://7e21-176-121-4-31.ngrok-free.app/api/payment", {
      amount,
      order_id: orderId,
      description: "Оплата замовлення",
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const orderStatusResponse = await axios.get(
      `http://26.235.139.202:8080/api/orders/${orderId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const status = orderStatusResponse.data.status;
    if (status === "Оплачено") {
      this.$router.push("/payment-confirmed");
    } else {
      alert("Сталася помилка при оплаті або замовлення знаходиться в очікуванні.");
    }
  }
} catch (error) {
  console.error("Помилка оформлення замовлення:", error.response?.data || error.message);
  alert("Не вдалося оформити замовлення. Спробуйте пізніше.");
}

    },
    async calculateDeliveryCost() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Будь ласка, увійдіть у свій обліковий запис.");
    this.$router.push("/login");
    return;
  }

  // Якщо cityRef не встановлено, отримуємо його за назвою міста
  if (!this.formData.cityRef && this.formData.city) {
    try {
      const cityResponse = await axios.get("http://26.235.139.202:8080/api/nova-poshta/cities", {
        headers: { Authorization: `Bearer ${token}` },
        params: { city: this.formData.city, delivery_type: this.formData.deliveryType },
      });
      if (cityResponse.data.success && Array.isArray(cityResponse.data.data) && cityResponse.data.data.length > 0) {
        this.formData.cityRef = cityResponse.data.data[0].Ref;
      } else {
        console.error("Невдалося знайти місто. Отримано:", cityResponse.data);
      }
    } catch (err) {
      console.error("Помилка встановлення cityRef", err);
    }
  }

  // Визначаємо тип доставки
  const serviceType = this.formData.deliveryType === "Поштове відділення"
                        ? "WarehouseWarehouse"
                        : "WarehouseDoors";

  // Отримуємо product_ids із кошика, переданого через пропси
  const productIds = (this.cartItems && this.cartItems.length > 0)
    ? this.cartItems.map(item => item.id)
    : [];

  if (!productIds.length) {
    console.error("Кошик порожній, product_ids обов'язковий для розрахунку доставки.");
    alert("Кошик порожній. Додайте товари до кошика для розрахунку доставки.");
    return;
  }

  console.log("Параметри для розрахунку доставки:", {
    CityRecipient: this.formData.cityRef,
    ServiceType: serviceType,
    product_ids: productIds
  });

  try {
    const response = await axios.get("http://26.235.139.202:8080/api/nova-poshta/delivery/cost", {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        CityRecipient: this.formData.cityRef,
        ServiceType: serviceType,
        product_ids: productIds // Передаємо як масив
      },
    });

    // Очікуємо, що API поверне ключ deliveryCost
    if (response.data && response.data.deliveryCost !== undefined) {
      this.deliveryCost = response.data.deliveryCost;
      this.updateDeliveryCost(response.data.deliveryCost);
    } else {
      console.error("Невірна відповідь API розрахунку доставки:", response.data);
      alert("Не вдалося розрахувати доставку. Спробуйте ще раз.");
    }
  } catch (error) {
    console.error("Помилка розрахунку вартості доставки", error);
    alert("Сталася помилка при розрахунку вартості доставки.");
  }
},
    cartTotalAmount() {
      return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
  },
  mounted() {
    console.log("Отримані дані customerData у PaymentSummary:", this.customerData);
  },
};
</script>




<style scoped>
@media (max-width: 991px) {

  .payment-steps,
  .payment-summary,
  .order-items,
  .delivery-address {
    width: 100%;
  }

}

.order-summary {
  position: absolute;
  top: 300px;
  right: 100px;
  z-index: 100;
  width: 300px;
  padding: 20px;
  border-radius: 16px;
  background-color: rgba(255, 247, 246, 1);
  border: 1px solid rgba(230, 230, 230, 1);
  max-height: 400px;
  overflow-y: auto;
  transition: position 0.3s ease;
  z-index: 10;
}

.order-summary.sticky {
  position: absolute;
  top: auto;
  bottom: 00px;
}

.summary-title {
  color: #000;
  font: 700 20px/1.3 Merriweather, sans-serif;
  margin-bottom: 16px;
}

.summary-details {
  font: 400 14px/1.3 Merriweather, sans-serif;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.price {
  color: rgba(160, 18, 18, 1);
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 14px;
}

.total {
  font-size: 18px;
  margin-top: 16px;
}

.payment-button {
  border-radius: 8px;
  background-color: rgba(107, 31, 31, 1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font: 700 12px/1.3 Merriweather, sans-serif;
  padding: 6px 15px;
  margin-top: 10px;
  width: 100%;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  height: 40px;
  font-size: 15px;
}

.button-icon {
  width: 24px;
  height: 24px;
}

@media (max-width: 991px) {
  .order-summary {
    max-width: 100%;
    margin-top: 20px;
    padding: 15px;
  }
}


.payment-summary {
  z-index: 5;
  /* Встановлюємо більш високий пріоритет */
}
</style>