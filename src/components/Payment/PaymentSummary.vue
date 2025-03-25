<template>
  <section class="payment-summary">
    <div class="order-summary">
      <h2 class="summary-title">Сума до оплати</h2>
      <div class="summary-details">
        <!-- Вивід товарів з кошика -->
        <div class="summary-row" v-for="item in safeCartItems" :key="item.id">
          <span>{{ item.name }}</span>
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

export default {
  name: "PaymentSummary",
  props: {
    cityRef: {
      type: String,
      required: true
    },
    deliveryType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      cartItems: [],
      // Залишимо deliveryCost для відображення в шаблоні, 
      // але у submitOrder будемо отримувати його безпосередньо
      deliveryCost: 0
    };
  },
  computed: {
    safeCartItems() {
      return Array.isArray(this.cartItems) ? this.cartItems : [];
    },
    cartTotalAmount() {
      return this.safeCartItems.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
        0
      );
    },
    totalWithDelivery() {
      return this.cartTotalAmount + this.deliveryCost;
    }
  },
  methods: {
    async fetchCartItems() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Необхідна авторизація");
        return;
      }
      try {
        const response = await axios.get("http://26.235.139.202:8080/api/cart", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data.products || [];
        console.log("Отримані дані кошика:", data);
        this.cartItems = data;
      } catch (error) {
        console.error("Помилка завантаження кошика", error);
      }
    },
    async calculateDeliveryCost() {
      if (!this.cityRef || !this.deliveryType || this.safeCartItems.length === 0) {
        console.warn("Недостатньо даних для розрахунку доставки");
        return 0;
      }
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Необхідна авторизація");
        return 0;
      }
      const productIds = this.safeCartItems.map(item => item.id);
      const serviceType = this.deliveryType.toLowerCase().includes("кур'єр")
        ? "WarehouseDoors"
        : "WarehouseWarehouse";
      try {
        const response = await axios.get("http://26.235.139.202:8080/api/nova-poshta/delivery/cost", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            CityRecipient: this.cityRef,
            ServiceType: serviceType,
            product_ids: productIds
          }
        });
        if (
          response.data &&
          response.data.data &&
          response.data.data.cost !== undefined
        ) {
          const cost = response.data.data.cost;
          console.log("Розрахована вартість доставки:", cost);
          // Оновлюємо відображення, але для payload використовуватимемо отримане значення
          this.deliveryCost = cost;
          return cost;
        } else {
          console.error("Невірна відповідь API розрахунку доставки", response.data);
          return 0;
        }
      } catch (error) {
        console.error("Помилка розрахунку вартості доставки", error);
        return 0;
      }
    },
    async submitOrder() {
      console.log("submitOrder запущено");
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }
      if (!this.cartItems.length) {
        alert("Кошик порожній. Додайте товари перед оформленням замовлення.");
        return;
      }
      // Отримуємо актуальну вартість доставки безпосередньо з API
      const currentDeliveryCost = await this.calculateDeliveryCost();
      console.log("Отримана вартість доставки для замовлення:", currentDeliveryCost);

      const customer = this.$store.getters["order/customerData"];
      console.log("Customer Data:", customer);
      console.log("Cart Items:", this.cartItems);
      
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
        delivery_cost: currentDeliveryCost, // використовуємо отримане значення
        cart_cost: this.cartTotalAmount
      };
      console.log("Готовий payload замовлення:", orderData);
      try {
        const orderResponse = await axios.post("http://26.235.139.202:8080/api/orders", orderData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Повна відповідь сервера:", orderResponse);
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
          const amount = this.cartTotalAmount + currentDeliveryCost;
          await axios.post("https://7e21-176-121-4-31.ngrok-free.app/api/payment", {
            amount,
            order_id: orderId,
            description: "Оплата замовлення"
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const orderStatusResponse = await axios.get(`http://26.235.139.202:8080/api/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
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
    }
  },
  async mounted() {
    // Завантаження кошика і розрахунок доставки для відображення в інтерфейсі
    await this.fetchCartItems();
    if (this.cityRef && this.deliveryType && this.safeCartItems.length) {
      await this.calculateDeliveryCost();
    }
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