<template>
  <section class="payment-summary">
    <div class="order-summary">
      <h2 class="summary-title">Сума до оплати</h2>
      <div class="summary-details">
        <div class="summary-row" v-for="item in cartItems" :key="item.id">
          <span>{{ item.title }}</span>
          <span class="price">{{ item.price * item.quantity }}₴</span>
        </div>
        <div class="summary-row">
          <span>Доставка</span>
          <span class="price">{{ deliveryCost }}₴</span>
        </div>
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
  computed: {
    ...mapGetters("order", ["customerData", "cartItems", "deliveryCost", "cartTotalAmount"]),
    totalWithDelivery() {
      return this.cartTotalAmount + this.deliveryCost;
    }
  },
  methods: {
    async submitOrder() {
      console.log("submitOrder запущено");
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть.");
        this.$router.push("/login");
        return;
      }
      // Створюємо чисту копію даних
      const customer = { ...this.customerData };
      const deliveryType = customer.deliveryType || "";
      const orderData = {
        last_name: customer.lastName,
        first_name: customer.firstName,
        second_name: customer.secondName || "",
        phone_number: customer.phone,
        city: customer.city,
        delivery_name: customer.deliveryType,
        delivery_address: deliveryType.toLowerCase().includes("самовивіз")
          ? customer.warehouse
          : `${customer.street} ${customer.houseNumber}`,
        payment_method: customer.selectedPaymentOption,
        type_of_card: customer.selectedPaymentOption === "Післяоплата" ? "" : customer.typeOfCard,
        delivery_cost: this.deliveryCost,
        cart_cost: this.cartTotalAmount,
        // Якщо потрібно передавати список товарів:
        // products: this.cartItems.map(item => ({ product_id: item.id, quantity: item.quantity })),
      };

      console.log("Готовий payload замовлення:", orderData);
      try {
        const orderResponse = await axios.post("http://26.235.139.202:8080/api/orders", orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Відповідь сервера на замовлення:", orderResponse.data);
        const orderId = orderResponse.data.order_id;
        if (customer.selectedPaymentOption === "Післяоплата") {
          this.$router.push("/payment-confirmed");
        } else if (customer.selectedPaymentOption === "Оплата картою") {
          const amount = this.totalWithDelivery;
          await axios.post("https://b9bc-176-121-4-31.ngrok-free.app/api/payment", {
            amount,
            order_id: orderId,
            description: "Оплата замовлення",
          });
          const orderStatusResponse = await axios.get(`http://26.235.139.202:8080/api/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const status = orderStatusResponse.data.status;
          if (status === "Оплачено") {
            this.$router.push("/payment-confirmed");
          } else {
            alert("Помилка оплати або замовлення очікує оплати.");
          }
        }
      } catch (error) {
        console.error("Помилка оформлення замовлення:", error.response?.data || error.message);
        alert("Не вдалося оформити замовлення. Спробуйте пізніше.");
      }
    }
  },
  mounted() {
    console.log("Отримані дані customerData у PaymentSummary:", this.customerData);
  }
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