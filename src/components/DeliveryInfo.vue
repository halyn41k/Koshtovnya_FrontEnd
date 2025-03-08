<template>
  <div>
    <h2>Поштове відділення</h2>
    <div class="input-container">
      <select v-model="selectedDeliveryCategory" @change="updateDeliveryOptions" class="input-field">
        <option disabled value="">Оберіть тип доставки</option>
        <option value="courier">Кур'єр</option>
        <option value="pickup">Самовивіз</option>
      </select>
    </div>
    <div class="input-container">
      <select v-model="deliveryType" class="input-field" :disabled="!selectedDeliveryCategory">
        <option disabled value="">Оберіть спосіб доставки</option>
        <option v-for="option in filteredDeliveryOptions" :key="option.id" :value="option.name">
          {{ option.name }}
        </option>
      </select>
    </div>
    <!-- City Input -->
    <div v-if="deliveryType && deliveryType !== 'Самовивіз з наших магазинів'" class="input-container">
      <input class="input-field"
             v-model="city"
             placeholder="Введіть місто"
             @input="handleCityInput" />
      <div v-if="cities && cities.length" class="city-suggestions">
        <ul>
          <li v-for="cityItem in cities" :key="cityItem.Ref" @click="selectCity(cityItem)">
            {{ cityItem.city }}
          </li>
        </ul>
      </div>
    </div>
    <!-- More inputs (street, warehouse selection etc.) can be added in a similar fashion -->
  </div>
</template>

<script>
export default {
  name: "DeliveryInfo",
  data() {
    return {
      // Local state for suggestions
      cities: [],
      filteredDeliveryOptions: []
    }
  },
  computed: {
    selectedDeliveryCategory: {
      get() {
        return this.$store.state.payment.selectedDeliveryCategory;
      },
      set(value) {
        this.$store.commit("payment/setSelectedDeliveryCategory", value);
      }
    },
    deliveryType: {
      get() {
        return this.$store.state.payment.deliveryType;
      },
      set(value) {
        this.$store.commit("payment/setDeliveryType", value);
      }
    },
    city: {
      get() {
        return this.$store.state.payment.city;
      },
      set(value) {
        this.$store.commit("payment/setCity", value);
      }
    }
  },
  methods: {
    updateDeliveryOptions() {
      // Here we emulate filtering based on the selected category.
      if (this.selectedDeliveryCategory === "courier") {
        this.filteredDeliveryOptions = [
          { id: 5, name: "Кур'єр Нової Пошти" },
          { id: 6, name: "Кур'єр УКРПОШТИ" }
        ];
      } else if (this.selectedDeliveryCategory === "pickup") {
        this.filteredDeliveryOptions = [
          { id: 1, name: "Самовивіз з наших магазинів" },
          { id: 2, name: "Самовивіз з поштоматів Нової Пошти" },
          { id: 3, name: "Самовивіз з Нової Пошти" },
          { id: 4, name: "Самовивіз з УКРПОШТИ" }
        ];
      } else {
        this.filteredDeliveryOptions = [];
      }
    },
    handleCityInput() {
      // Call an action to fetch cities (or implement a local API call).
      // For the purpose of this example we simulate an API call:
      if (this.city.length >= 3) {
        // This is where you can dispatch a Vuex action, for example:
        // this.$store.dispatch("payment/fetchCities", { city: this.city, deliveryType: this.deliveryType });
        // For now, we simulate the API response:
        this.cities = [
          { Ref: "1", city: "Київ" },
          { Ref: "2", city: "Львів" }
        ];
      } else {
        this.cities = [];
      }
    },
    selectCity(cityItem) {
      this.city = cityItem.city;
      // Typically you might also commit a mutation for cityRef:
      this.$store.commit("payment/setCityRef", cityItem.Ref);
      this.cities = [];
    }
  }
}
</script>

<style scoped>
.input-container { margin-bottom: 15px; }
.input-field { padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
.city-suggestions { border: 1px solid #ccc; max-height: 200px; overflow-y: auto; }
.city-suggestions li { padding: 8px; cursor: pointer; }
.city-suggestions li:hover { background: #f0f0f0; }
</style>
