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
import { mapGetters, mapActions } from "vuex";

export default {
  name: "PaymentSummary",
  props: {
    cityRef: {
      type: String,
      required: false,
      default: ""
    },
    deliveryType: {
      type: String,
      required: false,
      default: ""
    }
  },
  computed: {
    ...mapGetters("order", ["cartItems", "deliveryCost", "customerData"]),
    safeCartItems() {
      return Array.isArray(this.cartItems) ? this.cartItems : [];
    },
    // Використовуємо дані з пропсів, а якщо вони відсутні — дані з customerData
    effectiveCityRef() {
      return this.cityRef || (this.customerData && this.customerData.cityRef) || "";
    },
    effectiveDeliveryType() {
      return this.deliveryType || (this.customerData && this.customerData.deliveryType) || "";
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
  watch: {
    effectiveCityRef(newVal) {
      if (newVal && this.effectiveDeliveryType) {
        this.calculateDeliveryCost();
      }
    },
    effectiveDeliveryType(newVal) {
      if (newVal && this.effectiveCityRef) {
        this.calculateDeliveryCost();
      }
    }
  },
  methods: {
    ...mapActions("order", ["updateCartItems", "updateDeliveryCost"]),
    async fetchCartItems() {
      console.log("[fetchCartItems] Початок завантаження кошика");
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("[fetchCartItems] Необхідна авторизація");
        return;
      }
      try {
        const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/cart", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data.products || [];
        console.log("[fetchCartItems] Отримані дані кошика:", data);
        this.updateCartItems(data);
      } catch (error) {
        console.error("[fetchCartItems] Помилка завантаження кошика", error);
      }
    },
    async calculateDeliveryCost() {
      console.log("[calculateDeliveryCost] Виклик функції розрахунку доставки");
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("[calculateDeliveryCost] Необхідна авторизація");
        return 0;
      }
      console.log("[calculateDeliveryCost] effectiveCityRef:", this.effectiveCityRef);
      console.log("[calculateDeliveryCost] effectiveDeliveryType:", this.effectiveDeliveryType);
      if (!this.effectiveCityRef || !this.effectiveDeliveryType) {
        console.error("[calculateDeliveryCost] cityRef або deliveryType відсутні");
        return 0;
      }
      const productIds = this.safeCartItems.map(item => item.id);
      const serviceType = this.effectiveDeliveryType.toLowerCase().includes("кур'єр")
        ? "WarehouseDoors"
        : "WarehouseWarehouse";
      try {
        const response = await axios.get("https://koshtovnya.api-dev.bmax-edu.website/api/nova-poshta/delivery/cost", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            CityRecipient: this.effectiveCityRef,
            ServiceType: serviceType,
            product_ids: productIds
          }
        });
        if (response.data && response.data.data && response.data.data.cost !== undefined) {
          const cost = response.data.data.cost;
          this.updateDeliveryCost(cost);
          return cost;
        } else {
          console.error("[calculateDeliveryCost] Невірна відповідь API розрахунку доставки", response.data);
          return 0;
        }
      } catch (error) {
        console.error("[calculateDeliveryCost] Помилка розрахунку вартості доставки", error);
        return 0;
      }
    },
    async submitOrder() {
      console.log("[submitOrder] === Початок submitOrder ===");
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("[submitOrder] Токен відсутній - перенаправлення на логін");
        alert("Будь ласка, увійдіть у свій обліковий запис.");
        this.$router.push("/login");
        return;
      }
      if (!this.safeCartItems.length) {
        console.error("[submitOrder] Кошик порожній");
        alert("Кошик порожній. Додайте товари перед оформленням замовлення.");
        return;
      }
      // Логування перед розрахунком доставки
      console.log("[submitOrder] Перед розрахунком доставки:", {
        effectiveCityRef: this.effectiveCityRef,
        effectiveDeliveryType: this.effectiveDeliveryType,
        safeCartItems: this.safeCartItems
      });
      
      const currentDeliveryCost = await this.calculateDeliveryCost();
      console.log("[submitOrder] Поточна вартість доставки після розрахунку:", currentDeliveryCost);
      
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
        delivery_cost: currentDeliveryCost,
        cart_cost: this.cartTotalAmount
      };
      
      console.log("[submitOrder] Сформований payload замовлення:", orderData);
      try {
        // Створення замовлення
        const orderResponse = await axios.post("https://koshtovnya.api-dev.bmax-edu.website/api/orders", orderData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orderId = orderResponse.data?.data?.order?.id;
        if (!orderId) {
          console.error("[submitOrder] Помилка: order_id не отримано з API.");
          alert("Сталася помилка при оформленні замовлення. Спробуйте ще раз.");
          return;
        }
        console.log("[submitOrder] Замовлення успішно створено, order_id:", orderId);
        
        if (customer.paymentMethod === "Післяоплата") {
          this.$router.push("/payment-confirmed");
        } else if (customer.paymentMethod === "Оплата картою") {
          // Оплата картою:
          const amount = this.cartTotalAmount + currentDeliveryCost;
          console.log("[submitOrder] Спосіб оплати - Оплата картою, сума для оплати:", amount);
          try {
            const paymentResponse = await axios.post(
              "https://koshtovnya.api-dev.bmax-edu.website/api/payment",
              {
                amount,
                order_id: orderId,
                description: "Оплата замовлення" // або "Оплата товару" – за потребою
              },
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            // Очікуємо, що бекенд повертає HTML форму LiqPay у полі form
            const liqpayFormHtml = paymentResponse.data.form;
            if (!liqpayFormHtml) {
              console.error("[submitOrder] Не отримано HTML форму LiqPay");
              alert("Сталася помилка при оплаті картою. Спробуйте ще раз.");
              return;
            }
            // Створюємо тимчасовий контейнер, вставляємо HTML форму та автоматично її відправляємо
            const container = document.createElement("div");
            container.innerHTML = liqpayFormHtml;
            document.body.appendChild(container);
            const form = container.querySelector("form");
            if (form) {
              console.log("[submitOrder] Відправка форми LiqPay...");
              form.submit();
            } else {
              console.error("[submitOrder] Не вдалося знайти форму LiqPay в отриманому HTML");
            }
          } catch (paymentError) {
            console.error("[submitOrder] Помилка оплати картою:", paymentError);
            alert("Сталася помилка при оплаті картою. Спробуйте ще раз.");
          }
        }
      } catch (error) {
        console.error("[submitOrder] Помилка оформлення замовлення:", error.response?.data || error.message);
        alert("Не вдалося оформити замовлення. Спробуйте пізніше.");
      }
      console.log("[submitOrder] === Кінець submitOrder ===");
    }
  },
  async mounted() {
    console.log("[mounted] Компонент PaymentSummary монтується...");
    await this.fetchCartItems();
    if (this.effectiveCityRef && this.effectiveDeliveryType && this.safeCartItems.length) {
      await this.calculateDeliveryCost();
      console.log("[mounted] Розрахована вартість доставки:", this.deliveryCost);
    } else {
      console.warn("[mounted] Недостатньо даних для розрахунку доставки. effectiveCityRef:", this.effectiveCityRef, "effectiveDeliveryType:", this.effectiveDeliveryType, "safeCartItems.length:", this.safeCartItems.length);
    }
    console.log("[mounted] Завершення монтування PaymentSummary");
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